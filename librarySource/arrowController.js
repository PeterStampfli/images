/** a controller using a canvas with a rotating arrow, extending pixelcanvas object, call constructor without new
 * @constructor arrowController
 * @param {String} idName - html identifier
 * @param {integer} size - width and height
 */

/* jshint esversion:6 */

/*
it is basically a PixelCanvas object, adding fields and methods to the instance
usually we have only one instance, so this does not waste much memory and it not worth to bother with subclass acrobatics
*/

function arrowController(idName, size) {
    "use strict";
    let arrowController = new PixelCanvas(idName);
    arrowController.mouseEvents = new MouseEvents(idName);

    /**
     * what to do if angle changes (redraw image)
     * @method arrowController#action
     */
    arrowController.action = function() {};

    /**
     * set the action() - function for this controller, called at each change for instant following
     * @method arrowController#setAction
     * @param {function} action
     */
    arrowController.setAction = function(action) {
        arrowController.action = action;
    };

    arrowController.angle = 0;

    // setting the scale and origin (only of context)
    arrowController.setSize(size, size); // don't need no pixels
    arrowController.canvasContext.scale(size / 2, size / 2);
    arrowController.canvasContext.translate(1, 1);

    // custom colors possible
    arrowController.backGroundColor = "Yellow";
    arrowController.arrowColor = "Red";

    /**
     * draw the orientation arrow
     * @method ArrowController#drawOrientation
     */
    arrowController.drawOrientation = function() {
        var arrowWidth = 0.2;
        var cosAngle = Math.cos(arrowController.angle);
        var sinAngle = Math.sin(arrowController.angle);
        this.canvasContext.clearRect(-1, -1, 2, 2);
        this.canvasContext.fillStyle = arrowController.backGroundColor;
        this.canvasContext.beginPath();
        this.canvasContext.arc(0, 0, 1, 0, 2 * Math.PI, 1);
        this.canvasContext.fill();
        this.canvasContext.fillStyle = arrowController.arrowColor;
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(cosAngle, sinAngle);
        this.canvasContext.lineTo(arrowWidth * sinAngle, -arrowWidth * cosAngle);
        this.canvasContext.lineTo(-arrowWidth * cosAngle, -arrowWidth * sinAngle);
        this.canvasContext.lineTo(-arrowWidth * sinAngle, arrowWidth * cosAngle);
        this.canvasContext.fill();
    };

    // do the drawing as part of the setup
    arrowController.drawOrientation();

    /**
     * change angle by given amount: draw new orientation and call action
     * @method arrowController#changeAngle
     * @param {float} delta - the change in angle
     */
    arrowController.changeAngle = function(delta) {
        arrowController.angle += delta;
        arrowController.drawOrientation();
        arrowController.action();
    };

    // add the mouse actions
    /** check if a point (x,y) relative to upper left center is on the inner disc
     * @method arrowController#isOnDisc
     * @param {float} x - coordinate of point
     * @param {float} y - coordinate of point
     */
    arrowController.isOnDisc = function(x, y) {
        var radius = this.width / 2;
        return ((x - radius) * (x - radius) + (y - radius) * (y - radius)) < radius * radius;
    };

    /*
     * adding the down action: Sets pressed to true only if mouse is on inner circle.
     */
    arrowController.mouseEvents.addDownAction(function(mouseEvents) {
        mouseEvents.pressed = arrowController.isOnDisc(mouseEvents.x, mouseEvents.y);
        console.log("down" + mouseEvents.pressed);
    });

    /*
     * add standard up and out actions
     */
    arrowController.mouseEvents.addUpAction();
    arrowController.mouseEvents.addOutAction();

    /*
     * add move action: change arrow position and call arrowController.action() function for redrawing instantly
     */
    // restrict on the circle shape
    arrowController.mouseEvents.addMoveAction(function(mouseEvents) {
        var radius = arrowController.canvas.width / 2;
        if (mouseEvents.pressed) {
            if (arrowController.isOnDisc(mouseEvents.x, mouseEvents.y)) {
                arrowController.changeAngle(Math.atan2((mouseEvents.y - radius), (mouseEvents.x - radius)) -
                    Math.atan2((mouseEvents.lastY - radius), (mouseEvents.lastX - radius)));
            } else {
                mouseEvents.pressed = false;
            }
        }
    });

    /*
     * add wheel action: change arrow position and call arrowController.action() function for redrawing instantly
     */
    arrowController.mouseEvents.addWheelAction(function(mouseEvents) {
        var deltaAngle = 0.05;
        if (arrowController.isOnDisc(mouseEvents.x, mouseEvents.y)) {
            if (mouseEvents.wheelDelta > 0) {
                arrowController.changeAngle(deltaAngle);
            } else {
                arrowController.changeAngle(-deltaAngle);
            }
        }
    });

    return arrowController;
}
