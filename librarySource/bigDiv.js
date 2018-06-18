/**
 * a div html element with positioning and other formats
 * and a method to mark its space for debugging
 * @constructor BigDiv
 * @param {String} idName - html identifier
 * @param {float} width and height
 * @param {float} height
 * @param {float} left - left side, default 0
 * @param {float} top - top side, default 0
 */

/* jshint esversion:6 */

function BigDiv(idName, width, height = width, left = 0, top = 0) {
    this.idName = idName;
    if (document.getElementById(idName) == null) {
        DOM.create("div", idName, "body");
    }
    DOM.style("#" + this.idName, "zIndex", "4", "position", "fixed");
    DOM.style("#" + this.idName, "width", width + px, "height", height + px, "left", left + px, "top", top + px);
    DOM.style("#" + this.idName, "overflow", "auto");
    this.width = width;
    this.height = height;
    this.left = left;
    this.top = top;
}

(function() {
    "use strict";

    /**
     * show the square area for debugging layout, especially if still empty
     * @method ArrowController#showArea
     */
    BigDiv.prototype.showArea = function() {
        let id = "border" + this.idName;
        DOM.create("div", id, "body", "area for " + this.idName);
        DOM.style("#" + id, "zIndex", "3");
        DOM.style("#" + id, "backgroundColor", "rgba(250,50,0,0.3)", "color", "red");
        DOM.style("#" + id, "position", "fixed", "left", this.left + px, "top", this.top + px);
        DOM.style("#" + id, "width", this.width + px, "height", this.height + px);
    };

}());
