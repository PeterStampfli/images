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