/**
 * utilities for the gui
 * @namespace guiUtils
 */

export const guiUtils = {};


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
    "width", "height",
    "position", "top",
    "backgroundColor", "color",
    "display",
    "border", "borderRadius", "borderStyle", "borderWidth", "borderColor",
    "objectFit", "objectPosition",
    "cursor",
    "outline",
    "verticalAlign", "textAlign"
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
