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
        options: ['direct', 'inversion at intersection', 'inversion at boundary'],
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
            basic.drawMapChanged();
        }
    });
    let selectionHelp = 'Choose between different views:<br>';
    selectionHelp += '<strong>direct:</strong> Does not transform the kaleiddoscopic image.<br>';
    selectionHelp += '<strong>inversion at intersection:</strong> Inversion at a circle. Its center lies at the intersection of two circles.<br>';
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
            }
            console.log(view.circle1, view.circle2, view.circle3);
            basic.drawMapChanged();
        }
    });
    view.deleteCircleButton = view.useCircleButton.add({
        type: 'button',
        buttonText: 'remove first circle',
        onClick: function() {
            view.deleteCircle(view.circle1);
            basic.drawMapChanged();
        }
    });
    view.useCircleButton.addHelp("Makes that the selected circle is used as reference for the view or that it won't be used.");
    view.useCircleButton.hide();
    view.circlesMessage = view.gui.addParagraph('---');
    view.circlesMessage.style.display = 'none';
    view.radius = 1;
    view.centerX = 0;
    view.centerY = 0;
    view.centerMessage = view.gui.addParagraph('---');
    view.centerMessage.style.display = 'none';
    // for some views we can change the radius, position of center is determined by circles
    view.radiusController = view.gui.add({
        type: 'number',
        params: view,
        property: 'radius',
        onChange: function() {
            console.log('rad chang');
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
    if (this.circle3 === circle) {
        this.circle3 = null;
    } else if (this.circle2 === circle) {
        this.circle2 = this.circle3;
        this.circle3 = null;
    } else if (this.circle1 === circle) {
        this.circle1 = this.circle2;
        this.circle2 = this.circle3;
        this.circle3 = null;
    }
    console.log(view.circle1, view.circle2, view.circle3);
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
        // the system of linear equations for the center of this circle
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
            if (r2 > 0.00001) {
                view.radius = Math.sqrt(r2);
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
    console.log('update', view.type);
    let circlesMessage = 'No circle in use.';
    let centerMessage = '';
    switch (view.type) {
        case 'direct':
            view.isActive = false;
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
            break;
    }
    if (!guiUtils.isObject(view.circle1)) {
        circlesMessage = 'No circle in use.';
    } else if (!guiUtils.isObject(view.circle2)) {
        circlesMessage = 'Using circle ' + view.circle1.id + '.';
    } else if (!guiUtils.isObject(view.circle3) || (view.type === 'inversion')) {
        circlesMessage = 'Using circles ' + view.circle1.id + ' and ' + view.circle2.id + '.';
    } else {
        circlesMessage = 'Using circles ' + view.circle1.id + ', ' + view.circle2.id + ' and ' + view.circle3.id + '.';
    }
    view.circlesMessage.innerText = circlesMessage;
    view.centerMessage.innerText = centerMessage;
};

/**
 * drawing a circle that defines the view
 * with cross mark at center
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