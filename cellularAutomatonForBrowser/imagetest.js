/* jshint esversion: 6 */

import {
    output,
    ParamGui,
    BooleanButton
} from "../libgui/modules.js";

import {
    utils,
    colors
} from './modules.js';


// export everything from here, eliminate modules.js
export const main = {};


main.setup = function() {
    // gui and output canvas
    const gui = new ParamGui({
        name: 'colortest',
        closed: false,
        booleanButtonWidth: 40
    });
    main.gui = gui;
    BooleanButton.greenRedBackground();
    // no background color, no transparency
    output.createCanvas(gui, false, false);
    output.saveType.setValue('jpg');
    // square image
    output.setCanvasWidthToHeight();
    // create output.pixels
    output.createPixels();
    output.drawCanvasChanged = draw;
    draw();
};

function draw() {

    utils.setSize(9);
    utils.initialStateSquare([1, 0, 0, 0, 0, 0, 0]);
    utils.initialStateHexagon([3, 1, 2, 3,4,5,6]);
    utils.initialStateHexagon([3, 0,0,0,3,0,0]);
    utils.makeSumHexagon([9, 1, 2, 3, 4, 5, 6]);
    utils.logArray(utils.cells);
    utils.setViewLimits(0, 6);
    utils.copyCellsViewHexagon();
    console.log('==========');
    utils.logArray(utils.cellsView);
    utils.getViewHalf();
    console.log(utils.cellsFull);
    console.log(utils.viewHalf);
    utils.makeView();
    utils.normalizeView();
    utils.logArray(utils.view, 5 + 2 * utils.viewHalf);

    colors.setN(5);

    colors.greys();
utils.nearestImage();

}