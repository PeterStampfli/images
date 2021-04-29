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
    lineWidth: 1
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
        markers.makeUI('markers');
    }
};

// tiles, parameters:
// withMarker, boolean, switch markers on/off
// upperImage, boolean, if true takes input image from upper half plane
// coordinates, pairs of floats

/**
 * make a regular polygon from its corners
 * grid, border and scan
 * marker at first corner
 * @method tiles.polygon
 * @param {boolean} withMarker
 * @param {boolean} upperImage
 * @param {list of numbers|| array} coordinates
 */
tiles.polygon = function(withMarker, upperImage, coordinates) {
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
    for (i = 0; i < length; i += 2) {
        grid.addOpen(corners[i], corners[i + 1], centerX, centerY);
    }
    if (withMarker) {
        markers.add(corners[0], corners[1], 0.5 * (corners[0] + corners[2]), 0.5 * (corners[1] + corners[3]), 0.5 * (corners[0] + corners[length - 2]), 0.5 * (corners[1] + corners[length - 1]));
    }



    // test
    borders.draw();
    grid.draw();
    markers.draw();
};