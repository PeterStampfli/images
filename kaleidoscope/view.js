/* jshint esversion: 6 */

import {
    guiUtils,
    output,
    BooleanButton,
    map
} from "../libgui/modules.js";

import {
    Intersection,
    circles,
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
                    view.isActive = false;
                    break;
                case 'logarithmic':
                    console.log('logarithmic');
                    view.visibleButton.show();
                    view.useCircleButton.show();
                    view.radiusController.show();
                    view.isActive = true;
                    break;
            }
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
    view.radiusController = view.gui.add({
        type: 'number',
        params: view,
        property: 'radius',
        min: 0,
        onChange: function() {


        },

    });
    view.radiusController.hide();
    view.color = '#000000';
    view.colorController = view.gui.add({
        type: 'color',
        params: view,
        property: 'color',
        onChange: function() {

        },

    });
    view.colorController.addHelp('what');
    view.colorController.hide();

};