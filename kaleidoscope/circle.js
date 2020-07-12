/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

// directions
const insideOut = 'inside-out';
const outsideIn = 'outside-in';

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
 * @param{ParamGui} gui 
 */
export function Circle(gui) {
    this.radius = 1;
    this.centerX = 0;
    this.centerY = 0;
    this.isOutsideInMap = true;
    this.mapDirection = outsideIn;
    this.color = '#000000';
    const circle = this;
    // controllers: do not do things with them from the outside
    this.radiusController = gui.add({
        type: 'number',
        params: this,
        property: 'radius',
        min: 0,
        onChange: function() {
            circle.radius2 = circle.radius * circle.radius;
            console.log('radius changed');
            Circle.draw();
        }
    });
    this.centerXController = gui.add({
        type: 'number',
        params: this,
        property: 'centerX',
        labelText: 'center: x',
        onChange: function() {
            console.log('centerX changed');
            Circle.draw();
        }
    });
    this.centerYController = this.centerXController.add({
        type: 'number',
        params: this,
        property: 'centerY',
        labelText: ' y',
        onChange: function() {
            console.log('centerY changed');
            Circle.draw();
        }
    });
    this.mapDirectionController = gui.add({
        type: 'selection',
        params: this,
        property: 'mapDirection',
        options: [outsideIn, insideOut],
        onChange: function() {
            circle.isOutsideInMap = (circle.mapDirection === outsideIn);
            console.log('mapDirection changed', circle.isOutsideInMap);
            Circle.draw();
        }
    });
    this.colorController = gui.add({
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
 * set the radius of the circle
 * NOTE: use this and do not set value of the controller directly
 * @method Circle#setRadius
 * @param {float} radius
 * @return this circle, for chaining
 */
Circle.prototype.setRadius = function(radius) {
    this.radius2 = radius * radius;
    this.radius = radius;
    this.radiusController.updateDisplay();
    return this;
};

/**
 * set the center of the circle
 * @method Circle#setCenter
 * @param{float} x
 * @param{float} y
 * @return this circle, for chaining
 */
Circle.prototype.setCenter = function(x, y) {
    this.centerX = x;
    this.centerY = y;
    this.centerXController.updateDisplay();
    this.centerYController.updateDisplay();
    return this;
};

/**
 * set map direction
 * @method Circle#setMapDirection
 * @param{String} direction - 'inside-out' (insideOut) or 'outside-in' (outsideIn)
 */
Circle.prototype.setMapDirection = function(direction) {
    if ((direction === insideOut) || (direction === outsideIn)) {
        this.isOutsideInMap = (direction === outsideIn);
        this.mapDirection = direction;
        this.mapDirectionController.updateDisplay();

    } else {
        console.error('Circle#setMapDirection: direction param is not ' + insideOut + ' or ' + outsideIn + ' it is ' + direction);
    }
};

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
 * drawing a circle
 * as a braod circle in highlight color or narrow in its own color
 * (is the naming too confusing?)
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
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    const effSelectWidth = Circle.selectWidth * output.coordinateTransform.totalScale;
    return Math.abs(dx * dx + dy * dy - this.radius2) < this.radius * effSelectWidth;
};