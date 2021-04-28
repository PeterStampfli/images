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