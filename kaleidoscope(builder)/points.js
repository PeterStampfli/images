/* jshint esversion: 6 */

import {
    guiUtils,
    BooleanButton,
    output,
    map
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
    const dy = position.y - this.y;
    return (dx * dx + dy * dy) < selectionRadius2;
};

// draw the point, depending on wether is selected
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
    context.arc(this.x, this.y, radius, 0, 2 * Math.PI);
    context.stroke();
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
point.isSelected = function(position) {
    const length = points.collection.length;
    for (let i = 0; i < length; i++) {
        if (points.collection[i].isSelected(position)) {
            return true;
        }
    }
    return false;
};

// select the point corresponding to event position, move it to top

// draw points

// destroy selected point, at top