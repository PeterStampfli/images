/* jshint esversion: 6 */

import {
    guiUtils,
    output
}
from "../libgui/modules.js";

import {
    circles
} from './modules.js';

// directions
const insideOut = 'inside-out';
const outsideIn = 'outside-in';

// beware of hitting the circle center
const epsilon = 0.0001;
const epsilon2 = epsilon * epsilon;

// for mouse wheel action
Circle.zoomFactor = 1.04;

// parameters for drawing, change if you do not like it 
Circle.lineWidth = 2;
Circle.highlightLineWidth = 6;
Circle.highlightColor = 'yellow';

// selection, regionwidth in px
Circle.selectWidth = Circle.highlightLineWidth;

/**
 * a circle as a building block for kaleidoscopes
 * gets its own gui
 * @constructor Circle
 * @param{ParamGui} parentGui 
 * @param{object} properties - optional, radius, centerX, centerY, isOutsideInMap, color (all optional),id
 */
export function Circle(parentGui, properties) {
    this.radius = 1;
    this.centerX = 0;
    this.centerY = 0;
    this.isOutsideInMap = true;
    this.mapDirection = outsideIn;
    this.intersections = [];
    if (guiUtils.isObject(properties)) {
        Object.assign(this, properties);
    }
    if (!guiUtils.isNumber(this.id)) {
        this.id = circles.getId();
    }
    if (!guiUtils.isString(this.color)) {
        this.color = circles.getColor();
    }
    this.radius2 = this.radius * this.radius;
    const direction = (this.isOutsideInMap) ? outsideIn : insideOut;
    this.mapDirection = direction;

    const circle = this;
    // controllers: do not do things with them from the outside
    this.gui = parentGui.addFolder('Circle ' + this.id);

    this.radiusController = this.gui.add({
        type: 'number',
        params: this,
        property: 'radius',
        min: 0,
        onChange: function() {
            circles.setSelected(circle);
            circle.setRadius(circle.radius);
            console.log('radius changed');
            Circle.draw();
        }
    });
    this.centerXController = this.gui.add({
        type: 'number',
        params: this,
        property: 'centerX',
        labelText: 'center: x',
        onChange: function(x) {
            circles.setSelected(circle);
            if (circle.intersections.length === 1) {
                // only one intersection: adjust y-coordinate to get a rotation of center
                // x- coordinate restricted to range of d around center of other circcle
                const intersection = circle.intersections[0];
                const d = intersection.distanceBetweenCenters();
                const otherCircle = intersection.getOtherCircle(circle);
                const otherCenterX = otherCircle.centerX;
                const otherCenterY = otherCircle.centerY;
                const dx = Math.min(d, Math.max(-d, x - otherCenterX));
                if (circle.centerY < otherCenterY) {
                    circle.setCenter(otherCenterX + dx, otherCenterY - Math.sqrt(d * d - dx * dx));
                } else {
                    circle.setCenter(otherCenterX + dx, otherCenterY + Math.sqrt(d * d - dx * dx));
                }
            }
            Circle.draw();
        }
    });
    this.centerYController = this.centerXController.add({
        type: 'number',
        params: this,
        property: 'centerY',
        labelText: ' y',
        onChange: function(y) {
            circles.setSelected(circle);
            if (circle.intersections.length === 1) {
                // only one intersection: adjust x-coordinate to get a rotation of center
                // y- coordinate restricted to range of d around center of other circcle
                const intersection = circle.intersections[0];
                const d = intersection.distanceBetweenCenters();
                const otherCircle = intersection.getOtherCircle(circle);
                const otherCenterX = otherCircle.centerX;
                const otherCenterY = otherCircle.centerY;
                const dy = Math.min(d, Math.max(-d, y - otherCenterY));
                if (circle.centerX < otherCenterX) {
                    circle.setCenter(otherCenterX - Math.sqrt(d * d - dy * dy), otherCenterY + dy);
                } else {
                    circle.setCenter(otherCenterX + Math.sqrt(d * d - dy * dy), otherCenterY + dy);
                }
            }
            Circle.draw();
        }
    });
    this.mapDirectionController = this.gui.add({
        type: 'selection',
        params: this,
        property: 'mapDirection',
        options: [outsideIn, insideOut],
        onChange: function() {
            circles.setSelected(circle);
            circle.setIsOutsideInMap(circle.mapDirection === outsideIn);
            console.log('mapDirection changed', circle.isOutsideInMap);
            Circle.draw();
        }
    });
    this.colorController = this.gui.add({
        type: 'color',
        params: this,
        property: 'color',
        onChange: function() {
            console.log('color changed');
            Circle.draw();
        }
    });
}

/**
 * update the ui values
 * @method Circle#updateUI
 */
Circle.prototype.updateUI = function() {
    this.centerXController.updateDisplay();
    this.centerYController.updateDisplay();
    this.radiusController.updateDisplay();
    this.mapDirectionController.updateDisplay();
};

/**
 * set the radius of the circle
 * NOTE: use this and do not set value of the controller directly
 * may need to update the image
 * @method Circle#setRadius
 * @param {float} radius
 * @return this circle, for chaining
 */
Circle.prototype.setRadius = function(radius) {
    this.radius2 = radius * radius;
    this.radius = radius;
    this.adjustToIntersections();
    this.updateUI();
    return this;
};

/**
 * set the center of the circle
 * @method Circle#setCenter
 * @param{float} x
 * @param{float} y
 * @return this circle, for chaining
 */
Circle.prototype.setCenter = function(x, y) {
    this.centerX = x;
    this.centerY = y;
    this.adjustToIntersections();
    this.updateUI();
    return this;
};

/**
 * set if map is outsideIn (true) or insideOut (false)
 * @method Circle#setIsOutsideInMap
 * @param{boolean} isOutsideIn - 'inside-out' (insideOut) or 'outside-in' (outsideIn)
 */
Circle.prototype.setIsOutsideInMap = function(isOutsideIn) {
    this.isOutsideInMap = isOutsideIn;
    const direction = (isOutsideIn) ? outsideIn : insideOut;
    this.mapDirection = direction;
    this.adjustToIntersections();
    this.updateUI();
};

/**
 * get a parameter object that defines the circle
 * with additional field type: 'circle'
 * @method Circle#getProperties
 * @return object with the properties
 */
Circle.prototype.getProperties = function() {
    const properties = {
        type: 'circle',
        radius: this.radius,
        centerX: this.centerX,
        centerY: this.centerY,
        isOutsideInMap: this.isOutsideInMap
    };
    return properties;
};

/**
 * activate ui depending on number of intersections
 * call when number of intersections changes
 * @method Circle.activateUI
 */
Circle.prototype.activateUI = function() {
    switch (this.intersections.length) {
        case 0:
            this.radiusController.setActive(true);
            this.centerXController.setActive(true);
            this.centerYController.setActive(true);
            break;
        case 1:
            this.radiusController.setActive(true);
            this.centerXController.setActive(true);
            this.centerYController.setActive(true);
            break;
        case 2:
            this.radiusController.setActive(true);
            this.centerXController.setActive(false);
            this.centerYController.setActive(false);
            break;
        case 3:
            this.radiusController.setActive(false);
            this.centerXController.setActive(false);
            this.centerYController.setActive(false);
            break;
    }
};

/**
 * add an intersection
 * @method Circle#addIntersection
 * @param {Intersection} intersection
 */
Circle.prototype.addIntersection = function(intersection) {
    if (this.intersections.length > 2) {
        console.error('Circle.addIntersection: Circle has more than 2 intersections, cannot add more. Intersection:');
        console.log(intersection);
        console.log(this.intersections);
    } else {
        for (var i = 0; i < this.intersections.length; i++) {
            if (this === this.intersections[i].getOtherCircle(this)) {
                console.error('Circle#addIntersection: This intersection is already there:');
                console.log(intersection);
                console.log(this.intersections);
            }
        }
        this.intersections.push(intersection);
        this.activateUI();
    }
};

/**
 * remove an intersection
 * @method Circle#removeIntersection
 * @param {Intersection} intersection
 */
Circle.prototype.removeIntersection = function(intersection) {
    const index = this.intersections.indexOf(intersection);
    if (index >= 0) {
        this.intersections.splice(index, 1);
    } else {
        console.error('Circle.removeIntersection: intersection not found. It is:');
        console.log(intersection);
        console.log(this.intersections);
    }
};

/**
 * adjust the distance to another circle for a single intersection
 * moves center of this circle to or away from center of other circle
 * @method Circle#adjustOneIntersection
 */
Circle.prototype.adjustOneIntersection = function() {
    const distance = this.intersections[0].distanceBetweenCenters();
    const otherCircle = this.intersections[0].getOtherCircle(this);
    const dx = this.centerX - otherCircle.centerX;
    const dy = this.centerY - otherCircle.centerY;
    const d = Math.hypot(dx, dy);
    const factor = distance / d;
    this.centerX = otherCircle.centerX + factor * dx;
    this.centerY = otherCircle.centerY + factor * dy;
};

/**
 * for two intersections, calculate the two center positions
 * @method Circle#centerPositionsTwoIntersections
 * @param {object} pos1 - with x- and y fields
 * @param {object} pos2 - with x- and y fields
 */
Circle.prototype.centerPositionsTwoIntersections = function(pos1, pos2) {
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
    let distanceToCenter1 = intersection1.distanceBetweenCenters();
    let distanceToCenter2 = intersection2.distanceBetweenCenters();
    // check if we can form a triangle
    if (distanceCenter1To2 > distanceToCenter1 + distanceToCenter2) {
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
            // the smaller solution is negative, take the larger positive one
            this.radius = data.y;
            this.radius2 = data.y * data.y;
        } else {
            console.error('Circle#centerPositionsTwoIntersections: Quadratic equation for minimum radius has no real solution! Intersection:');
            console.log(this);
            this.radius = 1;
            this.radius2 = 1;
        }
        // recalculate distances to the other centers
        distanceToCenter1 = intersection1.distanceBetweenCenters();
        distanceToCenter2 = intersection2.distanceBetweenCenters();
    }
    // midpoint of the two solutions on the line between the two other centers
    const parallelPosition = 0.5 * (distanceCenter1To2 + (distanceToCenter1 * distanceToCenter1 - distanceToCenter2 * distanceToCenter2) / distanceCenter1To2);
    let xi = parallelPosition / distanceCenter1To2;
    const px = center1X + center1To2X * xi;
    const py = center1Y + center1To2Y * xi;
    // get the two solutions from the displacement perpendicular
    // danger: root of negative number
    const perpSquare = distanceToCenter1 * distanceToCenter1 - parallelPosition * parallelPosition;
    const perpendicularPosition = Math.sqrt(Math.max(0, perpSquare));
    xi = perpendicularPosition / distanceCenter1To2;
    pos1.x = px + center1To2Y * xi;
    pos1.y = py - center1To2X * xi;
    pos2.x = px - center1To2Y * xi;
    pos2.y = py + center1To2X * xi;
};

/**
 * solution for three intersections
 * there are two possible solutions for the radius
 * the resulting centers may be close to each other
 * take the radius that is closer to the current radius
 * @method Circle#solveThreeIntersections
 * @param {object} pos1 - with x- and y fields
 * @param {object} pos2 - with x- and y fields
 */
Circle.prototype.solveThreeIntersections = function(pos1, pos2) {
    const intersection1 = this.intersections[0];
    const intersection2 = this.intersections[1];
    const intersection3 = this.intersections[2];
    const otherCircle1 = intersection1.getOtherCircle(this);
    const otherCircle2 = intersection2.getOtherCircle(this);
    const otherCircle3 = intersection3.getOtherCircle(this);
    const center1X = otherCircle1.centerX;
    const center1Y = otherCircle1.centerY;
    const center1Square = center1X * center1X + center1Y * center1Y;
    console.log('center1', center1X, center1Y, center1Square);
    const center2X = otherCircle2.centerX;
    const center2Y = otherCircle2.centerY;
    const center2Square = center2X * center2X + center2Y * center2Y;
    console.log('center2', center2X, center2Y, center2Square);
    const center3X = otherCircle3.centerX;
    const center3Y = otherCircle3.centerY;
    const center3Square = center3X * center3X + center3Y * center3Y;
    console.log('center3', center3X, center3Y, center3Square);
    const center1To2X = center2X - center1X;
    const center1To2Y = center2Y - center1Y;
    const center1To3X = center3X - center1X;
    const center1To3Y = center3Y - center1Y;
    const coeff1 = 2 * otherCircle1.radius * intersection1.signCosAngle();
    const coeff2 = 2 * otherCircle2.radius * intersection2.signCosAngle();
    const coeff3 = 2 * otherCircle3.radius * intersection3.signCosAngle();
    console.log('coeffs', coeff1, coeff2, coeff3);
    const radius1Square = otherCircle1.radius2;
    const radius2Square = otherCircle2.radius2;
    const radius3Square = otherCircle3.radius2;
    // the system of linear equations for the center of this circle
    const denom = center1To2X * center1To3Y - center1To3X * center1To2Y;
    console.log(center1To2X, center1To3Y, center1To3X, center1To2Y);
    console.log('denom', denom);
    const g13 = 0.5 * (coeff3 - coeff1);
    const g21 = 0.5 * (coeff1 - coeff2);
    const g32 = 0.5 * (coeff2 - coeff3);
    console.log('gij', g13, g21, g32);
    // fij=0.5*(p_i^2-r_i^2-p_j^2+r_j^2)
    const f13 = 0.5 * (center1Square - otherCircle1.radius2 - center3Square + otherCircle3.radius2);
    const f21 = 0.5 * (center2Square - otherCircle2.radius2 - center1Square + otherCircle1.radius2);
    const f32 = 0.5 * (center3Square - otherCircle3.radius2 - center2Square + otherCircle2.radius2);
    console.log('fij', f13, f21, f32);
    // coefficients of the linear equation for this circle center as a function of r
    const a0 = (f32 * center1Y + f21 * center3Y + f13 * center2Y) / denom;
    const a1 = (g32 * center1Y + g21 * center3Y + g13 * center2Y) / denom;
    const b0 = -(f32 * center1X + f21 * center3X + f13 * center2X) / denom;
    const b1 = -(g32 * center1X + g21 * center3X + g13 * center2X) / denom;
    console.log('a0,a1', a0, a1);
    console.log('b0,b1', b0, b1);
    // checking the linear equation
    console.log('lineq for x', this.centerX, this.radius * a1 + a0);
    console.log('lineq for y', this.centerY, this.radius * b1 + b0);
    // setting up the quadratic equation for r
    const a = 1 - a1 * a1 - b1 * b1;
    const b = coeff1 - 2 * a1 * (a0 - center1X) - 2 * b1 * (b0 - center1Y);
    const c = otherCircle1.radius2 - (a0 - center1X) * (a0 - center1X) - (b0 - center1Y) * (b0 - center1Y);
    const data = {};
    console.log(a, b, c);
    if (!guiUtils.quadraticEquation(a, b, c, data)) {
        console.error('Circle#centerPositionsThreeIntersections: Quadratic equation for radius has no real solution! Intersection:');
        console.log(this);
        // some surrogate radius
        //    this.radius = 1;
    } else if (data.y < 0) {
        console.error('Circle#centerPositionsThreeIntersections: Quadratic equation for radius has only negative solutions! Intersection:');
        console.log(this);
        // some surrogate radius
        this.radius = 1;
    } else if (data.x < 0) {
        // only one positive solution
        this.radius = data.y;
    } else {
        // choose solution closer to this.radius
        if (Math.abs(data.x - this.radius) < Math.abs(data.y - this.radius)) {
            this.radius = data.x;
        } else {
            this.radius = data.y;
        }
    }
    console.log('solution for r', data);
    console.log(this);
    this.radius2 = this.radius * this.radius;
    // now determine the position of the center from the linear equation
    this.centerX = a1 * this.radius + a0;
    this.centerY = b1 * this.radius + b0;
};

/**
 * adjust circle to intersections when some parameters change
 * nothing to do if there is no intersection
 * update the UI after calling this!!
 * adjust distance to other circle if there is only one interssection
 * adjust podition of circle if there are two intersections
 * @method Circle#adjustToIntersections
 */
Circle.prototype.adjustToIntersections = function() {
    switch (this.intersections.length) {
        case 0:
            return;
        case 1:
            this.adjustOneIntersection();
            return;
        case 2:
            console.log('2 intersections');
            const pos1 = {};
            const pos2 = {};
            // determine the two possible positions
            this.centerPositionsTwoIntersections(pos1, pos2);
            const dis1 = (this.centerX - pos1.x) * (this.centerX - pos1.x) + (this.centerY - pos1.y) * (this.centerY - pos1.y);
            const dis2 = (this.centerX - pos2.x) * (this.centerX - pos2.x) + (this.centerY - pos2.y) * (this.centerY - pos2.y);
            console.log(dis1, dis2);
            if (dis1 < dis2) {
                this.centerY = pos1.y;
                this.centerX = pos1.x;
            } else {
                this.centerY = pos2.y;
                this.centerX = pos2.x;
            }
            return;
        case 3:
            console.log('3 intersections');

            this.solveThreeIntersections();
            return;
    }
};

/**
 * the (re)drawing routine for anything, called after some circle changes
 * to be defined, depending on what to draw
 * typically calls map.draw
 * @method Circle.draw
 */
Circle.draw = function() {
    console.log('Circle.draw');
};

/**
 * drawing a circle
 * as a braod circle in highlight color or narrow in its own color
 * (is the naming too confusing?)
 * @method Circle#draw
 * @param {boolean} highlight - optional, default is false
 */
Circle.prototype.draw = function(highlight = false) {
    const context = output.canvasContext;
    if (highlight) {
        output.setLineWidth(Circle.highlightLineWidth);
        context.strokeStyle = Circle.highlightColor;
    } else {
        output.setLineWidth(Circle.lineWidth);
        context.strokeStyle = this.color;
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
 * check if the position is inside the target region of thhe circle map (inside or outside the circle)
 * NOTE: Avoid double negations, use positive form of function
 * @method Circle#isInTarget
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if in target region (inside for outsideIn)
 */
Circle.prototype.isInTarget = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    if (this.isOutsideInMap) {
        return dx * dx + dy * dy < this.radius2;
    } else {
        return dx * dx + dy * dy > this.radius2;
    }
};

/**
 * make the mapping, return true if mapping occured
 * @method Circle.map
 * @param {object} position - with x and y fields, will be changed
 * @return boolean, true if mapping occured (point was outside target and is inside now)
 */
Circle.prototype.map = function(position) {
    const dx = position.x - this.centerX;
    const dy = position.y - this.centerY;
    const dr2 = dx * dx + dy * dy;
    if (this.isOutsideInMap) {
        if (dr2 < this.radius2) {
            return false;
        } else {
            const factor = this.radius2 / dr2;
            position.x = this.centerX + factor * dx;
            position.y = this.centerY + factor * dy;
            return true;
        }
    } else {
        if (dr2 > this.radius2) {
            return false;
        } else {
            const factor = this.radius2 / Math.max(dr2, epsilon2);
            position.x = this.centerX + factor * dx;
            position.y = this.centerY + factor * dy;
            return true;
        }
    }
};

/**
 * dragging the circle
 * action depends on intersections
 * @method Circle#dragAction
 * @param{object} event
 */
Circle.prototype.dragAction = function(event) {
    switch (this.intersections.length) {
        case 0:
            this.setCenter(this.centerX + event.dx, this.centerY + event.dy);
            return;
        case 1:
            this.setCenter(this.centerX + event.dx, this.centerY + event.dy); // adjusts radius
            return;
        case 2:
            // flip to the nearer position without changing radius
            const pos1 = {};
            const pos2 = {};
            // determine the two possible positions
            this.centerPositionsTwoIntersections(pos1, pos2);
            const dis1 = (event.x - pos1.x) * (event.x - pos1.x) + (event.y - pos1.y) * (event.y - pos1.y);
            const dis2 = (event.x - pos2.x) * (event.x - pos2.x) + (event.y - pos2.y) * (event.y - pos2.y);
            console.log(dis1, dis2);
            if (dis1 < dis2) {
                this.centerY = pos1.y;
                this.centerX = pos1.x;
            } else {
                this.centerY = pos2.y;
                this.centerX = pos2.x;
            }
            return;
        case 3:
            return; // fixed position, no drag
    }
};

/**
 * mouse wheel on the circle
 * action depends on intersections
 * @method Circle#wheelAction
 * @param{object} event
 */
Circle.prototype.wheelAction = function(event) {
    const zoomFactor = (event.wheelDelta > 0) ? Circle.zoomFactor : 1 / Circle.zoomFactor;
    this.setRadius(this.radius * zoomFactor);
};

/**
 * destroy the circle and all that depends on it
 * make that there are no more references to this circle hanging around
 * @method Circle#destroy
 */
Circle.prototype.destroy = function() {
    this.gui.destroy();
    circles.remove(this);
    this.intersections.forEach(intersection => intersection.destroy());
};