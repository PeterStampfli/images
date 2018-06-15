/** a controller with a rotating arrow and an angle
 * @constructor ArrowController
 * @param {String} idName - html identifier
 * @param {float} size - width and height
 * @param {float} left - left side, default -1000 for invisible
 * @param {float} top - top side, default -1000 for invisible
 */

/* jshint esversion:6 */

function ArrowController(idName, size, left = -1000, top = -1000) {

    this.idName = idName;

    DOM.create("canvas", idName, "body");

    if (left >= 0) { // visible as position fixed
        DOM.style("#" + this.idName, "zIndex", "4", "position", "fixed", "left", left + px, "top", top + px);
    } else {
        DOM.style("#" + this.idName, "display", "none");
    }
    this.size = size;
    this.left = left;
    this.top = top;
    this.pixelCanvas = new PixelCanvas(idName);
    this.mouseEvents = new MouseEvents(idName);
    this.linearTransform = null;

    /**
     * what to do if angle changes (redraw image)
     * @method arrowController#action
     */
    this.action = function() {};

    // setting the scale and origin (only of context) for easy drawing independent of size
    size = Math.round(size);
    this.pixelCanvas.setSize(size, size); // don't need no pixels
    this.pixelCanvas.canvasContext.scale(size / 2, size / 2);
    this.pixelCanvas.canvasContext.translate(1, 1);

    // custom colors possible
    this.backGroundColor = "#777777";
    this.arrowColor = "#ffffff";



    // access to this in callbacks
    const arrowController = this;

    /*
     * adding the down action: Sets pressed to true only if mouse is on inner circle.
     */
    this.mouseEvents.downAction = function(mouseEvents) {
        mouseEvents.pressed = arrowController.isOnDisc(mouseEvents.x, mouseEvents.y);
    };

    /*
     * move action: change arrow position and call arrowController.action() function for redrawing instantly
     */
    // restrict on the circle shape
    this.mouseEvents.dragAction = function(mouseEvents) {
        var radius = arrowController.pixelCanvas.canvas.width / 2;
        if (mouseEvents.pressed) {
            if (arrowController.isOnDisc(mouseEvents.x, mouseEvents.y)) {
                arrowController.changeAngle(Math.atan2((mouseEvents.y - radius), (mouseEvents.x - radius)) -
                    Math.atan2((mouseEvents.lastY - radius), (mouseEvents.lastX - radius)));
            } else {
                mouseEvents.pressed = false;
            }
        }
    };

    /*
     * add wheel action: change arrow position and call arrowController.action() function for redrawing instantly
     * changeAngle calls this.action
     */
    this.mouseEvents.wheelAction = function(mouseEvents) {
        var deltaAngle = 0.05;
        if (arrowController.isOnDisc(mouseEvents.x, mouseEvents.y)) {
            if (mouseEvents.wheelDelta > 0) {
                arrowController.changeAngle(deltaAngle);
            } else {
                arrowController.changeAngle(-deltaAngle);
            }
        }
    };
}

(function() {
    "use strict";

    /**
     * set the action() - function for this controller, called at each change for instant following
     * @method ArrowController#setAction
     * @param {function} action
     */
    ArrowController.prototype.setAction = function(action) {
        this.action = action;
    };


    /**
     * show the square area for debugging layout
     * @method ArrowController#showArea
     */
    ArrowController.prototype.showArea = function() {
        let id = "border" + this.idName;
        DOM.create("div", id, "body", "area for " + this.idName);
        DOM.style("#" + id, "zIndex", "3");
        DOM.style("#" + id, "backgroundColor", "rgba(100,150,255,0.3", "color", "blue");
        DOM.style("#" + id, "position", "fixed", "left", this.left + px, "top", this.top + px);
        DOM.style("#" + id, "width", this.size + px, "height", this.size + px);
    };

    /**
     * draw the orientation arrow
     * @method ArrowController#drawOrientation
     */
    ArrowController.prototype.drawOrientation = function() {
        const arrowWidth = 0.2;
        let angle = this.linearTransform.angle;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const canvasContext = this.pixelCanvas.canvasContext;
        canvasContext.clearRect(-1, -1, 2, 2);
        canvasContext.fillStyle = this.backGroundColor;
        canvasContext.beginPath();
        canvasContext.arc(0, 0, 1, 0, 2 * Math.PI, 1);
        canvasContext.fill();
        canvasContext.fillStyle = this.arrowColor;
        canvasContext.beginPath();
        canvasContext.moveTo(cosAngle, sinAngle);
        canvasContext.lineTo(arrowWidth * sinAngle, -arrowWidth * cosAngle);
        canvasContext.lineTo(-arrowWidth * cosAngle, -arrowWidth * sinAngle);
        canvasContext.lineTo(-arrowWidth * sinAngle, arrowWidth * cosAngle);
        canvasContext.fill();
    };

    /**
     * change angle by given amount: draw new orientation and call action
     * @method ArrowController#changeAngle
     * @param {float} delta - the change in angle
     */
    ArrowController.prototype.changeAngle = function(delta) {
        this.linearTransform.changeAngle(delta);
        this.drawOrientation();
        this.action();
    };

    // add the mouse actions
    /** check if a point (x,y) relative to upper left center is on the inner disc
     * @method ArrowController#isOnDisc
     * @param {float} x - coordinate of point
     * @param {float} y - coordinate of point
     */
    ArrowController.prototype.isOnDisc = function(x, y) {
        var radius = this.pixelCanvas.width / 2;
        return ((x - radius) * (x - radius) + (y - radius) * (y - radius)) < radius * radius;
    };

}());
