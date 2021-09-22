/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

export const builder = {};

var gui = {};

var order, inflation;
var basisX = [];
var basisY = [];

var tiles = {};
var tileNames = [];

const initialColors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#aa00aa'];

const colorControllers = [];

var initialTileController;

builder.init = function(guiP) {
    gui = guiP;
};

builder.setup = function(definition) {
    inflation = definition.inflation;
    order = definition.order;
    basisX.length = order;
    basisY.length = order;
    const dalpha = 2 * Math.PI / order;
    let alpha = 0;
    for (let i = 0; i < order; i++) {
        basisX[i] = Math.cos(alpha);
        basisY[i] = Math.sin(alpha);
        alpha += dalpha;
    }
    tiles = definition.tiles;
    colorControllers.forEach(controller => controller.destroy());
    if (initialTileController) {
        initialTileController.destroy();
    }

    tileNames = Object.keys(tiles);
    console.log(tileNames);

    const tileNamesLength = tileNames.length;
    for (let i = 0; i < tileNamesLength; i++) {
        const tileName = tileNames[i];
        const tile = tiles[tileName];
        if (!tile.color) {
            tile.color = initialColors[i % initialColors.length];
        }
        const colorController = gui.add({
            type: 'color',
            params: tile,
            property: 'color',
            labelText: tileName,
            onChange: function() {}
        });
        colorControllers.push(colorController);
    }
    builder.initialTile = tileNames[0];
    initialTileController = gui.add({
        type: 'selection',
        params: builder,
        property: 'initialTile',
        options: tileNames,
        labelText: 'initial'
    });
};

//  making the structure
//============================================

// drawing the structure
//=======================================

builder.drawTile = function(name, originX, originY, size, orientation) {
    const tile = tiles[name];
    console.log(tile);
    const shape = tile.shape;
    const canvasContext = output.canvasContext;
    canvasContext.fillStyle = tile.color;
    const length = shape.length;
    canvasContext.beginPath();
    canvasContext.moveTo(originX, originY);
    for (let i = 0; i < length; i++) {
        let x = 0;
        let y = 0;
        const vector = shape[i];
        const vectorLength = vector.length;
        for (let j = 0; j < vectorLength; j++) {
            const direction = (orientation + j) % order;
            const amplitude = vector[j];
            console.log(direction);
            x += amplitude * basisX[direction];
            y += amplitude * basisY[direction];
            console.log(x, y);

        }
        x = size * x + originX;
        y = size * y + originY;
        canvasContext.lineTo(x, y);
        console.log('line', x, y);
    }
    canvasContext.closePath();
    canvasContext.fill();
};