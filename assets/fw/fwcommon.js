//###############################################################################
//#                                                                             #
//#  fwcommon.js                                                                #
//#  (C) 2018-2024 Janusz Grabis <janusz@frameworks.pl>                         #
//#                                                                             #
//###############################################################################
//namespace fw
var fw = fw || {};
fw.common = fw.common || {};
fw.common.entity = fw.common.entity || {};

fw.common = { //namespace common

    PW_STRENGTH_NONE   : 0,
    PW_STRENGTH_WEAK   : 1, 
    PW_STRENGTH_NORMAL : 2,
    PW_STRENGTH_GOOD   : 3,

    monthNamesEnglish : ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
    
    //returns true if variable is defined
    isDefined : function(variable) {
        return typeof variable != 'undefined';
    },
    
    isNotNull : function(variable) {
        return this.isDefined(variable) && variable !== null;
    },

    //converts string into Date object
    stringToDate : function(stringDT) {
        if (stringDT !== null && stringDT !== NaN) {
            return new Date(stringDT);
        }

        return null;
    },
    
    //converts date object to string based on mask
    dateToString: function(dateObject, formatString) {
    
        var result = "";
        
        if (dateObject !== null && dateObject !== NaN && typeof(dateObject )=== 'object') {
            for (var i=0; i<formatString.length; i++)
            {
                switch (formatString.charAt(i))
                {
                    case 'Y': result += dateObject.getFullYear(); break;
                    case 'y':
                    { 
                        var fullYear = dateObject.getFullYear(); 
                        result += fullYear.toString().substring(2);
                    }
                    break;
                    case 'M':
                    {
                        var m = dateObject.getMonth() + 1; 
                        result += (m < 10) ? '0' + m : m;
                    }
                    break;
                    case 'm':
                    {
                        var m = dateObject.getMonth();
                        var month = fw.common.monthNamesEnglish[m]; 
                        result += month.substr(0, 3).toUpperCase();
                    }
                    break;
                    case 'D':
                    { 
                        var d = dateObject.getDate();
                        result += (d < 10) ? '0' + d : d; 
                    }
                    break;
                    case 'H':
                    {
                        var h = dateObject.getHours();
                        result += h < 10 ? '0' + h : h;
                    }
                    break;
                    case 'i':
                    {
                        var m = dateObject.getMinutes();
                        result += m < 10 ? '0' + m : m;
                    }
                    break;
                    case 's':
                    {
                        var s = dateObject.getSeconds();
                        result += s < 10 ? '0' + s : s; 
                    }            
                    break;
                    default: result += formatString.charAt(i); 
                }
            }
        }
        
        return result;    
    },
    
    stringToFloat : function(strFloat) {
        var strCorrectDecPoint = strFloat.replace(",", ".");
        return parseFloat(strCorrectDecPoint);
    },
    
    //returns true if given element id is visible
    isVisible : function(htmlElementId) {
    
      var htmlElement = document.getElementById(htmlElementId); 
      if (htmlElement != null)
      {
        return htmlElement.style.visibility === '' || htmlElement.style.visibility === 'visible';       
      }
      
      return false;          
    },
    
    //generates random string with length specified by strLength
    randomString: function(strLength) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < strLength; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    },
    
    //escapes the special characters 
    escapeStringForHTML: function(srcString) {
        return srcString.replace(/"/g, '&#34;');
    },
    
    // Copies a string to the clipboard. 
    copyToClipboard : function(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
            return clipboardData.setData("Text", text);
    
        }
        else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");  // Security exception may be thrown by some browsers.
            }
            catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return false;
            }
            finally {
                document.body.removeChild(textarea);
            }
        }
    },
    
    //Extracts query string from URL as array of name=value pairs
    getQueryParams : function(url) {
        var qParams = [];
        var urlQString = url.split("?");
        if (urlQString.length > 1) {
            var nameValueParams = urlQString[1].split('&');
            for (var i=0; i < nameValueParams.length; i++) {
                var nameValue = nameValueParams[i].split('=');
                qParams[nameValue[0]] = nameValue[1];
            }            
        }
        
        return qParams;        
    },
    
    //Adds or replaces exisitng query string portion of URL
    setQueryParams : function(url, params) {
        
        if (Object.keys(params).length) {    
            var urlQString = url.split("?");
            var existingParams = fw.common.getQueryParams(url);            
            var nameValues = [];
            
            //add any existing params that are NOT among new params
            var existingParamsNames = Object.keys(existingParams);
            for (var i = 0; i < Object.keys(existingParams).length; i++) {
                if (typeof params[existingParamsNames[i]] == 'undefined') {
                    params[existingParamsNames[i]] = existingParams[existingParamsNames[i]];                    
                }                
            }            
            
            var paramNames = Object.keys(params);
            for (var i = 0; i < paramNames.length; i++) {
                nameValues.push(paramNames[i] + '=' + params[paramNames[i]]);
            }            
            
            var qString = nameValues.join('&');
            
            return urlQString[0] + '?' + qString;
        }
        
        return url;                
    },
    
    passStrength : function(password, expectedLength) {
        if (fw.common.isNotNull(password)) {
            if (password.length < expectedLength) {
                return fw.common.PW_STRENGTH_WEAK;
            }
            
            var upperCChar = false;
            var lowerCChar = false;
            var digitChar = false;
            var nonAlphaChar = false;
            
            for (var i = 0; i < password.length; i++) {
                if (password.charCodeAt(i) >= 'A'.charCodeAt(0) && password.charCodeAt(i) <= 'Z'.charCodeAt(0)) {
                    upperCChar = true;
                }
                if (password.charCodeAt(i) >= 'a'.charCodeAt(0) && password.charCodeAt(i) <= 'z'.charCodeAt(0)) {
                    lowerCChar = true;
                }
                if (password.charCodeAt(i) >= '0'.charCodeAt(0) && password.charCodeAt(i) <= '9'.charCodeAt(0)) {
                    digitChar = true;
                }                
                if (password.charCodeAt(i) >= '!'.charCodeAt(0) && password.charCodeAt(i) <= '/'.charCodeAt(0)) {
                    nonAlphaChar = true;                
                }                                 
            }
            
            if (upperCChar && lowerCChar && digitChar) {
                if (nonAlphaChar) {  
                    return fw.common.PW_STRENGTH_GOOD; 
                }
                return fw.common.PW_STRENGTH_NORMAL;
            }
            
            return fw.common.PW_STRENGTH_WEAK;                        
        }
        
        return fw.common.PW_STRENGTH_NONE;        
    },
    
    isValidEmail : function(email) {
    
        var matches = email.match("^[^@]+@[^\.]+\\.[^\.]+$");
        if (matches !== null) {
            return  true;
        }
        
        return false;
    },
    
    sendJson : function(address, method, payload, successCallback) {
        // Act
        $.ajax({
            url: address,
            type: method,
            data: payload,
            contentType: "json",
            success: successCallback
        });        
    }
        
}; //namespace common

fw.command = {

    //redirect command
    Redirect : function(urlString)  {
        this.name = "redirect";
        this.url = urlString;
        
        this.execute = function() {
            window.location.href = this.url;
        }        
    },    

    //command factory function
    fromJson : function(json) {
        if (json.command === 'redirect' && json.url !== null)
        {
            return new fw.command.Redirect(json.url);
        }
        
        return null;            
    }
}
    
    
