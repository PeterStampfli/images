/**
 * utilities for the gui
 * @namespace guiUtils
 */

export const guiUtils = {};

// functions that check parameters, for overloading methods

/**
 * test if a variable is defined, and not missing in the call, 
 * a missing parameter is "undefined"
 * @method guiUtils.isDefined
 * @param {anything} p
 * @return true if p is defined
 */
guiUtils.isDefined = function(p) {
    return ((typeof p) !== "undefined") && (p !== null);
};

/**
 * test if a variable is boolean
 * @method guiUtils.isBoolean
 * @param {anything} p
 * @return true if p is boolean
 */
guiUtils.isBoolean = function(p) {
    return ((typeof p) === "boolean");
};

/**
 * test if a variable is a string
 * @method guiUtils.isString
 * @param {anything} p
 * @return true if p is string
 */
guiUtils.isString = function(p) {
    return ((typeof p) === "string");
};

/**
 * test if a variable is a function
 * @method guiUtils.isFunction
 * @param {anything} p
 * @return true if p is a function
 */
guiUtils.isFunction = function(p) {
    return ((typeof p) === "function");
};

/**
 * test if a variable is an integer
 * excluding float, NaN and infinite numbers (because of Number.isInteger)
 * @method guiUtils.isInteger
 * @param {anything} p
 * @return true if p is integer
 */
guiUtils.isInteger = function(p) {
    return ((typeof p) === "number") && (Number.isInteger(p));
};

/**
 * test if a variable is a floating point number
 * excluding integer, NaN and infinite numbers
 * @method guiUtils.isFloat
 * @param {anything} p
 * @return true if p is float
 */
guiUtils.isFloat = function(p) {
    return ((typeof p) === "number") && (!Number.isNaN(p)) && (!Number.isInteger(p)) && (Number.isFinite(p));
};

/**
 * test if a variable is a number (integer or float)
 * excluding NaN and infinite numbers
 * @method guiUtils.isNumber
 * @param {anything} p
 * @return true if p is a number
 */
guiUtils.isNumber = function(p) {
    return ((typeof p) === "number") && (!Number.isNaN(p)) && (Number.isFinite(p));
};

/**
 * test if a variable is an array
 * @method guiUtils.isArray
 * @param {anything} p
 * @return true if p is an array
 */
guiUtils.isArray = function(p) {
    return ((typeof p) === "object") && (Array.isArray(p));
};

/**
 * test if a variable is an object, not an array and not null
 * @method guiUtils.isNumber
 * @param {anything} p
 * @return true if p is an object
 */
guiUtils.isObject = function(p) {
    return ((typeof p) === "object") && (!Array.isArray(p)) && (p !== null);
};

/**
 * check if a file name is a string and has a good image file extension or is a dataURL of an image
 * @method guiUtils.isGoodImageFile
 * @param {string} filename
 * @return true if it is an image file name or dataURL
 */
const goodExtensions = ["jpg", "jpeg", "png", "svg", "bmp", "gif"];

guiUtils.isGoodImageFile = function(fileName) {
    if (typeof fileName === "string") {
        if (fileName.substring(0, 10) === "data:image") {
            return true;
        } else {
            const namePieces = fileName.split(".");
            if (namePieces.length > 1) {
                const extension = namePieces[namePieces.length - 1].toLowerCase();
                const index = goodExtensions.indexOf(extension);
                return (index >= 0);
            }
        }
    }
    return false;
};

/**
 * updating existing fields of first object by fields of second object
 * both have to have the same type, they are not functions (it does not matter if both are "undefined")
 * use instead of Object.assign(to,from) to avoid copying ALL (unwanted) fields
 * @method guiUtils.updateValues
 * @param {Object} toObject (or Generator function)
 * @param {Object} fromObject (or generator function)
 */
guiUtils.updateValues = function(toObject, fromObject) {
    for (var key in fromObject) {
        if ((typeof toObject[key] === typeof fromObject[key]) && (typeof fromObject[key] !== "function")) {
            toObject[key] = fromObject[key];
        }
    }
};

//   styles, DOM elements
//============================================================================

// take a HTML element and style it

var elements;

/*
 *  add element or array of elements to the list of elements for styling
 */
function addElement(elmnt) {
    if (Array.isArray(elmnt)) {
        for (var j = 0; j < elmnt.length; j++) {
            elements.push(elmnt[j]);
        }
    } else {
        elements.push(elmnt);
    }
}

/**
 * register HTML elements for styling
 * @method guiUtils.style
 * @param {... HTLElement|array of  HTMLElements} elmnts
 * @return guiUtils, for chaining
 */
guiUtils.style = function(elmnts) {
    elements = [];
    for (var i = 0; i < arguments.length; i++) {
        addElement(arguments[i]);
    }
    return guiUtils;
};

/**
 * set parent for registered HTML elements
 * @method guiUtils.parent
 * @param {HTLElement} p - parent element
 * @return guiUtils, for chaining
 */
guiUtils.parent = function(p) {
    elements.forEach(element => p.appendChild(element));
    return guiUtils;
};


/**
 * set attribute for registered HTML elements
 * @method guiUtils.attribute
 * @param {string} name
 * @param {string} value
 * @return guiUtils, for chaining
 */
guiUtils.attribute = function(name, value) {
    elements.forEach(element => element.setAttribute(name, value));
    return guiUtils;
};

function addStyle(key) {
    guiUtils[key] = function(value, elmnt) {
        if (arguments.length > 1) {
            elements = [];
            for (var i = 1; i < arguments.length; i++) {
                addElement(arguments[i]);
            }
        }
        elements.forEach(element => element.style[key] = value);
        return guiUtils;
    };
}

/*
create methods for styling the registered elements
@method addStyles
@param {array of strings} keys 
*/

function addStyles(keys) {
    keys.forEach(key => addStyle(key));
}

/**
 * resulting methods from the styles object:
 * setting the element.style.key property to value
 * @method guiUtils.key
 * @param {integer|string} value
 * @param {...htmlelement|array of HTMLelements} elmnt - optional, element to use for this styling and the following
 * @return guiUtils, for chaining
 */

addStyles([
    "width", "height", "fontSize", "paddingBottom",
    "position", "top", "bottom", "left", "right",
    "backgroundColor", "color",
    "display", "zIndex",
    "border", "borderRadius", "borderStyle", "borderWidth", "borderColor",
    "objectFit", "objectPosition",
    "cursor",
    "outline",
    "verticalAlign", "textAlign",
    "overflow"
]);

/**
 * create a horizontal space
 * @method guiUtils.hSpace
 * @param {htmlElement} parent
 * @param {integer} width - in px
 * @return the span element that makes the space
 */
guiUtils.hSpace = function(parent, width) {
    const space = document.createElement("span");
    space.style.display = "inline-block";
    space.style.width = width + "px";
    parent.appendChild(space);
    return space;
};

/**
 * create a vertical space
 * @method guiUtils.vSpace
 * @param {htmlElement} parent
 * @param {integer} height - in px
 * @return the div element that makes the space
 */
guiUtils.vSpace = function(parent, height) {
    const space = document.createElement("div");
    space.style.height = height + "px";
    parent.appendChild(space);
    return space;
};

/**
 * make that the element display style has given value
 * @method guiUtils.setDisplayStyle
 * @param {htmlElement} element
 * @param {string} value
 */
guiUtils.setDisplayStyle = function(element, value) {
    if ((element) && (element.style.display !== value)) {
        element.style.display = value;
    }
};

/**
 * make that the element display style is "none", ok for undefined
 * @method guiUtils.setDisplayStyle
 * @param {htmlElement} element
 */
guiUtils.displayNone = function(element) {
    guiUtils.setDisplayStyle(element, "none");
};

/**
 * make that the element display style is "block"
 * @method guiUtils.setDisplayStyle
 * @param {htmlElement} element
 */
guiUtils.displayBlock = function(element) {
    guiUtils.setDisplayStyle(element, "block");
};

/**
 * make that the element display style is "inline-block"
 * @method guiUtils.setDisplayStyle
 * @param {htmlElement} element
 */
guiUtils.displayInlineBlock = function(element) {
    guiUtils.setDisplayStyle(element, "inline-block");
};


/**
 * determine top position of an element, including scroll of the parents
 * @method guiUtils.topPosition
 * @param {domElement} theElement
 * @return number, (inverted) y-coordinate of top 
 */
guiUtils.topPosition = function(theElement) {
    const body = document.body;
    // sum of offsets, going only through offsetParents
    let offsetY = 0;
    let element = theElement;
    while (element !== body) {
        offsetY += element.offsetTop;
        if (element.style.position == "fixed") {
            offsetY += window.pageYOffset;
            break;
        }
        element = element.offsetParent; // important: does not double count offsetTop
    }
    // sum of scrolls, going through all parents
    let scrollY = 0;
    element = theElement;
    while (element !== body) {
        scrollY += element.scrollTop;
        if (element.style.position == "fixed") {
            break;
        }
        element = element.parentElement; // important: does not double count offsetTop
    }
    return offsetY - scrollY;
};
