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
    } else {
        DOM.style("#" + this.idName, "display", "none");
    }

    // setting the scale and origin (only of context) for easy drawing independent of size

    // custom colors possible
    this.backGroundColor = "#777777";
    this.arrowColor = "#ffffff";

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

    // access to this in callbacks
    const arrowController = this;
    // the center of the scanned pixels
    const inputCenter = new Vector2();


    // change scale and angle of input transform with an events object, that has x,y,lastX and lastY fields
    function changeScaleAngle(events) {
        let radius = arrowController.pixelCanvas.canvas.width / 2;
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
        arrowController.controlImage.pixelCanvas.centerOfOpaque(inputCenter);
        inputCenter.scale(1.0 / arrowController.controlImage.controlDivInputSize);
        arrowController.linearTransform.changeAngleFixPoint(deltaAngle, inputCenter.x, inputCenter.y);
        arrowController.linearTransform.changeScaleFixPoint(scaleFactor, inputCenter.x, inputCenter.y);
        arrowController.drawOrientation();
        arrowController.action();
    }



    if (this.isVisible) { //create mouse and touch events only if the image is visible
        this.mouseEvents = new MouseEvents(idName);
        this.touchEvents = new TouchEvents(idName);

        /*
         * adding the down action: Sets pressed to true only if mouse is on inner circle.
         */
        this.mouseEvents.downAction = function(mouseEvents) {
            mouseEvents.pressed = arrowController.isOnDisc(mouseEvents.x, mouseEvents.y);
        };

        // moving the mouse we can change the scale and rotation of the input mapping
        // restrict on the circle shape
        this.mouseEvents.dragAction = function(mouseEvents) {
            if (arrowController.isOnDisc(mouseEvents.x, mouseEvents.y)) {
                changeScaleAngle(mouseEvents);
            } else {
                mouseEvents.pressed = false;
            }
        };

        /*
         * add wheel action: change arrow position and call arrowController.action() function for redrawing instantly
         * changeAngle calls arrowController.action
         */
        this.mouseEvents.wheelAction = function(mouseEvents) {
            var deltaAngle = 0.05;
            if (arrowController.isOnDisc(mouseEvents.x, mouseEvents.y)) {
                if (mouseEvents.wheelDelta > 0) {
                    deltaAngle *= -1;
                }
                arrowController.controlImage.pixelCanvas.centerOfOpaque(inputCenter);
                inputCenter.scale(1.0 / arrowController.controlImage.controlDivInputSize);
                arrowController.linearTransform.changeAngleFixPoint(deltaAngle, inputCenter.x, inputCenter.y);
                arrowController.drawOrientation();
                arrowController.action();
            }
        };

        // touchstart only on the disc
        this.touchEvents.isInsideShape = function(singleTouch) {
            return arrowController.isOnDisc(singleTouch.x, singleTouch.y);
        };

        // touch can rotate and scale
        this.touchEvents.moveAction = function(touchEvents) {
            if (touchEvents.touches.length === 1) {
                changeScaleAngle(touchEvents);
            } else if (touchEvents.touches.length === 2) {

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
     * only if size really changes
     * @method ArrowController#setSize
     * @param{float} size
     */
    ArrowController.prototype.setSize = function(size) {
        console.log(size);
        size = Math.round(size);
        if (size != this.size) {
            this.size = size;
            this.pixelCanvas.setSize(size, size); // don't need no pixels
            this.pixelCanvas.canvasContext.scale(size / 2, size / 2);
            this.pixelCanvas.canvasContext.translate(1, 1);
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
        DOM.style("#" + id, "zIndex", "3");
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

}());
