//###############################################################################
//#                                                                             #
//#  fwgrid.js                                                                  #
//#  (C) 2020-2024 Janusz Grabis <janusz@frameworks.pl>                         #
//#                                                                             #
//###############################################################################

//namespace
var fw = fw || {};
fw.gui = fw.gui || {};

fw.gui.Sorter = function(id, classNames) {

    this.classNames = classNames;
    this.id = id;    

}

fw.gui.Sorter.prototype = {

    /**
     * @brief CSS classes to be applied to the sorter 
     * @var string
     */
    classNames : '',
    
    /**
     * @brief ID of this sort control (it should be initilized by parent) 
     * @var string
     */
    id : '', 
    
    /**
     * @brief true if this sorted is currently selected
     */
    isSelected : false,
    
    /**
     * @brief direction of this specific sorter: 1 - asc, 2 -desc
     */
    sorterDirection : '',

    /**
     * @return fw.gui.Tag
     */
    getAsTag : function() {
        var rootTag = new fw.tags.Tag('span', this.id, '', this.classNames);
        rootTag.setAttrib('data-selected', this.isSelected ? '1' : '0');
        rootTag.setAttrib('data-direction', this.sorterDirection);
        return rootTag;
    },
    
    setId : function(id) {
        this.id = id;
    },
    
    setSelected : function(selected) {
        this.selected = selected;
    },
    
    setDirection : function(direction) {
        this.sorterDirection = direction;
    }    

}

/**
 * @param string name - name of the column
 * @param array path - path to data item to be displayed in the grid
 * @param string classNames - classes to be applied to each cell in the column (except header)
 */
fw.gui.GridColumn = function(name, path, classNames, sorterUp, sorterDown) {
    this.name = name;
    this.path = path;
    this.classNames = classNames;
    this.sorterUp = sorterUp;
    if (this.sorterUp) {
        this.sorterUp.setDirection('1');
    }
    
    this.sorterDown = sorterDown;
    if (this.sorterDown) {
        this.sorterDown.setDirection('2');
    }
}


fw.gui.GridColumn.prototype = {


    /**
     * @brief name of the column
     */
    name : '',
    
    /**
     * @brief List of property names used to extract value for grid cell
     */
    path : [],
    
    
    /**
     * @brief value for class attribute of the cell 
     * @var string
     */
    classNames : '',
    
    /**
     * @brief object that draws/handles sorting up
     * @var fw.gui.Sorter
     */
    sorterUp : null,
    
    /**
     * @brief object that draws/handles sorting down
     */
    sorterDonw : null,    
    
    /**
     * @return string name of the column
     */
    getName : function() {
        return this.name;
    },
    
    /**
     * @return array of strings
     */
    getPath : function() {
        return this.path;
    },
    
    setPath : function(path) {
        this.path = path;
    },
    
    /**
     * @return string
     */
    getFormattedValue : function(value) {
        return value;
    },
    
    /**
     * @return string
     */
    getClassNames : function() {
        return this.classNames;
    },

    /**
     * @return fw.gui.Sorter
     */
    getUpSorter : function() {
    	return this.sorterUp;
    },

    getDownSorter : function() {
    	return this.sorterDown;
    },

    /**
     * @brief extracts value from hierarchical object (using recursion)
     */
    getObjectValue : function(obj, path, index) {
        if (index < path.length-1) {
            return this.getObjectValue(obj[path[index]], path, index+1);
        }

        if (obj != null) {
            return obj[path[index]];
        }
        return null;
    },  
    
    /**
     * @brief Called for each cell to be created.
     * @param object grid object
     * @param string id id of the tag 
     */
    onCellCreation : function(grid, id) {
        var row = grid.collection[grid.collectionName][grid.currentRowIndex];
        var cell = grid.columns[grid.currentColumnIndex];
        var classes = grid.columns[grid.currentColumnIndex].getClassNames();
        var cellValue = this.getObjectValue(row, cell.getPath(), 0);
        var formattedCellValue = cell.getFormattedValue(cellValue);    
        return new fw.tags.Tag('div', id, formattedCellValue, classes);
    },
    
}

fw.gui.DateGridColumn = function(name, path, classNames, dateMask = "Y-M-D") {
    this.dateMask = dateMask,
    fw.gui.GridColumn.call(this, name, path, classNames);
    
    this.getFormattedValue = function(value) { 
        var dateAsObject = fw.common.stringToDate(value);
        return fw.common.dateToString(dateAsObject, this.dateMask); 
    }
}


fw.gui.DateGridColumn.prototype = new fw.gui.GridColumn();
fw.gui.DateGridColumn.prototype.constructor = fw.gui.DateGridColumn;


fw.gui.LinkGridColumn = function(name, path, classNames, urlFunction, classFunction) {
    this.urlFunction = urlFunction;
    this.classFunction = classFunction;
    fw.gui.GridColumn.call(this, name, path, classNames);
    
    this.onCellCreation = function(grid, id) {
        var row = grid.collection[grid.collectionName][grid.currentRowIndex];
        var cell = grid.columns[grid.currentColumnIndex];
        var classes = grid.columns[grid.currentColumnIndex].getClassNames();
        var cellValue = this.getObjectValue(row, cell.getPath(), 0);
        var formattedCellValue = cell.getFormattedValue(cellValue);    
        var cellTag = new fw.tags.Tag('div', id, '', classes);
        
        var linkAttribs = { 'href' : this.urlFunction(row) };
        
        if (this.classFunction) {
            linkAttribs['class'] = this.classFunction(row);            
        }
        cellTag.addChild(new fw.tags.AttribTag('a', formattedCellValue, linkAttribs));
        return cellTag;
    }    
    
}
fw.gui.LinkGridColumn.prototype = new fw.gui.GridColumn();
fw.gui.LinkGridColumn.prototype.constructor = fw.gui.LinkGridColumn;

/**
 * @param string placeholderId - id of the parent element to the grid
 * @param string collectionName - name of the collection to display
 */
fw.gui.Grid = function(placeholderId, collectionName) {

        //id of the element that is parent to our grid
        this.placeholderId = placeholderId;
        
        /**
         * @brief name of the collection in collection object
         */
        this.collectionName = collectionName;        
        
        /**
         * @brief collection with elements to display
         */
        this.collection = null;
        
        /**
         * @biref collection of fw.gui.GridColumn objects
         */
        this.columns = []; 
        
        /**
         * @brief decides if header row is to be shown
         */
        this.displayHeader = false;
        
        /**
         * @brief index of the row being processed
         */
        this.currentRowIndex = -1;
        
        /**
         * @brief index of the cell being processed
         */
        this.currentColumnIndex = -1;

}
 
fw.gui.Grid.prototype =  {

        
        /**
         * @brief Called for each row to be created (can be used to skip given rows)
         */
        onRowCreation : function() {
            var row = this.collection[this.collectionName][this.currentRowIndex]; 
            var rowDivTag = new fw.tags.Tag('div', '', '', 'row');                                                    
            
            //columns
            for (var j = 0; j < this.columns.length; j++) {
                this.currentColumnIndex = j;
                //var colDivTag = this.columns[j].onCellCreation(row, this.columns[j], '', this.columns[j].getClassNames()); //jg_refactor
                var colDivTag = this.columns[j].onCellCreation(this, '');
                rowDivTag.addChild(colDivTag);
            }
            
            //any
            this.onAfterColumnsAdded(rowDivTag);
            
            return rowDivTag.toString();        
        }, 
        
        
        /**
         * @brief builds single header cell tag
         * @param fw.gui.GridColumn columnDef definition of the column
         * @param int columnIdx index of the column
         */
        buildHeaderCellTag : function(columnDef, columnIdx) {
            return new fw.tags.Tag('div', '', columnDef.getName(), typeof columnDef.getClassNames() === 'undefined' ? 'col' : columnDef.getClassNames());
        },
        
        /**
         * @brief builds grid
         * @return string raw HTML with grid
         */
        buildHTML : function() {
            var output = '';
            
            //header
            if (this.displayHeader === true) {
                var headerRowTag = new fw.tags.Tag('div', '', '', 'row');                
                for (var i = 0; i < this.columns.length; i++) {
                    var headerColTag = this.buildHeaderCellTag(this.columns[i], i);

                    //sorters
                    if (this.columns[i].getUpSorter()) {
                    	headerColTag.addChild(this.columns[i].getUpSorter().getAsTag());
                    }
                    if (this.columns[i].getDownSorter()) {
                    	headerColTag.addChild(this.columns[i].getDownSorter().getAsTag());
                    }                    

                    headerRowTag.addChild(headerColTag);
                }
                output += headerRowTag.toString();                
            }
            
            for (var i = 0; i < this.collection[this.collectionName].length; i++) {
                this.currentRowIndex = i;
                
                output += this.onRowCreation(this);
                
                //add extra rows (like expanded content for example)
                output += this.onAfterRowAdded(this);
            }
            
            return output;        
        },
        
        /**
         * @brief Builds grid based on current collection and replaces the grid pointed by placeholderId
         */
        refreshContent : function() {
            document.getElementById(this.placeholderId).innerHTML = this.buildHTML();            
        },
        
        /**
         * @return id of the parent element
         */
        getPlaceholderId : function() {
            return this.placeholderId;
        },
        
        /**
         * @brief Initializes collection
         */
        setCollection : function(collection) {
            this.collection = collection;
        },
        
        /**
         * @return number of actual data rows (without header!)
         */
        getRowCount : function() {
            return this.collection[this.collectionName].length;
        },
        
        /**
         * @brief adds new column object
         * @param fw.gui.GridColumn colObject
         */
        addColumn : function(colObject) {
            this.columns.push(colObject);            
        },
        
        /**
         * @param integer index 0-based column index
         * @return column object under given index
         */
        getColumn : function(index) {
            return this.columns[index];
        },
        
        /**
         * @param string name of the column
         * @return column object or null if not found
         */
        getColumnByName : function(name) {
            for (var i = 0; i < this.columns.length; i++) {
                if (this.columns[i].getName() === name) {
                    return this.columns[i];
                }
            }
            
            return null;
        },        
        
        /**
         * @param boolean value specifing if header row should be shown or not
         */
        showHeader : function(show) {
            this.displayHeader = show;
        },
        
        /**
         * @brief called after row has been produced and added to output, allows creation extra rows below
         * @param fw.gui.Grid grid object
         * @return HTML string representing row or empty string if nothing is to be added
         */
        onAfterRowAdded : function(grid) {
            return "";
        },
        
        /**
         * @brief called after column tags have been added to row but before it is parsed to string
         * @param fw.tags.Tag row object 
         */
        onAfterColumnsAdded : function(rowTag) {
        }

}

fw.gui.Grid.prototype.constructor = fw.gui.Grid;

