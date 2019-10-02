/** a controller with a rotating arrow and an angle
 * @constructor ArrowController
 * @param {String} idName - html identifier
 * @param {boolean} is visible - default true
 */

/* jshint esversion:6 */

function ArrowController(idName, isVisible = true) {
    this.idName = idName;
    this.isVisible = isVisible;
    this.size = -1;
    if (document.getElementById(idName) == null) {
        DOM.create("canvas", idName, "body");
    }
    this.pixelCanvas = new PixelCanvas(idName);
    if (this.isVisible >= 0) { // visible as position fixed
        DOM.style("#" + this.idName, "zIndex", "4", "position", "fixed");
        DOM.style("#" + this.idName, "cursor", "pointer");
    }
    // invisible until image loaded and if it is visible
    DOM.style("#" + this.idName, "display", "none");


    // setting the scale and origin (only of context) for easy drawing independent of size

    // custom colors possible
    this.backGroundColor = "#777777";
    this.arrowColor = "#ffffff";

    /**
     * place and size the arrow controller, depends on app/layout
     * @method ArrowController.place
     */
    this.place = function() {};

    //
    this.controlImage = null;

    // this is the linear transform for reading pixels of the input image
    // has to be set after creation
    this.linearTransform = null;

    /**
     * what to do if angle changes (redraw image)
     * @method arrowController#action
     */
    this.action = function() {};

    /*
     * what to do if the mouse/touch is outside the circle
     */
    this.outAction = function() {};

    /*
     * what to do upon a down event (inside the circle)
     */
    this.downAction = function() {};


    // access to this in callbacks
    const arrowController = this;

    if (this.isVisible) { //create mouse and touch events only if the image is visible
        this.mouseEvents = new MouseEvents(idName);
        this.touchEvents = new TouchEvents(idName);

        /*
         * adding the down action: Sets pressed to true only if mouse is on inner circle.
         */
        this.mouseEvents.downAction = function(mouseEvents) {
            if (arrowController.isOnDisc(mouseEvents.x, mouseEvents.y)) {
                mouseEvents.pressed = true;
                arrowController.downAction();
            } else {
                mouseEvents.pressed = false;
                arrowController.outAction();
            }
        };

        // moving the mouse we can change the scale and rotation of the input mapping
        // restrict on the circle shape
        this.mouseEvents.dragAction = function(mouseEvents) {
            if (arrowController.isOnDisc(mouseEvents.x, mouseEvents.y)) {
                arrowController.changeScaleAngle(mouseEvents);
            } else {
                mouseEvents.pressed = false;
            }
        };

        /*
         * add wheel action: change arrow position and call arrowController.action() function for redrawing instantly
         * changeAngle calls arrowController.action
         */
        this.mouseEvents.wheelAction = function(mouseEvents) {
            if (arrowController.isOnDisc(mouseEvents.x, mouseEvents.y)) {
                arrowController.changeAngleOnWheel(mouseEvents);
            }
        };

        // if touch outside the circle
        this.touchEvents.startAction = function(touchEvents) {
            if (arrowController.isOnDisc(touchEvents.x, touchEvents.y)) {
                arrowController.downAction();
            } else {
                arrowController.touchEvents.deleteAllTouches();
                arrowController.outAction();
            }
        };

        // touch can rotate and scale, only single touch
        this.touchEvents.moveAction = function(touchEvents) {
            if (touchEvents.touches.length === 1) {
                arrowController.changeScaleAngle(touchEvents);
            }
        };
    }
}

(function() {
    "use strict";

    /**
     * set the position of the arrow controller
     * @method ArrowController#setPosition
     * @param {float} left
     * @param {float} top
     */
    ArrowController.prototype.setPosition = function(left, top) {
        this.left = Math.floor(left);
        this.top = Math.floor(top);
        DOM.style("#" + this.idName, "left", left + px, "top", top + px);
    };

    /**
     * set the size of the arrow controler, and the context transform for drawing
     *  and do the drawing
     * only if size really changes
     * @method ArrowController#setSize
     * @param{float} size
     */
    ArrowController.prototype.setSize = function(size) {
        size = Math.round(size);
        if (size != this.size) {
            this.size = size;
            this.pixelCanvas.setSize(size, size); // don't need no pixels
            this.pixelCanvas.canvasContext.scale(size / 2, size / 2);
            this.pixelCanvas.canvasContext.translate(1, 1);
            this.drawOrientation();
        }
    };


    /**
     * show the arrowcontroller (if visible)
     * @method ArrowController#show
     */
    ArrowController.prototype.show = function() {
        if (this.isVisible) {
            DOM.style("#" + this.idName, "display", "initial");
        }
    };

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
        DOM.style("#" + id, "zIndex", "20");
        DOM.style("#" + id, "backgroundColor", "rgba(100,150,255,0.3)", "color", "blue");
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

    /** check if a point (x,y) relative to upper left center is on the inner disc
     * @method ArrowController#isOnDisc
     * @param {float} x - coordinate of point
     * @param {float} y - coordinate of point
     */
    ArrowController.prototype.isOnDisc = function(x, y) {
        var radius = this.pixelCanvas.width / 2;
        return ((x - radius) * (x - radius) + (y - radius) * (y - radius)) < radius * radius;
    };

    // the center of the scanned pixels
    const inputCenter = new Vector2();


    /**
     * change angle of input transform depending on wheel data of mouse events
     * @method ArrowController#changeAngleOnWheel
     * @param {MouseEvents} mouseEvents
     */
    ArrowController.prototype.changeAngleOnWheel = function(mouseEvents) {
        var deltaAngle = 0.05;
        if (mouseEvents.wheelDelta > 0) {
            deltaAngle *= -1;
        }
        this.controlImage.pixelCanvas.centerOfOpaque(inputCenter);
        inputCenter.scale(1.0 / this.controlImage.controlDivInputSize);
        this.linearTransform.changeAngleFixPoint(deltaAngle, inputCenter.x, inputCenter.y);
        this.drawOrientation();
        this.action();
    };

    /**
     * change scale and angle of input transform according to an events object, that has x,y,lastX and lastY fields
     * @method ArrowController#changeScaleAngle
     * @param {event} events
     */
    ArrowController.prototype.changeScaleAngle = function(events) {
        let radius = this.pixelCanvas.canvas.width / 2;
        // coordinates relative to the center of the image
        let relX = events.x - radius;
        let relY = events.y - radius;
        let lastRelX = events.lastX - radius;
        let lastRelY = events.lastY - radius;
        let deltaAngle = Fast.atan2(relY, relX) - Fast.atan2(lastRelY, lastRelX);
        // distance to center of arrow controller
        let distance = Math.hypot(relX, relY);
        let lastDistance = Math.hypot(lastRelX, lastRelY);
        let reductionFactor = 1;
        let scaleFactor = (distance + reductionFactor * radius) / (lastDistance + reductionFactor * radius);
        this.controlImage.pixelCanvas.centerOfOpaque(inputCenter);
        inputCenter.scale(1.0 / this.controlImage.controlDivInputSize);
        this.linearTransform.changeAngleFixPoint(deltaAngle, inputCenter.x, inputCenter.y);
        this.linearTransform.changeScaleFixPoint(scaleFactor, inputCenter.x, inputCenter.y);
        this.drawOrientation();
        this.action();
    };

}());
