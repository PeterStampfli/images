/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels,
    ColorInput
} from "../libgui/modules.js";

import {
    circles,
    intersections,
    presets,
    regions
} from './modules.js';

/**
 * basic things for screen output and mouse input
 * @namespace basic
 */
export const basic = {};

// for debug drawing/messages
basic.debug = false;

/**
 * setting up the output, gui and drawing
 * @method basic.setup
 */
basic.setup = function() {
    // base gui
    const gui = new ParamGui({
        name: 'kaleidoscopeBuilder',
        closed: false
    });
    basic.gui = gui;
    // create an output canvas
    const outputGui = gui.addFolder('output image');
    output.createCanvas(outputGui);
    output.createPixels();
    // coordinate transform for the output image
    const transformGui = outputGui.addFolder('coordinate transform');
    output.addCoordinateTransform(transformGui, false);
    output.setInitialCoordinates(0, 0, 3);
    const gridGui = outputGui.addFolder('grid');
    output.grid.interval = 0.1;
    output.addGrid(gridGui);

    // setting up the mapping, and its default input image
    map.mapping = function(point) {
        circles.map(point);
    };
    map.setOutputDraw(); // links the output drawing routines
    map.inputImage = '../libgui/testimage.jpg';
    map.makeShowingGui(gui);

    // a new map means changed circles
    // we have to work out the regions
    /**
     * what to do when the map changes (parameters, canvas size too)
     * circles might change - we have to determine the regions
     * @method map.drawMapChanged
     */
    map.drawMapChanged = function() {
        map.clearActive();
        if (map.updatingTheMap) {
            // determine fundamental regions
            regions.collectCircles();
            regions.determineBoundingRectangle();
            regions.linesFromInsideOutMappingCircles();
            regions.linesFromOutsideInMappingCircles();
            regions.removeDeadEnds();
            regions.makePolygons();
            // apply map to all pixels
            map.startDrawing();
            circles.lastCircleIndexArray = new Uint8Array(map.xArray.length);
            map.make();
        }
        // now we know which regions are relevant
        // make their controllers visible
        map.showControls();
        // create colors
        map.makeStructureColors();
        // draw image, taking into account regions, and new options
        map.drawImageChanged();
    };

    /**
     * what to do when only the image changes
     * @method map.drawImageChanged
     */
    map.drawImageChanged = function() {
        map.draw();
        output.drawGrid();
        circles.draw();
        intersections.draw();
        if (regions.debug && map.updatingTheMap) {
            regions.drawBoundingRectangle();
            regions.drawCorners();
            regions.drawLines();
        }
    };

    // the presets: make gui and load
    presets.makeGui(gui, {
        closed: false
    });

    // unclassified parameters
    map.makeSettingsGui(gui, {
        closed: false
    });
    map.addDrawIterations();
    map.addTrajectoryOnOffController();
    map.addLinewidthController();
    map.addDrawLimitset();
    map.addDrawIndrasPearls();
    map.addDrawFundamentalRegion();
    // new version for regions
    map.makeRegionsGui(gui, {
        closed: false
    });

    // GUI's for circles and intersections: you can close them afterwards
    circles.makeGui(gui, {
        closed: false
    });
    intersections.makeGui(gui, {
        closed: false
    });

    // mouse controls
    // mouse move with ctrl shows objects that can be selected
    output.mouseCtrlMoveAction = function(event) {
        if (intersections.isSelected(event)) {
            output.canvas.style.cursor = "pointer";
        } else if (circles.isSelected(event)) {
            output.canvas.style.cursor = "pointer";
        } else {
            output.canvas.style.cursor = "default";
        }
        basic.drawCirclesIntersections();
        if (map.trajectory) {
            circles.drawTrajectory(event);
        }
    };
    // smooth transition when ctrl key is pressed
    output.ctrlKeyDownAction = function(event) {
        output.mouseCtrlMoveAction(event);
    };

    // mouse down with ctrl selects intersection or circle
    output.mouseCtrlDownAction = function(event) {
        if (intersections.select(event) || circles.select(event)) {
            basic.drawCirclesIntersections();
            if (map.trajectory) {
                circles.drawTrajectory(event);
            }
        }
    };
    // mouse drag with ctrl moves selected circle
    output.mouseCtrlDragAction = function(event) {
        circles.dragAction(event);
        basic.drawMapChanged();
        if (map.trajectory) {
            circles.drawTrajectory(event);
        }
    };

    // mouse wheel with ctrl changes radius of slected circle
    // with ctrl+shift changes order of selected intersection
    output.mouseCtrlWheelAction = function(event) {
        if (event.shiftPressed) {
            intersections.wheelAction(event);
        } else {
            circles.wheelAction(event);
        }
        map.drawMapChanged();
        if (map.trajectory) {
            circles.drawTrajectory(event);
        }
    };
};

// standardized drawing routines

/**
 * recalculating the map, generating new pixel image and drawing
 * taking care for case that all circles are inverting inside out
 * use if the map changed
 * @method basic.drawMapChanged
 */
basic.drawMapChanged = function() {
    circles.finalInversion = circles.allInsideOut();
    map.drawMapChanged();
};

/**
 * generating new pixel image and drawing
 * use if the map remains and only the image changes
 * @method basic.drawImageChanged
 */
basic.drawImageChanged = function() {
    map.drawImageChanged();
};

/**
 * drawing
 * use if only the display of circles and intersection changes
 * @method basic.drawCirclesIntersections
 */
basic.drawCirclesIntersections = function() {
    output.pixels.show(); // no new map
    output.drawGrid();
    circles.draw();
    intersections.draw();
    if (regions.debug && map.updatingTheMap) {
        regions.drawBoundingRectangle();
        regions.drawCorners();
        regions.drawLines();
    }
};

// Indra's pearls

map.callDrawIndrasPearls = function() {
    map.drawingImage = false;
    map.drawIndrasPearls();
};

/**
 * draw Indra's pearls (pixel gets color of last mapping circle)
 * @method map.drawIndrasPearls
 */
map.drawIndrasPearls = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    // make table of colors related to circles.collection
    const colors = [];
    const colorObj = {
        alpha: 255
    };
    colors.length = circles.collection.length;
    for (var i = 0; i < circles.collection.length; i++) {
        ColorInput.setObject(colorObj, circles.collection[i].color);
        colors[i] = Pixels.integerOfColor(colorObj);
    }
    const length = map.width * map.height;
    for (var index = 0; index < length; index++) {
        // target region, where the pixel has been mapped into
        const lastCircleIndex = circles.lastCircleIndexArray[index];
        if (lastCircleIndex < 255) {
            output.pixels.array[index] = colors[lastCircleIndex];
        } else {
            output.pixels.array[index] = 0; // transparent black
        }
    }
    output.pixels.show();
};

/**
 * add the possibility to draw Indra's pearls
 * @method map.addDrawIndrasPearls
 */
map.addDrawIndrasPearls = function() {
    map.whatToShowController.addOption("Indra's Pearls", map.callDrawIndrasPearls);
};


/**
 * show fundamental region of the map: points that do not get mapped
 * @method map.drawFundamentalRegion
 */
map.drawFundamentalRegion = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    // making the solid colors
    const color = {};
    color.red = 255;
    color.blue = 255;
    color.green = 255;
    color.alpha = 255;
    const white = Pixels.integerOfColor(color);
    color.red = 0;
    color.blue = 0;
    color.green = 0;
    const black = Pixels.integerOfColor(color);
    // drawing
    const point = {
        x: 0,
        y: 0
    };
    let index = 0;
    for (var j = 0; j < map.height; j++) {
        for (var i = 0; i < map.width; i++) {
            point.x = i;
            point.y = j;
            output.coordinateTransform.transform(point);
            if (circles.isInTarget(point)) {
                output.pixels.array[index] = black;
            } else {
                output.pixels.array[index] = white;
            }
            index += 1;
        }
    }
    output.pixels.show();
};

// presets
//============================================================

/**
 * get properties of the kaleidoscope (saving as preset)
 * @method basic.get
 * @return object, defines the kaleidoscope
 */
basic.get = function() {
    const kaleidoscope = {
        circles: circles.get(),
        intersections: intersections.get()
    };
    return kaleidoscope;
};

/**
 * get json string for the kaleidoscope (saving as preset)
 * @method basic.getJSON
 * @return String, defines the kaleidoscope
 */
basic.getJSON = function() {
    return JSON.stringify(basic.get());
};

/**
 * get code string for the properties of the kaleidoscope (saving as preset)
 * ATTENTION: Add "'" around the color strings
 * @method basic.getProperties
 * @return String, defines the kaleidoscope
 */
basic.getProperties = function() {
    return basic.getJSON().replace(/"/g, "");
};

/**
 * set the kaleidoscope using a properties object
 * @method basic.setJSON
 * @param {Object} properties
 */
basic.setProperties = function(properties) {
    // first create the circles
    circles.set(properties.circles);
    // then we can create the ingtersections
    intersections.set(properties.intersections);
};

/**
 * set the kaleidoscope using JSON string
 * @method basic.setJSON
 * @param {String} kaleidoscopeJSON
 */
basic.setJSON = function(kaleidoscopeJSON) {
    const properties = JSON.parse(kaleidoscopeJSON);
    basic.setProperties(properties);
};