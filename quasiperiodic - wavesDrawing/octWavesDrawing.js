/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    pixelPaint,
    output
} from "../libgui/modules.js";

const waves = {};
waves.meta = 50;
waves.limit = 1;
waves.parity = true;
waves.higher = 1;

// drawing the image: constants
const white = Pixels.integerOfColor({
    red: 255,
    green: 255,
    blue: 255,
    alpha: 255
});
const black = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
});
const blue = Pixels.integerOfColor({
    red: 0,
    green: 0,
    blue: 255,
    alpha: 255
});

// four and eight
const sqrt05 = Math.sqrt(0.5);

const eight = function(x, y) {
    let result = white;
    let one = Math.cos(x) + Math.cos(y);
    let two = Math.cos(sqrt05 * (x + y));
    two += Math.cos(sqrt05 * (y - x));

    let r=Math.sqrt(x*x+y*y);
    r=r*r*r

    let sum = one + (1-r/(waves.meta+r))*two;

    if (waves.parity) {
        if (sum > 0) {
            result = black;
        }
    } else {
        if (Math.abs(sum) > waves.limit) {
            result = black;
        }
    }
    return result;
};



function draw() {

    pixelPaint.color = eight;

    pixelPaint.draw();
}

function setup() {
    pixelPaint.setup('waves', false);
    const gui = pixelPaint.gui;
    gui.add({
        type: 'number',
        params: waves,
        property: 'meta',
        min: 0,

        onChange: function() {
            draw();
        }
    });
    gui.add({
        type: "number",
        params: waves,
        property: 'limit',
        min: 0,
        onChange: function() {
            draw();
        }
    });
    gui.add({
        type: 'boolean',
        params: waves,
        property: 'parity',
        labelText: 'parity (else limit)',
        onChange: function() {
            draw();
        }
    });

    output.addCursorposition();
    output.setInitialCoordinates(0, 0, 100);
    output.drawCanvasChanged = draw;
    draw();

}

setup();