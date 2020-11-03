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
        options: ['direct', 'logarithmic'],
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
            basic.drawMapChanged();
        }
    });
    view.selectionButton.addHelp('whatever');
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
    view.useCircleButton.addHelp('whatever');
    view.useCircleButton.hide();
    view.circlesMessage = view.gui.addParagraph('---');
    view.circlesMessage.style.display = 'none';
    view.radius = 1;
    view.centerX = 0;
    view.centerY = 0;
    view.centerMessage = view.gui.addParagraph('---');
    view.centerMessage.style.display = 'none';
    // for some views we can change the radius, position of center is determined by circles
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
    view.visibleButton.addHelp('You can hide the circle that determines the view to get a neater image.');
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
    view.colorController.addHelp('what');
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
 * update the view:
 * position of center and radius, message, transform, call when map changes
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
        case 'logarithmic':
            if (guiUtils.isObject(view.circle1)) {
                circlesMessage = 'Using circle ' + view.circle1.id + '.';
                view.centerX = view.circle1.centerX;
                view.centerY = view.circle1.centerY;
                view.radius = view.circle1.radius;
                centerMessage = view.makeCenterMessage();
                view.isActive = true;
            } else {
                centerMessage = 'This view needs a reference circle.';
                view.isActive = false;

            }
            break;
    }
    if (!guiUtils.isObject(view.circle1)) {
        circlesMessage = 'No circle in use.';
    } else if (!guiUtils.isObject(view.circle2)) {
        circlesMessage = 'Using circle ' + view.circle1.id + '.';
    } else if (!guiUtils.isObject(view.circle3)) {
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