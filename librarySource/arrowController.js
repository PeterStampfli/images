/** a controller using a canvas with a rotating arrow, extending pixelcanvas object, call constructor without new
 * @constructor ArrowController
 * @param {String} idName - html identifier
 * @param {integer} size - width and height
 */

/* jshint esversion:6 */

/*
it is basically a PixelCanvas object, adding fields and methods to the instance
usually we have only one instance, so this does not waste much memory and it not worth to bother with subclass acrobatics
*/

function ArrowController(idName, size) {
    "use strict";
    let arrowController = new PixelCanvas(idName);


    arrowController.mouseEvents = new MouseEvents(idName);

    /**
     * what to do if angle changes (redraw image)
     * @method arrowController#action
     */
    arrowController.action = function() {};


    arrowController.angle = 0;
    arrowController.backGroundColor = "Yellow";
    arrowController.arrowColor = "Red";



    arrowController.setupOnscreen(size, size);

    // setting the scale and origin (only of context)
    arrowController.canvasContext.scale(size / 2, size / 2);
    arrowController.canvasContext.translate(1, 1);



    /**
     * draw the orientation arrow
     * @method arrowController#drawOrientation
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
     * update after change of angle: draw new orientation and call action
     * @method arrowController#update
     * @param {float} newAngle - the new angle
     */
    arrowController.update = function(newAngle) {
        arrowController.angle = newAngle;
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

    arrowController.mouseEvents.addDownAction(function(mouseEvents) {
        mouseEvents.pressed = arrowController.isOnDisc(mouseEvents.x, mouseEvents.y);
        console.log("down" + mouseEvents.pressed);
    });



    return arrowController;
}
