/* jshint esversion:6 */

/**
 * shift, scale and rotation (optional) for object with x and y components
 * also manages components of the transform (matrix)
 * particularly of a canvas
 * @creator CoordinateTransform
 * @param {ParamGui} gui
 * @param {boolean} withRotation - optional, defaault=false
 */

export function CoordinateTransform(gui, withRotation = false) {
    console.log(withRotation);
    this.setValues();
    this.setResetValues();

}

/**
 * update the combined scale-angle factors
 * call if scale or angle changes
 * @method CoordinateTransform#updateScaleAngle
 */
CoordinateTransform.prototype.updateScaleAngle = function() {
    const cosAngle = Math.cos(this.angle);
    const sinAngle = Math.sin(this.angle);
    this.cosAngleScale = this.scale * cosAngle;
    this.sinAngleScale = this.scale * sinAngle;
    this.cosAngleInvScale = cosAngle / this.scale;
    this.sinAngleInvScale = sinAngle / this.scale;
};

/**
 * set values
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
};

/**
 * set values for resetting
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
LinearTransform.prototype.changeShift = function(deltaX, deltaY) {
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