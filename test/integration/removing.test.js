var Common = require('./common');

describe('Removing', () => {
  it('can remove tree', () => {
    $("select").append("<option value='one' data-section='foo' selected='selected' data-description='One'>One</option>");
    var trees = $("select").treeMultiselect();
    var tree = trees[0];

    assert.equal($(".tree-multiselect").length, 1);

    tree.remove();
    assert.equal($(".tree-multiselect").length, 0);
  });

  // it('removes the right tree', () => {
  //   $("select").append("<option value='one' data-section='foo' selected='selected' data-description='One'>One</option>");
  //
  //   var newSelect = Common.createFixtureSelect();
  //   $(newSelect).append("<option value='two' data-section='bar' selected='selected' data-description='Two'>Two</option>");
  //
  //   var trees = $("select").treeMultiselect();
  //   assert.equal(trees.length, 2);
  //
  //   assert.equal($(".tree-multiselect").length, 2);
  //   assert.equal(Common.selection({value: 'one'}).length, 1);
  //   assert.equal(Common.selection({value: 'two'}).length, 1);
  //
  //   trees[0].remove();
  //
  //   assert.equal(Common.selection({value: 'one'}).length, 0);
  //   assert.equal(Common.selection({value: 'two'}).length, 1);
  //
  //   trees[1].remove();
  //   assert.equal(Common.selection({value: 'one'}).length, 0);
  //   assert.equal(Common.selection({value: 'two'}).length, 0);
  // });
});
