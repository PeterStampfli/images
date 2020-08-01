/* jshint esversion: 6 */

import {
    guiUtils,
    BooleanButton,
    output
}
from "../libgui/modules.js";

import {
    circles
} from './modules.js';

// beware of hitting the circle center
const epsilon = 0.0001;
const epsilon2 = epsilon * epsilon;

// for mouse wheel action
Circle.zoomFactor = 1.04;

// parameters for drawing, change if you do not like it 
Circle.lineWidth = 2;
Circle.highlightLineWidth = 6;
Circle.highlightColor = 'yellow';

// selection, regionwidth in px
Circle.selectWidth = Circle.highlightLineWidth;

/**
 * the (re)drawing routine for anything, called after some circle changes
 * to be defined, depending on what to draw
 * typically calls map.draw
 * @method Circle.draw
 */
Circle.draw = function() {
    console.log('Circle.draw');
};

/**
 * a circle as a building block for kaleidoscopes
 * gets its own gui
 * @constructor Circle
 * @param{ParamGui} parentGui 
 * @param{object} properties - optional, radius, centerX, centerY, isInsideOutMap, isMapping, color, id
 */
export function Circle(parentGui, properties) {
    // default parameters
    this.radius = 1;
    this.centerX = 0;
    this.centerY = 0;
    this.isInsideOutMap = true; // map direction, inside-out is more useful, not all circles overlap
    this.isMapping = true; // switch mapping on or off (debugging and building), the intersections remain
    this.color = '#000000'; // color for drawing a circle
    this.id = 0;
    // overwrite defaults with fields of the parameter object                                        // unique id, if circles are deleted the id is not related to index in circles.collection
    if (guiUtils.isObject(properties)) {
        Object.assign(this, properties);
    }
    // for speeding up the mapping
    this.radius2 = this.radius * this.radius;
    // the collection of the circle's intersections
    this.intersections = [];

    // the controllers
    // they do not directly change the parameter value of this circle
    // depending on intersections controllers try to change parameters
    // if it does not work, we still have the old values
    const circle = this;
    this.gui = parentGui.addFolder('Circle ' + this.id);

    this.radiusController = this.gui.add({
        type: 'number',
        initialValue: this.radius,
        labelText: 'radius',
        min: 0,
        onChange: function(radius) {
            circles.setSelected(circle);
            circle.tryRadius(radius);
        }
    });
    this.centerXController = this.gui.add({
        type: 'number',
        labelText: 'center: x',
        initialValue: this.centerX,
        onChange: function(centerX) {
            circles.setSelected(circle);
            circle.tryPosition(centerX, circle.centerY);
        }
    });
    this.centerYController = this.centerXController.add({
        type: 'number',
        labelText: ' y',
        initialValue: this.centerY,
        onChange: function(centerY) {
            circles.setSelected(circle);
            circle.tryPosition(circle.centerX, centerY);
        }
    });
    BooleanButton.whiteBackground();
    this.mapDirectionController = this.gui.add({
        type: 'boolean',
        labelText: 'map',
        width: 100,
        buttonText: ['inside -> out', 'outside -> in'],
        initialValue: this.isInsideOutMap,
        onChange: function(isInsideOutMap) {
            circles.setSelected(circle);
            circle.tryMapDirection(isInsideOutMap);
        }
    });
    BooleanButton.greenRedBackground();
    this.mapOnOffController = this.mapDirectionController.add({
        type: 'boolean',
        params: this,
        property: 'isMapping',
        labelText: '',
        onChange: function() {
            circles.setSelected(circle);
            Circle.draw();
        }
    });
    this.colorController = this.gui.add({
        type: 'color',
        params: this,
        property: 'color',
        onChange: function() {
            console.log('color changed');
            Circle.draw();
        }
    });
}

/**
 * update the ui values
 * need explicite setting the values from this circle's data
 * @method Circle#updateUI
 */
Circle.prototype.updateUI = function() {
    this.centerXController.setValueOnly(this.centerX);
    this.centerYController.setValueOnly(this.centerY);
    this.radiusController.setValueOnly(this.radius);
    this.mapDirectionController.setValueOnly(this.isInsideOutMap);
};

/**
 * activate ui depending on number of intersections
 * call when number of intersections changes
 * @method Circle.activateUI
 */
Circle.prototype.activateUI = function() {
    if (this.intersections.length < 3) {
        this.radiusController.setActive(true);
        this.centerXController.setActive(true);
        this.centerYController.setActive(true);
    } else {
        this.radiusController.setActive(false);
        this.centerXController.setActive(false);
        this.centerYController.setActive(false);
    }
};

/**
 * try a given value for the radius, adjust circle radius and position to intersections
 * if fails do not change current radius
 * if success update UI to new values and draw image
 * @method tryRadius
 * @param {number} radius
 */
Circle.prototype.tryRadius = function(radius) {
    console.log('try radius', radius);
    let success = true;
    switch (this.intersections.length) {
        case 0:
            this.radius = radius;
            this.radius2 = radius * radius;
            break;
        case 1:

            break;
        case 2:

            break;
        case 3:

            break;
    }
    if (success) {
        this.updateUI();
        Circle.draw();
    }
};

/**
 * try a given position, adjust circle radius and position to intersections
 * if fails do not change current position
 * if success update UI to new values and draw image
 * @method tryPosition
 * @param {number} centerX
 * @param {number} centerY
 */
Circle.prototype.tryPosition = function(centerX, centerY) {
    console.log('try position', centerX, centerY);
    let success = true;
    switch (this.intersections.length) {
        case 0:
            this.centerX = centerX;
            this.centerY = centerY;
            break;
        case 1:

            break;
        case 2:

            break;
        case 3:

            break;
    }
    if (success) {
        this.updateUI();
        Circle.draw();
    }
};

/**
 * try a given map direction, adjust circle radius and position to intersections
 * if fails do not change current position
 * if success update UI to new values and draw image
 * @method tryMapDirection
 * @param {boolean} isInsideOutMap
 */
Circle.prototype.tryMapDirection = function(isInsideOutMap) {
    console.log('try map direction', isInsideOutMap);
    // remember the old parameter (maybe it did not change?)
    const currentIsInsideOutMap = this.isInsideOutMap;
    this.isInsideOutMap = isInsideOutMap;
    let success = true;
    switch (this.intersections.length) {
        case 0:
            break;
        case 1:

            break;
        case 2:

            break;
        case 3:

            break;
    }
    if (success) {
        this.updateUI();
        Circle.draw();
    } else {
        this.isInsideOutMap = currentIsInsideOutMap; // fail: restore value
    }
};

/**
 * drawing a circle
 * as a broader circle in a highlight color or narrow in its own color
 * @method Circle#draw
 * @param {boolean} highlight - optional, default is false
 */
Circle.prototype.draw = function(highlight = false) {
    const context = output.canvasContext;
    if (highlight) {
        output.setLineWidth(Circle.highlightLineWidth);
        context.strokeStyle = Circle.highlightColor;
    } else {
        output.setLineWidth(Circle.lineWidth);
        context.strokeStyle = this.color;
    }
    context.beginPath();
    context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    context.stroke();
};

/**
 * check if the circle is selected by position
 * @method Circle#isSelected
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if selected
 */
Circle.prototype.isSelected = function(position) {
    const r = Math.hypot(position.x - this.centerX, position.y - this.centerY);
    const effSelectWidth = Circle.selectWidth * output.coordinateTransform.totalScale;
    return Math.abs(r - this.radius) < effSelectWidth;
};

/**
 * check if the position is inside the target region of the circle map (inside or outside the circle)
 * NOTE: Avoid double negations, use positive form of function
 * @method Circle#isInTarget
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if in target region (inside for outsideIn)
 */
Circle.prototype.isInTarget = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    if (this.isMapping) {
        if (this.isInsideOutMap) {
            return dx * dx + dy * dy > this.radius2;
        } else {
            return dx * dx + dy * dy < this.radius2;
        }
    } else {
        return true;
    }
};

/**
 * make the mapping, return true if mapping occured
 * @method Circle.map
 * @param {object} position - with x and y fields, will be changed
 * @return boolean, true if mapping occured (point was outside target and is inside now)
 */
Circle.prototype.map = function(position) {
    if (this.isMapping) {
        const dx = position.x - this.centerX;
        const dy = position.y - this.centerY;
        const dr2 = dx * dx + dy * dy;
        if (this.isInsideOutMap) {
            if (dr2 < this.radius2) {
                return false;
            } else {
                const factor = this.radius2 / Math.max(dr2, epsilon2);
                position.x = this.centerX + factor * dx;
                position.y = this.centerY + factor * dy;
                return true;
            }
        } else {
            if (dr2 > this.radius2) {
                return false;
            } else {
                const factor = this.radius2 / dr2;
                position.x = this.centerX + factor * dx;
                position.y = this.centerY + factor * dy;
                return true;
            }
        }
    } else {
        return false;
    }
};


/**
 * dragging the circle
 * action depends on intersections
 * @method Circle#dragAction
 * @param{object} event
 */
Circle.prototype.dragAction = function(event) {
    switch (this.intersections.length) {
        case 0:
            this.tryPosition(this.centerX + event.dx, this.centerY + event.dy);
            return;
        case 1:
            return;
        case 2:
            return;
        case 3:
            return; // fixed position, no drag
    }
};

/**
 * mouse wheel on the circle
 * action depends on intersections
 * @method Circle#wheelAction
 * @param{object} event
 */
Circle.prototype.wheelAction = function(event) {
    const zoomFactor = (event.wheelDelta > 0) ? Circle.zoomFactor : 1 / Circle.zoomFactor;
    this.tryRadius(this.radius * zoomFactor);
};

/**
 * destroy the circle and all that depends on it
 * make that there are no more references to this circle hanging around
 * @method Circle#destroy
 */
Circle.prototype.destroy = function() {
    this.gui.destroy();
    circles.remove(this);
    this.intersections.forEach(intersection => intersection.destroy());
};