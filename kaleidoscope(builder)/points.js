/* jshint esversion: 6 */

import {
    guiUtils,
    output
}
from "../libgui/modules.js";

const drawRadius = 5;
const selectionRadius = 6;
const linewidth = 2;

// colors
const borderSelected = '#ffffff';
const borderNotSelected = '#000000';
const fill = [];
fill[0] = '#8888ff';
fill[1] = '#ffff00';
fill[2] = '#999999';

// a point object that can be selected and drawn
// inverted y-axis
export const Point = function Point(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
};

Point.zero = 0;
Point.singularity = 1;
Point.neutral = 2;

// see if point is selected by position.x, position.y
Point.prototype.isSelected = function(position) {
    let selectionRadius2 = selectionRadius * output.coordinateTransform.totalScale;
    selectionRadius2 = selectionRadius2 * selectionRadius2;
    const dx = position.x - this.x;
    const dy = position.y + this.y;
    return (dx * dx + dy * dy) < selectionRadius2;
};

// draw the point, depending on whether is selected
Point.prototype.draw = function(isSelected) {
    const context = output.canvasContext;
    const radius = drawRadius * output.coordinateTransform.totalScale;
    output.setLineWidth(linewidth);
    if (isSelected) {
        context.strokeStyle = borderSelected;
    } else {
        context.strokeStyle = borderNotSelected;
    }
    context.fillStyle = fill[this.type];
    context.beginPath();
    context.arc(this.x, -this.y, radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
};

// drag a point
Point.prototype.drag = function(event) {
    this.x += event.dx;
    this.y -= event.dy;
};

// collecting the points and doing the main work
// particularly rapid calculations

export const points = {};

points.collection = [];

points.clear = function() {
    points.collection.length = 0;
};

points.add = function(point) {
    points.collection.push(point);
};

// check if one of the points is selected, position or event (x,y) fields
points.isSelected = function(position) {
    for (let i = points.collection.length - 1; i >= 0; i--) {
        if (points.collection[i].isSelected(position)) {
            return true;
        }
    }
    return false;
};

// select the point corresponding to event position, move it to top
// (if not at top)
points.select = function(position) {
    const length = points.collection.length;
    for (let i = length - 2; i >= 0; i--) {
        if (points.collection[i].isSelected(position)) {
            const selectedPoint = points.collection[i];
            for (let j = i; j < length - 1; j++) {
                points.collection[j] = points.collection[j + 1];
            }
            points.collection[length - 1] = selectedPoint;
            points.setTop(selectedPoint);
        }
    }
};

// draw points
points.draw = function() {
    const length = points.collection.length;
    if (length > 0) {
        for (let i = 0; i < length - 1; i++) {
            points.collection[i].draw(false);
        }
        points.collection[length - 1].draw(true);
    }
};

// remove selected point, at top
points.remove = function() {
    points.collection.pop();
};

// drag selected point at top
points.drag = function(event) {
    const length = points.collection.length;
    if (length > 0) {
        points.collection[length - 1].drag(event);
    }
};

// UI

const top = {};
top.x = 0;
top.y = 0;
top.type = Point.zero;

points.setTop = function(point) {
    points.topXController.setValueOnly(point.x);
    points.topYController.setValueOnly(point.y);
    points.topTypeController.setValueOnly(point.type);
};

points.setup = function(gui) {
    gui.addParagraph('zeros and singularity');
    points.topXController = gui.add({
        type: 'number',
        params: top,
        property: 'x',
        labelText: 'position',
        onChange: function() {}
    });
    points.topYController = points.topXController.add({
        type: 'number',
        params: top,
        property: 'y',
        labelText: '',
        onChange: function() {}
    });
    points.topTypeController = gui.add({
        type: 'selection',
        params: top,
        property: 'type',
        options: {
            zero: Point.zero,
            singularity: Point.singularity,
            neutral: Point.neutral
        },
        onChange: function() {}
    });


};