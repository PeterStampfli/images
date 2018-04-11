/**
 * dispatching keydown events to objects
 * @namespace KeyboardEvents
 */

/* jshint esversion:6 */

var KeyboardEvents = {};


(function() {
    "use strict";

    // listeners for a keydown event
    KeyboardEvents.keydownListeners = [];

    /**
     * adding an object with a keydown(key) method
     * @method KeyboardEvents.addKeydownListener
     * @param {object} listener
     */
    KeyboardEvents.addKeydownListener = function(listener) {
        KeyboardEvents.keydownListeners.push(listener);
    };

    // functions to call and their keys 
    KeyboardEvents.functions = [];
    KeyboardEvents.functionKeys = [];

    /**
     * add a function and its key to keyboard events
     * @method KeyboardEvents.addFunction
     * @param {function} theFunction
     * @param {String} key
     */
    KeyboardEvents.addFunction = function(theFunction, key) {
        KeyboardEvents.functions.push(theFunction);
        KeyboardEvents.functionKeys.push(key);
    };

    /**
     * adding html elements with a click() method
     * will be "clicked" if special key is pressed
     * @method KeyboardEvents.addClickListener
     * @param {idName} listenerId
     * @param {String} key
     */
    KeyboardEvents.addClickListener = function(listenerId, key) {
        KeyboardEvents.addFunction(function() {
            document.getElementById(listenerId).click();
        }, key);
    };

    /**
     * adding an URL of a html page that will be reached upon key pressed
     * @method KeyboardEvents.addUrl
     * @param {String} url 
     * @param {String} key 
     */
    KeyboardEvents.addUrl = function(url, key) {
        KeyboardEvents.addFunction(function() {
            window.location = url;
        }, key);
    };

    /**
     * setting up leftArrow and rightArrow to go to previous and next addUrl
     * @method KeyboardEvents.setPreviousNext
     * @param {String} previousUrl
     * @param {String} nextUrl
     */
    KeyboardEvents.setPreviousNext = function(previousUrl, nextUrl) {
        KeyboardEvents.addUrl(previousUrl, "ArrowLeft");
        KeyboardEvents.addUrl(nextUrl, "ArrowRight");
    };

    /*
     * event listener that sends out the keyboard signals to listeners and calls functions
     */
    document.onkeydown = function(event) {
        var i;
        let key = event.key;
        console.log(key);
        KeyboardEvents.keydownListeners.forEach(function(listener) {
            listener.keydown(key);
        });
        let length = KeyboardEvents.functions.length;
        for (i = 0; i < length; i++) {
            if (key == KeyboardEvents.functionKeys[i]) {
                KeyboardEvents.functions[i]();
            }
        }
    };

}());
