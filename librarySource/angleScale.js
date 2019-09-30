/** a controller with a rotating arrow to set 
 * an angle (tangential mouse/touch movement and a scale (radial)
 * @constructor AngleScale
 * @param {String} idName - html identifier of a container
 */

/* jshint esversion:6 */

function AngleScale(idName) {
    this.idName = idName;
    this.size = -1;
    this.canvasId = DOM.createId();
    this.canvas = DOM.create("canvas", this.canvasId, "#" + idName);
    // do better!!!
    DOM.style("#" + this.canvasId, "cursor", "pointer");
    this.canvasContext = this.canvas.getContext('2d');


    // custom colors possible
    this.backgroundColor = AngleScale.backgroundColor;
    this.arrowColor = AngleScale.arrowColor;
    this.arrowWidth = AngleScale.arrowWidth;
    // the data
    this.angle = 0;
    this.scale = 1;


    // interacting
    this.mouseEvents = new MouseEvents(idName);
    this.touchEvents = new TouchEvents(idName);


    /**
     * what to do if angle/scale changes (redraw image)
     * @method AngleScale#onChange
     */
    this.onChange = function() {};

    // access to this in callbacks
    const angleScale = this;


}


(function() {
    "use strict";

    // colors, if necessary change them before creating a new instance, or change instance values
    AngleScale.backgroundColor = "#777777";
    AngleScale.arrowColor = "#ffffff";
    AngleScale.arrowWidth = 0.2;

    /**
     * set the size of the controler, and the context transform for drawing
     *  and do the drawing
     * only if size really changes
     * @method AngleScale#setSize
     * @param{float} size
     */
    AngleScale.prototype.setSize = function(size) {
        size = Math.round(size);
        if (size != this.size) {
            this.size = size;
            this.canvas.width = size;
            this.canvas.height = size;
            // drawing context x and y-axis range: -1 ... +1
            this.canvasContext.scale(size / 2, size / 2);
            this.canvasContext.translate(1, 1);
            this.drawOrientation();
        }
    };

    /**
     * draw the orientation arrow
     * @method AngleScale#drawOrientation
     */
    AngleScale.prototype.drawOrientation = function() {
        const arrowWidth = this.arrowWidth;
        const cosAngle = Math.cos(this.angle);
        const sinAngle = Math.sin(this.angle);
        const canvasContext = this.canvasContext;
        canvasContext.clearRect(-1, -1, 2, 2);
        canvasContext.fillStyle = this.backgroundColor;
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
     * check if a point (x,y) relative to upper left center is on the inner disc
     * @method AngleScale#isOnDisc
     * @param {float} x - coordinate of point
     * @param {float} y - coordinate of point
     */
    AngleScale.prototype.isOnDisc = function(x, y) {
        var radius = this.canvas.width / 2;
        return ((x - radius) * (x - radius) + (y - radius) * (y - radius)) < radius * radius;
    };



    /**
     * set the angle (and redraw)
     * @method AngleScale#setAngle
     * @param {float} angle
     * @return this
     */
    AngleScale.prototype.setAngle = function(angle) {
        this.angle = angle;
        this.drawOrientation();
    };

    /**
     * get the angle 
     * @method AngleScale#getAngle
     * @return float - the angle
     */
    AngleScale.prototype.getAngle = function() {
        return this.angle;
    };

    /**
     * set the scale (no redraw)
     * @method AngleScale#setScale
     * @param {float} scale
     * @return this
     */
    AngleScale.prototype.setScale = function(scale) {
        this.scale = scale;
    };

    /**
     * get the scale 
     * @method AngleScale#getScale
     * @return float - the scale
     */
    AngleScale.prototype.getScale = function() {
        return this.scale;
    };


}());
