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

    // listeners for click event, and corresponding key
    KeyboardEvents.clickListeners = [];
    KeyboardEvents.clickListenerKeys = [];

    /**
     * adding html elements with a click() method
     * will be "clicked" if special key is pressed
     * @method KeyboardEvents.addClickListener
     * @param {idName} listenerId
     * @param {String} key
     */
    KeyboardEvents.addClickListener = function(listenerId, key) {
        KeyboardEvents.clickListeners.push(document.getElementById(listenerId));
        KeyboardEvents.clickListenerKeys.push(key);
    };

    KeyboardEvents.urls = [];
    KeyboardEvents.urlKeys = [];

    /**
     * adding an URL of a html page that will be reached upon key pressed
     * @method KeyboardEvents.addUrl
     * @param {String} url 
     * @param {String} key 
     */
    KeyboardEvents.addUrl = function(url, key) {
        KeyboardEvents.urls.push(url);
        KeyboardEvents.urlKeys.push(key);
    };

    document.onkeydown = function(event) {
        console.log("key " + event.key);
        var i;
        let key = event.key;
        KeyboardEvents.keydownListeners.forEach(function(listener) {
            listener.keydown(key);
        });
        let length = KeyboardEvents.clickListeners.length;
        for (i = 0; i < length; i++) {
            if (key == KeyboardEvents.clickListenerKeys[i]) {
                KeyboardEvents.clickListeners[i].click();
            }
        }
        length = KeyboardEvents.urls.length;
        for (i = 0; i < length; i++) {
            if (key == KeyboardEvents.urlKeys[i]) {
                window.location = KeyboardEvents.urls[i];
            }
        }
    };

}());
