/* jshint esversion: 6 */

import {
    ParamGui,
    Pixels,
    pixelPaint,
    output
} from "../libgui/modules.js";

const waves = {};
waves.symmetry = 5;
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

// five and ten-fold
const sin2PI5 = Math.sin(2 * Math.PI / 5);
const cos2PI5 = Math.cos(2 * Math.PI / 5);
const sin4PI5 = Math.sin(4 * Math.PI / 5);
const cos4PI5 = Math.cos(4 * Math.PI / 5);
const sin6PI5 = Math.sin(6 * Math.PI / 5);
const cos6PI5 = Math.cos(6 * Math.PI / 5);
const sin8PI5 = Math.sin(8 * Math.PI / 5);
const cos8PI5 = Math.cos(8 * Math.PI / 5);

// higher harmonic
const tau = 1.618;
const sinPI5 = tau * Math.sin(Math.PI / 5);
const cosPI5 = tau * Math.cos(Math.PI / 5);
const sin3PI5 = tau * Math.sin(3 * Math.PI / 5);
const cos3PI5 = tau * Math.cos(3 * Math.PI / 5);
const sin5PI5 = tau * Math.sin(5 * Math.PI / 5);
const cos5PI5 = tau * Math.cos(5 * Math.PI / 5);
const sin7PI5 = tau * Math.sin(7 * Math.PI / 5);
const cos7PI5 = tau * Math.cos(7 * Math.PI / 5);
const sin9PI5 = tau * Math.sin(9 * Math.PI / 5);
const cos9PI5 = tau * Math.cos(9 * Math.PI / 5);

//12-fold

const sin2PI12 = Math.sin(2 * Math.PI / 12);
const cos2PI12 = Math.cos(2 * Math.PI / 12);
const sin4PI12 = Math.sin(4 * Math.PI / 12);
const cos4PI12 = Math.cos(4 * Math.PI / 12);
const sin6PI12 = Math.sin(6 * Math.PI / 12);
const cos6PI12 = Math.cos(6 * Math.PI / 12);
const sin8PI12 = Math.sin(8 * Math.PI / 12);
const cos8PI12 = Math.cos(8 * Math.PI / 12);
const sin10PI12 = Math.sin(10 * Math.PI / 12);
const cos10PI12 = Math.cos(10 * Math.PI / 12);
const d6 = 1.932;
const sinPI12 = d6 * Math.sin(Math.PI / 12);
const cosPI12 = d6 * Math.cos(Math.PI / 12);
const sin3PI12 = d6 * Math.sin(3 * Math.PI / 12);
const cos3PI12 = d6 * Math.cos(3 * Math.PI / 12);
const sin5PI12 = d6 * Math.sin(5 * Math.PI / 12);
const cos5PI12 = d6 * Math.cos(5 * Math.PI / 12);
const sin7PI12 = d6 * Math.sin(7 * Math.PI / 12);
const cos7PI12 = d6 * Math.cos(7 * Math.PI / 12);
const sin9PI12 = d6 * Math.sin(9 * Math.PI / 12);
const cos9PI12 = d6 * Math.cos(9 * Math.PI / 12);
const sin11PI12 = d6 * Math.sin(11 * Math.PI / 12);
const cos11PI12 = d6 * Math.cos(11 * Math.PI / 12);

// four and eight
const sqrt05 = Math.sqrt(0.5);
const d4 = 1.847;
const cosPI8 = d4 * Math.cos(Math.PI / 8);
const sinPI8 = d4 * Math.sin(Math.PI / 8);
const cos3PI8 = d4 * Math.cos(3 * Math.PI / 8);
const sin3PI8 = d4 * Math.sin(3 * Math.PI / 8);
const cos5PI8 = d4 * Math.cos(5 * Math.PI / 8);
const sin5PI8 = d4 * Math.sin(5 * Math.PI / 8);
const cos7PI8 = d4 * Math.cos(7 * Math.PI / 8);
const sin7PI8 = d4 * Math.sin(7 * Math.PI / 8);

const four = function(x, y) {
    let result = white;
    let sum = Math.cos(x) + Math.cos(y);
    sum -= Math.cos(sqrt05 * (x + y));
    sum -= Math.cos(sqrt05 * (y - x));
    let hSum = Math.cos(cosPI8 * x + sinPI8 * y) + Math.cos(cos5PI8 * x + sin5PI8 * y);
    hSum -= Math.cos(cos3PI8 * x + sin3PI8 * y);
    hSum -= Math.cos(cos7PI8 * x + sin7PI8 * y);
    sum += waves.higher * hSum;
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

const eight = function(x, y) {
    let result = white;
    let sum = Math.cos(x) + Math.cos(y);
    sum += Math.cos(sqrt05 * (x + y));
    sum += Math.cos(sqrt05 * (y - x));
    let hSum = Math.cos(cosPI8 * x + sinPI8 * y) + Math.cos(cos5PI8 * x + sin5PI8 * y);
    hSum += Math.cos(cos3PI8 * x + sin3PI8 * y);
    hSum += Math.cos(cos7PI8 * x + sin7PI8 * y);
    sum += waves.higher * hSum;
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



const pentagonal = function(x, y) {
    let result = white;
    let sum = Math.sin(x);
    sum += Math.sin(cos2PI5 * x + sin2PI5 * y);
    sum += Math.sin(cos4PI5 * x + sin4PI5 * y);
    sum += Math.sin(cos6PI5 * x + sin6PI5 * y);
    sum += Math.sin(cos8PI5 * x + sin8PI5 * y);
    let hSum = Math.sin(cosPI5 * x + sinPI5 * y);
    hSum += Math.sin(cos3PI5 * x + sin3PI5 * y);
    hSum += Math.sin(cos5PI5 * x + sin5PI5 * y);
    hSum += Math.sin(cos7PI5 * x + sin7PI5 * y);
    hSum += Math.sin(cos9PI5 * x + sin9PI5 * y);
    sum += waves.higher * hSum;
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

const decagonal = function(x, y) {
    let result = white;
    let sum = Math.cos(x);
    sum += Math.cos(cos2PI5 * x + sin2PI5 * y);
    sum += Math.cos(cos4PI5 * x + sin4PI5 * y);
    sum += Math.cos(cos6PI5 * x + sin6PI5 * y);
    sum += Math.cos(cos8PI5 * x + sin8PI5 * y);
    let hSum = Math.cos(cosPI5 * x + sinPI5 * y);
    hSum += Math.cos(cos3PI5 * x + sin3PI5 * y);
    hSum += Math.cos(cos5PI5 * x + sin5PI5 * y);
    hSum += Math.cos(cos7PI5 * x + sin7PI5 * y);
    hSum += Math.cos(cos9PI5 * x + sin9PI5 * y);
    sum += waves.higher * hSum;
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

const six = function(x, y) {
    let result = white;
    let sum = Math.cos(x);
    sum -= Math.cos(cos2PI12 * x + sin2PI12 * y);
    sum += Math.cos(cos4PI12 * x + sin4PI12 * y);
    sum -= Math.cos(cos6PI12 * x + sin6PI12 * y);
    sum += Math.cos(cos8PI12 * x + sin8PI12 * y);
    sum -= Math.cos(cos10PI12 * x + sin10PI12 * y);
    let hSum = Math.cos(cosPI12 * x + sinPI12 * y);
    hSum -= Math.cos(cos3PI12 * x + sin3PI12 * y);
    hSum += Math.cos(cos5PI12 * x + sin5PI12 * y);
    hSum -= Math.cos(cos7PI12 * x + sin7PI12 * y);
    hSum += Math.cos(cos9PI12 * x + sin9PI12 * y);
    hSum -= Math.cos(cos11PI12 * x + sin11PI12 * y);
    sum += waves.higher * hSum;
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
const twelve = function(x, y) {
    let result = white;
    let sum = Math.cos(x);
    sum += Math.cos(cos2PI12 * x + sin2PI12 * y);
    sum += Math.cos(cos4PI12 * x + sin4PI12 * y);
    sum += Math.cos(cos6PI12 * x + sin6PI12 * y);
    sum += Math.cos(cos8PI12 * x + sin8PI12 * y);
    sum += Math.cos(cos10PI12 * x + sin10PI12 * y);
    let hSum = Math.cos(cosPI12 * x + sinPI12 * y);
    hSum += Math.cos(cos3PI12 * x + sin3PI12 * y);
    hSum += Math.cos(cos5PI12 * x + sin5PI12 * y);
    hSum += Math.cos(cos7PI12 * x + sin7PI12 * y);
    hSum += Math.cos(cos9PI12 * x + sin9PI12 * y);
    hSum += Math.cos(cos11PI12 * x + sin11PI12 * y);
    sum += waves.higher * hSum;
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
    switch (waves.symmetry) {
        case 4:
            pixelPaint.color = four;
            break;
        case 5:
            pixelPaint.color = pentagonal;
            break;
        case 6:
            pixelPaint.color = six;
            break;
        case 8:
            pixelPaint.color = eight;
            break;
        case 10:
            pixelPaint.color = decagonal;
            break;
        case 12:
            pixelPaint.color = twelve;
            break;

    }
    pixelPaint.draw();
}

function setup() {
    pixelPaint.setup('waves', false);
    const gui = pixelPaint.gui;
    gui.add({
        type: "selection",
        params: waves,
        property: 'symmetry',
        options: [4, 5, 6, 8, 10, 12],

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
    gui.add({
        type: "number",
        params: waves,
        property: 'higher',
        labelText: 'amplitude 2nd harm',
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