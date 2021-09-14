/* jshint esversion: 6 */

import {
    ParamGui
} from "../libgui/modules.js";

import {
    view,
    main
} from './modules.js';

export const ui = {};

ui.setup = function() {
    // setting up the canvas and its gui
    const gui = new ParamGui({
        name: 'touching spheres',
        closed: false,
        booleanButtonWidth: 40
    });
    ui.gui = gui;

    // view transforms

    const controllerAlpha = gui.add({
        type: 'number',
        params: view,
        property: 'alpha',
        labelText: 'Euler: alpha',
        min: -180,
        max: 180,
        onChange: function() {
            main.transformSort();
            main.draw();
        }
    });
    controllerAlpha.cyclic();

    const controllerBeta = controllerAlpha.add({
        type: 'number',
        params: view,
        property: 'beta',
        min: -180,
        max: 180,
        onChange: function() {
            main.transformSort();
            main.draw();
        }
    });
    controllerBeta.cyclic();

    const controllerGamma = controllerBeta.add({
        type: 'number',
        params: view,
        property: 'gamma',
        min: -180,
        max: 180,
        onChange: function() {
            main.transformSort();
            main.draw();
        }
    });
    controllerGamma.cyclic();


ui.viewInterpolationController = gui.add({
    type: 'number',
    params: view,
    property: 'interpolation',
    min: 0,
    max: 1,
    labelText: 'st.project',
    onChange: function() {
            main.transformSort();
            main.draw();
    }
});

ui.rotationController = gui.add({
    type: 'number',
    params: view,
    property: 'rotationAngle',
    labelText: 'rotation',
    min: -180,
    max: 180,
    onChange: function() {
            main.transformSort();
            main.draw();
    }
}).cyclic();

ui.tiltController = gui.add({
    type: 'number',
    params: view,
    property: 'tiltAngle',
    labelText: 'tilt',
    min: -180,
    max: 180,
    onChange: function() {
main.transformSort();
            main.draw();
    }
}).cyclic();

};