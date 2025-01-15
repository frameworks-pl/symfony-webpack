//###############################################################################
//#                                                                             #
//#  fwtags.js                                                                  #
//#  (C) 2019-2020 Janusz Grabis <janusz@frameworks.pl>                         #
//#                                                                             #
//###############################################################################
'use strict';
//namespace fw
var fw = fw || {};
fw.tags = fw.tags || {};


fw.tags.Tag = function(_name, _id, _value, _classNames) {
    this.attribs = [];
    this.children = [];    
    this.name = _name;
    this.value = _value;
    this.classNames = _classNames;
    if (_id) {
        this.setAttrib('id', _id);
    }

}

fw.tags.Tag.prototype = {

    /**
     * Name of the tag
     */
     name: '',

    /**
     * value of the tag
     */
     value: '',
     
     /**
      * @breif collection of raw pairs representing name nad value
      */
     attribs: undefined,
     
     /**
      * class attribute
      */
     classNames: '',

    
    /**
     * array of child items (tags)
     */
    children: undefined,
    
    /**
     * @brief Adds custom attribute for the tag
     */
     setAttrib : function(_name, _value) {
        this.attribs[_name] = _value;
     },
     
     /**
      * @return string value of the given attrib or undefined it does not exist
      */
     getAttrib : function(_name) {
     
        if (_name in this.attribs) {
            return this.attribs[_name];
        }
        
     },
    
    /**
     * builds attribute string which looks like _name="_value"
     * @param string _name name of the attribute
     * @param string _value value of the attribute
     * @param boolean _canBeEmptyOrNull if true will generate attribute even if value is empty
     */
    buildAttrib: function(_name, _value, _canBeEmptyOrNull) {
        var output = '';
        
        if (typeof _value === 'undefined') {
            _value = '';
        }
        
        if (_name !== '')
        {
            if (_value !== '' || _canBeEmptyOrNull !== false)
            {
                output = _name+"=\""+_value+"\"";
            }            
        }
        
        return output; 
    },
    
    /**
     * constructs tag and returns it as string
     */
    toString: function() {
    
        var self = this;
    
        //generate chidlren
        var childrenString = '';
        for (var j = 0; j < self.children.length; j++)
        {
            childrenString += self.children[j].toString();
        }
        
        var allAttribs = [];
        
        for (var key in this.attribs) {
            allAttribs.push(this.buildAttrib(key, this.attribs[key]));
        }
        
        //var allAttribs = this.attribs;        
        
        //allAttribs.push(this.buildAttrib('id', this.id, false));
        if (this.classNames != '') {
            allAttribs.push(this.buildAttrib('class', this.classNames, false));
        }
        var attribsString = '';
        for (var i = 0; i < allAttribs.length; i++)
        {
            if (allAttribs[i] !== '')
            {
                attribsString += allAttribs[i];
                attribsString += " ";
            }            
        }
        var tagName = this.name;
        var tagValue = this.value;
        
        if (typeof tagValue === 'undefined') {
            tagValue = '';
        }
        
        if (attribsString !== '')
            tagName += " ";        
 
        var output = "<"+tagName+attribsString.substr(0, attribsString.length-1)+">"+tagValue+childrenString;
        
        if (this.name != 'input') { //skip ending tag for input
            output +="</"+this.name+">";
        }
        return output; 
    },
    
    /**
     * Adds child tag to this tag
     * @param fw.tags.Tag or deviced class _child child object
     */
    addChild: function(_child) {
        this.children.push(_child);
    },
    
    /**
     * Appends class(es) to existing tag classes
     * @param string _classNames 
     */
    
    appendClass : function(_classNames) {
        this.classNames += ' ' + _classNames;
    },

    /**
     * Returns class names for this tag as string
     */
    getClassNames : function() {
        return this.classNames;
    }
}



fw.tags.BR = function() {

       this.toString = function() {
            return '<br>';
       } 
}


fw.tags.AttribTag = function(_name, _value, _attributes) {
    fw.tags.Tag.call(this, _name, '', _value, '');
    this.attribs = _attributes;    
}
fw.tags.AttribTag.prototype = new fw.tags.Tag();
fw.tags.AttribTag.prototype.constructor = fw.tags.AttribTag; 

