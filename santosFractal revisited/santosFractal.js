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



const length = Polygon.subControls.length;
for (let i = 0; i < length; i++) {
    const subControls=Polygon.subControls[i];
       gui.add({
        type: 'selection',
        params: subControls,
        property: 'subDiv',
        labelText: i + ' ',
        options: Polygon.subDivs,
        onChange: function() {
            console.log(Polygon.subControls)
            makeStructure();
            draw();
        }
    });



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