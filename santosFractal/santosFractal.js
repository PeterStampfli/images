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
    property: 'gamma',
    min: 0.1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'boolean',
    params: Polygon,
    property: 'invertBrightness',
    labelText: 'invert',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'saturated',
    min: 0,
    max: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'minSaturation',
    labelText: 'min',
    min: 0,
    max: 1,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'hueShift',
    labelText: 'hue shift',
    min: 0,
    max: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'hueRange',
    labelText: 'range',
    min: 0,
    max: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon,
    property: 'hueAlternance',
    labelText: 'altern',
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
});

gui.add({
    type: 'color',
    params: Polygon,
    property: 'lineColor',
    labelText: 'line',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'lineWidth',
    min: 0.1,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: Polygon,
    property: 'vertexSize',
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
    min: 2,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 1,
    min: 2,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 2,
    min: 2,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 3,
    min: 2,
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
    min: 2,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 5,
    min: 2,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 6,
    min: 2,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 7,
    min: 2,
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
    min: 2,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 9,
    min: 2,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 10,
    min: 2,
    step: 1,
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: Polygon.subdivisions,
    property: 11,
    min: 2,
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
    Polygon.noAlert = true;
    if (Polygon.generations > Polygon.subdivisions.length) {
        generationsController.setValueOnly(Polygon.subdivisions.length);
    }
    // for collecting polygons
    Polygon.collection.length = 0;
    const subdivisions = Polygon.subdivisions[0];
    var basisPolygon;
    if (Polygon.initial === 'double triangles') {
        if (((subdivisions & 1) === 0) && (subdivisions > 5)) {
            basisPolygon = Polygon.createRegular(subdivisions / 2);
        } else {
            if (Polygon.noAlert) {
                Polygon.noAlert = false;
                alert('cannot do double triangles for odd number of children or initial subdivison smaller than 6 ');
            }
            return;
        }
    } else {
        if (subdivisions === 2) {
            basisPolygon = Polygon.createRegular(4);
        } else {
            basisPolygon = Polygon.createRegular(subdivisions);
        }
    }
    switch (Polygon.initial) {
        case 'triangles':
            basisPolygon.initialTriangles();
            break;
        case 'double triangles':
            basisPolygon.initialDoubleTriangles();
            break;
        case 'quadrangles':
            basisPolygon.initialQuadrangles();
            break;
        case 'pseudo quadrangles':
            basisPolygon.initialPseudoQuadrangles();
            break;
    }
    Polygon.setSurfaces();
    Polygon.minMaxSurface();
}

function makeColors() {
    Polygon.normalizeSurface();
    //  Polygon.greySurfaces();
    // Polygon.magentaGreen();
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