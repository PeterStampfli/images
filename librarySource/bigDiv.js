/**
 * a div html element with positioning and other formats
 * and a method to mark its space for debugging
 * @constructor BigDiv
 * @param {String} idName - html identifier
 */

/* jshint esversion:6 */

function BigDiv(idName) {
    this.idName = idName;
    if (document.getElementById(idName) == null) {
        DOM.create("div", idName, "body");
    }
    DOM.style("#" + this.idName, "zIndex", "4", "position", "fixed");
    DOM.style("#" + this.idName, "overflow", "auto");
    this.setPosition(0, 0);
}

(function() {
    "use strict";

    /**
     * set position, preset to (0,0)
     * @method BigDiv#setPosition
     * @param {float} left
     * @param {float} top
     */
    BigDiv.prototype.setPosition = function(left, top) {
        DOM.style("#" + this.idName, "left", left + px, "top", top + px);
        this.left = left;
        this.top = top;
    };

    /**
     * set dimensions
     * @method BigDiv#setDimensions
     * @param {float} width
     * @param {float} height
     */
    BigDiv.prototype.setDimensions = function(width, height) {
        width = Math.floor(width);
        height = Math.floor(height);
        this.width = width;
        this.height = height;
        DOM.style("#" + this.idName, "width", width + px, "height", height + px);
    };

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
