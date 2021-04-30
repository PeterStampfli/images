/* jshint esversion: 6 */

import {
    Lines,
    Areas
}
from "./modules.js";

/**
 * making tiles for drawing 
 * areas, markers, borders, subBorders, scanning
 * @namespace tiles
 */

export const tiles = {};

// the areas are defined externally
// tiles makes the other elements
// quasiperiodic tilings: Tile iteration knows all corners to decide if it is visible
// do not recalculate

const borders = new Lines({
    color: '#000000',
    lineWidth: 2
});
const subBorders = new Lines({
    color: '#0000ff',
    lineWidth: 2
});
const markers = new Areas({
    color: '#88888888',
    overprinting: false
});
const grid = new Lines({
    color: '#ffaa00',
    overprinting: false
});

/**
 * make the UI for the elements
 * @method tiles.makeUI
 * @param {boolean} withSubBorders - optional, default is true
 * @param {boolean} withMarkers - optional, default is true
 */
tiles.makeUI = function(withSubBorders = true, withMarkers = true) {
    grid.makeUI('grid');
    borders.makeUI('borders');
    if (withSubBorders) {
        subBorders.makeUI('subBorders');
    }
    if (withMarkers) {
        markers.makeUI('markers',false);
    }
};

/**
 * clear the drawables
 * @method tiles.clear
 */
tiles.clear = function() {
    borders.clear();
    subBorders.clear();
    markers.clear();
    grid.clear();
};

/**
 * draw the drawables
 * @method tiles.draw
 */
tiles.draw = function() {
    borders.draw();
    subBorders.draw();
    markers.draw();
    grid.draw();
};

// tiles, parameters:
// withMarker, boolean, switch markers on/off
// upperImage, boolean, if true takes input image from upper half plane
// coordinates, pairs of floats

/**
 * make a regular polygon from its corners
 * grid, border and scan
 * marker at first corner
 * @method tiles.regularPolygon
 * @param {boolean} withMarker
 * @param {boolean} upperImage
 * @param {list of numbers|| array} coordinates
 */
tiles.regularPolygon = function(withMarker, upperImage, coordinates) {
    var corners, length, i;
    if (arguments.length === 3) {
        corners = coordinates;
        length = corners.length;
    } else {
        corners = [];
        length = arguments.length - 2;
        corners.length = length;
        for (i = 0; i < length; i++) {
            corners[i] = arguments[i + 2];
        }
    }
    // calculate center
    let centerX = 0;
    let centerY = 0;
    for (i = 0; i < length; i += 2) {
        centerX += corners[i];
        centerY += corners[i + 1];
    }
    const factor = 2 / length;
    centerX *= factor;
    centerY *= factor;
    console.log(centerX, centerY);
    borders.addClosed(corners);
    for (i = 2; i < length; i += 2) {
        grid.addOpen(0.5 * (corners[i] + corners[i - 2]), 0.5 * (corners[i + 1] + corners[i - 1]), centerX, centerY);
    }
    grid.addOpen(0.5 * (corners[0] + corners[length - 2]), 0.5 * (corners[1] + corners[length - 1]), centerX, centerY);
    if (withMarker) {
        markers.add(corners[0], corners[1], 0.5 * (corners[0] + corners[2]), 0.5 * (corners[1] + corners[3]), 0.5 * (corners[0] + corners[length - 2]), 0.5 * (corners[1] + corners[length - 1]));
    }
};

/**
 * make a part of a regular polygon from its corners and the center
 * grid, border and scan
 * marker at first corner
 * @method tiles.partRegularPolygon
 * @param {boolean} withMarker
 * @param {boolean} upperImage
 * @param {list of numbers|| array} coordinates, center comes last
 */
tiles.partRegularPolygon = function(withMarker, upperImage, coordinates) {
    var length, i, centerX, centerY;
    const corners = [];
    if (arguments.length === 3) {
        length = coordinates.length - 2;
        corners.length = length;
        for (i = 0; i < length; i++) {
            corners[i] = coordinates[i];
            centerX = coordinates[length];
            centerY = coordinates[length + 1];
        }
    } else {
        length = arguments.length - 4;
        corners.length = length;
        for (i = 0; i < length; i++) {
            corners[i] = arguments[i + 2];
        }
        centerX = arguments[length + 2];
        centerY = arguments[length + 3];
    }
    borders.addOpen(corners);
    subBorders.addOpen(corners[0], corners[1], centerX, centerY, corners[length - 2], corners[length - 1]);
    for (i = 2; i < length; i += 2) {
        grid.addOpen(0.5 * (corners[i] + corners[i - 2]), 0.5 * (corners[i + 1] + corners[i - 1]), centerX, centerY);
    }
    if (withMarker) {
        markers.add(corners[0], corners[1], 0.5 * (corners[0] + corners[2]), 0.5 * (corners[1] + corners[3]), 0.5 * (corners[0] + centerX), 0.5 * (corners[1] + centerY));
    }
};

/**
 * 30 degree rhomb
 * with list of corners, begin with acute angle, go counterclockwise (in caalculated space)
 * @method tiles.rhomb30
 * @param {boolean} withMarker
 * @param {boolean} upperImage
 * @param {number} ax - x-coordinate, corner with acute angle
 * @param {number} ay - y-coordinate, corner with acute angle 
 * @param {number} bx - x-coordinate, corner with obtuse angle
 * @param {number} by - y-coordinate, corner with obtuse angle
 * @param {number} cx - x-coordinate, corner with acute angle
 * @param {number} cy - y-coordinate, corner with acute angle 
 * @param {number} dx - x-coordinate, corner with obtuse angle
 * @param {number} dy - y-coordinate, corner with obtuse angle
 */
tiles.rhomb30 = function(withMarker, upperImage, ax, ay, bx, by, cx, cy, dx, dy) {
    borders.addClosed(ax, ay, bx, by, cx, cy, dx, dy);
    // 0.26796=0.25/cos(15)**2
    const t = 0.26796;
    const s = 1 - t;
    const aax = s * ax + t * cx;
    const aay = s * ay + t * cy;
    const ccx = t * ax + s * cx;
    const ccy = t * ay + s * cy;
    grid.addOpen(0.5 * (ax + bx), 0.5 * (ay + by), aax, aay, 0.5 * (ax + dx), 0.5 * (ay + dy));
    grid.addOpen(0.5 * (cx + bx), 0.5 * (cy + by), ccx, ccy, 0.5 * (cx + dx), 0.5 * (cy + dy));
    grid.addOpen(aax, aay, ccx, ccy);
    if (withMarker) {
        markers.add(ax, ay, 0.5 * (ax + bx), 0.5 * (ay + by), 0.5 * (ax + dx), 0.5 * (ay + dy));
    }
};

/**
 * 45 degree rhomb
 * with list of corners, begin with acute angle, go counterclockwise (in caalculated space)
 * @method tiles.rhomb30
 * @param {boolean} withMarker
 * @param {boolean} upperImage
 * @param {number} ax - x-coordinate, corner with acute angle
 * @param {number} ay - y-coordinate, corner with acute angle 
 * @param {number} bx - x-coordinate, corner with obtuse angle
 * @param {number} by - y-coordinate, corner with obtuse angle
 * @param {number} cx - x-coordinate, corner with acute angle
 * @param {number} cy - y-coordinate, corner with acute angle 
 * @param {number} dx - x-coordinate, corner with obtuse angle
 * @param {number} dy - y-coordinate, corner with obtuse angle
 */
tiles.rhomb45 = function(withMarker, upperImage, ax, ay, bx, by, cx, cy, dx, dy) {
    borders.addClosed(ax, ay, bx, by, cx, cy, dx, dy);
    // 0.29289=0.25/cos(22.5)**2
    const t = 0.29289;
    const s = 1 - t;
    const aax = s * ax + t * cx;
    const aay = s * ay + t * cy;
    const ccx = t * ax + s * cx;
    const ccy = t * ay + s * cy;
    grid.addOpen(0.5 * (ax + bx), 0.5 * (ay + by), aax, aay, 0.5 * (ax + dx), 0.5 * (ay + dy));
    grid.addOpen(0.5 * (cx + bx), 0.5 * (cy + by), ccx, ccy, 0.5 * (cx + dx), 0.5 * (cy + dy));
    grid.addOpen(aax, aay, ccx, ccy);

    if (withMarker) {
        markers.add(ax, ay, 0.5 * (ax + bx), 0.5 * (ay + by), 0.5 * (ax + dx), 0.5 * (ay + dy));
    }
};

/**
 * 60 degree rhomb
 * with list of corners, begin with acute angle, go counterclockwise (in caalculated space)
 * @method tiles.rhomb30
 * @param {boolean} withMarker
 * @param {boolean} upperImage
 * @param {number} ax - x-coordinate, corner with acute angle
 * @param {number} ay - y-coordinate, corner with acute angle 
 * @param {number} bx - x-coordinate, corner with obtuse angle
 * @param {number} by - y-coordinate, corner with obtuse angle
 * @param {number} cx - x-coordinate, corner with acute angle
 * @param {number} cy - y-coordinate, corner with acute angle 
 * @param {number} dx - x-coordinate, corner with obtuse angle
 * @param {number} dy - y-coordinate, corner with obtuse angle
 */
tiles.rhomb60 = function(withMarker, upperImage, ax, ay, bx, by, cx, cy, dx, dy) {
    borders.addClosed(ax, ay, bx, by, cx, cy, dx, dy);
    // 0.3333=0.25/cos(30)**2
    const t = 0.33333;
    const s = 1 - t;
    const aax = s * ax + t * cx;
    const aay = s * ay + t * cy;
    const ccx = t * ax + s * cx;
    const ccy = t * ay + s * cy;
    grid.addOpen(0.5 * (ax + bx), 0.5 * (ay + by), aax, aay, 0.5 * (ax + dx), 0.5 * (ay + dy));
    grid.addOpen(0.5 * (cx + bx), 0.5 * (cy + by), ccx, ccy, 0.5 * (cx + dx), 0.5 * (cy + dy));
    grid.addOpen(aax, aay, ccx, ccy);

    if (withMarker) {
        markers.add(ax, ay, 0.5 * (ax + bx), 0.5 * (ay + by), 0.5 * (ax + dx), 0.5 * (ay + dy));
    }
};