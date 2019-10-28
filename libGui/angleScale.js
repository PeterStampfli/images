/** a controller with a rotating arrow to set 
 * an angle (tangential mouse/touch movement and a scale (radial)
 * @constructor AngleScale
 * @param {String} idName - html identifier of a div as container 
 */

/* jshint esversion:6 */
import {
    TouchEvents,
    MouseEvents,
    DOM
} from "./modules.js";

export function AngleScale(idName) {
    this.idName = idName;
    this.canvasId = DOM.createId();
    this.canvas = DOM.create("canvas", this.canvasId, "#" + idName);
    /*   // make that it can have focus
       this.canvas.setAttribute("tabindex","1")
       // no special "focus border"
       this.canvas.style.outlineStyle="none";
    */
    this.canvasContext = this.canvas.getContext('2d');
    // units: set/get angle
    // value of a full turn
    this.fullTurn = 360; // using degrees

    // custom colors possible
    this.backgroundColor = AngleScale.backgroundColor;
    this.arrowColor = AngleScale.arrowColor;
    this.arrowWidth = AngleScale.arrowWidth;
    // the data
    this.angle = 0;
    this.scale = 1;

    // interacting
    this.mouseEvents = new MouseEvents(this.canvasId);
    this.touchEvents = new TouchEvents(this.canvasId);

    /**
     * what to do if angle/scale changes (redraw image)
     * @method AngleScale#onChange
     */
    this.onChange = function() {
        console.log("change angle " + this.angle + " scale " + this.scale);
    };

    // access to this in callbacks
    const angleScale = this;

    /*
     * add mouse move action: change pointer
     */
    this.mouseEvents.moveAction = function(mouseEvents) {
        if (angleScale.isOnDisc(mouseEvents.x, mouseEvents.y)) {
            DOM.style("#" + angleScale.canvasId, "cursor", "pointer");
        } else {
            DOM.style("#" + angleScale.canvasId, "cursor", "initial");
        }
    };

    /*
     * adding the down action: Sets pressed to true only if mouse is on inner circle.
     */
    this.mouseEvents.downAction = function(mouseEvents) {
        if (angleScale.isOnDisc(mouseEvents.x, mouseEvents.y)) {
            mouseEvents.pressed = true;
        } else {
            mouseEvents.pressed = false;
        }
    };

    // moving the mouse we can change the scale and rotation of the input mapping
    // restrict on the circle shape
    this.mouseEvents.dragAction = function(mouseEvents) {
        //  if (angleScale.isOnDisc(mouseEvents.x, mouseEvents.y)) {
        angleScale.changeScaleAngle(mouseEvents);
        //    } else {
        //        mouseEvents.pressed = false;  // switches to move action
        //   }
    };

    /*
     * add wheel action: change arrow position and call  this.onChange
     * returns true if has done nothing and default should be done
     */
    this.mouseEvents.wheelAction = function(mouseEvents) {
        if (angleScale.isOnDisc(mouseEvents.x, mouseEvents.y)) {
            angleScale.changeAngleOnWheel(mouseEvents);
            return false;
        }
        return true;
    };

    // if touch outside the circle
    this.touchEvents.startAction = function(touchEvents) {
        if (angleScale.isOnDisc(touchEvents.x, touchEvents.y)) {} else {
            angleScale.touchEvents.deleteAllTouches();
        }
    };

    // touch can rotate and scale, only single touch
    this.touchEvents.moveAction = function(touchEvents) {
        if (touchEvents.touches.length === 1) {
            angleScale.changeScaleAngle(touchEvents);
        }
    };
}

// colors, if necessary change them before creating a new instance, or change instance values
AngleScale.backgroundColor = "#777777";
AngleScale.arrowColor = "#ffffff";
AngleScale.arrowWidth = 0.2;

/**
 * set the size of the controler, and the context transform for drawing
 *  and do the drawing
 * only if size really changes
 * @method AngleScale#setSize
 * @param{float} width
 * @param{float} height
 */
AngleScale.prototype.setDimensions = function(width, height) {
    width = Math.round(width);
    height = Math.round(height);
    this.canvas.width = width;
    this.canvas.height = height;
    const radius = Math.min(width, height) / 2;
    // drawing context x and y-axis range: -1 ... +1
    this.canvasContext.scale(radius, radius);
    this.canvasContext.translate(0.5 * width / radius, 0.5 * height / radius);
    this.drawOrientation();
};

/**
 * draw the orientation arrow
 * @method AngleScale#drawOrientation
 */
AngleScale.prototype.drawOrientation = function() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const radius = Math.min(width, height) / 2;
    const arrowWidth = this.arrowWidth;
    const cosAngle = Math.cos(this.angle);
    // compensate for inverted y-axis
    const sinAngle = -Math.sin(this.angle);
    const canvasContext = this.canvasContext;
    canvasContext.clearRect(-0.5 * width / radius, -0.5 * height / radius, width / radius, height / radius);
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
    const width2 = this.canvas.width / 2;
    const height2 = this.canvas.height / 2;
    const radius = Math.min(width2, height2);
    return ((x - width2) * (x - width2) + (y - height2) * (y - height2)) < radius * radius;
};

/**
 * change angle of input transform depending on wheel data of mouse events
 * @method AngleScale#changeAngleOnWheel
 * @param {MouseEvents} mouseEvents
 */
AngleScale.prototype.changeAngleOnWheel = function(mouseEvents) {
    var deltaAngle = 0.05;
    if (mouseEvents.wheelDelta > 0) {
        deltaAngle *= -1;
    }
    this.angle += deltaAngle;
    this.drawOrientation();
    this.onChange();
};

/**
 * change scale and angle of input transform according to an events object, that has x,y,lastX and lastY fields
 * @method AngleScale#changeScaleAngle
 * @param {event} events
 */
AngleScale.prototype.changeScaleAngle = function(events) {
    const width2 = this.canvas.width / 2;
    const height2 = this.canvas.height / 2;
    const radius = Math.min(width2, height2);
    // coordinates relative to the center of the image
    let relX = events.x - width2;
    let relY = events.y - height2;
    let lastRelX = events.lastX - width2;
    let lastRelY = events.lastY - height2;
    let deltaAngle = Math.atan2(relY, relX) - Math.atan2(lastRelY, lastRelX);
    // distance to center of arrow controller
    let distance = Math.hypot(relX, relY);
    let lastDistance = Math.hypot(lastRelX, lastRelY);
    let reductionFactor = 1;
    let scaleFactor = (distance + reductionFactor * radius) / (lastDistance + reductionFactor * radius);
    // compensate for inverted y-axis
    this.angle -= deltaAngle;
    this.scale *= scaleFactor;
    this.drawOrientation();
    this.onChange();
};

/**
 * set the angle (and redraw)
 * @method AngleScale#setAngle
 * @param {float} angle
 * @return this
 */
AngleScale.prototype.setAngle = function(angle) {
    this.angle = 2 * Math.PI / this.fullTurn * angle;
    this.drawOrientation();
};

/**
 * get the angle 
 * @method AngleScale#getAngle
 * @return float - the angle
 */
AngleScale.prototype.getAngle = function() {
    return 0.5 * this.fullTurn / Math.PI * this.angle;
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


/**
 * destroy the angleScale element, taking care of all references
 * maybe too careful
 * @method AngleScale#destroy
 */
AngleScale.prototype.destroy = function() {
    this.mouseEvents.destroy();
    this.touchEvents.destroy();
    this.canvas.remove();
    this.canvas = null;
};