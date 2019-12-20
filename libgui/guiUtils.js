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

/**
 * set the style of an element using an object with style.key and value pairs
 * @method guiUtils.style
 * @param {html element} element
 * @param {... object} styles - style object, can be repeated, key is style property
 */
guiUtils.style = function(element, styles) {
    for (var i = 1; i < arguments.length; i++) {
        const newStyle = arguments[i];
        if (typeof newStyle === "object") {
            for (var key in newStyle) {
                element.style[key] = newStyle[key];
            }
        }
    }
};

/**
 * create an element, set its styles and append it to a parent
 * @method guiUtils.create
 * @param {string} tag - says what kind of element we want
 * @param {htmlElement} parent
 * @param {... object} styles - style object, can be repeated, key is style property
 * @return the styled html element
 */
guiUtils.create = function(tag, parent, styles) {
    const element = document.createElement(tag);
    for (var i = 2; i < arguments.length; i++) {
        const newStyle = arguments[i];
        if (typeof newStyle === "object") {
            for (var key in newStyle) {
                element.style[key] = newStyle[key];
            }
        }
    }
    parent.appendChild(element);
    return element;
};

/**
 * create a horizontal space
 * @method guiUtils.hSpace
 * @param {htmlElement} parent
 * @param {integer} width - in px
 * @return the span element that makes the space
 */
guiUtils.hSpace = function(parent, width) {
    return guiUtils.create("span", parent, {
        width: width + "px",
        display: "inline-block"
    });
};

/**
 * create a vertical space
 * @method guiUtils.vSpace
 * @param {htmlElement} parent
 * @param {integer} height - in px
 * @return the span element that makes the space
 */
guiUtils.vSpace = function(parent, height) {
    return guiUtils.create("div", parent, {
        height: height + "px",
    });
};
