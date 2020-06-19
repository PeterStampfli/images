/* jshint esversion:6 */
import {
    MouseEvents
}
from "./modules.js";

/**
 * shift, scale and rotation (optional) for object with x and y components
 * also manages components of the transform (matrix)
 * particularly of a canvas
 * @creator CoordinateTransform
 * @param {ParamGui} gui
 * @param {boolean} withRotation - optional, defaault=false
 * @param {float} stepSize - optional, step size for UI, default is 0.001
 */

export function CoordinateTransform(gui, withRotation = false, stepSize = 0.001) {
    this.withRotation = withRotation;
    this.shiftX = 0;
    this.shiftY = 0;
    this.scale = 1;
    this.angle = 0;
    this.updateScaleAngle();
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
        step: stepSize,
        width: 55,
        onChange: function() {
            coordinateTransform.updateScaleAngle();
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
}

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
 * add a help text popup
 * @method CoordinateTransform#addHelp
 * @param {String} message - can have html
 */
CoordinateTransform.prototype.addHelp = function(message) {
    this.resetButton.addHelp(message);
};

/**
 * update the combined scale-angle factors
 * call if scale or angle changes
 * @method CoordinateTransform#updateScaleAngle
 */
CoordinateTransform.prototype.updateScaleAngle = function() {
    const angleRad = Math.PI / 180 * this.angle;
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);
    this.cosAngleScale = this.scale * cosAngle;
    this.sinAngleScale = this.scale * sinAngle;
    this.cosAngleInvScale = cosAngle / this.scale;
    this.sinAngleInvScale = sinAngle / this.scale;
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
    this.updateScaleAngle();
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
    this.updateScaleAngle();
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
 * @method CoordinateTransform#do
 * @param {Object} v - with coordinates v.x and v.y
 */
CoordinateTransform.prototype.do = function(v) {
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
 * @method CoordinateTransform#inverse
 * @param {Vector2} v
 */
CoordinateTransform.prototype.inverse = function(v) {
    v.x -= this.shiftX;
    v.y -= this.shiftY;
    let h = this.cosAngleInvScale * v.x + this.sinAngleInvScale * v.y;
    v.y = -this.sinAngleInvScale * v.x + this.cosAngleInvScale * v.y;
    v.x = h;
};