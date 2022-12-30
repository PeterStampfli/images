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
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'fill',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: Polygon,
    property: 'colors',
    options: ['hue(width)-value(surface)', 'hue(angle)-value(surface)', 'grey surfaces', 'grey angles', 'magenta-green', 'modular(hue2-value1)'],
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'brightnessFrom',
    labelText: 'brightness',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'brightnessTo',
    labelText: '',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'saturationFrom',
    labelText: 'saturation',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'saturationTo',
    labelText: '',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'hueFrom',
    labelText: 'hue',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'hueTo',
    labelText: '',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'stroke',
    labelText: 'lines',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'color',
    params: Polygon,
    property: 'lineColor',
    labelText: 'line color',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'lineWidth',
    labelText: 'width',
    min: 0.1,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'vertices',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'vertexSize',
    labelText: 'size',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'generations',
    step: 1,
    min: 0,
    onChange: function() {
        makeStructure();
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'symmetry',
    step: 1,
    min: 3,
    onChange: function() {
        makeStructure();
        draw();
    }
}).add({
    type: 'boolean',
    params: Polygon,
    property: 'star',
    labelText: 'star',
    onChange: function() {
        makeStructure();
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'starFactor',
    labelText: 'factor',
    onChange: function() {
        makeStructure();
        draw();
    }
});

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
    switch (Polygon.colors) {
        case 'grey surfaces':
            Polygon.normalizeSurface();
            Polygon.greySurfaces();
            break;
        case 'grey angles':
            Polygon.normalizeSurface();
            Polygon.greyAngles();
            break;
        case 'magenta-green':
            Polygon.normalizeSurface();
            Polygon.magentaGreen();
            break;
        case 'hue(angle)-value(surface)':
            Polygon.normalizeSurface();
            for (let i = 0; i < length; i++) {
                const polygon = Polygon.collection[i];
                polygon.hue = polygon.cosAngle;
                polygon.value = polygon.normalizedSurface;
            }
            Polygon.hueValue();
            break;
        case 'hue(width)-value(surface)':
            Polygon.normalizeSurface();
            for (let i = 0; i < length; i++) {
                const polygon = Polygon.collection[i];
                polygon.hue = polygon.width;
                polygon.value = polygon.normalizedSurface;
            }
            Polygon.hueValue();
            break;
        case 'modular(hue2-value1)':
            const lastSubdiv = Polygon.subdivisions[Math.max(0, Polygon.generations - 1)];
            const last2Subdiv = Polygon.subdivisions[Math.max(0, Polygon.generations - 2)];
            const prod2Subdiv = lastSubdiv * last2Subdiv;
            const iLastSubdiv = 1 / (lastSubdiv - 1);
            const iProd2Subdiv = 1 / (prod2Subdiv - 1);
            for (let i = 0; i < length; i++) {
                const polygon = Polygon.collection[i];
                let iEff = i;
                if (Polygon.spin && (Math.floor(i / lastSubdiv) & 1 === 1)) {
                    iEff = iEff + lastSubdiv - 1 - 2 * (iEff % lastSubdiv);
                }
                // normalize to 0...1
                polygon.hue = (iEff % prod2Subdiv) * iProd2Subdiv;
                polygon.value = (iEff % lastSubdiv) * iLastSubdiv;
            }
            Polygon.hueValue();
            break;
    }
}

function drawOnly() {
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

function draw() {
    makeStructure();
    makeColors();
    drawOnly();
}

SVG.draw = draw;
draw();