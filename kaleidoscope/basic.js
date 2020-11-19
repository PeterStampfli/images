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
    Circle,
    intersections,
    view,
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
        name: 'kaleidoBuilder',
        closed: false
    });
    basic.gui = gui;
    // help
    const help = gui.addFolder('help');
    help.addParagraph('This app cannot be used with touch devices. Send bug reports and other comments to: <strong>pestampf@gmail.com</strong>');
    help.addParagraph('For more information see "Kaleidoscopes for Non-Euclidean Space" (http://archive.bridgesmathart.org/2018/bridges2018-67.html) and "Fractal Images from Multiple Inversion in Circles" (http://archive.bridgesmathart.org/2019/bridges2019-263.html).');
    help.addParagraph('Zoom the image with the mouse wheel while the mouse is on the image. Move the image with a mouse drag. Or use the "output image" part of the gui.');
    help.addParagraph('The image results from inversion at circles. Select a circle with the ctrl key and mouse click. Move it with the ctrl key and mouse drag. Change the radius with ctrl key and mouse wheel. Or use the "circles" part of the gui.');
    help.addParagraph('Circles are tied together by controlled intersections. They are shown as small polygons. Select with the ctrl key and mouse click. Change the intersection angle with ctrl and shift keys and mouse wheel. Or use the "intersections" part of the gui.');
    help.addParagraph('"output image": Change the image size and display options. Save the image. Zoom and translate.');
    help.addParagraph('"presets": Choose between predefined kaleidoscopes. Save and load your own work.');
    help.addParagraph('"showing": Determine how the kaleidoscopic image is displayed. "fundamental region" is particularly fast and useful for building complicated structures. With "image ..." you map an input image onto the structure.');
    help.addParagraph('"regions": Switch on and off distinct image parts. Change their tints.');
    help.addParagraph('"circles": Add and destroy circles. Change their properties.');
    help.addParagraph('"intersections": Add and destroy controlled intersections. Change the order of their dihedral group');

    // create an output canvas
    output.createCanvas(gui);
    output.createPixels();
    output.addAntialiasing();
    output.grid.interval = 0.1;
    output.addGrid();
    output.addCoordinateTransform(false);
    output.addCursorposition();
    output.addZoomAnimation();
    output.setInitialCoordinates(0, 0, 3);
    // more  UI
    // the presets: make gui and load
    presets.makeGui(gui);
    map.makeShowingGui(gui);
    map.maxIterationsController.name('inversions');
    map.maxIterationsController.addHelp('Upper limit for the number of inversions. Increase if there are undefined transparent patches of pixels. Decrease if app is lagging too much.');
    map.linewidthController.addHelp('Width in pixels for drawing circles, intersections and the trajectory.');
    map.trajectoryOnOffController.addHelp('Switch on and press the ctrl-button to see a trajectory of the circle inversions, starting at the mouse position. The trajectory line pieces have the same color as the inverting circle. No trajectory is shown if some circles make an inverting, logarithmic or ortho-stereographic view.');
    map.addDrawFundamentalRegion();
    map.addDrawNoImage();
    map.addDrawIterations();
    map.gammaController.addHelp('Only pixels with more inversions than the threshold will get color. For large gamma mainly pixels with a number of inversions near the limit get much color. For small gamma pixels near the threshold get more color.');
    map.addDrawLimitset();
    map.addDrawIndrasPearls();
    let showHelp = '<strong>structure:</strong> Pixels get the color of the region they are mapped into. For odd numbers of inversions the color is darkened. For even numbers it is lightened.<br>';
    showHelp += '<strong>image - low quality:</strong> Maps an input image. Fast, but strong aliasing and block pixels may appear.<br>';
    showHelp += '<strong>image - high quality:</strong> Maps an input image with anti-aliasing and linear pixel interpolation.<br>';
    showHelp += '<strong>image - high quality:</strong> Maps an input image with anti-aliasing and cubic pixel interpolation.<br>';
    showHelp += '<strong>fundamental region:</strong> Shows the regions where pixels get mapped into as solid grey. Much faster than the other options. Use for setup.<br>';
    showHelp += '<strong>no image:</strong> Does not show an image. Very fast. Use for setup.<br>';
    showHelp += '<strong>iterations:</strong> Shows pixels that need many inversions in white. Else transparent black.<br>';
    showHelp += '<strong>borders:</strong> Shows pixels that lie at the border of different mapping regions in white. Else transparent black.<br>';
    showHelp += "<strong>Indra's pearls:</strong> Pixels get the color of the last circle that inverted their position. Use for non-intersecting circles.<br>";
    map.whatToShowController.addHelp(showHelp);
    map.darkController.addHelp('Sets contrast between odd and even number of inversions. Use zero to get flat color.');
    map.imageController.addDragAndDropWindow();
    // GUI's for regions, circles and intersections: you can close them afterwards
    map.makeRegionsGui(gui);
    circles.makeGui(gui);
    intersections.makeGui(gui);
    view.makeGui(gui);
    // setting up the mapping, and its default input image
    map.mapping = function(point) {
        circles.map(point);
    };
    map.setOutputDraw(); // links the output drawing routines
    map.trajectoryColorController.destroy();

    // a new map means changed circles
    // we have to work out the regions
    /**
     * what to do when the map changes (parameters, canvas size too)
     * circles might change - we have to determine the regions
     * @method map.drawMapChanged
     */
    map.drawMapChanged = function() {
        view.update();
        circles.finalInversion = circles.allInsideOut();
        circles.categorize();
        map.clearActive(); // clears regions
        map.startDrawing();
        if (map.updatingTheMap) {
            // determine fundamental regions
            regions.collectCircles();
            regions.determineBoundingRectangle();
            regions.linesFromInsideOutMappingCircles();
            regions.linesFromOutsideInMappingCircles();
            regions.resolveIntersections();
            regions.removeDeadEnds();
            regions.makePolygons();
            circles.lastCircleIndexArray = new Uint8Array(map.xArray.length);
            map.make();
            map.renumber();
        }
        // now we know which regions are relevant
        // make their controllers visible
        map.showRegionControls();
        // create colors for structure (regions)
        map.makeStructureColors();
        // draw image, taking into account regions, and new options
        map.drawImageChanged();
    };

    // for debug show the polygons when showing fundamental regions
    map.callDrawFundamentalRegion = function() {
        map.drawingInputImage = false;
        map.allImageControllersHide();
        circles.categorize();
        map.drawFundamentalRegion();
        if (regions.debug) {
            // determine fundamental regions
            regions.collectCircles();
            regions.determineBoundingRectangle();
            regions.linesFromInsideOutMappingCircles();
            regions.linesFromOutsideInMappingCircles();
            regions.resolveIntersections();
            regions.removeDeadEnds();
            regions.makePolygons();
            // show the regions
            regions.drawBoundingRectangle();
            regions.drawCorners();
            regions.drawLines();
        }
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
        view.draw();
        if (regions.debug && map.updatingTheMap) {
            regions.drawBoundingRectangle();
            regions.drawCorners();
            regions.drawLines();
        }
    };

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
        if (!intersections.select(event)) {
            circles.select(event);
        }
        basic.drawCirclesIntersections();
        if (map.trajectory) {
            circles.drawTrajectory(event);
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

    // mouse wheel with ctrl changes radius of selected circle
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
 * use if only the display of circles and intersection changes, or the grid, or sampling
 * @method basic.drawCirclesIntersections
 */
basic.drawCirclesIntersections = function() {
    if (map.draw === map.callDrawNoImage) {
        // clear screen
        const context = output.canvasContext;
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, output.canvas.width, output.canvas.height);
        context.restore();
    } else {
        output.pixels.show(); // no new map/image
    }
    output.drawGrid();
    circles.draw();
    intersections.draw();
    view.draw();
    if (regions.debug && map.updatingTheMap) {
        regions.drawBoundingRectangle();
        regions.drawCorners();
        regions.drawLines();
    }
};
output.drawGridChanged = function() {
    console.log('output drawGridChngedd');
    basic.drawCirclesIntersections();
};

// for drawing the fundamental region
map.isInFundamentalRegion = function(point) {
    return circles.isInTarget(point);
};

// Indra's pearls

map.callDrawIndrasPearls = function() {
    map.drawingImage = false;
    map.allImageControllersHide();
    map.drawIndrasPearls();
};

/**
 * draw Indra's pearls (pixel gets color of last mapping circle)
 * inverted colors for odd regions
 * @method map.drawIndrasPearls
 */
map.drawIndrasPearls = function() {
    if (map.inputImageLoaded) {
        map.controlPixels.setAlpha(map.controlPixelsAlpha);
        map.controlPixels.show();
    }
    // make table of colors related to circles.collection
    const colors = [];
    const invertedColors = [];
    const colorObj = {
        alpha: 255
    };
    colors.length = circles.collection.length;
    for (var i = 0; i < circles.collection.length; i++) {
        ColorInput.setObject(colorObj, circles.collection[i].color);
        colors[i] = Pixels.integerOfColor(colorObj);
        colorObj.red = 255 - colorObj.red;
        colorObj.green = 255 - colorObj.green;
        colorObj.blue = 255 - colorObj.blue;
        invertedColors[i] = Pixels.integerOfColor(colorObj);
    }
    const length = map.width * map.height;
    for (var index = 0; index < length; index++) {
        // target region, where the pixel has been mapped into
        const region = map.regionArray[index];
        const lastCircleIndex = circles.lastCircleIndexArray[index];
        if (map.showRegion[region] && (lastCircleIndex < 255)) {
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