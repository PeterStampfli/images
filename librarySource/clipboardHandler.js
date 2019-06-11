/**
 * interface to the clipboard
 * just in case that the API chnges or that there will be something new
 * only copy to the clipboard is possible, not pasting because of the browser
 * @namespace clipboardHandler
 */

/* jshint esversion:6 */

var clipboardHandler = {};

(function() {
    "use strict";

    // create a hidden input element to get clipboard access

    const hiddenTextId = DOM.createId();
    const hiddenText = DOM.create("input", hiddenTextId, "body");
    DOM.style("#" + hiddenTextId, "display", "none", "position", "absolute", "left", "-10000px");

    /**
     * flag indicating that the clipboard handler sent a execCommand 
     * @variable clipboardHandler.active {boolean} ignore paste or copy events if true
     */
    clipboardHandler.active = false;

    /**
     * copy a text to the clipboard, only possible if reacting to a user input (button click)
     * @method clipboardHandler.copy
     * @param {String} text - to copy to the clipboard
     */
    clipboardHandler.copy = function(text) {
        DOM.style("#" + hiddenTextId, "display", "initial");
        hiddenText.value = text;
        hiddenText.select();
        clipboardHandler.active = true;
        document.execCommand("copy");
        clipboardHandler.active = false;
        DOM.style("#" + hiddenTextId, "display", "none");
    };

    /**
     * alert that the browser does not allow paste
     * @method clipboardHandler.paste
     */
    clipboardHandler.paste = function() {
        alert("Here, the browser does not allow paste.");
    };

}());
