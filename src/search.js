let Util = require('./utility');

const MAX_SAMPLE_SIZE = 3;

function Search(options, inSelectionNodeHash, inSectionNodeHash, searchParams) {
  this.options = options;

  this.index = {}; // key: at most three-letter combinations, value: array of data-key

  // key: data-key, value: DOM node
  this.selectionNodeHash = inSelectionNodeHash;
  this.selectionNodeHashKeys = Object.keys(inSelectionNodeHash);

  this.sectionNodeHash = inSectionNodeHash;
  this.sectionNodeHashKeys = Object.keys(inSectionNodeHash);

  this.setSearchParams(searchParams);

  this.buildIndex();
}

Search.prototype.setSearchParams = function(searchParams) {
  Util.assert(Array.isArray(searchParams));

  let allowedParams = {
    'value': true,
    'text': true,
    'description': true,
    'section': true,
  };

  this.searchParams = [];
  for (let ii = 0; ii < searchParams.length; ++ii) {
    if (allowedParams[searchParams[ii]]) {
      this.searchParams.push(searchParams[ii]);
    }
  }
};

Search.prototype.buildIndex = function() {
  // options are sorted by id already
  // trigrams
  this.options.forEach((option) => {
    let searchItems = [];
    this.searchParams.forEach((searchParam) => {
      searchItems.push(option[searchParam]);
    });
    Util.array.removeFalseyExceptZero(searchItems);
    let searchWords = searchItems.map((item) => {
      return item.toLowerCase();
    });

    searchWords.forEach((searchWord) => {
      let words = searchWord.split(' ');
      words.forEach((word) => {
        this._addToIndex(word, option.id);
      });
    });
  });
};

Search.prototype._addToIndex = function(key, id) {
  for (let sample_size = 1; sample_size <= MAX_SAMPLE_SIZE; ++sample_size) {
    for (let start_offset = 0; start_offset < key.length - sample_size + 1; ++start_offset) {
      let minikey = key.substring(start_offset, start_offset + sample_size);

      if (!this.index[minikey]) {
        this.index[minikey] = [];
      }

      // don't duplicate
      // this takes advantage of the fact that the minikeys with same id's are added sequentially
      let length = this.index[minikey].length;
      if (length === 0 || this.index[minikey][length - 1] !== id) {
        this.index[minikey].push(id);
      }
    }
  }
};

Search.prototype.search = function(value) {
  if (!value) {
    this.selectionNodeHashKeys.forEach((id) => {
      this.selectionNodeHash[id].style.display = '';
    });
    this.sectionNodeHashKeys.forEach((id) => {
      this.sectionNodeHash[id].style.display = '';
      this.sectionNodeHash[id].removeAttribute('searchhit');
    });
    return;
  }

  value = value.toLowerCase();

  let searchWords = value.split(' ');
  let searchChunks = [];
  searchWords.forEach((searchWord) => {
    let chunks = splitWord(searchWord);
    chunks.forEach((chunk) => {
      searchChunks.push(this.index[chunk] || []);
    });
  });

  let matchedNodeIds = Util.array.intersectMany(searchChunks);

  // now we have id's that match search query
  this._handleNodeVisbilities(matchedNodeIds);
};

Search.prototype._handleNodeVisbilities = function(shownNodeIds) {
  let shownNodeIdsHash = {};
  let sectionsToNotHideHash = {};
  shownNodeIds.forEach((id) => {
    shownNodeIdsHash[id] = true;
    let node = this.selectionNodeHash[id];
    node.style.display = '';

    // now search for parent sections
    node = node.parentNode;
    while (!node.className.match(/tree-multiselect/)) {
      if (node.className.match(/section/)) {
        let key = Util.getKey(node);
        Util.assert(key || key === 0);
        if (sectionsToNotHideHash[key]) {
          break;
        } else {
          sectionsToNotHideHash[key] = true;
          node.style.display = '';
          node.setAttribute('searchhit', true);
        }
      }
      node = node.parentNode;
    }
  });

  // hide selections
  this.selectionNodeHashKeys.forEach((id) => {
    if (!shownNodeIdsHash[id]) {
      this.selectionNodeHash[id].style.display = 'none';
    }
  });
  this.sectionNodeHashKeys.forEach((id) => {
    if (!sectionsToNotHideHash[id]) {
      this.sectionNodeHash[id].style.display = 'none';
    }
  });
};

// split word into three letter (or less) pieces
function splitWord(word) {
  Util.assert(word);

  if (word.length < MAX_SAMPLE_SIZE) {
    return [word];
  }

  let chunks = [];
  for (let ii = 0; ii < word.length - MAX_SAMPLE_SIZE + 1; ++ii) {
    chunks.push(word.substring(ii, ii + MAX_SAMPLE_SIZE));
  }
  return chunks;
}

module.exports = Search;
