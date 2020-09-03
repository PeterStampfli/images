/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

import {
    circles,
    Corner,
    Line
} from './modules.js';

/**
 * detecting disjoint target regions as defined by the circles
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
regions.hasOutsideInMappingCircles = false;

// collecting the corners and lines
// it is for building polygons (they refer to corners as object references)
regions.corners = [];
regions.lines = [];

// each inside-> out mapping cirle center might be a corner
// we collect them all, some might be unused
// but circles and corners then have the same indices

/**
 * collect circles according to mapping direction
 * each inside->out mapping circlee gives a potential corner
 * inside->out mapping circles are potential corners
 * @method regions.collectCircles
 */
regions.collectCircles = function() {
    const length = circles.collection.length;
    regions.outsideInMappingCircles.length = 0;
    regions.insideOutMappingCircles.length = 0;
    regions.corners.length = 0;
    for (var i = 0; i < length; i++) {
        const circle = circles.collection[i];
        if (circle.isInsideOutMap) {
            regions.insideOutMappingCircles.push(circle);
            regions.corners.push(new Corner(circle.centerX, circle.centerY));
        } else {
            regions.outsideInMappingCircles.push(circle);
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
 * determine bounding rectangle of intersection region
 * for circles with outside->in mapping
 * or bounding region of all circles, if there are only inside->out mapping circles
 * uses regions.outsideInMappingCircles
 * @method regions.determineBoundingRectangle
 */
regions.determineBoundingRectangle = function() {
    var i;
    // just in case that there is no circle
    regions.boundingTop = 0;
    regions.boundingBottom = 0;
    regions.boundingLeft = 0;
    regions.boundingRight = 0;
    // some outside->in
    if (regions.outsideInMappingCircles.length > 0) {
        regions.hasOutsideInMappingCircles = true;
        const circle = regions.outsideInMappingCircles[0];
        regions.boundingTop = circle.centerY + circle.radius;
        regions.boundingBottom = circle.centerY - circle.radius;
        regions.boundingRight = circle.centerX + circle.radius;
        regions.boundingLeft = circle.centerX - circle.radius;
        const length = regions.outsideInMappingCircles.length;
        for (i = 1; i < length; i++) {
            const circle = regions.outsideInMappingCircles[i];
            regions.boundingTop = Math.min(regions.boundingTop, circle.centerY + circle.radius);
            regions.boundingBottom = Math.max(regions.boundingBottom, circle.centerY - circle.radius);
            regions.boundingRight = Math.min(regions.boundingRight, circle.centerX + circle.radius);
            regions.boundingLeft = Math.max(regions.boundingLeft, circle.centerX - circle.radius);
        }
    } else {
        //inside->out only
        const circle = regions.insideOutMappingCircles[0];
        regions.hasOutsideInMappingCircles = false;
        regions.boundingTop = circle.centerY + circle.radius;
        regions.boundingBottom = circle.centerY - circle.radius;
        regions.boundingRight = circle.centerX + circle.radius;
        regions.boundingLeft = circle.centerX - circle.radius;
        const length = regions.insideOutMappingCircles.length;
        for (i = 1; i < length; i++) {
            const circle = regions.insideOutMappingCircles[i];
            regions.boundingTop = Math.max(regions.boundingTop, circle.centerY + circle.radius);
            regions.boundingBottom = Math.min(regions.boundingBottom, circle.centerY - circle.radius);
            regions.boundingRight = Math.max(regions.boundingRight, circle.centerX + circle.radius);
            regions.boundingLeft = Math.min(regions.boundingLeft, circle.centerX - circle.radius);
        }
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
    var quadrant;
    if (dYLine > 0) {
        const deltaY = regions.boundingTop - inOutCorner.y;
        if (dXLine > 0) {
            const deltaX = regions.boundingRight - inOutCorner.x;
            // going up and right
            // does it go to the right or top boundary ?
            if (dyLine * deltaX < dXLine * deltaY) {
                // the line is relatively closer to the x-axis -> hits the right border
                const newCornerX = regions.boundingRight;
                const newCornerY = inOutCorner.y + dYLine * deltaX / dXLine;

                //...
            }

        } else {
            quadrant = 2;
        }
    } else {
        if (dXLine > 0) {
            quadrant = 4;
        } else {
            quadrant = 3;
        }
    }

};

/**
 * lines due to outside->in mapping circles
 * @method regions.linesFromOutsideInMappingCircles
 */
regions.linesFromOutsideInMappingCircles = function() {
    regions.cornersTop.length = 0;
    regions.cornersBottom.length = 0;
    regions.cornersLeft.length = 0;
    regions.cornersRight.length = 0;
    if (regions.hasOutsideInMappingCircles) {
        // the corners of the bounding rectangle
        let corner = new Corner(regions.boundingLeft, regions.boundingTop);
        regions.cornersTop.push(corner);
        regions.corners.push(corner);
        corner = new Corner(regions.boundingRight, regions.boundingTop);
        regions.cornersTop.push(corner);
        regions.corners.push(corner);
        corner = new Corner(regions.boundingLeft, regions.boundingBottom);
        regions.cornersBottom.push(corner);
        regions.corners.push(corner);
        corner = new Corner(regions.boundingRight, regions.boundingBottom);
        regions.cornersBottom.push(corner);
        regions.corners.push(corner);
        // corners from intersections
        const lengthInOut = regions.insideOutMappingCircles.length;
        const lengthOutIn = regions.outsideInMappingCircles.length;
        for (var i = 0; i < lengthInOut - 1; i++) {
            const circle1 = regions.insideOutMappingCircles[i];
            for (var j = i + 1; j < lengthOutIn; j++) {
                const circle2 = regions.outsideInMappingCircles[j];
                if (circle1.intersectsCircle(circle2)) {
                    regions.insideOutIntersectsOutsideIn(regions.corners[i], circle2);
                }
            }
        }



    }

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