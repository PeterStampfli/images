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

var element;

guiUtils.style = function(elmnt) {
    element = elmnt;
    return guiUtils;
};


guiUtils.parent = function(elmnt) {
    elmnt.appendChild(element);
    return guiUtils;
};

guiUtils.attribute = function(name, value) {
    element.setAttribute(name, value);
    return guiUtils;
};

function addStyle(key, addString) {
    guiUtils[key] = function(value) {
        element.style[key] = value + addString;
        return guiUtils;
    };
}


function addStyles(styles) {
    for (var key in styles) {
        addStyle(key, styles[key]);
    }
    return guiUtils;
}


addStyles({
    width: "px",
    height: "px",
    backgroundColor: ""
});


/**
 * create a horizontal space
 * @method guiUtils.hSpace
 * @param {htmlElement} parent
 * @param {integer} width - in px
 * @return the span element that makes the space
 */
guiUtils.hSpace = function(parent, width) {

};

/**
 * create a vertical space
 * @method guiUtils.vSpace
 * @param {htmlElement} parent
 * @param {integer} height - in px
 * @return the span element that makes the space
 */
guiUtils.vSpace = function(parent, height) {


};
