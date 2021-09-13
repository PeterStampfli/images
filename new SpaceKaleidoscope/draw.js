/* jshint esversion: 6 */

import {
    output,
    ColorInput
} from "../libgui/modules.js";

export const draw = {};

// for solid spheres
draw.lightness = 0.75;
draw.darkness = 0.5;

// for transparent bubbles
draw.alphaBubble = 200;
draw.alphaBubbleBack = 100;
draw.alphaBubbleFront = 50;

const colorObject = {};

draw.disc = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = color;
    canvasContext.strokeStyle = '#000000';
    canvasContext.beginPath();
    canvasContext.arc(x, y, Math.abs(radius), 0, 2 * Math.PI);
    canvasContext.fill();
    canvasContext.stroke();
};

draw.circle = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = color;
    canvasContext.strokeStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(x, y, Math.abs(radius), 0, 2 * Math.PI);
    canvasContext.stroke();
};

draw.sphere = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    ColorInput.setObject(colorObject, color);
    colorObject.red = Math.floor(colorObject.red * (1 - draw.lightness) + 255.9 * draw.lightness);
    colorObject.green = Math.floor(colorObject.green * (1 - draw.lightness) + 255.9 * draw.lightness);
    colorObject.blue = Math.floor(colorObject.blue * (1 - draw.lightness) + 255.9 * draw.lightness);
    const lightColor = ColorInput.stringFromObject(colorObject);
    ColorInput.setObject(colorObject, color);
    colorObject.red = Math.floor(colorObject.red * (1 - draw.darkness));
    colorObject.green = Math.floor(colorObject.green * (1 - draw.darkness));
    colorObject.blue = Math.floor(colorObject.blue * (1 - draw.darkness));
    const darkColor = ColorInput.stringFromObject(colorObject);
    const grd = canvasContext.createRadialGradient(x - 0.5 * radius, y - 0.5 * radius, radius * 0.1, x - 0.5 * radius, y - 0.5 * radius, radius * 1.5);
    grd.addColorStop(0, lightColor);
    grd.addColorStop(0.8, color);
    grd.addColorStop(1, darkColor);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
};

draw.upperBubble = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    ColorInput.setObject(colorObject, color);
    colorObject.alpha = draw.alphaBubbleFront;
    let transparentColor = ColorInput.stringFromObject(colorObject);
    colorObject.alpha = draw.alphaBubble;
    color = ColorInput.stringFromObject(colorObject);
    let grd = canvasContext.createRadialGradient(x, y, radius * 0.8, x, y, radius);
    grd.addColorStop(0, transparentColor);
    grd.addColorStop(0.9, color);
    grd.addColorStop(1, color);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
    colorObject.alpha = 0;
    transparentColor = ColorInput.stringFromObject(colorObject);
    grd = canvasContext.createRadialGradient(x - 0.5 * radius, y - 0.5 * radius, 0, x - 0.5 * radius, y - 0.5 * radius, radius);
    grd.addColorStop(0, color);
    grd.addColorStop(1, transparentColor);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
};

draw.lowerBubble = function(x, y, radius, color) {
    const canvasContext = output.canvasContext;
    ColorInput.setObject(colorObject, color);
    colorObject.alpha = draw.alphaBubbleBack;
    let transparentColor = ColorInput.stringFromObject(colorObject);
    colorObject.alpha = draw.alphaBubble;
    color = ColorInput.stringFromObject(colorObject);
    let grd = canvasContext.createRadialGradient(x, y, radius * 0.9, x, y, radius);
    grd.addColorStop(0, transparentColor);
    grd.addColorStop(0.9, color);
    grd.addColorStop(1, color);
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
    colorObject.alpha = Math.floor(0.8 * draw.alphaBubble);
    color = ColorInput.stringFromObject(colorObject);
    colorObject.alpha = 0;
    transparentColor = ColorInput.stringFromObject(colorObject);
    grd = canvasContext.createRadialGradient(x + 0.5 * radius, y + 0.5 * radius, 0, x + 0.5 * radius, y + 0.5 * radius, 0.8 * radius);
    grd.addColorStop(0, color);
    grd.addColorStop(1, transparentColor);
    canvasContext.fillStyle = grd;
    canvasContext.fill();
};
