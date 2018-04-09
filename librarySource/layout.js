/**
 * a simple two-panel layout
 * @namespace Layout
 */

/* jshint esversion:6 */

var Layout = {};


(function() {
    "use strict";

    /**
     * get the text-div and the graphics-canvas elements
     * @method Layout.getElements
     * @param {String} idText
     * @param {String} idGraphics
     */

    Layout.getElements = function(idText, idGraphics) {
        Layout.text = document.getElementById(idText);
        Layout.graphics = document.getElementById(idGraphics);
    };







}());
