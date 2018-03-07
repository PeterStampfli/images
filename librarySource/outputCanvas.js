/**
 * on-screen canvas with a map and mouse events to change the map
 * @constructor outputCanvas
 * @param {String} idName - html identifier
 * @param {Map} map - a VectorMap or other map object with the same functions
 */

/* jshint esversion:6 */

function outputCanvas(idName, map) {

    let outputCanvas = new PixelCanvas(idName);
    outputCanvas.mouseEvents = new MouseEvents(idName);
    outputCanvas.map = map;




    /**
     * set size of the output canvas and its map, create pixel
     * @method outputCanvas#setMapCanvasSize
     * @param {float} width
     * @param {float} height
     */
    outputCanvas.setMapCanvasSize = function(width, height) {

        setupOnscreen(width, height);
        outputCanvas.map.setMapDimensionFromCanvas(outputCanvas);

    };


    /**
     * what to do if map changes (redraw image)
     * @method outputCanvas#action
     */
    outputCanvas.action = function() {};

    /**
     * set the action() - function for this controller, called at each change for instant following
     * @method outputCanvas#setAction
     * @param {function} action
     */
    outputCanvas.setAction = function(action) {
        outputCanvas.action = action;
    };



    /*
     * add standard up and out actions
     */
    outputCanvas.mouseEvents.addUpAction();
    outputCanvas.mouseEvents.addOutAction();

    outputCanvas.mouseEvents.addWheelAction(function(mouseEvents) {
        outputCanvas.map.mouseZoom(mouseEvents);
        action();
    });

    outputCanvas.mouseEvents.addMoveAction(function(mouseEvents) {
        outputCanvas.map.mouseShift(mouseEvents);
        action();
    });


    return outputCanvas;
}
