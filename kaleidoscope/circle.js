/* jshint esversion: 6 */

import {
    guiUtils,
    output
}
from "../libgui/modules.js";

import {
    mirrors
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
        this.id = mirrors.getId();
    }
    if (!guiUtils.isString(this.id)) {
        this.color = mirrors.getColor();
    }
    const circle = this;
    // controllers: do not do things with them from the outside
    this.gui = parentGui.addFolder('Circle ' + this.id);

    this.radiusController = this.gui.add({
        type: 'number',
        params: this,
        property: 'radius',
        min: 0,
        onChange: function() {
            mirrors.setSelected(circle);
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
            mirrors.setSelected(circle);
            if (circle.intersections.length === 1) {
                // only one intersection: adjust y-coordinate to get a rotation of center
                // x- coordinate restricted to range of d around center of other circcle
                const intersection = circle.intersections[0];
                const d = intersection.distanceBetweenCenters();
                const otherMirror = intersection.getOtherMirror(circle);
                const otherCenterX = otherMirror.centerX;
                const otherCenterY = otherMirror.centerY;
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
            mirrors.setSelected(circle);
            if (circle.intersections.length === 1) {
                // only one intersection: adjust x-coordinate to get a rotation of center
                // y- coordinate restricted to range of d around center of other circcle
                const intersection = circle.intersections[0];
                const d = intersection.distanceBetweenCenters();
                const otherMirror = intersection.getOtherMirror(circle);
                const otherCenterX = otherMirror.centerX;
                const otherCenterY = otherMirror.centerY;
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
            mirrors.setSelected(circle);
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
    this.setRadius(this.radius);
    this.setIsOutsideInMap(this.isOutsideInMap);
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
            if (this === this.intersections[i].getOtherMirror(this)) {
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
    const otherMirror = this.intersections[0].getOtherMirror(this);
    const dx = this.centerX - otherMirror.centerX;
    const dy = this.centerY - otherMirror.centerY;
    const d = Math.hypot(dx, dy);
    const factor = distance / d;
    this.centerX = otherMirror.centerX + factor * dx;
    this.centerY = otherMirror.centerY + factor * dy;
};

/**
 * for two intersections, calculate the two center positions
 * @method Circle#centerPositionsTwoIntersections
 * @param {object} pos1 - with x- and y fields
 * @param {object} pos2 - with x- and y fields
 */
Circle.prototype.centerPositionsTwoIntersections = function(pos1,pos2) {
    const intersection1 = this.intersections[0];
    const intersection2 = this.intersections[1];
    const otherMirror1 = intersection1.getOtherMirror(this);
    const otherMirror2 = intersection2.getOtherMirror(this);
    const center1X = otherMirror1.centerX;
    const center1Y = otherMirror1.centerY;
    const center2X = otherMirror2.centerX;
    const center2Y = otherMirror2.centerY;
    let center1To2X = center2X - center1X;
    let center1To2Y = center2Y - center1Y;
    // the actual distances between centers
    const distanceCenter1To2 = Math.hypot(center1To2X, center1To2Y);
    // the required distances from center of this circle
    let distanceToCenter1 = intersection1.distanceBetweenCenters();
    let distanceToCenter2 = intersection2.distanceBetweenCenters();
    console.log(distanceCenter1To2, distanceToCenter1, distanceToCenter2);
    // determine minimum radius
    if (distanceCenter1To2 > distanceToCenter1 + distanceToCenter2) {
        console.log('radius too small');
        // solve the system of two quadratic equations: 
        // do the resulting linear equation part
        const coeff1 = 2 * otherMirror1.radius * intersection1.signCosAngle();
        const coeff2 = 2 * otherMirror2.radius * intersection2.signCosAngle();
        const radius1Square = otherMirror1.radius2;
        const radius2Square = otherMirror2.radius2;
        // coefficients for the linear equation for this.radius
        const a0 = 0.5 * (distanceCenter1To2 + (radius1Square - radius2Square) / distanceCenter1To2);
        const a1 = 0.5 * (coeff1 - coeff2) / distanceCenter1To2;
        // setup the quadratic equation
        const a = 1 - a1 * a1;
        const b = coeff1 - 2 * a0 * a1;
        const c = radius1Square - a0 * a0;
        const data = {};
        guiUtils.quadraticEquation(a, b, c, data);
        console.log(data);
        // the smaller solution is negative, take the larger positive one
        console.log('new radius');
        this.radius = data.y;
        this.radius2 = data.y * data.y;
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
    const perpendicularPosition = Math.sqrt(distanceToCenter1 * distanceToCenter1 - parallelPosition * parallelPosition);
    xi = perpendicularPosition / distanceCenter1To2;
    pos1.x = px + center1To2Y * xi;
    pos1.y = py - center1To2X * xi;
    pos2.x = px - center1To2Y * xi;
    pos2.y = py + center1To2X * xi;
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
            this.centerPositionsTwoIntersections(pos1, pos2);
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
    this.setCenter(this.centerX + event.dx, this.centerY + event.dy);
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
    mirrors.remove(this);
    this.intersections.forEach(intersection => intersection.destroy());
};