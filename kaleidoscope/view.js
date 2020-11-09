/* jshint esversion: 6 */

import {
    guiUtils,
    output,
    BooleanButton,
    map
} from "../libgui/modules.js";

import {
    basic,
    circles
} from './modules.js';

/**
 * choosing a view of the kaleidoscopic image
 * @namespace view
 */
export const view = {};

// circle intersections as centers for inversion
const pos1 = {};
const pos2 = {};
let pos = pos1;

// text of messages
let circlesMessage = 'No circle in use.';
let centerMessage = '';

// beware of hitting the circle center
const epsilon = 0.0001;
const epsilon2 = epsilon * epsilon;

/**
 * make the gui and add some buttons
 * @method view.makeGui
 * @param{Paramgui} parentGui
 * @param{Object} args - optional, modifying the gui (keep it closed)
 */
view.makeGui = function(parentGui, args = {}) {
    view.gui = parentGui.addFolder('view', args, {
        closed: false
    });
    view.visible = true;
    view.type = 'direct';
    view.isActive = false;
    view.map = function(position) {};
    view.selectionButton = view.gui.add({
        type: 'selection',
        params: view,
        property: 'type',
        options: ['direct', 'inversion at intersection', 'inversion at boundary', 'ortho-stereographic', 'ortho-stereo outside'],
        onChange: function() {
            if (view.type === 'direct') {
                view.visibleButton.hide();
                view.useCircleButton.hide();
                view.colorController.hide();
                view.circlesMessage.style.display = 'none';
                view.centerMessage.style.display = 'none';
            } else {
                view.visibleButton.show();
                view.useCircleButton.show();
                view.colorController.show();
                view.circlesMessage.style.display = 'block';
                view.centerMessage.style.display = 'block';
            }
            if (view.type === 'inversion at intersection') {
                view.radiusController.show();
                view.switchCenterButton.show();
            } else {
                view.radiusController.hide();
                view.switchCenterButton.hide();
            }
            if (view.type === 'ortho-stereographic') {
                view.osInterpolationController.show();
            } else {
                view.osInterpolationController.hide();
            }
            basic.drawMapChanged();
        }
    });
    let selectionHelp = 'Choose between different views:<br>';
    selectionHelp += '<strong>direct:</strong> Does not transform the kaleidoscopic image.<br>';
    selectionHelp += '<strong>inversion at intersection:</strong> Inversion at a circle. Its center lies at the intersection of two circles of the kaleidoscope.<br>';
    selectionHelp += '<strong>inversion at boundary:</strong> Inversion at a circle. It is the boundary of a Poincare disc or the equator of a sphere as defined by three circles of the kaleidoscope.<br>';
    selectionHelp += '<strong>ortho-stereographic:</strong> Shows an orthographic view of a sphere that fits into a circle. It is the boundary of a Poincare disc or the equator of a sphere as defined by three circles of the kaleidoscope. The kaleidoscopic image inside the circle is mapped onto the sphere using a stereographic projection. Transforms the Poincare disc model to the Beltrami-Klein model.<br>';
    selectionHelp += '<strong>ortho-stereo outside:</strong> Shows an orthographic view of a sphere that fits into the circle. The kaleidoscopic image outside the circle is mapped onto the sphere using a stereographic projection. The sphere is defined by three circles of the kaleidoscope.';
    view.selectionButton.addHelp(selectionHelp);
    view.circle1 = null;
    view.circle2 = null;
    view.circle3 = null;
    view.useCircleButton = view.gui.add({
        type: 'button',
        buttonText: 'use selected circle',
        onClick: function() {
            const circle = circles.selected;
            if (guiUtils.isObject(circle)) {
                view.deleteCircle(circle);
                view.circle3 = view.circle2;
                view.circle2 = view.circle1;
                view.circle1 = circle;
                view.useCircleButton.setActive(false);
                basic.drawMapChanged();
            }
        }
    });
    view.deleteCircleButton = view.useCircleButton.add({
        type: 'button',
        buttonText: 'remove first circle',
        onClick: function() {
            view.deleteCircle(view.circle1);
        view.useCircleButton.setActive(view.circle1 !== circles.selected);
            basic.drawMapChanged();
        }
    });
    view.useCircleButton.addHelp("Makes that the selected circle is used as reference for the view or that it won't be used.");
    view.useCircleButton.hide();
    view.circlesMessage = view.gui.addParagraph('---');
    view.circlesMessage.style.display = 'none';
    view.radius = 1;
    view.radius2 = view.radius * view.radius; // for documentation
    view.centerX = 0;
    view.centerY = 0;
    view.centerMessage = view.gui.addParagraph('---');
    view.centerMessage.style.display = 'none';
    // for inversion at intersection view we can change the radius
    // only position of center is determined by circles
    view.radiusController = view.gui.add({
        type: 'number',
        params: view,
        property: 'radius',
        onChange: function() {
            console.log('rad chang');
            view.radius2 = view.radius * view.radius;
            basic.drawMapChanged();
        }
    });
    view.radiusController.addHelp('Here you can adjust the radius of the inverting circle.');
    view.radiusController.hide();
    // for inversion there are two centers
    view.switchCenterButton = view.gui.add({
        type: 'button',
        buttonText: 'switch center',
        onClick: function() {
            console.log('switch');
            if (pos === pos1) {
                pos = pos2;
            } else {
                pos = pos1;
            }
            basic.drawMapChanged();
        }
    });
    view.switchCenterButton.hide();

    view.osInterpolation = 1;
    view.osInterpolationController = view.gui.add({
        type: 'number',
        params: view,
        property: 'osInterpolation',
        min: 0,
        max: 1,
        labelText: 'interpolation',
        usePopup: false,
        onChange: function() {
            basic.drawMapChanged();
        }
    });
    view.osInterpolationController.addHelp('Interpolates between direct view and the ortho-stereographic view.');
    view.osInterpolationController.createLongRange();
    view.osInterpolationController.hide();

    BooleanButton.greenRedBackground();
    view.visibleButton = view.gui.add({
        type: 'boolean',
        params: view,
        property: 'visible',
        labelText: 'reference',
        buttonText: ['visible', 'hidden'],
        onChange: function() {
            basic.drawCirclesIntersections();
        }
    });

    view.visibleButton.addHelp('You can hide the circle that defines the view to get a neater image.');
    view.visibleButton.hide();
    view.color = '#4444bb';
    view.colorController = view.gui.add({
        type: 'color',
        params: view,
        property: 'color',
        onChange: function() {
            basic.drawCirclesIntersections();
        },
        onInteraction: function() {
            basic.drawCirclesIntersections();
        }
    });
    view.colorController.addHelp("Choose the color for drawing the circle that defines the view.");
    view.colorController.hide();
};

/**
 * delete a circle and update the three circles as a list
 * do nothing if the circlee is not one of the three circles
 * if a circle is deleted, it will null the second or third one
 * @method view.deleteCircle
 * @param {Circle} circle
 */
view.deleteCircle = function(circle) {
    if (view.circle3 === circle) {
        view.circle3 = null;
    } else if (view.circle2 === circle) {
        view.circle2 = view.circle3;
        view.circle3 = null;
    } else if (view.circle1 === circle) {
        view.circle1 = view.circle2;
        view.circle2 = view.circle3;
        view.circle3 = null;
    }
};

/**
 * make the center message
 * @method view.makeCenterMessage
 * @return String with message
 */
view.makeCenterMessage = function() {
    return 'center x=' + view.centerX.toPrecision(3) + ', y=' + view.centerY.toPrecision(3) + ' and radius=' + view.radius.toPrecision(3);
};

/**
 * determine radius and center of view for three circcles
 * either boundary of Poincare disc or equator of sphere (spherical geometry)
 * euclidean geometry: all circles intersect at center (hyperbolic geometry: max 2 circles pass through center if they have infinite radius)
 * sets view.isActive=false for fail
 * @method view.updateCenterRadius
 */
view.updateCenterRadius = function() {
    if (guiUtils.isObject(view.circle1) && guiUtils.isObject(view.circle2) && guiUtils.isObject(view.circle3)) {
        const center1X = view.circle1.centerX;
        const center1Y = view.circle1.centerY;
        const delta1 = center1X * center1X + center1Y * center1Y - view.circle1.radius2;
        const center2X = view.circle2.centerX;
        const center2Y = view.circle2.centerY;
        const delta2 = center2X * center2X + center2Y * center2Y - view.circle2.radius2;
        const center3X = view.circle3.centerX;
        const center3Y = view.circle3.centerY;
        const delta3 = center3X * center3X + center3Y * center3Y - view.circle3.radius2;
        const center1To2X = center2X - center1X;
        const center1To2Y = center2Y - center1Y;
        const center1To3X = center3X - center1X;
        const center1To3Y = center3Y - center1Y;
        // the system of linear equations for the center of the view circle
        const denom = center1To2X * center1To3Y - center1To3X * center1To2Y;
        if (Math.abs(denom) < 0.001 * (Math.abs(center1To2X * center1To3Y) + Math.abs(center1To3X * center1To2Y))) {
            // nearly colinear, fail
            centerMessage = 'Fail because the circle centers are colinear.';
            view.isActive = false;
        } else {
            view.centerX = 0.5 * ((delta2 - delta1) * center1To3Y - (delta3 - delta1) * center1To2Y) / denom;
            view.centerY = 0.5 * ((delta3 - delta1) * center1To2X - (delta2 - delta1) * center1To3X) / denom;
            // use smallest circle for precision
            let r2 = 0;
            if ((view.circle1 < view.circle2) && (view.circle1 < view.circle3)) {
                r2 = (view.centerX - center1X) * (view.centerX - center1X) + (view.centerY - center1Y) * (view.centerY - center1Y) - view.circle1.radius2;

            } else if ((view.circle2 < view.circle3)) {
                r2 = (view.centerX - center2X) * (view.centerX - center2X) + (view.centerY - center2Y) * (view.centerY - center2Y) - view.circle2.radius2;
            } else {
                r2 = (view.centerX - center3X) * (view.centerX - center3X) + (view.centerY - center3Y) * (view.centerY - center3Y) - view.circle3.radius2;
            }
            r2 = Math.abs(r2); // both signs are possible (elliptic vs. hyperbolic geometry)
            if (r2 > 0.00001) {
                view.radius = Math.sqrt(r2);
                centerMessage = view.makeCenterMessage();
                view.isActive = true;
            } else {
                centerMessage = 'Fail because the circles intersect at a single point (Euclidean geometry).';
                view.isActive = false;
            }
        }
    } else {
        centerMessage = 'This view requires three intersecting circles.';
        view.isActive = false;
    }
};

/**
 * update the view:
 * position of center and radius, message, transform, 
 * always call when map changes
 * @method view.update
 */
view.update = function() {
    switch (view.type) {
        case 'direct':
            view.isActive = false;
            view.map = function(position) {};
            break;
        case 'inversion at intersection':
            if (guiUtils.isObject(view.circle1) && guiUtils.isObject(view.circle2)) {
                if (view.circle1.intersectsCircle(view.circle2)) {
                    view.circle1.determineIntersectionPositions(pos1, pos2, view.circle2);
                    // pos is either pos1 or pos2
                    view.centerX = pos.x;
                    view.centerY = pos.y;
                    view.radius = view.circle1.radius;
                    centerMessage = view.makeCenterMessage();
                    view.isActive = true;
                } else {
                    centerMessage = 'Error: The circles do not intersect!';
                    view.isActive = false;
                }
            } else {
                centerMessage = 'This view requires two intersecting circles.';
                view.isActive = false;
            }
            view.map = view.invert;
            break;
        case 'inversion at boundary':
            view.updateCenterRadius();
            view.map = view.invert;
            break;
        case 'ortho-stereographic':
            view.updateCenterRadius();
            view.map = view.orthoStereo;
            break;
        case 'ortho-stereo outside':
            view.updateCenterRadius();
            view.map = view.orthoStereoOutside;
            break;
    }
    if (!guiUtils.isObject(view.circle1)) {
        circlesMessage = 'No circle in use.';
    } else if (!guiUtils.isObject(view.circle2)) {
        circlesMessage = 'Using circle ' + view.circle1.id + '.';
    } else if (!guiUtils.isObject(view.circle3) || (view.type === 'inversion at intersection')) {
        circlesMessage = 'Using circles ' + view.circle1.id + ' and ' + view.circle2.id + '.';
    } else {
        circlesMessage = 'Using circles ' + view.circle1.id + ', ' + view.circle2.id + ' and ' + view.circle3.id + '.';
    }
    view.circlesMessage.innerText = circlesMessage;
    view.centerMessage.innerText = centerMessage;
    view.radius2 = view.radius * view.radius;
    view.osFactor = 1 + Math.sqrt(Math.max(0, 1 - view.osInterpolation));
    view.osx2r2 = view.osInterpolation / view.radius2;
    view.deleteCircleButton.setActive(guiUtils.isObject(view.circle1));
};

/**
 * invert at the circle
 * @method view.invert
 * @param {object} position - with x and y fields, will be changed
 */
view.invert = function(position) {
    const dx = position.x - view.centerX;
    const dy = position.y - view.centerY;
    const dr2 = dx * dx + dy * dy;
    const factor = view.radius2 / (dr2 + epsilon2);
    position.x = view.centerX + factor * dx;
    position.y = view.centerY + factor * dy;
};

/**
 * orthographic view of stereographic projection
 * circle center as origin, radius as equator of the prejection sphere
 * projection of the "inside", hiding the outside
 * @method view.orthoStereo
 * @param {object} position - with x, y and valid fields, will be changed
 */
view.orthoStereo = function(position) {
    const dx = position.x - view.centerX;
    const dy = position.y - view.centerY;
    const d2 = dx * dx + dy * dy;
    if (d2 < view.radius2) {
        const factor = view.osFactor / (1 + Math.sqrt(1 - d2 * view.osx2r2));
        position.x = view.centerX + factor * dx;
        position.y = view.centerY + factor * dy;
    } else {
        position.valid = -1;
    }
};

/**
 * orthographic view of stereographic projection
 * circle center as origin, radius as equator of the prejection sphere
 * projection of the "outside", hiding the inside
 * @method view.orthoStereo
 * @param {object} position - with x, y and valid fields, will be changed
 */
view.orthoStereoOutside = function(position) {
    const dx = position.x - view.centerX;
    const dy = position.y - view.centerY;
    const d2 = dx * dx + dy * dy;
    if (d2 < view.radius2) {
        const factor = 1 / (1 - Math.sqrt(1 - d2 / view.radius2));
        position.x = view.centerX + factor * dx;
        position.y = view.centerY + factor * dy;
    } else {
        position.valid = -1;
    }
};

/**
 * drawing the circle that defines the view
 * including cross-hair
 * @method view.draw
 */
view.draw = function() {
    if (view.visible && view.isActive) {
        const context = output.canvasContext;
        output.setLineWidth(map.linewidth);
        context.strokeStyle = view.color;
        const d = 2 * map.linewidth * output.coordinateTransform.totalScale;
        const D = 10 * map.linewidth * output.coordinateTransform.totalScale;
        context.beginPath();
        context.moveTo(view.centerX - D, view.centerY);
        context.lineTo(view.centerX - d, view.centerY);
        context.moveTo(view.centerX + D, view.centerY);
        context.lineTo(view.centerX + d, view.centerY);
        context.moveTo(view.centerX, view.centerY - D);
        context.lineTo(view.centerX, view.centerY - d);
        context.moveTo(view.centerX, view.centerY + D);
        context.lineTo(view.centerX, view.centerY + d);
        context.stroke();
        context.beginPath();
        context.arc(view.centerX, view.centerY, view.radius, 0, 2 * Math.PI);
        context.stroke();
    }
};