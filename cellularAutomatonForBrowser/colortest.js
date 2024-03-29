/* jshint esversion: 6 */

import {
    output,
    ParamGui,
    BooleanButton
} from "../libgui/modules.js";

// export everything from here, eliminate modules.js
export const main = {};



import {
    colors,
    utils
} from "./modules.js";

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


    colors.makeGui(gui);
    colors.draw = colors.test;

    draw();
};

function draw() {

    colors.random(20);

    colors.test();
}