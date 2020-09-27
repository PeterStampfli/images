/* jshint esversion: 6 */

import {
    map,
    BooleanButton,
    output,
    guiUtils
} from "../libgui/modules.js";

import {
    basic
} from './modules.js';

/**
 * making different view (transformations)
 * @namespace view
 */

export const view = {};

// parameters
view.radius = 1;
view.radius2 = view.radius * view.radius;
view.centerX = 0;
view.centerY = 0;
view.showIndicator = true;
view.indicatorColor = '#000000';
view.mode = 'direct';

// transforms

/**
* transform defining the view
* changes the position coordinates
* sets position.valid=-1 if mapping fails
* @method view.transform
* @param {object} position - with x, y and valid fields
*/
view.transform = function(position){};

/** 
* direct view, makes nothing
* @method view.direct
*/
view.direct = function() {};

// beware of hitting the circle center
const epsilon = 0.0001;
const epsilon2 = epsilon * epsilon;

/**
 * invert at a circle
 * @method view.inversion
 * @param {object} position - with x and y fields, will be changed
 */
view.inversion=function(position){
    const dx = position.x - view.centerX;
    const dy = position.y - view.centerY;
    const dr2 = dx * dx + dy * dy;
    const factor = view.radius2 / (dr2 + epsilon2);
    position.x = view.centerX + factor * dx;
    position.y = view.centerY + factor * dy;
};

/**
 * make the ui for controlling the view
 * @method view.makeGui
 * @param{Paramgui} parentGui
 * @param{Object} args - optional, modifying the gui
 */
view.makeGui = function(parentGui, args = {}) {
    view.gui = parentGui.addFolder('view', args);

    view.modeController = view.gui.add({
        type: 'selection',
        params: view,
        property: 'mode',
        labelText: '',
        options: ['direct', 'inverted'],
        onChange: function() {
            console.log(view.mode);
            if (view.mode === 'direct') {
                view.radiusController.hide();
                view.centerXController.hide();
                view.centerYController.hide();
                view.indicatorColorController.hide();
                view.showIndicatorController.hide();
            } else {
                view.radiusController.show();
                view.centerXController.show();
                view.centerYController.show();
                view.indicatorColorController.show();
                view.showIndicatorController.show();
            }
            switch (view.mode){
            	case 'direct':
            	view.transform=view.direct;
            	break;
            	case 'inverted':
            	view.transform=view.inversion;
            	break;
            }
            basic.drawMapChanged();
        }
    });
    view.radiusController = view.gui.add({
        type: 'number',
        params: view,
        property: 'radius',
        min: 0,
        onChange: function() {
            view.radius2 = view.radius * view.radius;
            basic.drawMapChanged();
            console.log(view.radius);
        }
    });
    view.centerXController = view.gui.add({
        type: 'number',
        params: view,
        property: 'centerX',
        labelText: 'center: x',
        onChange: function() {
            basic.drawMapChanged();

        }
    });
    view.centerYController = view.centerXController.add({
        type: 'number',
        params: view,
        property: 'centerY',
        labelText: 'y',
        onChange: function() {
            basic.drawMapChanged();

        }
    });
    BooleanButton.greenRedBackground();
    view.showIndicatorController = view.gui.add({
        type: 'boolean',
        params: view,
        property: 'showIndicator',
        labelText: 'indicator',
        buttonText: ['visible', 'hidden'],
        onChange: function() {
            basic.drawCirclesIntersections();
        }
    });
    view.indicatorColorController = view.gui.add({
        type: 'color',
        params: view,
        property: 'indicatorColor',
        labelText: '',
        onChange: function() {
            basic.drawCirclesIntersections();
        }
    });

    view.radiusController.hide();
    view.centerXController.hide();
    view.centerYController.hide();
    view.indicatorColorController.hide();
    view.showIndicatorController.hide();
};

/**
 * drawing the view controller (if not direct view and visible)
 * @method view.draw
 */
view.draw = function() {
    if ((view.mode !== 'direct') && view.showIndicator) {

        const context = output.canvasContext;
        context.strokeStyle = view.indicatorColor;
        context.strokeStyle = 'black';
        output.setLineWidth(map.linewidth);

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