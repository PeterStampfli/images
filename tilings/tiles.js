/* jshint esversion: 6 */

import {
    output,
}
from "./library/modules.js";

/**
 * collecting tiles and drawing them
 * @namespace tiles
 */
export const tiles = {};

// speed is important - most simple data structure
// corner coordinates for each tile as arrays
// methods for creating (adding) tile, drawing parts, doing other things, destroying

// the rhombs with 30 degree acute angle
//============================================
const rhomb30BottomX = [];
const rhomb30BottomY = [];
const rhomb30TopX = [];
const rhomb30TopY = [];

/**
 * delete rhombs with 30 degree acute angle
 * @method tiles.deleteRhombs30
 */
tiles.deleteRhombs30 = function() {
    rhomb30BottomX.length = 0;
    rhomb30BottomY.length = 0;
    rhomb30TopX.length = 0;
    rhomb30TopY.length = 0;
};

/**
 * add a rhomb, with coordinates of corners with acute angle
 * @method tiles.addRhomb30
 * @param {number}bottomX
 * @param {number}bottomY
 * @param {number}topX
 * @param {number}topY
 */
tiles.addRhomb30 = function(bottomX, bottomY, topX, topY) {
    rhomb30BottomX.push(bottomX);
    rhomb30BottomY.push(bottomY);
    rhomb30TopX.push(topX);
    rhomb30TopY.push(topY);
};

/**
 * fill the rhombs with solid color
 * set fill style before
 * @method tiles.fillRhombs30
 */
tiles.fillRhombs30 = function() {
    const canvasContext = output.canvasContext;
    const length = rhomb30TopY.length;
    for (var i = 0; i < length; i++) {
        const bX = rhomb30BottomX[i];
        const bY = rhomb30BottomY[i];
        const tX = rhomb30TopX[i];
        const tY = rhomb30TopY[i];
        // make center and missing corners
        const cX = 0.5 * (bX + tX);
        const cY = 0.5 * (bY + tY);
        // 0.378937382=tan(Math.PI/12)*sqrt(2);
        let upX = 0.378937382 * (cX - bX);
        let upY = 0.378937382 * (cY - bY);
        let rightX = upY;
        let rightY = -upX;
        const rX = cX + 0.7071 * rightX;
        const rY = cY + 0.7071 * rightY;
        const lX = cX - 0.7071 * rightX;
        const lY = cY - 0.7071 * rightY;
        output.makePath(bX, bY, rX, rY, tX, tY, lX, lY);
        canvasContext.fill();
    }
};

/**
 * draw border of rhomb
 * set stroke style  and line width before
 * @method tiles.borderRhombs30
 */
tiles.borderRhombs30 = function() {
    const canvasContext = output.canvasContext;
    const length = rhomb30TopY.length;
    for (var i = 0; i < length; i++) {
        const bX = rhomb30BottomX[i];
        const bY = rhomb30BottomY[i];
        const tX = rhomb30TopX[i];
        const tY = rhomb30TopY[i];
        // make center and missing corners
        const cX = 0.5 * (bX + tX);
        const cY = 0.5 * (bY + tY);
        // 0.378937382=tan(Math.PI/12)*sqrt(2);
        let upX = 0.378937382 * (cX - bX);
        let upY = 0.378937382 * (cY - bY);
        let rightX = upY;
        let rightY = -upX;
        const rX = cX + 0.7071 * rightX;
        const rY = cY + 0.7071 * rightY;
        const lX = cX - 0.7071 * rightX;
        const lY = cY - 0.7071 * rightY;
        output.makePath(bX, bY, rX, rY, tX, tY, lX, lY, bX, bY);
        canvasContext.stroke();
    }
};

/**
 * draw grid of rhomb
 * set stroke style  and line width before
 * @method tiles.gridRhombs30
 */
tiles.gridRhombs30 = function() {
    const canvasContext = output.canvasContext;
    const length = rhomb30TopY.length;
    for (var i = 0; i < length; i++) {
        const bX = rhomb30BottomX[i];
        const bY = rhomb30BottomY[i];
        const tX = rhomb30TopX[i];
        const tY = rhomb30TopY[i];
        // make center and missing corners
        const cX = 0.5 * (bX + tX);
        const cY = 0.5 * (bY + tY);
        // 0.378937382=tan(Math.PI/12)*sqrt(2);
        let upX = 0.378937382 * (cX - bX);
        let upY = 0.378937382 * (cY - bY);
        let rightX = upY;
        let rightY = -upX;
        const rX = cX + 0.7071 * rightX;
        const rY = cY + 0.7071 * rightY;
        const lX = cX - 0.7071 * rightX;
        const lY = cY - 0.7071 * rightY;
        // 1.274519=(1+sqrt(3))*cos(15)-0.5*(1+sqrt(3))/cos(15)
        const lowX = cX - 1.2247 * upX;
        const lowY = cY - 1.2247 * upY;
        const highX = cX + 1.2247 * upX;
        const highY = cY + 1.2247 * upY;
        output.makePath(0.5 * (bX + lX), 0.5 * (bY + lY), lowX, lowY, 0.5 * (bX + rX), 0.5 * (bY + rY));
        canvasContext.stroke();
        output.makePath(0.5 * (tX + lX), 0.5 * (tY + lY), highX, highY, 0.5 * (tX + rX), 0.5 * (tY + rY));
        canvasContext.stroke();
        output.makePath(lowX, lowY, highX, highY);
        canvasContext.stroke();
    }
};


/**
 * draw marker of rhomb at bottom corner
 * set fill style before
 * @method tiles.markerRhombs30
 * @param {number}s - relative size of marker
 */
tiles.markerRhombs30 = function(s) {
    const canvasContext = output.canvasContext;
    const length = rhomb30TopY.length;
    for (var i = 0; i < length; i++) {
        const bX = rhomb30BottomX[i];
        const bY = rhomb30BottomY[i];
        const tX = rhomb30TopX[i];
        const tY = rhomb30TopY[i];
        // make center and missing corners
        const cX = 0.5 * (bX + tX);
        const cY = 0.5 * (bY + tY);
        // 0.378937382=tan(Math.PI/12)*sqrt(2);
        let upX = 0.378937382 * (cX - bX);
        let upY = 0.378937382 * (cY - bY);
        let rightX = upY;
        let rightY = -upX;
        const rX = cX + 0.7071 * rightX;
        const rY = cY + 0.7071 * rightY;
        const lX = cX - 0.7071 * rightX;
        const lY = cY - 0.7071 * rightY;
        output.makePath(bX, bY, bX + s * (rX - bX), bY + s * (rY - bY), bX + s * (lX - bX), bY + s * (lY - bY));
        canvasContext.fill();
    }
};

// the quarter squares
//============================================
const squareCenterX = [];
const squareCenterY = [];
const squareCornerX = [];
const squareCornerY = [];

/**
 * delete quarter squares
 * @method tiles.deleteQuarterSquares
 */
tiles.deleteQuarterSquares = function() {
    squareCenterX.length = 0;
    squareCenterY.length = 0;
    squareCornerX.length = 0;
    squareCornerY.length = 0;
};

/**
 * add a quarter square
 * @method tiles.addQuarterSquare
 * @param {number}squareCenterX
 * @param {number}squareCenterY
 * @param {number}squareCornerX
 * @param {number}squareCornerY
 */
tiles.addQuarterSquare = function(centerX, centerY, cornerX, cornerY) {
    squareCenterX.push(centerX);
    squareCenterY.push(centerY);
    squareCornerX.push(cornerX);
    squareCornerY.push(cornerY);
};

/**
 * fill the quarter square with solid color
 * set fill style before
 * strokes borders to other quarter squares, set line width
 * @method tiles.fillQuarterSquares
 */
tiles.fillQuarterSquares = function() {
    const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = canvasContext.fillStyle;
    const length = squareCenterY.length;
    for (var i = 0; i < length; i++) {
        const blX = squareCenterX[i];
        const blY = squareCenterY[i];
        const trX = squareCornerX[i];
        const trY = squareCornerY[i];
        // make center and missing corners
        let cX = 0.5 * (blX + trX);
        let cY = 0.5 * (blY + trY);
        const dX = trX - cX;
        const dY = trY - cY;
        const brX = cX + dY;
        const brY = cY - dX;
        const tlX = cX - dY;
        const tlY = cY + dX;
        output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
        canvasContext.fill();
        output.makePath(trX, trY, blX, blY, brX, brY);
        canvasContext.stroke();
    }
};

/**
 * fill the full square (extended quarter) square with solid color
 * set fill style before
 * strokes borders to other quarter squares, set line width
 * @method tiles.fillFullSquares
 */
tiles.fillFullSquares = function() {
    const canvasContext = output.canvasContext;
    const length = squareCenterY.length;
    for (var i = 0; i < length; i++) {
        const blX = squareCenterX[i];
        const blY = squareCenterY[i];
        const trX = squareCornerX[i];
        const trY = squareCornerY[i];
        // make center and missing corners
        let cX = 0.5 * (blX + trX);
        let cY = 0.5 * (blY + trY);
        const dX = trX - cX;
        const dY = trY - cY;
        const brX = cX + dY;
        const brY = cY - dX;
        const tlX = cX - dY;
        const tlY = cY + dX;
        output.makePath(2 * blX - trX, 2 * blY - trY, 2 * brX - trX, 2 * brY - trY, trX, trY, 2 * tlX - trX, 2 * tlY - trY);
        canvasContext.fill();
    }
};

/**
 * draw grid or subtile border for quarter square
 * set stroke style before
 * strokes borders to other quarter squares, set line width
 * @method tiles.gridQuarterSquares
 */
tiles.gridQuarterSquares = function() {
    const canvasContext = output.canvasContext;
    const length = squareCenterY.length;
    for (var i = 0; i < length; i++) {
        const blX = squareCenterX[i];
        const blY = squareCenterY[i];
        const trX = squareCornerX[i];
        const trY = squareCornerY[i];
        // make center and missing corners
        let cX = 0.5 * (blX + trX);
        let cY = 0.5 * (blY + trY);
        const dX = trX - cX;
        const dY = trY - cY;
        const brX = cX + dY;
        const brY = cY - dX;
        const tlX = cX - dY;
        const tlY = cY + dX;
        output.makePath(tlX, tlY, blX, blY, brX, brY);
        canvasContext.stroke();
    }
};

/**
 * draw (outer) border for quarter square
 * set stroke style before
 * strokes borders to other quarter squares, set line width
 * @method tiles.borderQuarterSquares
 */
tiles.borderQuarterSquares = function() {
    const canvasContext = output.canvasContext;
    const length = squareCenterY.length;
    for (var i = 0; i < length; i++) {
        const blX = squareCenterX[i];
        const blY = squareCenterY[i];
        const trX = squareCornerX[i];
        const trY = squareCornerY[i];
        // make center and missing corners
        let cX = 0.5 * (blX + trX);
        let cY = 0.5 * (blY + trY);
        const dX = trX - cX;
        const dY = trY - cY;
        const brX = cX + dY;
        const brY = cY - dX;
        const tlX = cX - dY;
        const tlY = cY + dX;
        output.makePath(tlX, tlY, trX, trY, brX, brY);
        canvasContext.stroke();
    }
};

/**
 * draw marker at center for quarter square
 * set fill style before
 * @method tiles.markerQuarterSquares
 * @param {number}s - relative size
 */
tiles.markerQuarterSquares = function(s) {
    const canvasContext = output.canvasContext;
    const length = squareCenterY.length;
    for (var i = 0; i < length; i++) {
        const blX = squareCenterX[i];
        const blY = squareCenterY[i];
        const trX = squareCornerX[i];
        const trY = squareCornerY[i];
        // make center and missing corners
        let cX = 0.5 * (blX + trX);
        let cY = 0.5 * (blY + trY);
        const dX = trX - cX;
        const dY = trY - cY;
        const brX = cX + dY;
        const brY = cY - dX;
        const tlX = cX - dY;
        const tlY = cY + dX;
        output.makePath(blX + s * (tlX - blX), blY + s * (tlY - blY), blX, blY, blX + s * (brX - blX), blY + s * (brY - blY));
        canvasContext.fill();
    }
};

// the half triangles
//============================================
const halfTriangleMX = [];
const halfTriangleMY = [];
const halfTriangleBX = [];
const halfTriangleBY = [];
const halfTriangleCX = [];
const halfTriangleCY = [];

/**
 * delete half triangles
 * @method tiles.deleteHalfTriangles
 */
tiles.deleteHalfTriangles = function() {
    halfTriangleMX.length = 0;
    halfTriangleMY.length = 0;
    halfTriangleBX.length = 0;
    halfTriangleBY.length = 0;
    halfTriangleCX.length = 0;
    halfTriangleCY.length = 0;
};

/**
 * add a half triangle
 * @method tiles.addHalfTriangle
 * @param {number}mX
 * @param {number}mY
 * @param {number}bX
 * @param {number}bY
 * @param {number}cX
 * @param {number}cY
 */
tiles.addHalfTriangle = function(mX, mY, bX, bY, cX, cY) {
    halfTriangleMX.push(mX);
    halfTriangleMY.push(mY);
    halfTriangleBX.push(bX);
    halfTriangleBY.push(bY);
    halfTriangleCX.push(cX);
    halfTriangleCY.push(cY);
};

/**
 * fill the half triangle with solid color
 * set fill style before
 * strokes borders to other half triangle, set line width
 * @method tiles.fillQuarterSquares
 */
tiles.fillHalfTriangles = function() {
    const canvasContext = output.canvasContext;
    canvasContext.strokeStyle = canvasContext.fillStyle;
    const length = halfTriangleMX.length;
    for (var i = 0; i < length; i++) {
        const mX = halfTriangleMX[i];
        const mY = halfTriangleMY[i];
        const bX = halfTriangleBX[i];
        const bY = halfTriangleBY[i];
        const cX = halfTriangleCX[i];
        const cY = halfTriangleCY[i];
        output.makePath(mX, mY, bX, bY, cX, cY);
        canvasContext.fill();
        output.makePath(mX, mY, cX, cY);
        canvasContext.stroke();
    }
};

/**
 * draw the grid lines for a half triangle
 * set stroke style before and set line width
 * @method tiles.gridHalfTriangles
 */
tiles.gridHalfTriangles = function() {
    const canvasContext = output.canvasContext;
    const length = halfTriangleMX.length;
    for (var i = 0; i < length; i++) {
        const mX = halfTriangleMX[i];
        const mY = halfTriangleMY[i];
        const bX = halfTriangleBX[i];
        const bY = halfTriangleBY[i];
        const cX = halfTriangleCX[i];
        const cY = halfTriangleCY[i];
        output.makePath(mX, mY, 0.3333 * (mX + mX + cX), 0.3333 * (mY + mY + cY), 0.5 * (cX + bX), 0.5 * (cY + bY));
        canvasContext.stroke();
    }
};

/**
 * draw the border lines for a half triangle
 * the lines that are the border of the equilateral triangle
 * set stroke style before and set line width
 * @method tiles.borderHalfTriangles
 */
tiles.borderHalfTriangles = function() {
    const canvasContext = output.canvasContext;
    const length = halfTriangleMX.length;
    for (var i = 0; i < length; i++) {
        const mX = halfTriangleMX[i];
        const mY = halfTriangleMY[i];
        const bX = halfTriangleBX[i];
        const bY = halfTriangleBY[i];
        const cX = halfTriangleCX[i];
        const cY = halfTriangleCY[i];
        output.makePath(mX, mY, bX, bY, cX, cY);
        canvasContext.stroke();
    }
};

/**
 * draw the sub border lines for a half triangle
 * the lines that separate the halves of equialateral triangles
 * set stroke style before and set line width
 * @method tiles.subBorderHalfTriangles
 */
tiles.subBorderHalfTriangles = function() {
    const canvasContext = output.canvasContext;
    const length = halfTriangleMX.length;
    for (var i = 0; i < length; i++) {
        const mX = halfTriangleMX[i];
        const mY = halfTriangleMY[i];
        const cX = halfTriangleCX[i];
        const cY = halfTriangleCY[i];
        output.makePath(mX, mY, cX, cY);
        canvasContext.stroke();
    }
};

// everything together
//======================================================

/**
 * delete all tiles
 * @method tiles.delete
 */
tiles.delete = function() {
    tiles.deleteRhombs30();
    tiles.deleteHalfTriangles();
    tiles.deleteQuarterSquares();
};

/**
 * draw grid for all tiles
 * @method tiles.grid
 */
tiles.grid = function() {
    tiles.gridRhombs30();
    tiles.gridHalfTriangles();
    tiles.gridQuarterSquares();
};

/**
 * draw border for all tiles
 * @method tiles.border
 */
tiles.border = function() {
    tiles.borderRhombs30();
    tiles.borderHalfTriangles();
    tiles.borderQuarterSquares();
};