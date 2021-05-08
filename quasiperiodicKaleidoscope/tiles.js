/* jshint esversion: 6 */

import {
    map,
    pixelPaint
} from "../libgui/modules.js";

import {
    Lines,
    Areas,
    main
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

// outlines as extra
tiles.outlines = new Lines({
    color: '#000000',
    lineWidth: 4
});

// mirror parts
tiles.evenReflections = new Areas({
    color: '#ffff00',
    overprinting: false
});

tiles.oddReflections = new Areas({
    color: '#0000ff',
    overprinting: false
});

var originX, originY;
var rightX, rightY, upX, upY;

/**
 * mapping the even reflections
 * @method tiles.mapEvenReflections
 */
function evenReflectionAction(x, y, index) {
    map.sizeArray[index] = 1;
    map.iterationsArray[index] = 0;
    x -= originX;
    y -= originY;
    map.xArray[index] = x * rightX + y * rightY;
    map.yArray[index] = x * upX + y * upY;
}

tiles.mapEvenReflections = function() {
    console.log('evenreflects');
    tiles.evenReflections.areas.forEach(area => {
        originX = area[0];
        originY = area[1];
        rightX = area[2] - originX;
        rightY = area[3] - originY;
        let norm = 1 / Math.sqrt(rightX * rightX + rightY * rightY);
        rightX *= norm;
        rightY *= norm;
        upX = -rightY;
        upY = rightX;
        pixelPaint.scanConvexPolygon(evenReflectionAction, area);
    });
};

/**
 * make the UI for the elements
 * @method tiles.makeUI
 * @param {boolean} withSubBorders
 * @param {boolean} withMarkers 
 * @param {boolean} withOutlines 
 * @param {ParamGui} gui - optional, default is main.gui
 */
tiles.makeUI = function(withSubBorders, withMarkers, withOutlines, gui = main.gui) {
    grid.makeUI('grid', gui);
    borders.makeUI('borders', gui);
    if (withSubBorders) {
        subBorders.makeUI('subBorders', gui);
    }
    if (withMarkers) {
        markers.makeUI('markers', false, gui);
    }
    if (withOutlines) {
        tiles.outlines.makeUI('outlines', gui);
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
    tiles.outlines.clear();
    tiles.evenReflections.clear();
    tiles.oddReflections.clear();
};

/**
 * draw the drawables
 * @method tiles.draw
 */
tiles.draw = function() {
    Lines.initDrawing();
    borders.draw();
    subBorders.draw();
    markers.draw();
    grid.draw();
    tiles.outlines.draw();
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
    borders.addClosed(corners);
    var even, odd, midX, midY;
    if (upperImage) {
        even = tiles.evenReflections;
        odd = tiles.oddReflections;
    } else {
        even = tiles.oddReflections;
        odd = tiles.evenReflections;
    }
    for (i = 2; i < length; i += 2) {
        midX = 0.5 * (corners[i] + corners[i - 2]);
        midY = 0.5 * (corners[i + 1] + corners[i - 1]);
        grid.addOpen(midX, midY, centerX, centerY);
        even.add(midX, midY, corners[i], corners[i + 1], centerX, centerY);
        odd.add(midX, midY, corners[i - 2], corners[i - 1], centerX, centerY);
    }
    midX = 0.5 * (corners[0] + corners[length - 2]);
    midY = 0.5 * (corners[1] + corners[length - 1]);
    grid.addOpen(midX, midY, centerX, centerY);
    even.add(midX, midY, corners[0], corners[1], centerX, centerY);
    odd.add(midX, midY, corners[length - 2], corners[length - 1], centerX, centerY);
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
    var even, odd, midX, midY;
    if (upperImage) {
        even = tiles.evenReflections;
        odd = tiles.oddReflections;
    } else {
        even = tiles.oddReflections;
        odd = tiles.evenReflections;
    }
    for (i = 2; i < length; i += 2) {
        midX = 0.5 * (corners[i] + corners[i - 2]);
        midY = 0.5 * (corners[i + 1] + corners[i - 1]);
        grid.addOpen(midX, midY, centerX, centerY);
        even.add(midX, midY, corners[i], corners[i + 1], centerX, centerY);
        odd.add(midX, midY, corners[i - 2], corners[i - 1], centerX, centerY);
    }
    if (withMarker) {
        markers.add(corners[0], corners[1], 0.5 * (corners[0] + corners[2]), 0.5 * (corners[1] + corners[3]), 0.5 * (corners[0] + centerX), 0.5 * (corners[1] + centerY));
    }
};

function rhomb(t, withMarker, upperImage, ax, ay, bx, by, cx, cy, dx, dy) {
    borders.addClosed(ax, ay, bx, by, cx, cy, dx, dy);
    const s = 1 - t;
    const aax = s * ax + t * cx;
    const aay = s * ay + t * cy;
    const ccx = t * ax + s * cx;
    const ccy = t * ay + s * cy;
    const abx = 0.5 * (ax + bx);
    const aby = 0.5 * (ay + by);
    const adx = 0.5 * (ax + dx);
    const ady = 0.5 * (ay + dy);
    const bcx = 0.5 * (cx + bx);
    const bcy = 0.5 * (cy + by);
    const cdx = 0.5 * (cx + dx);
    const cdy = 0.5 * (cy + dy);
    grid.addOpen(abx, aby, aax, aay, adx, ady);
    grid.addOpen(bcx, bcy, ccx, ccy, cdx, cdy);
    grid.addOpen(aax, aay, ccx, ccy);
    if (withMarker) {
        markers.add(ax, ay, abx, aby, adx, ady);
    }
    const centerX = 0.5 * (bx + dx);
    const centerY = 0.5 * (by + dy);
    var even, odd;
    if (upperImage) {
        even = tiles.evenReflections;
        odd = tiles.oddReflections;
    } else {
        even = tiles.oddReflections;
        odd = tiles.evenReflections;
    }
    even.add(bcx, bcy, cx, cy, ccx, ccy);
    odd.add(bcx, bcy, bx, by, centerX, centerY, ccx, ccy);
    even.add(cdx, cdy, dx, dy, centerX, centerY, ccx, ccy);
    odd.add(cdx, cdy, cx, cy, ccx, ccy);
    odd.add(adx, ady, dx, dy, centerX, centerY, aax, aay);
    even.add(adx, ady, ax, ay, aax, aay);
    odd.add(abx, aby, ax, ay, aax, aay);
    even.add(abx, aby, bx, by, centerX, centerY, aax, aay);
}

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
    // 0.26796=0.25/cos(15)**2
    const t = 0.26796;
    rhomb(t, withMarker, upperImage, ax, ay, bx, by, cx, cy, dx, dy);
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
    // 0.29289=0.25/cos(22.5)**2
    const t = 0.29289;
    rhomb(t, withMarker, upperImage, ax, ay, bx, by, cx, cy, dx, dy);
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
    // 0.3333=0.25/cos(30)**2
    const t = 0.33333;
    rhomb(t, withMarker, upperImage, ax, ay, bx, by, cx, cy, dx, dy);
};

/**
 * half of an equilateral triangle
 * with list of corners, begin with 90 degree angle, 60 degree,30 degree
 * @method tiles.halfTriangle
 * @param {boolean} withMarker - for consistency, has no effect
 * @param {boolean} upperImage
 * @param {number} mx - x-coordinate, corner with 90 degree angle
 * @param {number} my - y-coordinate 
 * @param {number} bx - x-coordinate, corner with 60 degree angle
 * @param {number} by - y-coordinate
 * @param {number} cx - x-coordinate, corner with 30 degree angle
 * @param {number} cy - y-coordinate 
 */
tiles.halfTriangle = function(withMarker, upperImage, mx, my, bx, by, cx, cy) {
    borders.addOpen(mx, my, bx, by, cx, cy);
    subBorders.addOpen(mx, my, cx, cy);
    const centerX = 0.33333 * (mx + mx + cx);
    const centerY = 0.33333 * (my + my + cy);
    const bcX = 0.5 * (bx + cx);
    const bcY = 0.5 * (by + cy);
    grid.addOpen(bcX, bcY, centerX, centerY, mX, mY);
    var even, odd;
    if (upperImage) {
        even = tiles.evenReflections;
        odd = tiles.oddReflections;
    } else {
        even = tiles.oddReflections;
        odd = tiles.evenReflections;
    }
    // take into account mirror images
    const surface = ((bx - mx) * (cy - my) - (by - my) * (cx - mx));
    if (surface < 0) {
        const h = odd;
        odd = even;
        even = h;
    }
    even.add(mx, my, centerX, centerY, bx, by);
    odd.add(bcX, bcY, centerX, centerY, bx, by);
    even.add(bcX, bcY, cx, cy, centerX, centerY);
};