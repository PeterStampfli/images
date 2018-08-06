/**
 * on-screen canvas with a map and mouse events to change the map, wrapped in a div to allow size changes
 * @constructor OutputImage
 * @param {String} idName - html identifier  
 * @param {float} width - width of visible part, containing div-element
 * @param {float} height - height of visible part, containing div-element,default width
 * @param {float} left -  left side, default -0
 * @param {float} top - top side, default 0
 */

/* jshint esversion:6 */

function OutputImage(idName, width, height = width, left = 0, top = 0) {
    width = Math.round(width);
    height = Math.round(height);
    this.idName = idName;
    this.divName = idName + "div";
    this.divWidth = width;
    this.divHeight = height;
    this.left = left;
    this.top = top;
    this.bigDiv = new BigDiv(this.divName, width, height, left, top);
    DOM.create("canvas", idName, "#" + this.divName);
    DOM.style("#" + idName, "cursor", "pointer", "display", "block", "position", "relative");

    this.canMove = true;
    this.canZoom = true;

    this.pixelCanvas = new PixelCanvas(idName);
    this.mouseEvents = new MouseEvents(idName);
    this.touchEvents = new TouchEvents(idName);

    // the linear transform between pixel indices and image coordinates
    // (x,y)= (cornerX,cornerY)+scale*(i,j)
    this.cornerX = 0;
    this.cornerY = 0;
    this.scale = 1;
    this.zoomFactor = 1.05;

    /**
     * what to do if map changes (move or zoom -> redraw image) due to mouse events
     * @method OutputImage#action
     */
    this.action = function() {};

    const outputImage = this;

    // mouse wheel changes scale
    this.mouseEvents.wheelAction = function(mouseEvents) {
        if (outputImage.canZoom) {
            outputImage.mouseZoom(mouseEvents);
            outputImage.action();
        }
    };

    // mouse move shifts image
    this.mouseEvents.dragAction = function(mouseEvents) {
        if (outputImage.canMove) {
            outputImage.mouseShift(mouseEvents);
            outputImage.action();
        }
    };

    // touch can move and scale
    this.touchEvents.moveAction = function(touchEvents) {
        if (touchEvents.touches.length === 1) {
            if (outputImage.canMove) {
                outputImage.cornerX -= touchEvents.dx * outputImage.scale;
                outputImage.cornerY -= touchEvents.dy * outputImage.scale;
                outputImage.adjustCanvasTransform();
                outputImage.action();
            }
        } else if (touchEvents.touches.length === 2) {

        }
    };
}

(function() {

    /**
     * show area of the containing bigdiv
     * @method OutputImage#showArea
     */
    OutputImage.prototype.showArea = function() {
        this.bigDiv.showArea();
    };

    /**
     * set size of the output canvas and its scale, create pixel, use together with other size dependent setup
     * sets overflow style of surrounding div
     * @method OutputImage#setSize
     * @param {float} width
     * @param {float} height - default is width
     */
    OutputImage.prototype.setSize = function(width, height = width) {
        width = Math.round(width);
        height = Math.round(height);
        if (this.pixelCanvas.width > 0) {
            this.scale *= Math.sqrt((this.pixelCanvas.width - 1) * (this.pixelCanvas.height - 1) / (width - 1) / (height - 1));
        }
        this.pixelCanvas.setupOnscreen(width, height); // does nothing if size has not changed
        // adjust overflow of conatining divName
        if (width <= this.divWidth) {
            DOM.style("#" + this.divName, "overflowX", "hidden");
        } else {
            DOM.style("#" + this.divName, "overflowX", "scroll");
        }
        if (height <= this.divHeight) {
            DOM.style("#" + this.divName, "overflowY", "hidden");
        } else {
            DOM.style("#" + this.divName, "overflowY", "scroll");
        }
        // center
        DOM.style("#" + this.idName, "left", Math.max(0, 0.5 * (this.divWidth - width)) + px);
        DOM.style("#" + this.idName, "top", Math.max(0, 0.5 * (this.divHeight - height)) + px);
    };
}());


(function() {
    "use strict";


    /**
     * set the cursor shape (style "default","arrow","none",...) on the output image
     * @method OutputImage#setCursorStyle
     * @param {String} shape
     */
    OutputImage.prototype.setCursorStyle = function(shape) {
        console.log("cursor " + shape);
        this.pixelCanvas.canvas.style.cursor = shape;
    };

    /**
     * set the action() - function for this output canvas, called at each position or scale change for instant following
     * @method OutputImage#setAction
     * @param {function} action
     */
    OutputImage.prototype.setAction = function(action) {
        this.action = action;
    };

    /**
     * transform from pixel coordinates (indices) to space coordinates
     * @method OutputCanvas#pixelToSpaceCoordinates
     * @param {Vector2} v - will be transformed
     */
    OutputImage.prototype.pixelToSpaceCoordinates = function(v) {
        v.x = this.scale * v.x + this.cornerX;
        v.y = this.scale * v.y + this.cornerY;
    };

    /**
     * transform from space coordinates to pixel (indices) coordinates
     * @method OutputCanvas#spaceToPixelCoordinates
     * @param {Vector2} v - will be transformed
     */
    OutputImage.prototype.spaceToPixelCoordinates = function(v) {
        v.x = (v.x - this.cornerX) / this.scale;
        v.y = (v.y - this.cornerY) / this.scale;
    };

    /**
     * make that the canvas context transform agrees with the input transform from pixel to coordinates
     * this is equivalent to the transform from space coordinates to pixel indices
     * @method OutputImage#adjustCanvasTransform
     */
    OutputImage.prototype.adjustCanvasTransform = function() {
        let context = this.pixelCanvas.canvasContext;
        context.setTransform(1, 0, 0, 1, -this.cornerX / this.scale, -this.cornerY / this.scale); // unshift
        context.transform(1 / this.scale, 0, 0, 1 / this.scale, 0, 0);
    };

    /**
     * set input coordinates, transform and adjust canvas transform
     * @method OutputImage#setCoordinates
     * @param {float} xMin - lowest value for x-coordinate
     * @param {float} yMin - lowest value for y-coordinate
     * @param {float} xMax - highest value for x-coordinate
     */
    OutputImage.prototype.setCoordinates = function(xMin, yMin, xMax) {
        this.cornerX = xMin;
        this.cornerY = yMin;
        if (this.pixelCanvas.width > 1) {
            this.scale = (xMax - xMin) / (this.pixelCanvas.width - 1);
        } else {
            console.log(" ***Output.setCoordinates: width of canvas=0");
        }
        this.adjustCanvasTransform();
    };

    /**
     * mouse shifts the image, action method for mouse handler linked to the canvas, 
     * needs image update
     * @method OutputImage#mouseShift
     * @param {MouseEvents} mouseEvents - contains the data
     */
    OutputImage.prototype.mouseShift = function(mouseEvents) {
        this.cornerX -= mouseEvents.dx * this.scale;
        this.cornerY -= mouseEvents.dy * this.scale;
        this.adjustCanvasTransform();
    };

    /**
     * stop shift
     * @method OutputImage.stopShift
     */
    OutputImage.prototype.stopShift = function() {
        this.canMove = false;
    };


    /**
     * zoom with given factor to/from given point (mouse position) as center
     * @method OutputImage#zoom
     * @param {float} factor - zoom factor
     * @param {float} x - coordinate of zooming center
     * @param {float} y - coordinate of zooming center
     */
    OutputImage.prototype.zoom = function(factor, x, y) {
        this.cornerX += this.scale * (1 - factor) * x;
        this.cornerY += this.scale * (1 - factor) * y;
        this.scale *= factor;
        this.adjustCanvasTransform();
    };

    /**
     * mouse wheel zooms the image around given position, action method for mouse handler linked to the canvas, 
     * needs image update
     * @method OutputImage#positionZoom
     * @param {MouseEvents} mouseEvents - contains the wheel data
     * @param {float} x - coordinate of center
     * @param {float} y - coordinate of center
     */
    OutputImage.prototype.positionZoom = function(mouseEvents, x, y) {
        if (mouseEvents.wheelDelta > 0) {
            this.zoom(this.zoomFactor, x, y);
        } else {
            this.zoom(1 / this.zoomFactor, x, y);
        }
    };

    /**
     * mouse wheel zooms the image around mouse position, action method for mouse handler linked to the canvas, 
     * needs image update
     * @method OutputImage#mouseZoom
     * @param {MouseEvents} mouseEvents - contains the data
     */
    OutputImage.prototype.mouseZoom = function(mouseEvents) {
        this.positionZoom(mouseEvents, mouseEvents.x, mouseEvents.y);
    };

    /**
     * stop zoom
     * @method OutputImage.stopZoom
     */
    OutputImage.prototype.stopZoom = function() {
        this.canZoom = false;
    };

    /**
     * draw on the outputImage pixel by pixel, draw all
     * @method OutputImage#drawPixel
     * @param {function} mapping - from Vector2(position) to Color, 
     */
    OutputImage.prototype.drawPixel = function(mapping) {
        let position = new Vector2();
        let color = new Color(0, 0, 0, 255);
        let width = this.pixelCanvas.width;
        let height = this.pixelCanvas.height;
        let index = 0;
        let scale = this.scale;
        position.y = this.cornerY;
        for (var j = 0; j < height; j++) {
            position.x = this.cornerX;
            for (var i = 0; i < width; i++) {
                mapping(position, color);
                this.pixelCanvas.setPixelAtIndex(color, index);
                position.x += scale;
                index++;
            }
            position.y += scale;
        }
        this.pixelCanvas.showPixel();
    };



}());
