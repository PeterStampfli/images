/**
 * collecting unique lines  as four coordinates and drawing them
 */

import {
    output
}
from "../libgui/modules.js";

import {
    Vector2
}
from "./vector2.js";

/**
 * @constructor DrawingLines
 */

export function DrawingLines() {
    this.axs = [];
    this.ays = [];
    this.bxs = [];
    this.bys = [];
}

DrawingLines.color = '#000000';
DrawingLines.width = 2;
DrawingLines.on = true;

/**
 * return true if empty
 * @method DrawingLines#isEmpty
 * @return boolean, true if arrays empty
 */
DrawingLines.prototype.isEmpty = function() {
    return this.axs.length === 0;
};

DrawingLines.prototype.clear = function() {
    this.axs.length = 0;
    this.ays.length = 0;
    this.bxs.length = 0;
    this.bys.length = 0;
};

/**
 * draw the lines
 * @method DrawingLines.draw
 */
DrawingLines.prototype.draw = function() {
    if (DrawingLines.on) {
        const canvasContext = output.canvas.getContext('2d');
        output.setLineWidth(DrawingLines.width);
        canvasContext.strokeStyle = DrawingLines.color;
        const length = this.axs.length;
        for (var i = 0; i < length; i++) {
            canvasContext.beginPath();
            canvasContext.moveTo(this.axs[i], this.ays[i]);
            canvasContext.lineTo(this.bxs[i], this.bys[i]);
            canvasContext.stroke();
        }
    }
};

const eps = 0.01;
/**
 * add a line, no dublicates
 * @method DrawingLines#add
 * @param {Vector2} a
 * @param {Vector2} b
 */
DrawingLines.prototype.add = function(a, b) {
    this.axs.push(a.x);
    this.ays.push(a.y);
    this.bxs.push(b.x);
    this.bys.push(b.y);
};

const center = new Vector2();
const halfDiagonal = new Vector2();
const top = new Vector2();
const bottom = new Vector2();

/**
 * add sides of a parallelgram
 * @method DrawingLines#addParallelogram
 * @param {float} angle
 * @param {Vector2} left - clone if changed later
 * @param {Vector2} right - clone if changed later
 */
DrawingLines.prototype.addParallelogram = function(angle, left, right) {
    center.set(left).lerp(0.5, right);
    halfDiagonal.set(center).sub(left);
    halfDiagonal.scale(Math.tan(angle * 0.5)).rotate90();
    top.set(center).add(halfDiagonal);
    bottom.set(center).sub(halfDiagonal);
    this.add(left, bottom);
    this.add(left, top);
    this.add(bottom, right);
    this.add(top, right);
};


// fast efficient rotation
const sinCos = new Vector2();
/**
 * set the rotation angle
 * @method DrawingLines.setRotationAngle
 * @param {float} angle
 */
DrawingLines.setRotationAngle = function(angle) {
    DrawingLines.cosAngle = Math.cos(angle);
    DrawingLines.sinAngle = Math.sin(angle);
};

/**
 * rotate a vector by the given angle
 * @method DrawingLines.rotate
 * @param {Vector2} p
 * @return the changed vector for chaining
 */
DrawingLines.rotate = function(p) {
    const h = DrawingLines.cosAngle * p.x - DrawingLines.sinAngle * p.y;
    p.y = DrawingLines.sinAngle * p.x + DrawingLines.cosAngle * p.y;
    p.x = h;
    return p;
};

const cornerA = new Vector2();
const cornerB = new Vector2();
const side = new Vector2();

/**
 * add sides of a regular polygon
 * given even number n of sides, a first and a second corner, 
 * the polygon lies at left of the line from first to second
 * @method DrawingLines#addRegularPolygon
 * @param {integer} n - number of sides
 * @param {Vector2} firstCorner - of type A, matching (0,0)
 * @param {Vector2} secondCorner 
 */
DrawingLines.prototype.addRegularPolygon = function(n, firstCorner, secondCorner) {
    DrawingLines.setRotationAngle(2 * Math.PI / n);
    cornerA.set(firstCorner);
    cornerB.set(secondCorner);
    side.set(secondCorner).sub(firstCorner);
    for (var i = 0; i < n; i++) {
        this.add(cornerA, cornerB);
        cornerA.set(cornerB);
        DrawingLines.rotate(side);
        cornerB.add(side);
    }
};
/**
 * add sides of the half of a regular polygon (even number of sides)
 * given even number n of sides, a first and a second corner, 
 * the polygon lies at left of the line from first to second
 * @method DrawingLines#addRegularPolygon
 * @param {integer} n - number of sides
 * @param {Vector2} firstCorner - of type A, matching (0,0)
 * @param {Vector2} secondCorner 
 */
DrawingLines.prototype.addRegularHalfPolygon = function(n, firstCorner, secondCorner) {
    DrawingLines.setRotationAngle(2 * Math.PI / n);
    cornerA.set(firstCorner);
    cornerB.set(secondCorner);
    side.set(secondCorner).sub(firstCorner);
    n /= 2;
    for (var i = 0; i < n; i++) {
        this.add(cornerA, cornerB);
        cornerA.set(cornerB);
        DrawingLines.rotate(side);
        cornerB.add(side);
    }
};

/**
 * add lines between points, do not close
 * @method DrawingLines#addPolyline
 * @param {Vector2List} corners 
 */
DrawingLines.prototype.addPolyline = function(corners) {
    const nLines = arguments.length - 1;
    for (var i = 0; i < nLines; i++) {
        this.add(arguments[i], arguments[i + 1]);
    }
};

DrawingLines.setup = function(gui) {

    gui.addParagraph('<strong>lines</strong>');

    gui.add({
        type: 'boolean',
        params: DrawingLines,
        property: 'on',
        onChange: function() {
            DrawingLines.draw();
        }
    });

    gui.add({
        type: 'number',
        params: DrawingLines,
        property: 'width',
        onChange: function() {
            DrawingLines.draw();
        }
    }).add({
        type: 'color',
        params: DrawingLines,
        property: 'color',
        labelText: 'line',
        onChange: function() {
            DrawingLines.draw();
        }
    });
}