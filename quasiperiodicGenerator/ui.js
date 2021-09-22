/* jshint esversion: 6 */

import {
    ParamGui
} from "../libgui/modules.js";

import {
    main
} from './modules.js';

export const ui = {};

ui.setup = function() {
    // setting up the canvas and its gui
    const gui = new ParamGui({
        name: 'quasiperiodic tilings + fractals',
        closed: false,
        booleanButtonWidth: 40
    });
    ui.gui = gui;

};