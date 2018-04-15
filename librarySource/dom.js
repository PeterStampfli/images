/**
 * working with the document object model
 * always using id strings or similar
 * @namespace DOM
 */

/* jshint esversion:6 */

var DOM = {};


(function() {
    "use strict";

    /**
     * create an element, give it an id, add to parent,if it has a text, add text to element 
     * @method DOM.create
     * @param {String} tag
     * @param {String} id
     * @param {String} parent - css selector for parent (tag "body" or id selector "#id")
     * @param {String} text - optional
     */
    DOM.create = function(tag, id, parent, text) {
        let element = document.createElement(tag);
        element.setAttribute("id", id);
        document.querySelector(parent).appendChild(element);
        if (arguments.length > 3) {
            let textNode = document.createTextNode(text);
            element.appendChild(textNode);
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

}());
