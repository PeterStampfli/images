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
    graphEuclidean
}
from "./graphEuclidean.js";
graphEuclidean.setup();

import {
    initial
}
from "./initial.js";
initial.setup();

import {
    mod3
}
from "./mod3.js";
mod3.setup();

import {
    mod4
}
from "./mod4.js";
mod4.setup();

import {
    colors
}
from "./colors.js";
colors.setup();

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
    options: ['hue(width)-value(surface)','hue(angle)-value(surface)', 'grey surfaces', 'grey angles', 'magenta-green', 'modular(hue2-value1)'],
    onChange: function() {
        draw();
    }
}).add({
    type: 'boolean',
    params: Polygon,
    property: 'spin',
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
}).add({
    type: 'number',
    params: Polygon,
    property: 'hueAlternance',
    labelText: 'alternance',
    min: 0,
    max: 1,
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
    property: 'centerWeight',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'trueBaryCenter',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: Polygon,
    property: 'subdivApproach',
    labelText: 'method',
    options: [
        'graphEuclidean', 'modular 3', 'modular 4'
    ],
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: Polygon,
    property: 'initial',
    options: [
        'triangles', 'double triangles', 'quadrangles', 'pseudo quadrangles'
    ],
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'star',
    min: 0.1,
    onChange: function() {
        draw();
    }
});

const generationsController = gui.add({
    type: 'number',
    params: Polygon,
    property: 'generations',
    min: 1,
    step: 1,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 0,
    labelText: 'subdivs &nbsp;&nbsp; 0',
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 1,
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 2,
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 3,
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 4,
    labelText: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4',
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 5,
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 6,
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 7,
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
});
gui.add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 8,
    labelText: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 8',
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 9,
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 10,
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 11,
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'initialAddVertices',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'additionalVertices',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: Polygon,
    property: 'shift',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'shiftValue',
    min: 0.1,
    labelText: '',
    onChange: function() {
        draw();
    }
});

function makeStructure() {
    Polygon.indices.fill(-1);
    Polygon.noAlert = true;
    if (Polygon.generations > Polygon.subdivisions.length) {
        generationsController.setValueOnly(Polygon.subdivisions.length);
    }
    // for collecting polygons
    Polygon.collection.length = 0;
Polygon.createInitial();
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