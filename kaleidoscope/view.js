/* jshint esversion: 6 */

import {
    output,
    BooleanButton,
    map
} from "../libgui/modules.js";

import {
    basic
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
            switch (view.type) {
                case 'direct':
                    console.log('direcct');
                    view.visibleButton.hide();
                    view.useCircleButton.hide();
                    view.centerXController.hide();
                    view.colorController.hide();
                    view.isActive = false;
                    break;
                case 'logarithmic':
                    console.log('logarithmic');
                    view.enable();
                    break;
            }
            basic.drawMapChanged();
        }
    });
    view.selectionButton.addHelp('whatever');
    BooleanButton.greenRedBackground();
    view.visibleButton = view.gui.add({
        type: 'boolean',
        params: view,
        property: 'visible',
        labelText: '',
        buttonText: ['visible', 'hidden'],
        onChange: function() {

        }
    });
    view.visibleButton.addHelp('You can hide the circle that determines the view to get a neater image.');
    view.visibleButton.hide();
    view.circle1 = null;
    view.circle2 = null;
    view.circle3 = null;
    view.useCircleButton = view.gui.add({
        type: 'button',
        buttonText: 'use selected circle',
        onClick: function() {
            console.log('use');
        }
    });
    view.useCircleButton.addHelp('whatever');
    view.useCircleButton.hide();
    view.radius = 1;
    view.centerX = 0;
    view.centerY = 0;
    // for some views we can change the radius, position of center is determined by circles

    view.centerXController = view.gui.add({
        type: 'number',
        labelText: 'center: x',
        initialValue: view.centerX
    });
    view.centerXController.setActive(false);
    view.centerYController = view.centerXController.add({
        type: 'number',
        labelText: ' y',
        initialValue: view.centerY
    });
    view.centerYController.setActive(false);
    view.radiusController = view.centerYController.add({
        type: 'number',
        params: view,
        property: 'radius',
        min: 0,
        onChange: function() {
            basic.drawMapChanged();
        },
    });
    view.centerXController.hide();
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
 * show buttons and enable things for real views
 * @method view.enable
 */
view.enable = function() {
    view.visibleButton.show();
    view.useCircleButton.show();
    view.centerXController.show();
    view.colorController.show();
    view.isActive = true;
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