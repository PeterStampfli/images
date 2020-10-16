/* jshint esversion: 6 */

import {
    guiUtils,
    BooleanButton,
    output,
    map
}
from "../libgui/modules.js";

import {
    circles,
    intersections,
    basic,
    Fast
} from './modules.js';

// beware of hitting the circle center
const epsilon = 0.0001;
const epsilon2 = epsilon * epsilon;

// for mouse wheel action
Circle.zoomFactor = 1.04;

// parameters for drawing, change if you do not like it 
Circle.highlightColor = '#ffff00';
Circle.otherHighlightColor = '#ffffff';
Circle.frozenHighlightColor = '#eeee88';

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
    this.mapType = 'inside -> out';
    this.osInterpolation = 1; // interpolation for ortho-stereographic projection
    this.color = '#000000'; // color for drawing a circle
// unique id, if circles are deleted the id is not related to index in circles.collection
    this.id = 0;
    // overwrite defaults with fields of the parameter object  
    if (guiUtils.isObject(properties)) {
        Object.assign(this, properties);
    }
    this.setMapProperties(this.mapType);
    // for speeding up the mapping
    this.radius2 = this.radius * this.radius;
    this.updateOSParameters();
    // the collection of the circle's intersections
    this.intersections = [];

    // the controllers
    // they do not directly change the parameter value of this circle
    // controllers try to change parameters
    // if it does not work because of intersections, we still have the old values
    const circle = this;
    this.gui = parentGui;

    BooleanButton.greenRedBackground();
    this.canChangeController = this.gui.add({
        type: 'boolean',
        params: this,
        property: 'canChange',
        labelText: '<strong>circle ' + this.id + '</strong>',
        width: 100,
        buttonText: ['can change', 'frozen'],
        onChange: function() {
            circle.activateUI();
            intersections.activateUI();
            basic.drawCirclesIntersections(); // no new map
        }
    });

    this.centerXController = this.gui.add({
        type: 'number',
        labelText: 'center: x',
        initialValue: this.centerX,
        onChange: function(centerX) {
            circles.setSelected(circle);
            const success = circle.tryPosition(centerX, circle.centerY);
            if (!success) {
                alert('Fail: Cannot change position');
            }
        }
    });
    this.centerYController = this.centerXController.add({
        type: 'number',
        labelText: ' y',
        initialValue: this.centerY,
        onChange: function(centerY) {
            circles.setSelected(circle);
            const success = circle.tryPosition(circle.centerX, centerY);
            if (!success) {
                alert('Fail: Cannot change position');
            }
        }
    });

    this.radiusController = this.centerYController.add({
        type: 'number',
        initialValue: this.radius,
        labelText: 'radius',
        min: 0,
        onChange: function(radius) {
            circles.setSelected(circle);
            const success = circle.tryRadius(radius);
            circle.updateOSParameters();
            if (!success) {
                alert('Fail: Cannot change radius');
            }
        }
    });

    this.mapTypeController = this.gui.add({
        type: 'selection',
        params: this,
        property: 'mapType',
        labelText: 'map',
        width: 100,
        options: ['inside -> out', 'outside -> in', 'no mapping', 'inverting view', 'logarithmic view', 'ortho-stereographic view'],
        onChange: function(mapType) {
            circles.setSelected(circle);
            // if map direction changes, try new direction
            if ((mapType === 'inside -> out') && !circle.isInsideOutMap) {
                circle.isInsideOutMap = true; // we want inside->out map
                // check if successful
                const success = circle.adjustToIntersections();
                if (success) {
                    intersections.activateUI();
                } else {
                    // failing to change direction, reset selection
                    circle.mapTypeController.setValueOnly('outside -> in');
                    alert('Fail: Cannot change map direction');
                }
            } else if ((mapType === 'outside -> in') && circle.isInsideOutMap) {
                circle.isInsideOutMap = false; // we want outside->in map
                // check if successful
                const success = circle.adjustToIntersections();
                if (success) {
                    intersections.activateUI();
                } else {
                    // failing to change direction, reset selection
                    circle.mapTypeController.setValueOnly('inside -> out');
                    alert('Fail: Cannot change map direction');
                }
            }
            if (mapType === 'ortho-stereographic view') {
                circle.osInterpolationController.show();
            } else {
                circle.osInterpolationController.hide();
            }
            // set properties of map, may have changed
            circle.setMapProperties(circle.mapTypeController.getValue());
            basic.drawMapChanged();
        }
    });

    this.osInterpolationController = this.gui.add({
        type: 'number',
        params: this,
        property: 'osInterpolation',
        min: 0,
        max: 1,
        labelText: 'interpolation',
        usePopup: false,
        onChange: function() {
            circle.updateOSParameters();
            basic.drawMapChanged();
        }
    });
    this.osInterpolationController.createLongRange();
    this.osInterpolationController.hide();

    this.colorController = this.gui.add({
        type: 'color',
        params: this,
        property: 'color',
        onChange: function() {
            circles.setSelected(circle);
            if (map.whatToShowController.getValue() === map.callDrawIndrasPearls) {
                basic.drawImageChanged();
            } else {
                basic.drawCirclesIntersections();
            }
        }
    });
}

/**
 * set mapping properties from mapType
 * note the redundancy of data, difficult to improve, thus modify only using this method
 * @method Circle#setMapProperties
 * @param {String} mapType
 */
Circle.prototype.setMapProperties = function(mapType) {
    switch (mapType) {
        case 'inside -> out':
            this.isInsideOutMap = true; // map direction, inside-out is more useful, not all circles overlap
            this.isMapping = true; // switch mapping on or off (debugging and building), the intersections remain
            this.isView = false; // true for circles that change the view, such as inversion
            this.map = this.insideOutMap; // improving speed
            this.isInTarget = this.isOutside;
            break;
        case 'outside -> in':
            this.isInsideOutMap = false;
            this.isMapping = true;
            this.isView = false;
            this.map = this.outsideInMap;
            this.isInTarget = this.isInside;
            break;
        case 'no mapping':
            this.isMapping = false;
            this.isView = false;
            this.map = this.noMap;
            this.isInTarget = this.noMap;
            break;
        case 'inverting view':
            this.isMapping = false;
            this.isView = true;
            this.map = this.invert;
            this.isInTarget = this.noMap;
            break;
        case 'logarithmic view':
            this.isMapping = false;
            this.isView = true;
            this.map = this.exponential;
            this.isInTarget = this.noMap;
            break;
        case 'ortho-stereographic view':
            this.isMapping = false;
            this.isView = true;
            this.map = this.orthoStereo;
            this.isInTarget = this.noMap;
            break;
    }
};

/**
 * calculate parameterss for the ortho-stereographic view
 * @method Circle#updateOSParameters
 */
Circle.prototype.updateOSParameters = function() {
    this.osFactor = 1 + Math.sqrt(Math.max(0, 1 - this.osInterpolation));
    this.osx2r2 = this.osInterpolation / this.radius2;
};

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
        mapType: this.mapType,
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
 * for checking if we can have an intersection:
 * do the circles really intersect ?
 * using the triangle rule "for all three sides"
 * nearly concentric circles with nearly same radius do not intersect
 * @method Circle#intersectsCircle
 * @param {Circle} circle
 * @return boolean, true if the circles intersect
 */
const eps = 0.001;
Circle.prototype.intersectsCircle = function(circle) {
    const distance = Math.hypot(this.centerX - circle.centerX, this.centerY - circle.centerY);
    // Note: Concentric circles of same radius do not intersect
    if (distance < eps * (this.radius + circle.radius)) {
        return false;
    } else {
        // float numbers are never accurate, make sure that touching circles intersect
        const safetyFactor = 0.999;
        let intersects = ((this.radius + circle.radius) >= distance * safetyFactor);
        intersects = intersects && ((this.radius + distance) >= circle.radius * safetyFactor);
        intersects = intersects && ((circle.radius + distance) >= this.radius * safetyFactor);
        return intersects;
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
 * circle with two intersections, try a given new position, adjust circle radius and position
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
 * @return boolean true if successful and case solved
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
        return success;
    } else {
        return false;
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
                if (!success) {
                    success = this.adjustRadiusTwoIntersections(this.centerX, this.centerY);
                }
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
    //   console.log('add',this.id,this.intersections.length);
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
 * inverting view with cross mark at center for mor precise positioning
 * @method Circle#draw
 * @param {boolean} highlight - optional, default is 0, not highlighted
 */
Circle.prototype.draw = function(highlight = 0) {
    const context = output.canvasContext;
    switch (highlight) {
        case 0:
            // basic drawing without highlight
            output.setLineWidth(map.linewidth);
            context.strokeStyle = this.color;
            if ((this.mapType === 'inverting view')||(this.mapType === 'ortho-stereographic view')||(this.mapType === 'logarithmic view')) {
                const d = 2 * map.linewidth * output.coordinateTransform.totalScale;
                const D = 10 * map.linewidth * output.coordinateTransform.totalScale;
                context.beginPath();
                context.moveTo(this.centerX - D, this.centerY);
                context.lineTo(this.centerX - d, this.centerY);
                context.moveTo(this.centerX + D, this.centerY);
                context.lineTo(this.centerX + d, this.centerY);
                context.moveTo(this.centerX, this.centerY - D);
                context.lineTo(this.centerX, this.centerY - d);
                context.moveTo(this.centerX, this.centerY + D);
                context.lineTo(this.centerX, this.centerY + d);
                context.stroke();
            }
            break;
        case 1:
            // highlighting the last selection
            output.setLineWidth(3 * map.linewidth);
            if ((this.intersections.length < 3) && (this.canChange)) {
                context.strokeStyle = Circle.highlightColor;
            } else {
                context.strokeStyle = Circle.frozenHighlightColor;
            }
            break;
        case 2:
            // highlighting the other selection
            output.setLineWidth(3 * map.linewidth);
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
    const effSelectWidth = 3 * map.linewidth * output.coordinateTransform.totalScale;
    return Math.abs(r - this.radius) < effSelectWidth;
};

/**
 * check if the position is inside the target region of the circle map (inside or outside the circle)
 * @method Circle#isInTarget
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if in target region (inside for outsideIn)
 */
Circle.prototype.isInTarget = function(position) {
    return false;
};

/**
 * check if the position is inside the circle (target region for outside->in mapping circles)
 * @method Circle#isInside
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if in target region (inside for outsideIn)
 */
Circle.prototype.isInside = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    return dx * dx + dy * dy < this.radius2;
};

/**
 * check if the position is inside the circle (target region for inside->out mapping circles)
 * @method Circle#isOutside
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if in target region (inside for outsideIn)
 */
Circle.prototype.isOutside = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    return dx * dx + dy * dy > this.radius2;
};

/**
 * make the mapping, return true if mapping occured
 * @method Circle#map
 * @param {object} position - with x and y fields, will be changed
 * @return boolean, true if mapping occured (point was outside target and is inside now)
 */
Circle.prototype.map = function(position) {
    return false;
};

/**
 * make the mapping and draw trajectory, return true if mapping occured
 * @method Circle#drawTrajectory
 * @param {object} position - with x and y fields, will be changed
 * @return boolean, true if mapping occured (point was outside target and is inside now)
 */
Circle.prototype.drawTrajectory = function(position) {
    const startX = position.x;
    const startY = position.y;
    let mapped = this.map(position);
    if (mapped) {
        const context = output.canvasContext;
        output.setLineWidth(map.linewidth);
        context.strokeStyle = this.color;
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(position.x, position.y);
        context.stroke();
    }
    return mapped;
};

// special mappings

/**
 * for a circle that does not map
 * @method Circle#noMap
 * @return boolean, false, because there is no mapping
 */
Circle.prototype.noMap = function() {
    return false;
};

/**
 * for a circle that maps inside out, return true if mapping occured
 * @method Circle#insideOutMap
 * @param {object} position - with x and y fields, will be changed
 * @return boolean, true if mapping occured (point was outside target and is inside now)
 */
Circle.prototype.insideOutMap = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    const dr2 = dx * dx + dy * dy;
    if (dr2 > this.radius2) {
        return false;
    }
    const factor = this.radius2 / (dr2 + epsilon2);
    position.x = this.centerX + factor * dx;
    position.y = this.centerY + factor * dy;
    return true;
};

/**
 * for a circle that maps outside in, return true if mapping occured
 * @method Circle#outsideInMap
 * @param {object} position - with x and y fields, will be changed
 * @return boolean, true if mapping occured (point was outside target and is inside now)
 */
Circle.prototype.outsideInMap = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    const dr2 = dx * dx + dy * dy;
    if (dr2 < this.radius2) {
        return false;
    }
    const factor = this.radius2 / dr2;
    position.x = this.centerX + factor * dx;
    position.y = this.centerY + factor * dy;
    return true;
};

/**
 * invert at the circle, used to get a good image even if all circles are mapping inside->out
 * and for inverted views
 * @method Circle#invert
 * @param {object} position - with x and y fields, will be changed
 */
Circle.prototype.invert = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    const dr2 = dx * dx + dy * dy;
    const factor = this.radius2 / (dr2 + epsilon2);
    position.x = this.centerX + factor * dx;
    position.y = this.centerY + factor * dy;
};

/**
 * complex logarithm at the circle for exponential views
 * backtransformation gives the inverse
 * @method Circle#logarithm
 * @param {object} position - with x and y fields, will be changed
 */
Circle.prototype.logarithm = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    const dr2 = dx * dx + dy * dy + epsilon2;
    position.x = this.center.x + 0.5 * Fast.log(dr2 / this.radius2);
    position.y = this.center.y + Fast.atan2(dy, dx);
};

/**
 * complex exponent at the circle for logarithmic views
 * circle center as origin, radius as scale
 * backtransformation gives the inverse
 * @method Circle#exponential
 * @param {object} position - with x and y fields, will be changed
 */
Circle.prototype.exponential = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    Fast.cosSin(dy, position);
    const r = Fast.exp(dx / this.radius - 1) * this.radius;
    position.x = this.centerX + r * position.x;
    position.y = this.centerY + r * position.y;
};

/**
 * orthographic view of stereographic projection
 * circle center as origin, radius as equator of the prejection sphere
 * projection of the "inside", direct view of the outside
 * @method Circle#orthoStereo
 * @param {object} position - with x, y and valid fields, will be changed
 */
Circle.prototype.orthoStereo = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    const d2 = dx * dx + dy * dy;
    if (d2 < this.radius2) {
        const factor = this.osFactor / (1 + Math.sqrt(1 - d2 * this.osx2r2));
        position.x = this.centerX + factor * dx;
        position.y = this.centerY + factor * dy;
    }
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
        if (!success) {
            alert('Fail: Cannot change position');
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
        const success = this.tryRadius(this.radius * zoomFactor);
        this.updateOSParameters();
        if (!success) {
              alert('Fail: Cannot change radius');
        }
    }
};

/**
 * destroy the circle and all that depends on it
 * remove from circles
 * make that there are no more references to this circle hanging around
 * @method Circle#destroy
 */
Circle.prototype.destroy = function() {
    circles.remove(this);
    while (this.intersections.length > 0) {
        this.intersections[this.intersections.length - 1].destroy();
    }
    this.canChangeController.destroy();
    this.radiusController.destroy();
    this.centerYController.destroy();
    this.centerXController.destroy();
    this.mapTypeController.destroy();
    this.colorController.destroy();
};