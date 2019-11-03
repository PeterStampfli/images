/**
 * working with the document object model
 * always using id strings or similar
 * @namespace DOM
 */

export const DOM = {};

const px = "px";

/**
 * check if an element with given id exists
 * @method DOM.idExists
 * @param {String} id
 * @return boolean, true if id exists, false else
 */
DOM.idExists = function(id) {
    return !!document.getElementById(id);
};

/**
 * create an element, give it an id, add to parent,if it has a text, add text to element 
 * if an element with the id already exists then nothing will be done
 * @method DOM.create
 * @param {String} tag
 * @param {String} id
 * @param {String} parent - css selector for parent (tag "body" or id selector "#id")
 * @param {String} text - optional
 * @return the element
 */
DOM.create = function(tag, id, parent, text) {
    let element = document.getElementById(id);
    if (element === null) {
        element = document.createElement(tag);
        element.setAttribute("id", id);
        document.querySelector(parent).appendChild(element);
        if (arguments.length > 3) {
            let textNode = document.createTextNode(text);
            element.appendChild(textNode);
        }
    }
    return element;
};

/**
 * set style attributes of all elements with given tag, repeating attribute/value pairs
 * @method DOM.style
 * @param {String} selectors - comma separated list (tag,tag.class,.class,#id)
 * @param {String} attribute - can be repeated together with value as pairs
 * @param {String} value - can be repeated together with attribute as pairs
 */
DOM.style = function(selectors, attribute, value) {
    let elms = document.querySelectorAll(selectors);
    for (var ie = 0; ie < elms.length; ie++) {
        for (var ia = 1; ia < arguments.length; ia += 2) {
            elms[ie].style[arguments[ia]] = arguments[ia + 1];
        }
    }
};

/**
 * make that elements given as a list of ids are not shown
 * @method DOM.displayNone
 * @param {String ...} ids
 */
DOM.displayNone = function(ids) {
    for (var i = 0; i < arguments.length; i++) {
        if (DOM.idExists(arguments[i])) {
            DOM.style("#" + arguments[i], "display", "none");
        }
    }
};

/**
 * make that elements given as a list of ids are shown
 * attention: "initial deletes height ...
 * @method DOM.displayInitial
 * @param {String ...} ids
 */
DOM.display = function(ids) {
    for (var i = 0; i < arguments.length; i++) {
        if (DOM.idExists(arguments[i])) {
            DOM.style("#" + arguments[i], "display", "initial");
        }
    }
};

/**
 * set attribute as repeating attribute/value pairs
 * @method DOM.attribute
 * @param {String} selectors - comma separated list (tag,tag.class,.class,#id)
 * @param {String} attribute - can be repeated together with value as pairs
 * @param {String} value - can be repeated together with attribute as pairs
 */
DOM.attribute = function(selectors, attribute, value) {
    let elms = document.querySelectorAll(selectors);
    for (var ie = 0; ie < elms.length; ie++) {
        for (var ia = 1; ia < arguments.length; ia += 2) {
            elms[ie].setAttribute(arguments[ia], arguments[ia + 1]);
        }
    }
};

/**
 * set class attribute
 * @method DOM.class
 * @param {String} selectors - comma separated list (tag,tag.class,.class,#id)
 * @param {String} value - can be repeated together with attribute as pairs
 */
DOM.class = function(selectors, value) {
    DOM.attribute(selectors, "class", value);
};

/**
 * hide all elements given as a list of strings
 * @method DOM.hide
 * @param {list of String} ids - comma separated id strings of elements to hide
 */
DOM.hide = function(ids) {
    for (var i = 0; i < arguments.length; i++) {
        DOM.style("#" + arguments[i], "display", "none");
    }
};

/**
 * place an element fixed in the top right corner
 * @method DOM.topRight
 * @param {String} id
 */
DOM.topRight = function(id) {
    DOM.style("#" + id, "position", "fixed", "right", 0 + px, "top", 0 + px);
};
/**
 * place an element fixed in the top left corner
 * @method DOM.topLeft
 * @param {String} id
 */
DOM.topLeft = function(id) {
    DOM.style("#" + id, "position", "fixed", "left", 0 + px, "top", 0 + px);
};
/**
 * place an element fixed in the bottom right corner
 * @method DOM.bottomRight
 * @param {String} id
 */
DOM.bottomRight = function(id) {
    DOM.style("#" + id, "position", "fixed", "right", 0 + px, "bottom", 0 + px);
};

/**
 * place an element fixed in the bottom left corner
 * @method DOM.bottomLeft
 * @param {String} id
 */
DOM.bottomLeft = function(id) {
    DOM.style("#" + id, "position", "fixed", "left", 0 + px, "bottom", 0 + px);
};

/**
 * create a div and wrap it around an html-element
 * @method DOM.wrapDiv
 * @param {String} divId
 * @param {String} elementId
 */
DOM.wrapDiv = function(divId, elementId) {
    DOM.create("div", divId, "body");
    document.getElementById(divId).insertBefore(document.getElementById(elementId), null);
};

/**
 * add a span with a space to inner HTML of an element
 * @method DOM.addSpace
 * @param {String} id - of the element
 * @return html span with space
 */
DOM.addSpace = function(id) {
    return DOM.create("span", DOM.createId(), "#" + id, " ");
};

/**
 * add a break to inner HTML of an element
 * @method DOM.addBreak
 * @param {String} id - of the element
 */
DOM.addBreak = function(id) {
    const element = document.getElementById(id);
    DOM.create("br", DOM.createId(), "#" + id);
};

/**
 * create a unique id
 * @method DOM.createId
 * @returns integer 
 */
let idNumber = 0;
DOM.createId = function() {
    idNumber++;
    return "DOM" + idNumber;
};

/**
 * create a button with synthetic id in given parent, with given text
 * @method createButton
 * @param {String} parentId
 * @param {String} text
 * @return String, id of button
 */
DOM.createButton = function(parentId, text) {
    const buttonId = DOM.createId();
    DOM.create("button", buttonId, "#" + parentId, text);
    return buttonId;
};
