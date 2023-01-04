/* jshint esversion: 6 */

import {
    ParamGui,
    SVG,
    BooleanButton,
    guiUtils
}
from "../libgui/modules.js";

import {
    Polygon
} from "./polygon.js";

import {
    colors
}
from "./colors.js";
colors.setup();

import {
    subdivs
}
from "./subdivisions.js";
subdivs.setup();

const gui = new ParamGui({
    closed: false
});

SVG.makeGui(gui);
SVG.init();

BooleanButton.greenRedBackground();
gui.add({
    type: 'number',
    params: Polygon,
    property: 'size',
    min: 0,
    onChange: draw
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'fill',
    onChange: draw
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'brightnessFrom',
    labelText: 'brightness',
    onChange: doall
}).add({
    type: 'number',
    params: Polygon,
    property: 'brightnessTo',
    labelText: '',
    onChange: doall
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'saturationFrom',
    labelText: 'saturation',
    onChange: doall
}).add({
    type: 'number',
    params: Polygon,
    property: 'saturationTo',
    labelText: '',
    onChange: doall
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'hueFrom',
    labelText: 'hue',
    onChange: doall
}).add({
    type: 'number',
    params: Polygon,
    property: 'hueTo',
    labelText: '',
    onChange: doall
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'stroke',
    labelText: 'lines',
    onChange: draw
});

gui.add({
    type: 'color',
    params: Polygon,
    property: 'lineColor',
    labelText: 'line color',
    onChange: draw
}).add({
    type: 'number',
    params: Polygon,
    property: 'lineWidth',
    labelText: 'width',
    min: 0.1,
    onChange: draw
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'vertices',
    onChange: draw
}).add({
    type: 'number',
    params: Polygon,
    property: 'vertexSize',
    labelText: 'size',
    onChange: draw
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'generations',
    step: 1,
    min: 0,
    onChange: doall
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'symmetry',
    step: 1,
    min: 3,
    onChange: doall
}).add({
    type: 'boolean',
    params: Polygon,
    property: 'star',
    labelText: 'star',
    onChange: doall
}).add({
    type: 'number',
    params: Polygon,
    property: 'starFactor',
    labelText: 'factor',
    onChange: doall
});

const length = Polygon.subControls.length;
for (let i = 0; i < length; i++) {
    const subControls = Polygon.subControls[i];
    gui.add({
        type: 'selection',
        params: subControls,
        property: 'subDiv',
        labelText: i + ' ',
        options: Polygon.subDivs,
        onChange: doall
    });
    const ratioController = gui.add({
        type: 'number',
        params: subControls,
        property: 'ratio',
        min: 0,
        onChange: doall
    });
    if (i > 0) {
        ratioController.add({
            type: 'number',
            params: subControls,
            property: 'origin',
            onChange: doall
        });
    }
    if (i < length - 1) {
        gui.add({
            type: 'number',
            params: subControls,
            property: 'insideVertices',
            labelText: 'inside',
            min: 1,
            onChange: doall
        }).add({
            type: 'number',
            params: subControls,
            property: 'radialVertices',
            labelText: 'radial',
            min: 1,
            onChange: doall
        }).add({
            type: 'number',
            params: subControls,
            property: 'outsideVertices',
            labelText: 'outside',
            min: 1,
            onChange: doall
        });
    }



    /* subControls.subDiv = 'simpleQuadrangles';
     subControls.origin = 0;
     subControls.ratio = 0.4;
     subControls.insideVertices = 1;
     subControls.radialVertices = 1;
     subControls.outsideVertices = 1;
     */
}

function makeStructure() {
    // for collecting polygons
    Polygon.collection.length = 0;
    const polygon = new Polygon(0);
    const delta = (Polygon.symmetry & 1) ? 0 : Math.PI / Polygon.symmetry;
    const dAngle = 2 * Math.PI / Polygon.symmetry;
    for (let i = 0; i < Polygon.symmetry; i++) {
        let angle = i * dAngle + delta;
        polygon.addCorner(Polygon.size * Math.sin(angle), Polygon.size * Math.cos(angle));
        if (Polygon.star) {
            angle += 0.5 * dAngle;
            polygon.addCorner(Polygon.starFactor * Polygon.size * Math.sin(angle), Polygon.starFactor * Polygon.size * Math.cos(angle));
        }
    }
    polygon.subdivide();
    Polygon.setSurfaces();
    Polygon.minMaxSurface();
}

function makeColors() {
    const length = Polygon.collection.length;
    Polygon.normalizeSurface();
    for (let i = 0; i < length; i++) {
        const polygon = Polygon.collection[i];
        polygon.hue = polygon.width;
        polygon.value = polygon.normalizedSurface;
    }
    Polygon.hueValue();
}

function draw() {
    SVG.begin();
    SVG.groupAttributes = {
        transform: 'scale(1 -1)',
        fill: 'none',
        'stroke-width': Polygon.lineWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    };
    Polygon.drawCollection();
    SVG.terminate();
}

function doall() {
    makeStructure();
    makeColors();
    draw();
}

SVG.draw = doall;
doall();