/* jshint esversion: 6 */

import {
    output
}
from "../libgui/modules.js";

import {
    circles,
    Corner
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

regions.insideOutMappingCircles = []; // give corners, same position as circle centers, same index as in this array
regions.outsideInMappingCircles = []; // these make some additional corners, in particular the corners of the bounding rectangle 

// collecting the corners and lines
regions.corners = [];

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
    for (var i = 0; i < length; i++) {
        const circle = circles.collection[i];
        if (circle.isInsideOutMap) {
            regions.insideOutMappingCircles.push(circle);
            regions.corners.push(new Corner(circle.centerX,circle.centerY));
        } else {
            regions.outsideInMappingCircles.push(circle);
        }
    }
};

regions.boundingTop = 0;
regions.boundingBottom = 0;
regions.boundingLeft = 0;
regions.boundingRight = 0;
/**
 * determine bounding rectangle of intersection region
 * for circles with outside->in mapping
 * uses regions.outsideInMappingCircles
 * @method regions.determineBoundingRectangle
 */
regions.determineBoundingRectangle = function() {
    if (regions.outsideInMappingCircles.length > 0) {
        const circle = regions.outsideInMappingCircles[0];
        regions.boundingTop = circle.centerY + circle.radius;
        regions.boundingBottom = circle.centerY - circle.radius;
        regions.boundingRight = circle.centerX + circle.radius;
        regions.boundingLeft = circle.centerX - circle.radius;
        const length = regions.outsideInMappingCircles.length;
        for (var i = 1; i < length; i++) {
            const circle = regions.outsideInMappingCircles[i];
            regions.boundingTop = Math.min(regions.boundingTop, circle.centerY + circle.radius);
            regions.boundingBottom = Math.max(regions.boundingBottom, circle.centerY - circle.radius);
            regions.boundingRight = Math.min(regions.boundingRight, circle.centerX + circle.radius);
            regions.boundingLeft = Math.max(regions.boundingLeft, circle.centerX - circle.radius);
        }
    }
};

/**
 * draw the bounding rectangle for tests
 * @method regions.drawBoundingRectangle
 */
regions.drawBoundingRectangle = function() {
    if ((regions.outsideInMappingCircles.length > 0) && (regions.boundingLeft < regions.boundingRight) && (regions.boundingBottom < regions.boundingTop)) {
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

/**
* draw the corners
* @method regions.drawCorners
*/
regions.drawCorners=function(){
regions.corners.forEach(corner=>corner.draw());
};