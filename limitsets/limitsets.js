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
main.lineWidth = 1;

main.size = 40;
main.generations = 5;
main.minRadius = 0.1;
main.maxElements=1000;

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
    type: 'number',
    params: main,
    property: 'maxElements',
    labelText:'max no of circles',
    min: 0,
    step: 1,
    onChange: function() {
        create();
        draw();
    }
})

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

// add a mapping circle
function mappingCircle(centerX,centerY,radius,inverted=false){
    Circles.mapping.add(new Circle(main.size *centerX, main.size * centerY, main.size * radius,inverted));
}

// add an image circle resulting from a mapping triplett to the zero generation of images
function basicImage(i, j, k) {
    const circle = Circles.mapping.createFromTriplett(i, j, k);
    Circles.images[0].add(circle);
}

// new generations from inversions
function newGeneration(generation) {
    const oldCircles = Circles.images[generation - 1];
    if (oldCircles.length()>main.maxElements){
        return;
    }
    const newCircles = Circles.images[generation];
    const mappingCircles = Circles.mapping;
    const oldLength = oldCircles.length();
    const mapLength = mappingCircles.length();
    const minRadius=main.minRadius;
    for (let i = 0; i < oldLength; i++) {
        const oldCircle = oldCircles.get(i);
        for (let m = 0; m < mapLength; m++) {
            const mapCircle = mappingCircles.get(m);
            const newCircle = mapCircle.invertCircle(oldCircle);
            if ((newCircle !== false)&&(newCircle.radius>minRadius)) {
                newCircles.add(newCircle);
            }
        }
    }
}

function tetrahedron(){
        // the tetrahedron, creating the appollonian gasket
    const rt32 = Math.sqrt(3) / 2;
    mappingCircle(1,0,rt32);
    mappingCircle(-0.5,rt32,rt32);
    mappingCircle(-0.5,-rt32,rt32);
    mappingCircle(0,0,1-rt32,false);
    basicImage(0, 1, 2);
    basicImage(0, 1, 3);
    basicImage(0, 2, 3);
    basicImage(1, 2, 3);
}

function create() {
    Circles.mapping.clear();
    Circles.images.length = Math.max(1,main.generations);
    for (let i = 0; i < main.generations; i++) {
        Circles.images[i] = new Circles();
    }
tetrahedron();


    for (let gen=1;gen<main.generations;gen++){
        newGeneration(gen);
    console.log(Circles.images[gen].length());
    }
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