/* jshint esversion: 6 */

import {
    output,
    guiUtils,
    ColorInput
}
from "../libgui/modules.js";

import {
    circles,
    Corner,
    Line
} from './modules.js';

/**
 * detecting disjoint target regions as defined by the circles
 * making separating polygons around these regions
 * some may be empty
 * @namespace regions
 */
export const regions = {};

// regions are polygons
//====================================
// the center of each circle that maps inside->out is a corner of polygons
// additional corners arise for circles mapping outside->in

// each intersection between inside->out mapping circles gives a line between the corresponding corners
// these lines have to assembled to make polygons

// each intersection between an inside->out and an outside->in mapping circle gives:
// a corner on the bounding rectangle with a line between this corner and the center of the inside->out mapping circle
// the line is parallel to the line between the centers of the two circles
// and goes from the center of the inside->out mapping circle opposite to the other circle
// making a corner at the boundary of the bounding rectangle, it makes an additional line piece at the bounding rectangle
// finally, there are the 4 corners of the bounding rectangle

// collecting circles depending on their mapping direction
// if region.outsideInMappingCircles.length===0 then ther are only inside->out mapping circles

regions.insideOutMappingCircles = []; // give corners, same position as circle centers, same index as in this array
regions.outsideInMappingCircles = []; // these make some additional corners, in particular the corners of the bounding rectangle 

// collecting the corners and lines
// it is for building polygons (they refer to corners as object references)
regions.corners = [];
regions.lines = [];
regions.polygons = [];

// know, which polygon regions are active, boolean, true if there is some pixel inside
// do not renumber regions (we might look at a small part of the image, such as part of the Poincare disc)
// hide the UI for unused/inactive regions
regions.active = [];
regions.active.length = 256;

// gui to control the regions
// general: contrast between 0, odd and even number of iterations
// region color controllers: 0 ... regions.polygons.length
// show only controllers for active regions/polygons
// on/off and basic color
// for each region a basic color and an array of colors[iterations]

// switching on/off regions via 'map.showRegion[map.regionArray[index]]'
// initially all true

regions.basicColor = [];
regions.basicColor.length = 256;
regions.basicColor[0] = '#ff0000';
//guiUtils.arrayRepeat = function(array, n) {
regions.structureColors = []; // each element is an array of colors
regions.structureColors.length = 256;

// obj.red,.green,.blue
//ColorInput.stringFromObject = function(obj) 
//ColorInput.setObject = function(obj, color) {




/**
 * collect mapping circles according to mapping direction
 * each inside->out mapping circle gives a potential corner
 * inside->out mapping circles are potential corners
 * a circle and the corresponding corner have the same index
 * @method regions.collectCircles
 */
regions.collectCircles = function() {
    const length = circles.collection.length;
    regions.outsideInMappingCircles.length = 0;
    regions.insideOutMappingCircles.length = 0;
    regions.corners.length = 0;
    for (var i = 0; i < length; i++) {
        const circle = circles.collection[i];
        if (circle.isMapping) {
            if (circle.isInsideOutMap) {
                regions.insideOutMappingCircles.push(circle);
                regions.corners.push(new Corner(circle.centerX, circle.centerY));
            } else {
                regions.outsideInMappingCircles.push(circle);
            }
        }
    }
};

// circles with outside->in mapping define a rectangular region
// around their intersection
// polygon corners are at its boundary

// for outside->in mapping circles
// collect the corners at each side of the boundary
// and sort according to position, gives then lines

/**
 * determine bounding rectangle of all circles
 * uses regions.outsideInMappingCircles
 * @method regions.determineBoundingRectangle
 */
regions.determineBoundingRectangle = function() {
    var i;
    // just in case that there is no circle
    regions.boundingTop = -1e10;
    regions.boundingBottom = 1e10;
    regions.boundingLeft = 1e10;
    regions.boundingRight = -1e10;
    let length = regions.outsideInMappingCircles.length;
    for (i = 0; i < length; i++) {
        const circle = regions.outsideInMappingCircles[i];
        regions.boundingTop = Math.max(regions.boundingTop, circle.centerY + circle.radius);
        regions.boundingBottom = Math.min(regions.boundingBottom, circle.centerY - circle.radius);
        regions.boundingRight = Math.max(regions.boundingRight, circle.centerX + circle.radius);
        regions.boundingLeft = Math.min(regions.boundingLeft, circle.centerX - circle.radius);
    }
    length = regions.insideOutMappingCircles.length;
    for (i = 0; i < length; i++) {
        const circle = regions.insideOutMappingCircles[i];
        regions.boundingTop = Math.max(regions.boundingTop, circle.centerY + circle.radius);
        regions.boundingBottom = Math.min(regions.boundingBottom, circle.centerY - circle.radius);
        regions.boundingRight = Math.max(regions.boundingRight, circle.centerX + circle.radius);
        regions.boundingLeft = Math.min(regions.boundingLeft, circle.centerX - circle.radius);
    }
};

/**
 * draw the bounding rectangle for tests
 * @method regions.drawBoundingRectangle
 */
regions.drawBoundingRectangle = function() {
    if ((regions.boundingLeft < regions.boundingRight) && (regions.boundingBottom < regions.boundingTop)) {
        const context = output.canvasContext;
        output.setLineWidth(3);
        context.strokeStyle = 'red';
        context.beginPath();
        context.moveTo(regions.boundingLeft, regions.boundingBottom);
        context.lineTo(regions.boundingRight, regions.boundingBottom);
        context.lineTo(regions.boundingRight, regions.boundingTop);
        context.lineTo(regions.boundingLeft, regions.boundingTop);
        context.closePath();
        context.stroke();
    }
};

// making the lines

/**
 * lines due to intersecting inside->out mapping circles
 * call this first to generate lines
 * @method regions.linesFromInsideOutMappingCircles
 */
regions.linesFromInsideOutMappingCircles = function() {
    regions.lines.length = 0;
    const length = regions.insideOutMappingCircles.length;
    for (var i = 0; i < length - 1; i++) {
        const circle1 = regions.insideOutMappingCircles[i];
        for (var j = i + 1; j < length; j++) {
            const circle2 = regions.insideOutMappingCircles[j];
            if (circle1.intersectsCircle(circle2)) {
                // accord between elements of regions.insideOutMappingCircles and regions.corners
                regions.lines.push(new Line(regions.corners[i], regions.corners[j]));
            }
        }
    }
};

// data for the corners in bounding rectangle
regions.cornersTop = [];
regions.cornersBottom = [];
regions.cornersLeft = [];
regions.cornersRight = [];

/**
 * doing the intersection between an insideout and an outsidein circle
 * @method regions.insideOutIntersectsOutsideIn
 * @param {Corner} inOutCorner - we need the corner object of the inside out mapping circlee for making lines
 * @param {Circle} outInCircle - outside-in mapping
 */
regions.insideOutIntersectsOutsideIn = function(inOutCorner, outInCircle) {
    // the line goes from the inoutCorner opposite to the outin circle center
    // until it intersects the bounding rectangle
    // the inoutcorner may lie outside the bounding rectangle, 
    // then we get a line that lies outside the bounding rectangle.
    // but this line is still important for closing a polygon

    // determine vector parallel to the line, with correct orientation
    // pointing away from the outsideIn mapping cirle when put to the inout corner
    let dXLine = inOutCorner.x - outInCircle.centerX;
    let dYLine = inOutCorner.y - outInCircle.centerY;
    // determine the quadrant of this vector, a pedestrian approach
    // from this get coordinates of new corner, and create it
    var newCorner = false;
    if (dYLine > 0) {
        const deltaY = regions.boundingTop - inOutCorner.y;
        if (dXLine > 0) {
            // going up and right
            // does it go to the right or top border ?
            const deltaX = regions.boundingRight - inOutCorner.x;
            if (Math.abs(dYLine * deltaX) < Math.abs(dXLine * deltaY)) {
                // the line is relatively closer to the x-axis -> hits the right border
                const newCornerX = regions.boundingRight;
                const newCornerY = inOutCorner.y + dYLine * deltaX / dXLine;
                newCorner = new Corner(newCornerX, newCornerY);
                regions.cornersRight.push(newCorner);
            } else {
                // line is closer to y-axis, hits the top border
                const newCornerX = inOutCorner.x + dXLine * deltaY / dYLine;
                const newCornerY = regions.boundingTop;
                newCorner = new Corner(newCornerX, newCornerY);
                regions.cornersTop.push(newCorner);
            }
        } else {
            // going up and left, hitting the left or top border
            const deltaX = regions.boundingLeft - inOutCorner.x;
            if (Math.abs(dYLine * deltaX) < Math.abs(dXLine * deltaY)) {
                // the line is relatively closer to the x-axis -> hits the left border
                const newCornerX = regions.boundingLeft;
                const newCornerY = inOutCorner.y + dYLine * deltaX / dXLine;
                newCorner = new Corner(newCornerX, newCornerY);
                regions.cornersLeft.push(newCorner);
            } else {
                // line is closer to y-axis, hits the top border
                const newCornerX = inOutCorner.x + dXLine * deltaY / dYLine;
                const newCornerY = regions.boundingTop;
                newCorner = new Corner(newCornerX, newCornerY);
                regions.cornersTop.push(newCorner);
            }
        }
    } else {
        const deltaY = regions.boundingBottom - inOutCorner.y;
        if (dXLine > 0) {
            // going down and right
            // does it go to the right or bottom border ?
            const deltaX = regions.boundingRight - inOutCorner.x;
            if (Math.abs(dYLine * deltaX) < Math.abs(dXLine * deltaY)) {
                // the line is relatively closer to the x-axis -> hits the right border
                const newCornerX = regions.boundingRight;
                const newCornerY = inOutCorner.y + dYLine * deltaX / dXLine;
                newCorner = new Corner(newCornerX, newCornerY);
                regions.cornersRight.push(newCorner);
            } else {
                // the line is closer to the y-axis -> hits the bottom border
                const newCornerX = inOutCorner.x + dXLine * deltaY / dYLine;
                const newCornerY = regions.boundingBottom;
                newCorner = new Corner(newCornerX, newCornerY);
                regions.cornersBottom.push(newCorner);
            }
        } else {
            // going down and left
            // does it go to the left or bottom border ?
            const deltaX = regions.boundingLeft - inOutCorner.x;
            if (Math.abs(dYLine * deltaX) < Math.abs(dXLine * deltaY)) {
                // the line is relatively closer to the x-axis -> hits the left border
                const newCornerX = regions.boundingLeft;
                const newCornerY = inOutCorner.y + dYLine * deltaX / dXLine;
                newCorner = new Corner(newCornerX, newCornerY);
                regions.cornersLeft.push(newCorner);
            } else {
                // the line is closer to the y-axis -> hits the bottom border
                const newCornerX = inOutCorner.x + dXLine * deltaY / dYLine;
                const newCornerY = regions.boundingBottom;
                newCorner = new Corner(newCornerX, newCornerY);
                regions.cornersBottom.push(newCorner);
            }
        }
    }
    if (newCorner) {
        regions.corners.push(newCorner);
        const line = new Line(newCorner, inOutCorner);
        regions.lines.push(line);
    }
};

// making lines from boundary pieces
// based on sorted arrays of corners
function makeLines(corners) {
    const length = corners.length;
    for (var i = 0; i < length - 1; i++) {
        const line = new Line(corners[i], corners[i + 1]);
        regions.lines.push(line);
    }
}

/**
 * lines due to outside->in mapping circles
 * @method regions.linesFromOutsideInMappingCircles
 */
regions.linesFromOutsideInMappingCircles = function() {
    regions.cornersTop.length = 0;
    regions.cornersBottom.length = 0;
    regions.cornersLeft.length = 0;
    regions.cornersRight.length = 0;
    if (regions.outsideInMappingCircles.length > 0) {
        // the corners of the bounding rectangle
        let corner = new Corner(regions.boundingLeft, regions.boundingTop);
        regions.cornersLeft.push(corner);
        regions.cornersTop.push(corner);
        regions.corners.push(corner);
        corner = new Corner(regions.boundingRight, regions.boundingTop);
        regions.cornersRight.push(corner);
        regions.cornersTop.push(corner);
        regions.corners.push(corner);
        corner = new Corner(regions.boundingLeft, regions.boundingBottom);
        regions.cornersLeft.push(corner);
        regions.cornersBottom.push(corner);
        regions.corners.push(corner);
        corner = new Corner(regions.boundingRight, regions.boundingBottom);
        regions.cornersRight.push(corner);
        regions.cornersBottom.push(corner);
        regions.corners.push(corner);
        // corners from intersections
        const lengthInOut = regions.insideOutMappingCircles.length;
        const lengthOutIn = regions.outsideInMappingCircles.length;
        for (var i = 0; i < lengthInOut; i++) {
            const circle1 = regions.insideOutMappingCircles[i];
            for (var j = 0; j < lengthOutIn; j++) {
                const circle2 = regions.outsideInMappingCircles[j];
                if (circle1.intersectsCircle(circle2)) {
                    regions.insideOutIntersectsOutsideIn(regions.corners[i], circle2);
                }
            }
        }
        // order the corners on the boundarys
        guiUtils.sortObjects(regions.cornersTop, 'x');
        guiUtils.sortObjects(regions.cornersBottom, 'x');
        guiUtils.sortObjects(regions.cornersLeft, 'y');
        guiUtils.sortObjects(regions.cornersRight, 'y');
        // making the lines along the border
        makeLines(regions.cornersTop);
        makeLines(regions.cornersBottom);
        makeLines(regions.cornersLeft);
        makeLines(regions.cornersRight);
    }
};

/**
 * remove an line from the collection here and from its corners' collections
 * @method regions.removeLine
 * @param {Line} line
 */
regions.removeLine = function(line) {
    const index = this.lines.indexOf(line);
    if (index >= 0) {
        regions.lines.splice(index, 1);
        line.corner1.removeLine(line);
        line.corner2.removeLine(line);
    } else {
        console.error('regions.removeLine: line not found. It is:');
        console.log(line);
        console.log(regions.lines);
    }
};

/**
 * remove a corner from the collection here, and its connecting lines
 * @method regions.removeCorner
 * @param {Corner} corner
 */
regions.removeCorner = function(corner) {
    const index = this.corners.indexOf(corner);
    if (index >= 0) {
        regions.corners.splice(index, 1);
        while (corner.lines.length > 0) {
            regions.removeLine(corner.lines[corner.lines.length - 1]);
        }
    } else {
        console.error('regions.removeCorner: corner not found. It is:');
        console.log(corner);
        console.log(regions.corners);
    }
};

/**
 * remove all dead ends (corners with a single line, and corners without a line)
 * @method regions.removeDeadEnds
 */
regions.removeDeadEnds = function() {
    let success = true;
    while (success) {
        success = false;
        const length = regions.corners.length;
        // counting down: we do not get problems when elements are removed
        for (var i = length - 1; i >= 0; i--) {
            const corner = regions.corners[i];
            if (corner.lines.length <= 1) {
                success = true;
                regions.removeCorner(corner);
            }
        }
    }
};

/**
 * make the polygons
 * @method regions.makePolygons
 */
regions.makePolygons = function() {
    regions.polygons.length = 0;
    regions.corners.forEach(corner => corner.sortLines());
    regions.corners.forEach(corner => corner.makePolygons());
};

/**
 * determine in which polygon a point lies
 * returns the index of the polygon, or -1 if not found
 * @method regions.getPolygonIndex
 * @param {Object} point - with x- and y-fields
 * @return integer, index to regions.polygons, -1 if point is not in a polygon
 */
regions.getPolygonIndex = function(point) {
    const length = regions.polygons.length;
    for (var i = 0; i < length; i++) {
        if (regions.polygons[i].isInside(point)) {
            return i;
        }
    }
    return -1;
};

/**
 * clear active regions, set all to false
 * @method regions.clearActive
 */
regions.clearActive = function() {
    regions.active.fill(false);
};

/**
 * draw the corners
 * @method regions.drawCorners
 */
regions.drawCorners = function() {
    regions.corners.forEach(corner => corner.draw());
};

/**
 * draw the lines
 * @method regions.drawLines
 */
regions.drawLines = function() {
    regions.lines.forEach(line => line.draw());
};

/**
 * draw the polygons
 * @method regions.drawPolygons
 */
regions.drawPolygons = function() {
    regions.polygons.forEach(polygon => polygon.draw());
};