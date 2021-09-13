/* jshint esversion: 6 */

import {
    ParamGui
} from "../libgui/modules.js";


export const ui = {};

ui.setup = function() {
    // setting up the canvas and its gui
    ui.gui = new ParamGui({
        name: 'touching spheres',
        closed: false,
        booleanButtonWidth: 40
    });
};