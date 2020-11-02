/* jshint esversion:6 */
import {
    MouseEvents,
    guiUtils
}
from "./modules.js";

/**
 * shift, scale and rotation (optional) for object with x and y components
 * using an additional prescaling (accounting for varying output canvas sizee, input image)
 * also manages components of the transform (matrix) of a canvas context 
 * @creator CoordinateTransform
 * @param {ParamGui} gui
 * @param {canvas} canvas - optional, default==null, transform applies to canvas context
 * @param {boolean} withRotation - optional, default==false
 */

export function CoordinateTransform(gui, canvas = null, withRotation = false) {
    this.canvas = canvas;
    this.withRotation = withRotation;
    this.shiftX = 0;
    this.shiftY = 0;
    this.prescale = 1;
    this.scale = 1;
    this.angle = 0;
    this.updateTransform();
    this.setResetValues();

    const coordinateTransform = this;

    /**
     * action upon change of the number
     * @method RealNumber#onchange
     * @param {integer} value
     */
    this.onChange = function(value) {
        console.log("onChange", coordinateTransform.shiftX, coordinateTransform.shiftY, coordinateTransform.scale, coordinateTransform.angle);
    };

    const numbers = {
        type: 'number',
        params: this,
        width: 55,
        onChange: function() {
            coordinateTransform.updateTransform();
            coordinateTransform.onChange();
        }
    };
    this.shiftXController = gui.add(numbers, {
        property: 'shiftX',
        labelText: 'translate X'
    });
    this.shiftYController = this.shiftXController.add(numbers, {
        property: 'shiftY',
        labelText: ' Y'
    });
    this.resetButton = this.shiftYController.add({
        type: 'button',
        buttonText: 'reset',
        onClick: function() {
            coordinateTransform.reset();
            coordinateTransform.onChange();
        }
    });
    this.scaleController = gui.add(numbers, {
        property: 'scale'
    });
    if (withRotation) {
        this.angleController = this.scaleController.add(numbers, {
            property: 'angle',
            min: -180,
            max: 180,
            step: 1
        });
        this.angleController.cyclic();
    }

    this.setStepShift(0.001);
    this.setStepScale(0.001);
}

// coordinate transforms are often related to mouse events
// mouse wheel zooming factor
CoordinateTransform.zoomFactor = 1.04;
// and rotating, angle step, in degrees
CoordinateTransform.angleStep = 1;

/**
 * set step size for shift controllers
 * @method CoordinateTransform#setStepShift
 * @param {number} step
 */
CoordinateTransform.prototype.setStepShift = function(step) {
    this.shiftXController.setStep(step);
    this.shiftYController.setStep(step);
};

/**
 * set step size for scale controller
 * @method CoordinateTransform#setStepScale
 * @param {number} step
 */
CoordinateTransform.prototype.setStepScale = function(step) {
    this.scaleController.setStep(step);
};

/**
 * update the ui values
 * @method CoordinateTransfrom#updateUI
 */
CoordinateTransform.prototype.updateUI = function() {
    this.shiftXController.updateDisplay();
    this.shiftYController.updateDisplay();
    this.scaleController.updateDisplay();
    if (this.withRotation) {
        this.angleController.updateDisplay();
    }
};

/**
 * hide the ui
 * @method CoordinateTransfrom#hide
 */
CoordinateTransform.prototype.hide = function() {
    this.shiftXController.hide();
    this.shiftYController.hide();
    this.scaleController.hide();
    if (this.withRotation) {
        this.angleController.hide();
    }
};

/**
 * show the ui
 * @method CoordinateTransfrom#show
 */
CoordinateTransform.prototype.show = function() {
    this.shiftXController.show();
    this.shiftYController.show();
    this.scaleController.show();
    if (this.withRotation) {
        this.angleController.show();
    }
};

/**
 * add a help text popup
 * @method CoordinateTransform#addHelp
 * @param {String} message - can have html
 */
CoordinateTransform.prototype.addHelp = function(message) {
    this.resetButton.addHelp(message);
};

/**
 * update the combined scale-angle factors
 * call if prescale, scale, angle or shift changes
 * updates canvas context if canvas present
 * @method CoordinateTransform#updateTransform
 */
CoordinateTransform.prototype.updateTransform = function() {
    const angleRad = Math.PI / 180 * this.angle;
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);
    this.totalScale = this.prescale * this.scale;
    this.cosAngleScale = this.totalScale * cosAngle;
    this.sinAngleScale = this.totalScale * sinAngle;
    this.cosAngleInvScale = cosAngle / this.totalScale;
    this.sinAngleInvScale = sinAngle / this.totalScale;
    if (guiUtils.isDefined(this.canvas)) {
        // backtransform for the canvas context
        const canvasContext = this.canvas.getContext('2d');
        const cosAngleInvTotalScale = cosAngle / this.totalScale;
        const sinAngleInvTotalScale = sinAngle / this.totalScale;
        const deltaX = cosAngleInvTotalScale * this.shiftX + sinAngleInvTotalScale * this.shiftY;
        const deltaY = -sinAngleInvTotalScale * this.shiftX + cosAngleInvTotalScale * this.shiftY;
        canvasContext.setTransform(1, 0, 0, 1, 0, 0); // reset transform, and then setup backwards transform
        canvasContext.translate(-deltaX, -deltaY);
        canvasContext.rotate(-this.angle / 180 * Math.PI);
        canvasContext.scale(1 / this.totalScale, 1 / this.totalScale);
    }
};

/**
 * set the prescale value 
 * (for changes of the canvas size without changing the ui values)
 * @method CoordinateTransform#setPrescale
 * @param {number} prescale
 */
CoordinateTransform.prototype.setPrescale = function(prescale) {
    this.prescale = prescale;
    this.updateTransform();
};

/**
 * set values
 * to make a transformation from the unit square with corner at (0,0)
 * to a square with corners at (x1,y1) and (x2,y2) set 
 * scale=(x2-x1) and shiftX=x1/scale, shiftY=x2/scale
 * @method CoordinateTransform#setValues
 * @param {number} shiftX - optional, default=0
 * @param {number} shiftY - optional, default=0
 * @param {number} scale - optional, default=1
 * @param {number} angle - optional, default=0
 */
CoordinateTransform.prototype.setValues = function(shiftX = 0, shiftY = 0, scale = 1, angle = 0) {
    this.shiftX = shiftX;
    this.shiftY = shiftY;
    this.scale = scale;
    this.angle = angle;
    this.updateTransform();
    this.updateUI();
};

/**
 * set values for resetting, default parameter values are current values
 * @method CoordinateTransform#setResetValues
 * @param {number} shiftX - optional, default=current value of this.shiftX
 * @param {number} shiftY - optional, default=current value of this.shiftY
 * @param {number} scale - optional, default=current value of this.scale
 * @param {number} angle - optional, default=current value of this.angle
 */
CoordinateTransform.prototype.setResetValues = function(shiftX = this.shiftX, shiftY = this.shiftY, scale = this.scale, angle = this.angle) {
    this.resetShiftX = shiftX;
    this.resetShiftY = shiftY;
    this.resetScale = scale;
    this.resetAngle = angle;
};

/**
 * reset the transformation values to the given reset values
 * @method CoordinateTransform#reset
 */
CoordinateTransform.prototype.reset = function() {
    this.shiftX = this.resetShiftX;
    this.shiftY = this.resetShiftY;
    this.scale = this.resetScale;
    this.angle = this.resetAngle;
    this.updateTransform();
    this.updateUI();
};

// a vector object for intermediate result
const vInter = {
    x: 0,
    y: 0
};

/**
 * change translation part of transform
 * @method CoordinateTransform#changeShift
 * @param {float} deltaX
 * @param {float} deltaY
 */
CoordinateTransform.prototype.changeShift = function(deltaX, deltaY) {
    this.shiftX += deltaX;
    this.shiftY += deltaY;
    this.updateTransform();
    this.updateUI();
};

// the transforms
//============================================================

/**
 * rotate and scale only
 * @method CoordinateTransform#rotateScale
 * @param {Object} v - with coordinates v.x and v.y
 */
CoordinateTransform.prototype.rotateScale = function(v) {
    let h = this.cosAngleScale * v.x - this.sinAngleScale * v.y;
    v.y = this.sinAngleScale * v.x + this.cosAngleScale * v.y;
    v.x = h;
};

/**
 * do the transform: first rotate and scale, then shift
 * @method CoordinateTransform#transform
 * @param {Object} v - with coordinates v.x and v.y
 */
CoordinateTransform.prototype.transform = function(v) {
    let h = this.cosAngleScale * v.x - this.sinAngleScale * v.y + this.shiftX;
    v.y = this.sinAngleScale * v.x + this.cosAngleScale * v.y + this.shiftY;
    v.x = h;
};

/**
 * inverse rotate and scale
 * @method CoordinateTransform#inverseRotateScale
 * @param {Vector2} v
 */
CoordinateTransform.prototype.inverseRotateScale = function(v) {
    let h = this.cosAngleInvScale * v.x + this.sinAngleInvScale * v.y;
    v.y = -this.sinAngleInvScale * v.x + this.cosAngleInvScale * v.y;
    v.x = h;
};

/**
 * inverse transform: first undo the shift, then scale with inverse and rotate by opposite angle
 * @method CoordinateTransform#inverseTransform
 * @param {Vector2} v
 */
CoordinateTransform.prototype.inverseTransform = function(v) {
    v.x -= this.shiftX;
    v.y -= this.shiftY;
    let h = this.cosAngleInvScale * v.x + this.sinAngleInvScale * v.y;
    v.y = -this.sinAngleInvScale * v.x + this.cosAngleInvScale * v.y;
    v.x = h;
};