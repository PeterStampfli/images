/* jshint esversion: 6 */

import {
    ParamGui,
    SVG,
    BooleanButton
}
from "../libgui/modules.js";

import {
    Circle,
    Circles
} from "./circle.js";

const gui = new ParamGui({
    closed: false
});

SVG.makeGui(gui);
SVG.init();

// parameters for drawing
const main = {};
// colors
main.imageColor = '#000000';
main.mappingColor = '#ff0000';
main.lineWidth = 2;

main.size = 40;
main.generations = 5;
main.minRadius = 10;

gui.add({
    type: 'number',
    params: main,
    property: 'size',
    min: 0,
    onChange: function() {
        create();
        draw();
    }
});

gui.add({
    type: 'number',
    params: main,
    property: 'generations',
    min: 0,
    step: 1,
    onChange: function() {
        create();
        draw();
    }
}).add({
    type: 'number',
    params: main,
    property: 'minRadius',
    labelText: 'minimum radius',
    min: 0,
    onChange: function() {
        create();
        draw();
    }
});

gui.add({
    type: 'color',
    params: main,
    property: 'mappingColor',
    labelText: 'maps',
    onChange: function() {
        draw();
    }
});
gui.add({
    type: 'color',
    params: main,
    property: 'imageColor',
    labelText: 'images',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: main,
    min: 0,
    property: 'lineWidth',
    onChange: function() {
        draw();
    }
});

Circles.mapping = new Circles();
Circles.images = [];

function create() {
    Circles.mapping.clear();
    Circles.images.length = main.generations;
    for (let i = 0; i < main.generations; i++) {
        Circles.images[i] = new Circles();
    }

    // the tetrahedron, creating the appollonian gasket
    const rt32 = Math.sqrt(3) / 2;
    Circles.mapping.add(new Circle(main.size, 0, main.size * rt32));
    Circles.mapping.add(new Circle(-main.size * 0.5, main.size * rt32, main.size * rt32));
    Circles.mapping.add(new Circle(-main.size * 0.5, -main.size * rt32, main.size * rt32));
    // the inverted surrounding circle
    Circles.mapping.add(new Circle(0, 0, main.size * (1 + rt32), true));

    const circle4 = Circles.mapping.createFromTriplett(1, 2, 0);
    Circles.images[0].add(circle4);
}

function draw() {
    SVG.begin();
    SVG.attributes = {
        transform: 'scale(1 -1)',
        fill: 'none',
        'stroke-width': main.lineWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    };
    SVG.attributes.stroke = main.mappingColor;
    SVG.createGroup(SVG.attributes);

    Circles.mapping.drawStereographic();
    SVG.attributes.stroke = main.imageColor;
    SVG.createGroup(SVG.attributes);

    for (let i = 0; i < main.generations; i++) {
        Circles.images[i].drawStereographic();
    }

    SVG.terminate();
}

SVG.draw = draw;
create();
draw();