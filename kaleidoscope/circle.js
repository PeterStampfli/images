/* jshint esversion: 6 */

import {
    guiUtils,
    BooleanButton,
    output
}
from "../libgui/modules.js";

import {
    circles,
    intersections,
    basic
} from './modules.js';

// beware of hitting the circle center
const epsilon = 0.0001;
const epsilon2 = epsilon * epsilon;

// for mouse wheel action
Circle.zoomFactor = 1.04;

// parameters for drawing, change if you do not like it 
Circle.lineWidth = 2;
Circle.highlightLineWidth = 6;
Circle.highlightColor = 'yellow';
Circle.otherHighlightColor = 'white';
Circle.frozenHighlightColor = '#ffbbbb';

// selection, regionwidth in px
Circle.selectWidth = Circle.highlightLineWidth;

/**
 * a circle as a building block for kaleidoscopes
 * gets its own gui
 * @constructor Circle
 * @param{ParamGui} parentGui 
 * @param{object} properties - optional, radius, centerX, centerY, isInsideOutMap, isMapping, color, id
 */
export function Circle(parentGui, properties) {
    // default parameters
    this.canChange = true; // determines if parameters are frozen
    this.radius = 1;
    this.centerX = 0;
    this.centerY = 0;
    this.isInsideOutMap = true; // map direction, inside-out is more useful, not all circles overlap
    this.isMapping = true; // switch mapping on or off (debugging and building), the intersections remain
    this.color = '#000000'; // color for drawing a circle
    this.id = 0;
    // overwrite defaults with fields of the parameter object                                        // unique id, if circles are deleted the id is not related to index in circles.collection
    if (guiUtils.isObject(properties)) {
        Object.assign(this, properties);
    }
    // for speeding up the mapping
    this.radius2 = this.radius * this.radius;
    // the collection of the circle's intersections
    this.intersections = [];

    // the controllers
    // they do not directly change the parameter value of this circle
    // controllers try to change parameters
    // if it does not work because of intersections, we still have the old values
    const circle = this;
    this.gui = parentGui.addFolder('Circle ' + this.id);

    BooleanButton.greenRedBackground();
    this.canChangeController = this.gui.add({
        type: 'boolean',
        params: this,
        property: 'canChange',
        labelText: 'parameters',
        width: 100,
        buttonText: ['can change', 'frozen'],
        onChange: function() {
            circle.activateUI();
            intersections.activateUI();
            circle.mapDirectionController.setActive(circle.canChange);
            basic.drawCirclesIntersections(); // no new map
        }
    });

    this.radiusController = this.gui.add({
        type: 'number',
        initialValue: this.radius,
        labelText: 'radius',
        min: 0,
        onChange: function(radius) {
            circles.setSelected(circle);
            circle.tryRadius(radius);
        }
    });
    this.centerXController = this.gui.add({
        type: 'number',
        labelText: 'center: x',
        initialValue: this.centerX,
        onChange: function(centerX) {
            circles.setSelected(circle);
            circle.tryPosition(centerX, circle.centerY);
        }
    });
    this.centerYController = this.centerXController.add({
        type: 'number',
        labelText: ' y',
        initialValue: this.centerY,
        onChange: function(centerY) {
            circles.setSelected(circle);
            circle.tryPosition(circle.centerX, centerY);
        }
    });
    BooleanButton.whiteBackground();
    this.mapDirectionController = this.gui.add({
        type: 'boolean',
        labelText: 'map',
        width: 100,
        buttonText: ['inside -> out', 'outside -> in'],
        initialValue: this.isInsideOutMap,
        onChange: function(isInsideOutMap) {
            circles.setSelected(circle);
            circle.tryMapDirection(isInsideOutMap);
        }
    });
    BooleanButton.greenRedBackground();
    this.mapOnOffController = this.mapDirectionController.add({
        type: 'boolean',
        params: this,
        property: 'isMapping',
        labelText: '',
        onChange: function() {
            circles.setSelected(circle);
            basic.drawMapChanged(); // changes map
        }
    });
    this.colorController = this.gui.add({
        type: 'color',
        params: this,
        property: 'color',
        onChange: function() {
            circles.setSelected(circle);
            basic.drawCirclesIntersections(); //no new map
        }
    });
}

/**
 * get properties of this circle as an object
 * @method Circle#getProperties
 * @return object, with all properties needed to build the same circle
 */
Circle.prototype.getProperties = function() {
    const properties = {
        radius: this.radius,
        centerX: this.centerX,
        centerY: this.centerY,
        canChange: this.canChange,
        isInsideOutMap: this.isInsideOutMap,
        color: this.color,
        id: this.id
    };
    return properties;
};

/**
 * update the ui values
 * need explicite setting the values from this circle's data
 * @method Circle#updateUI
 */
Circle.prototype.updateUI = function() {
    this.centerXController.setValueOnly(this.centerX);
    this.centerYController.setValueOnly(this.centerY);
    this.radiusController.setValueOnly(this.radius);
    this.mapDirectionController.setValueOnly(this.isInsideOutMap);
};

/**
 * activate ui depending on number of intersections
 * and if canChange is true, such that we can frieze the circle parameters
 * call when number of intersections changes
 * @method Circle.activateUI
 */
Circle.prototype.activateUI = function() {
    if ((this.intersections.length < 3) && (this.canChange)) {
        this.radiusController.setActive(true);
        this.centerXController.setActive(true);
        this.centerYController.setActive(true);
    } else {
        this.radiusController.setActive(false);
        this.centerXController.setActive(false);
        this.centerYController.setActive(false);
    }
};

/**
 * adjust the radius of a circle with only one intersection
 * use this for a given position of the center
 * return true if successful, false if fails
 * does not change the circle for fail
 * @method Circle#adjustRadiusOneIntersection
 * @param {number} centerX
 * @param {number} centerY
 * @return boolean, success
 */
Circle.prototype.adjustRadiusOneIntersection = function(centerX, centerY) {
    // basic data
    const intersection = this.intersections[0];
    const otherCircle = intersection.getOtherCircle(this);
    const coeff = 2 * otherCircle.radius * intersection.signCosAngle();
    if (coeff < 0) {
        return false; // unstable because of two possible solutions radius(distance)
    }
    const dx = centerX - otherCircle.centerX;
    const dy = centerY - otherCircle.centerY;
    const distance2 = dx * dx + dy * dy;
    if ((coeff > 0) && (distance2 < otherCircle.radius2)) {
        // both circles map in the same direction:
        // center of this circle cannot lie inside other circle, (would result in negative radius)
        // Correction: center lies on the circle and its radius vanishes
        const factor = Math.sqrt(otherCircle.radius2 / distance2);
        this.centerX = otherCircle.centerX + factor * dx;
        this.centerY = otherCircle.centerY + factor * dy;
        this.radius = 0;
        this.radius2 = 0;
        return true;
    }
    // setting up the quadratic equation
    const a = 1;
    const b = coeff;
    const c = otherCircle.radius2 - distance2;
    // solve, catch fails (no real solution, no positive solution)
    let success = true;
    const data = {};
    if (guiUtils.quadraticEquation(a, b, c, data)) {
        if ((data.x > 0) && (Math.abs(this.radius - data.x) < Math.abs(this.radius - data.y))) {
            // data.x is the smaller solution than data.y
            // if it is positive, then we have two valid solutions, take the one that is closer to current radius
            this.radius = data.x;
        } else if (data.y > 0) {
            // we have only one positive solution for the radius
            this.radius = data.y;
        } else {
            // no positive solution, fail
            // console.error('Circle#adjustRadiusOneIntersection: Quadratic equation for minimum radius has no positve solution! Intersection:');
            // console.log(this);
            success = false;
        }
    } else {
        // no real solution, fail
        // console.error('Circle#adjustRadiusOneIntersection: Quadratic equation for minimum radius has no real solution! Intersection:');
        // console.log(this);
        success = false;
    }
    if (success) {
        this.radius2 = this.radius * this.radius;
        this.centerX = centerX;
        this.centerY = centerY;
    }
    return success;
};

/**
 * adjust the distance to another circle for a single intersection
 * use this for the current radius and position
 * moves center of this circle to or away from center of the other circle of the intersection
 * @method Circle#adjustPositionOneIntersection
 * @return true, always successful
 */
Circle.prototype.adjustPositionOneIntersection = function() {
    const distance = this.intersections[0].requireDistanceBetweenCenters();
    const otherCircle = this.intersections[0].getOtherCircle(this);
    const dx = this.centerX - otherCircle.centerX;
    const dy = this.centerY - otherCircle.centerY;
    const d = Math.hypot(dx, dy);
    const factor = distance / d;
    this.centerX = otherCircle.centerX + factor * dx;
    this.centerY = otherCircle.centerY + factor * dy;
    return true;
};

/**
 * for two intersections and a given radius
 * adjust the center position, set radius (if it is too small)
 * return true if successful, false if fails
 * does not change the circle for fail
 * @method Circle#adjustPositionTwoIntersections
 * @param {number} radius
 * @return boolean success
 */
Circle.prototype.adjustPositionTwoIntersections = function(radius) {
    // messing things up, restore if needed
    const currentRadius = this.radius;
    this.radius = radius;
    this.radius2 = radius * radius;
    // get basic data, circle centers
    const intersection1 = this.intersections[0];
    const intersection2 = this.intersections[1];
    const otherCircle1 = intersection1.getOtherCircle(this);
    const otherCircle2 = intersection2.getOtherCircle(this);
    const center1X = otherCircle1.centerX;
    const center1Y = otherCircle1.centerY;
    const center2X = otherCircle2.centerX;
    const center2Y = otherCircle2.centerY;
    const center1To2X = center2X - center1X;
    const center1To2Y = center2Y - center1Y;
    // the actual distances between centers of other circles
    const distanceCenter1To2 = Math.hypot(center1To2X, center1To2Y);
    // the required distances from center of this circle to the other circles
    let distanceToCenter1 = intersection1.requireDistanceBetweenCenters();
    let distanceToCenter2 = intersection2.requireDistanceBetweenCenters();
    // check if we can form a triangle: every side of the triangle has to be smaller than the sum of the other two side
    // if not: we have to increase the radius. Minimum radius from all three centers on a line ?
    // Because the degenerate triangle is the most extreme case with respect to the triangle rule.
    let fail = distanceCenter1To2 > distanceToCenter1 + distanceToCenter2;
    fail = fail || (distanceToCenter1 > distanceCenter1To2 + distanceToCenter2);
    fail = fail || (distanceToCenter2 > distanceCenter1To2 + distanceToCenter1);
    if (fail) {
        // determine the minimum distance
        // solve the system of two quadratic equations: 
        // do the resulting linear equation part
        const coeff1 = 2 * otherCircle1.radius * intersection1.signCosAngle();
        const coeff2 = 2 * otherCircle2.radius * intersection2.signCosAngle();
        const radius1Square = otherCircle1.radius2;
        const radius2Square = otherCircle2.radius2;
        // coefficients for the linear equation for this.radius
        const a0 = 0.5 * (distanceCenter1To2 + (radius1Square - radius2Square) / distanceCenter1To2);
        const a1 = 0.5 * (coeff1 - coeff2) / distanceCenter1To2;
        // setup the quadratic equation
        const a = 1 - a1 * a1;
        const b = coeff1 - 2 * a0 * a1;
        const c = radius1Square - a0 * a0;
        const data = {};
        if (guiUtils.quadraticEquation(a, b, c, data)) {
            // data.x is the smaller solution than data.y
            if ((data.x > 0) && (Math.abs(radius - data.x) < Math.abs(radius - data.y))) {
                radius = data.x;
            } else if (data.y > 0) {
                radius = data.y;
            } else {
                //  console.error('Circle#centerPositionsTwoIntersections: Quadratic equation for minimum radius has no positve solution! Intersection:');
                //  console.log(this);
                // fail, restore radius, do not change position
                this.radius = currentRadius;
                this.radius2 = currentRadius * currentRadius;
                return false;
            }
            this.radius = radius;
            this.radius2 = radius * radius;
            // recalculate distances to the other centers
            distanceToCenter1 = intersection1.requireDistanceBetweenCenters();
            distanceToCenter2 = intersection2.requireDistanceBetweenCenters();
        } else {
            //  console.error('Circle#centerPositionsTwoIntersections: Quadratic equation for minimum radius has no real solution! Intersection:');
            //  console.log(this);
            // fail, restore radius, do not change position
            this.radius = currentRadius;
            this.radius2 = currentRadius * currentRadius;
            return false;
        }
    }
    // midpoint of the two solutions on the line between the two other centers
    // distance from center of circle 1 to the midpoint
    const parallelPosition = 0.5 * (distanceCenter1To2 + (distanceToCenter1 * distanceToCenter1 - distanceToCenter2 * distanceToCenter2) / distanceCenter1To2);
    let xi = parallelPosition / distanceCenter1To2;
    const px = center1X + center1To2X * xi;
    const py = center1Y + center1To2Y * xi;
    // get the two solutions from the displacement perpendicular
    // danger: root of near zero but negative number
    const perpSquare = distanceToCenter1 * distanceToCenter1 - parallelPosition * parallelPosition;
    const perpendicularPosition = Math.sqrt(Math.max(0, perpSquare));
    xi = perpendicularPosition / distanceCenter1To2;
    const pos1x = px + center1To2Y * xi;
    const pos1y = py - center1To2X * xi;
    const pos2x = px - center1To2Y * xi;
    const pos2y = py + center1To2X * xi;
    // choose position closer to current center
    const dis1 = (this.centerX - pos1x) * (this.centerX - pos1x) + (this.centerY - pos1y) * (this.centerY - pos1y);
    const dis2 = (this.centerX - pos2x) * (this.centerX - pos2x) + (this.centerY - pos2y) * (this.centerY - pos2y);
    if (dis1 < dis2) {
        this.centerY = pos1y;
        this.centerX = pos1x;
    } else {
        this.centerY = pos2y;
        this.centerX = pos2x;
    }
    return true;
};

/**
 * circle with two intersections, try a given new position, 
 * adjust mainly circle radius and partly position to intersections
 * return true if successful, false if fails
 * does not change the circle for fail
 * @method Circle#adjustRadiusTwoIntersections
 * @param {number} centerX
 * @param {number} centerY
 * @return boolean, true if successful
 */
Circle.prototype.adjustRadiusTwoIntersections = function(centerX, centerY) {
    // get basic data
    const intersection1 = this.intersections[0];
    const intersection2 = this.intersections[1];
    const otherCircle1 = intersection1.getOtherCircle(this);
    const otherCircle2 = intersection2.getOtherCircle(this);
    const center1X = otherCircle1.centerX;
    const center1Y = otherCircle1.centerY;
    const center2X = otherCircle2.centerX;
    const center2Y = otherCircle2.centerY;
    let center1To2X = center2X - center1X;
    let center1To2Y = center2Y - center1Y;
    // the actual distances between centers of other circles
    const distanceCenter1To2 = Math.hypot(center1To2X, center1To2Y);
    // normalized distance vector
    center1To2X /= distanceCenter1To2;
    center1To2Y /= distanceCenter1To2;
    // coefficients of the eqn. for required distances
    const coeff1 = 2 * otherCircle1.radius * intersection1.signCosAngle();
    const coeff2 = 2 * otherCircle2.radius * intersection2.signCosAngle();
    // determine distance y of this center perpendicularly from the line between the two other centers
    // perpendicular vector is (-center1To2Y,center1To2X), rotating 90 degrees in positve sense
    const y = -(centerX - center1X) * center1To2Y + (centerY - center1Y) * center1To2X;
    // linear eqn for the distance x from the first center towards the second center
    // coefficients a1*r + a0
    const a0 = 0.5 * (distanceCenter1To2 * distanceCenter1To2 + otherCircle1.radius2 - otherCircle2.radius2) / distanceCenter1To2;
    const a1 = 0.5 * (coeff1 - coeff2) / distanceCenter1To2;
    // make the quadratic equation for the radius
    const a = (1 - a1 * a1);
    const b = (coeff1 - 2 * a1 * a0);
    const c = -a0 * a0 - y * y + otherCircle1.radius2;
    // solve quadratic eqn, choose good solution
    const data = {};
    if (guiUtils.quadraticEquation(a, b, c, data)) {
        // data.x is the smaller solution than data.y
        // if data.x is positive and closer to the current radius take it as solution
        if ((data.x > 0) && (Math.abs(this.radius - data.x) < Math.abs(this.radius - data.y))) {
            this.radius = data.x;
        } else if (data.y > 0) {
            this.radius = data.y;
        } else {
            //console.error('Circle#adjustRadiusTwoIntersections: Quadratic equation for minimum radius has no positve solution! Intersection:');
            //console.log(this);
            // fail, do not change anything
            return false;
        }
    } else {
        //console.error('Circle#adjustRadiusTwoIntersections: Quadratic equation for minimum radius has no real solution! Intersection:');
        //console.log(this);
        // fail, do not change anything
        return false;
    }
    this.radius2 = this.radius * this.radius;
    // determine x from radius
    const x = a1 * this.radius + a0;
    // determine position from x and y
    this.centerX = center1X + center1To2X * x - center1To2Y * y;
    this.centerY = center1Y + center1To2Y * x + center1To2X * y;
    return true;
};

/**
 * solution for three intersections
 * there are two possible solutions for the radius
 * the resulting centers may be close to each other
 * take the radius that is closer to the current radius
 * return true if successful, false if fails
 * does not change the circle for fail
 * @method Circle#adjustThreeIntersections
 * @param {object} pos1 - with x- and y fields
 * @param {object} pos2 - with x- and y fields
 */
Circle.prototype.adjustThreeIntersections = function(pos1, pos2) {
    const intersection1 = this.intersections[0];
    const intersection2 = this.intersections[1];
    const intersection3 = this.intersections[2];
    const otherCircle1 = intersection1.getOtherCircle(this);
    const otherCircle2 = intersection2.getOtherCircle(this);
    const otherCircle3 = intersection3.getOtherCircle(this);
    const center1X = otherCircle1.centerX;
    const center1Y = otherCircle1.centerY;
    const center1Square = center1X * center1X + center1Y * center1Y;
    const center2X = otherCircle2.centerX;
    const center2Y = otherCircle2.centerY;
    const center2Square = center2X * center2X + center2Y * center2Y;
    const center3X = otherCircle3.centerX;
    const center3Y = otherCircle3.centerY;
    const center3Square = center3X * center3X + center3Y * center3Y;
    const center1To2X = center2X - center1X;
    const center1To2Y = center2Y - center1Y;
    const center1To3X = center3X - center1X;
    const center1To3Y = center3Y - center1Y;
    const coeff1 = 2 * otherCircle1.radius * intersection1.signCosAngle();
    const coeff2 = 2 * otherCircle2.radius * intersection2.signCosAngle();
    const coeff3 = 2 * otherCircle3.radius * intersection3.signCosAngle();
    const radius1Square = otherCircle1.radius2;
    const radius2Square = otherCircle2.radius2;
    const radius3Square = otherCircle3.radius2;
    // the system of linear equations for the center of this circle
    const denom = center1To2X * center1To3Y - center1To3X * center1To2Y;
    if (denom < 0.001 * (Math.abs(center1To2X * center1To3Y) + Math.abs(center1To3X * center1To2Y))) {
        // nearly colinear, fail
        return false;
    }
    const g13 = 0.5 * (coeff3 - coeff1);
    const g21 = 0.5 * (coeff1 - coeff2);
    const g32 = 0.5 * (coeff2 - coeff3);
    // fij=0.5*(p_i^2-r_i^2-p_j^2+r_j^2)
    const f13 = 0.5 * (center1Square - otherCircle1.radius2 - center3Square + otherCircle3.radius2);
    const f21 = 0.5 * (center2Square - otherCircle2.radius2 - center1Square + otherCircle1.radius2);
    const f32 = 0.5 * (center3Square - otherCircle3.radius2 - center2Square + otherCircle2.radius2);
    // coefficients of the linear equation for this circle center as a function of r
    const a0 = (f32 * center1Y + f21 * center3Y + f13 * center2Y) / denom;
    const a1 = (g32 * center1Y + g21 * center3Y + g13 * center2Y) / denom;
    const b0 = -(f32 * center1X + f21 * center3X + f13 * center2X) / denom;
    const b1 = -(g32 * center1X + g21 * center3X + g13 * center2X) / denom;
    // checking the linear equation
    // setting up the quadratic equation for r
    const a = 1 - a1 * a1 - b1 * b1;
    const b = coeff1 - 2 * a1 * (a0 - center1X) - 2 * b1 * (b0 - center1Y);
    const c = otherCircle1.radius2 - (a0 - center1X) * (a0 - center1X) - (b0 - center1Y) * (b0 - center1Y);
    const data = {};
    if (guiUtils.quadraticEquation(a, b, c, data)) {
        // data.x is the smaller solution than data.y
        // if data.x is positive and closer to the current radius take it as solution
        if ((data.x > 0) && (Math.abs(this.radius - data.x) < Math.abs(this.radius - data.y))) {
            this.radius = data.x;
        } else if (data.y > 0) {
            this.radius = data.y;
        } else {
            //  console.error('Circle#adjustThreeIntersections: Quadratic equation for radius has only negative solutions! Intersection:');
            //      console.log(this);
            // fail, do not change anything
            return false;
        }
    } else {
        //  console.error('Circle#adjustThreeIntersections: Quadratic equation for radius has no real solution! Intersection:');
        //console.log(this);
        // fail, do not change anything
        return false;
    }
    this.radius2 = this.radius * this.radius;
    // now determine the position of the center from the linear equation
    this.centerX = a1 * this.radius + a0;
    this.centerY = b1 * this.radius + b0;
    return true;
};

/**
 * try a given value for the radius, adjust circle radius and position to intersections
 * if fails, do not change current radius
 * does nothing for three or mor intersections
 * if success update UI to new values and draw image
 * @method tryRadius
 * @param {number} radius
 */
Circle.prototype.tryRadius = function(radius) {
    if (this.canChange) {
        let success = true;
        switch (this.intersections.length) {
            case 0:
                this.radius = radius;
                this.radius2 = radius * radius;
                break;
            case 1:
                // keep the radius, change distance to other circle, always possible
                this.radius = radius;
                this.radius2 = radius * radius;
                this.adjustPositionOneIntersection();
                break;
            case 2:
                success = this.adjustPositionTwoIntersections(radius);
                break;
            default:
                success = false; // not possible for three or more intersections
                break;
        }
        if (success) {
            this.updateUI();
            intersections.activateUI();
            basic.drawMapChanged();
        }
    }
};

/**
 * try a given position, adjust circle radius and position to intersections
 * if fails do not change current position
 * if success update UI to new values and draw image
 * @method tryPosition
 * @param {number} centerX
 * @param {number} centerY
 * @return boolean true if successful and case solved
 */
Circle.prototype.tryPosition = function(centerX, centerY) {
    if (this.canChange) {
        let success = true;
        switch (this.intersections.length) {
            case 0:
                this.centerX = centerX;
                this.centerY = centerY;
                break;
            case 1:
                // first try to adjust the radius for the new position
                if (!this.adjustRadiusOneIntersection(centerX, centerY)) {
                    // if it failed, keep radius and adjust distance between the circles
                    this.centerX = centerX;
                    this.centerY = centerY;
                    this.adjustPositionOneIntersection();
                }
                break;
            case 2:
                success = this.adjustRadiusTwoIntersections(centerX, centerY);
                break;
            default:
                success = false; // not possible for three or more intersections
                break;
        }
        if (success) {
            this.updateUI();
            intersections.activateUI();
            basic.drawMapChanged();
        }
        return success;
    } else {
        return false;
    }
};

/**
 * adjust circle to intersections when adding intersection or changing order
 * nothing to do if there is no intersection
 * adjust distance to other circle if there is only one intersection (increase radius if too small)
 * adjust position of circle if there are two intersections
 * adjust radius and position of circle for three intersections
 * update UI if successful
 * update output image elsewhere
 * return true if successful, false if fails
 * does not change the circle for fail
 * @method Circle#adjustToIntersections
 * @return boolean, true if success, false if something failed
 */
Circle.prototype.adjustToIntersections = function() {
    if (this.canChange) {
        let success = true;
        switch (this.intersections.length) {
            case 0:
                break;
            case 1:
                // one intersection is 'trivial', we can keep the radius and change the distance to the other circle
                this.adjustPositionOneIntersection();
                break;
            case 2:
                success = this.adjustPositionTwoIntersections(this.radius);
                break;
            case 3:
                success = this.adjustThreeIntersections();
                break;
            default:
                success = false; // not possible for more than 3 intersections
                break;
        }
        if (success) {
            this.updateUI();
        }
        return success;
    } else {
        return false;
    }
};

/**
 * try a given map direction, adjust circle radius and position to intersections
 * if fails do not change current position
 * if success update UI to new values and draw image
 * @method tryMapDirection
 * @param {boolean} isInsideOutMap
 */
Circle.prototype.tryMapDirection = function(isInsideOutMap) {
    // remember the old parameter (maybe it did not change?)
    const currentIsInsideOutMap = this.isInsideOutMap;
    this.isInsideOutMap = isInsideOutMap;
    let success = this.adjustToIntersections();
    if (success) {
        this.updateUI();
        basic.drawMapChanged();
    } else {
        this.isInsideOutMap = currentIsInsideOutMap; // fail: restore value
        this.updateUI(); // reset the shown map direction value
    }
};

/**
 * more checks: Circle can adjust to a new intersection
 * means it can change and has less than 3 intersections
 * @method Circle#canAdjust
 * @return boolean, true if circle can adjust
 */
Circle.prototype.canAdjust = function() {
    return (this.canChange) && (this.intersections.length < 3);
};

/**
 * add an intersection
 * we can have more than 3, but then this circle cannot adjust to intersections
 * @method Circle#addIntersection
 * @param {Intersection} intersection
 */
Circle.prototype.addIntersection = function(intersection) {
    // for safety, check if intersection already there
    for (var i = 0; i < this.intersections.length; i++) {
        if (this === this.intersections[i].getOtherCircle(this)) {
            console.error('Circle#addIntersection: This intersection is already there:');
            console.log(intersection);
            console.log(this.intersections);
            return;
        }
    }
    this.intersections.push(intersection);
    this.activateUI();
};

/**
 * remove an intersection from the collection
 * @method Circle.removeIntersection
 * @param {Intersection} intersection
 */
Circle.prototype.removeIntersection = function(intersection) {
    const index = this.intersections.indexOf(intersection);
    if (index >= 0) {
        this.intersections.splice(index, 1);
        // just in case that we had a fail in adjusting to intersections
        this.adjustToIntersections();
        this.activateUI();
    } else {
        console.error('Circle#removeIntersection: intersection not found. It is:');
        console.log(intersection);
        console.log(this);
    }
};

/**
 * drawing a circle
 * as a broader circle in a highlight color or narrow in its own color
 * @method Circle#draw
 * @param {boolean} highlight - optional, default is 0, not highlighted
 */
Circle.prototype.draw = function(highlight = 0) {
    const context = output.canvasContext;
    switch (highlight) {
        case 0:
            output.setLineWidth(Circle.lineWidth);
            context.strokeStyle = this.color;
            break;
        case 1:
            output.setLineWidth(Circle.highlightLineWidth);
            if ((this.intersections.length < 3) && (this.canChange)) {
                context.strokeStyle = Circle.highlightColor;
            } else {
                context.strokeStyle = Circle.frozenHighlightColor;
            }
            break;
        case 2:
            output.setLineWidth(Circle.highlightLineWidth);
            if ((this.intersections.length < 3) && (this.canChange)) {
                context.strokeStyle = Circle.otherHighlightColor;
            } else {
                context.strokeStyle = Circle.frozenHighlightColor;
            }
            break;
    }
    context.beginPath();
    context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    context.stroke();
};

/**
 * check if the circle is selected by position
 * @method Circle#isSelected
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if selected
 */
Circle.prototype.isSelected = function(position) {
    const r = Math.hypot(position.x - this.centerX, position.y - this.centerY);
    const effSelectWidth = Circle.selectWidth * output.coordinateTransform.totalScale;
    return Math.abs(r - this.radius) < effSelectWidth;
};

/**
 * check if the position is inside the target region of the circle map (inside or outside the circle)
 * NOTE: Avoid double negations, use positive form of function
 * @method Circle#isInTarget
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if in target region (inside for outsideIn)
 */
Circle.prototype.isInTarget = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    if (this.isMapping) {
        if (this.isInsideOutMap) {
            return dx * dx + dy * dy > this.radius2;
        } else {
            return dx * dx + dy * dy < this.radius2;
        }
    } else {
        return true;
    }
};

/**
 * make the mapping, return true if mapping occured
 * @method Circle.map
 * @param {object} position - with x and y fields, will be changed
 * @return boolean, true if mapping occured (point was outside target and is inside now)
 */
Circle.prototype.map = function(position) {
    if (this.isMapping) {
        const dx = position.x - this.centerX;
        const dy = position.y - this.centerY;
        const dr2 = dx * dx + dy * dy;
        if (this.isInsideOutMap) {
            if (dr2 > this.radius2) {
                return false;
            } else {
                const factor = this.radius2 / Math.max(dr2, epsilon2);
                position.x = this.centerX + factor * dx;
                position.y = this.centerY + factor * dy;
                return true;
            }
        } else {
            if (dr2 < this.radius2) {
                return false;
            } else {
                const factor = this.radius2 / dr2;
                position.x = this.centerX + factor * dx;
                position.y = this.centerY + factor * dy;
                return true;
            }
        }
    } else {
        return false;
    }
};

/**
 * invert at the circle, used to get always a good image
 * @method Circle.invert
 * @param {object} position - with x and y fields, will be changed
 */
Circle.prototype.invert = function(position) {
        const dx = position.x - this.centerX;
        const dy = position.y - this.centerY;
        const dr2 = dx * dx + dy * dy;
                const factor = this.radius2 / Math.max(dr2, epsilon2);
                position.x = this.centerX + factor * dx;
                position.y = this.centerY + factor * dy;        
};
/**
 * dragging the circle
 * action depends on intersections
 * @method Circle#dragAction
 * @param{object} event
 */
Circle.prototype.dragAction = function(event) {
    if (this.canChange) {
        let success = this.tryPosition(this.centerX + event.dx, this.centerY + event.dy);
        if (!success && (this.intersections.length === 2)) {
            // dragging fails for a circle with two intersections
            // because the two other circles are intersecting and this circle falls into their intersection
            // and this circle cannot be there
            // try tunneling: mirror current position of this circle at line
            // get basic data: unit vector between the two other circles
            // repeats work done before, but is not expensive
            const intersection1 = this.intersections[0];
            const intersection2 = this.intersections[1];
            const otherCircle1 = intersection1.getOtherCircle(this);
            const otherCircle2 = intersection2.getOtherCircle(this);
            const center1X = otherCircle1.centerX;
            const center1Y = otherCircle1.centerY;
            const center2X = otherCircle2.centerX;
            const center2Y = otherCircle2.centerY;
            let center1To2X = center2X - center1X;
            let center1To2Y = center2Y - center1Y;
            // the actual distances between centers of other circles
            const distanceCenter1To2 = Math.hypot(center1To2X, center1To2Y);
            // normalized distance vector
            center1To2X /= distanceCenter1To2;
            center1To2Y /= distanceCenter1To2;
            const c1ToMLength = center1To2X * (this.centerX - center1X) + center1To2Y * (this.centerY - center1Y);
            const mX = center1X + c1ToMLength * center1To2X;
            const mY = center1Y + c1ToMLength * center1To2Y;
            const flippedX = 2 * mX - this.centerX;
            const flippedY = 2 * mY - this.centerY;
            // try dragging the circle away from its mirrored position
            this.tryPosition(flippedX + event.dx, flippedY + event.dy);
        }
    }
};

/**
 * mouse wheel on the circle, changing raadius
 * effective action depends on intersections
 * @method Circle#wheelAction
 * @param{object} event
 */
Circle.prototype.wheelAction = function(event) {
    if (this.canChange) {
        const zoomFactor = (event.wheelDelta > 0) ? Circle.zoomFactor : 1 / Circle.zoomFactor;
        this.tryRadius(this.radius * zoomFactor);
    }
};

/**
 * destroy the circle and all that depends on it
 * make that there are no more references to this circle hanging around
 * @method Circle#destroy
 */
Circle.prototype.destroy = function() {
    while (this.intersections.length > 0) {
        this.intersections[this.intersections.length - 1].destroy();
    }
    this.gui.destroy();
    circles.remove(this);
};