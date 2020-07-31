/* jshint esversion: 6 */

import {
    guiUtils,
    output
}
from "../libgui/modules.js";

import {
    circles
} from './modules.js';

// directions
const insideOut = 'inside-out';
const outsideIn = 'outside-in';

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
 * a circle as a building block for kaleidoscopes
 * gets its own gui
 * @constructor Circle
 * @param{ParamGui} parentGui 
 * @param{object} properties - optional, radius, centerX, centerY, isOutsideInMap, color, id
 */
export function Circle(parentGui, properties) {
    // default parameters
    this.radius = 1;
    this.centerX = 0;
    this.centerY = 0;
    this.isInsideOutMap = true;                      // map direction, inside-out is more useful, not all cirlces overlap
    this.color='#000000';                             // color for drawing a circle
    this.id=0;
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
        labelText:'radius',
        min: 0,
        onChange: function() {
            circles.setSelected(circle);


            Circle.draw();
        }
    });
    this.centerXController = this.gui.add({
        type: 'number',
        params: this,
        property: 'centerX',
        labelText: 'center: x',
        onChange: function(x) {
            circles.setSelected(circle);
            if (circle.intersections.length === 1) {
                // only one intersection: adjust y-coordinate to get a rotation of center
                // x- coordinate restricted to range of d around center of other circcle
                const intersection = circle.intersections[0];
                const d = intersection.distanceBetweenCenters();
                const otherCircle = intersection.getOtherCircle(circle);
                const otherCenterX = otherCircle.centerX;
                const otherCenterY = otherCircle.centerY;
                const dx = Math.min(d, Math.max(-d, x - otherCenterX));
                if (circle.centerY < otherCenterY) {
                    circle.setCenter(otherCenterX + dx, otherCenterY - Math.sqrt(d * d - dx * dx));
                } else {
                    circle.setCenter(otherCenterX + dx, otherCenterY + Math.sqrt(d * d - dx * dx));
                }
            }
            Circle.draw();
        }
    });
    this.centerYController = this.centerXController.add({
        type: 'number',
        params: this,
        property: 'centerY',
        labelText: ' y',
        onChange: function(y) {
            circles.setSelected(circle);
            if (circle.intersections.length === 1) {
                // only one intersection: adjust x-coordinate to get a rotation of center
                // y- coordinate restricted to range of d around center of other circcle
                const intersection = circle.intersections[0];
                const d = intersection.distanceBetweenCenters();
                const otherCircle = intersection.getOtherCircle(circle);
                const otherCenterX = otherCircle.centerX;
                const otherCenterY = otherCircle.centerY;
                const dy = Math.min(d, Math.max(-d, y - otherCenterY));
                if (circle.centerX < otherCenterX) {
                    circle.setCenter(otherCenterX - Math.sqrt(d * d - dy * dy), otherCenterY + dy);
                } else {
                    circle.setCenter(otherCenterX + Math.sqrt(d * d - dy * dy), otherCenterY + dy);
                }
            }
            Circle.draw();
        }
    });
    this.mapDirectionController = this.gui.add({
        type: 'boolean',
        params: this,
        property: 'mapDirection',
        onChange: function() {
            circles.setSelected(circle);
            circle.setIsOutsideInMap(circle.mapDirection === outsideIn);
            console.log('mapDirection changed', circle.isOutsideInMap);
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
 * @method Circle#updateUI
 */
Circle.prototype.updateUI = function() {
    this.centerXController.updateDisplay();
    this.centerYController.updateDisplay();
    this.radiusController.updateDisplay();
    this.mapDirectionController.updateDisplay();
};
