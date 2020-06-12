/* jshint esversion:6 */

import {
    guiUtils,
    output,
    Pixels
} from "../libgui/modules.js";

/**
 * organizing the mapping from the output canvas
 * (after transforming the pixel positions to a adjustable space region)
 * to input image/structure
 * recalculate if canvas dimensions, its mapping or mapping parameters change
 * directly tied to the output canvas
 * @namespace map
 */

export const map = {};

// dimensions, private, required to see if resizing arrays is required
// then same as for output canvas

let width = 1;
let height = 1;

// map data, accessible from the outside
// the mapped coordinates
map.xArray = new Float32Array(1);
map.yArray = new Float32Array(1);

// the sector (for color symmetry and selective display) or other info
map.sectorArray = new Uint8Array(1);

// the number of iterations, or other info
map.iterationsArray = new Uint8Array(1);

// size of pixels after mapping, not taking into account the final input image transform
map.sizeArray = new Float32Array(1);

/**
 * initialization, at start of the drawing method
 * update output canvas parameters and array dimensions
 * make sure that we have output.pixels(output.canvas)
 * update pixels
 * @method map.initialize
 */
map.initialize = function() {
    if (!guiUtils.isDefined(output.pixels)) {
        output.pixels = new Pixels(output.canvas);
    }
    output.pixels.updateArraySize();
    output.updateCanvasScale();
    output.updateCanvasTransform();
    const canvas = output.canvas;
    if ((width !== canvas.width) || (height !== canvas.height)) {
        width = canvas.width;
        height = canvas.height;
        const size = width * height;
        map.xArray = new Float32Array(size);
        map.yArray = new Float32Array(size);
        map.sectorArray = new Uint8Array(size);
        map.iterationsArray = new Uint8Array(size);
        map.sizeArray = new Float32Array(size);
    }
};

// an object with the mapping data for a single point
// fields are x, y, iterations, sector
// has input and return data for mapping function
const point = {};

/**
 * make the map using the mapping(point) function
 * initializes canvas transform and array sizes
 * point.x and point.y have the intial position at call
 * at return they have the final position
 * point.sector has the number of a sector. Typically, there is no mapping between sectors
 * point.iterations has the number of iterations done, or other info
 * the xArray, yArray, iterationsArray and sectorArray have new values, but not the sizeArray
 * results are not normalized
 * @method map.make
 * @param {function} mapping 
 */
map.make = function(mapping) {
    map.initialize();
    let index = 0;
    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            point.x = i;
            point.y = j;
            point.sector = 0;
            point.iterations = 0;
            output.transform(point);
            mapping(point);
            map.xArray[index] = point.x;
            map.yArray[index] = point.y;
            map.sectorArray[index] = point.sector;
            map.iterationsArray[index] = point.iterations;
            index += 1;
        }
    }
};

// showing the map
//==================================

// selecting the sectors that will be shown, max 256 sectors
map.showSector = [];
map.showSector.length = 256;
// default, show all
for (let i = 0; i < 256; i++) {
    map.showSector[i] = true;
}

// show the structure resulting from the number of iterations
// typically two colors (even/odd)
// using a table (maximum number of iterations is 255)
map.colorTable = [];
map.colorTable.length = 256;

/**
 * make an alternating color table
 * @method map.makeColorTable
 * @param {object}color1 - with red, green blue and alpha fields
 * @param {object}color2 - with red, green blue and alpha fields
 */
map.makeColorTable = function(color1, color2) {
    const intColor1 = Pixels.integerOfColor(color1);
    const intColor2 = Pixels.integerOfColor(color2);
    for (var i = 0; i < 256; i++) {
        map.colorTable[i] = (i & 1) ? intColor1 : intColor2;
    }
};

const black = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
};

const white = {
    red: 255,
    green: 255,
    blue: 255,
    alpha: 255
};

map.makeColorTable(black, white);

/**
 * show structure of the map: color depending on the number of iterations
 * using the map.colorTable
 * @method map.showStructure
 */
map.showStructure = function() {
    let index = 0;
    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            if (map.showSector[map.sectorArray[index]]) {
                output.pixels.array[index] = map.colorTable[map.iterationsArray[index]];
            }
            index += 1;
        }
    }
    output.pixels.show();
};

/**
 * normalize the map points to a unit square, centered
 * @method map.normalize
 */
map.normalize = function() {
    var i;
    const length = width * height;
    let xMin = 1e10;
    let xMax = -1e10;
    let yMin = 1e10;
    let yMax = -1e10;
    for (i = 0; i < length; i++) {
        const x = map.xArray[i];
        xMax = Math.max(x, xMax);
        xMin = Math.min(x, xMin);
        const y = map.yArray[i];
        yMax = Math.max(y, yMax);
        yMin = Math.min(y, yMin);
    }
    console.log(xMin,xMax,yMin,yMax);
    const scale = Math.min(1 / (xMax - xMin), 1 / (yMax - yMin));
    const deltaX = 0.5 * (1 - scale * (xMax + xMin));
    const deltaY = 0.5 * (1 - scale * (yMax + yMin));
    for (i = 0; i < length; i++) {
        map.xArray[i] = scale * map.xArray[i] + deltaX;
        map.yArray[i] = scale * map.yArray[i] + deltaY;
    }
};