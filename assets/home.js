
import $ from 'jquery';
const { fw } = require('./fw/fwgrid');
$(document).ready(function() {

    let data = {
        'collection': [
            {"name" : "John"},
            {"name" : "Jack"}
            ]
    };

    let grid = new fw.gui.Grid("placeholder", "collection");
    grid.addColumn(new fw.gui.GridColumn('Name', ['name'], 'col-4 text-left'));

    grid.setCollection(data);
    grid.refreshContent();

});