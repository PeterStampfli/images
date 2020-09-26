/* jshint esversion: 6 */

import {
    map,
    BooleanButton,
    output,
    guiUtils
} from "../libgui/modules.js";

import {
    Circle,
    intersections,
    basic,
    regions
} from './modules.js';

/**
 * making different view (transformations)
 * @namespace view
 */

export const view = {};

/**
 * make the ui for controlling the view
 * @method view.makeGui
 * @param{Paramgui} parentGui
 * @param{Object} args - optional, modifying the gui
 */
view.makeGui = function(parentGui, args = {}) {
    view.gui = parentGui.addFolder('view', args);
};