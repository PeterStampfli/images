/**
 * on-screen canvas with a map and mouse events to change the map, 
 * wrapped in a div to allow size changes, scrolls if it becomes too large
 * set container div width, height separately, position is preset to (0,0)
 * @constructor OutputImage
 * @param {String} idName - html identifier  
 */

/* jshint esversion:6 */

function OutputImage(idName) {
    this.idName = idName;
    this.divName = idName + "div";
    this.bigDiv = new BigDiv(this.divName);
    this.bigDiv.stopWheelScroll();
    this.setDivPosition(0, 0);
    if (document.getElementById(idName) == null) {
        DOM.create("canvas", idName, "#" + this.divName);
    }
    DOM.style("#" + idName, "cursor", "pointer", "display", "block", "position", "relative");

    this.canMove = true;
    this.canZoom = true;
    this.leftMouseButton = true; // true if left mouse button pressed or none (false if other buttons pressed)
    this.showsTrajectory = false; // true if trajectory above image

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



    /**
     * what to do if mouse or touch moves, change this to change touch and mouse behaviour
     * @method OutputImage#move
     * @param {Event} events - with dx and dy
     */
    this.move = function(events) {
        this.shift(events.dx, events.dy);
        this.action();
    };

    /**
     * what to do if  center button pressed  (down and drag events)
     * @method OutputImage#centerAction
     */
    this.centerAction = function(events) {};

    // hook to this
    const outputImage = this;

    // mouse wheel changes scale
    this.mouseEvents.wheelAction = function(mouseEvents) {
        if (outputImage.canZoom && outputImage.leftMouseButton) {
            if (mouseEvents.wheelDelta > 0) {
                outputImage.zoom(outputImage.zoomFactor, mouseEvents.x, mouseEvents.y);
            } else {
                outputImage.zoom(1 / outputImage.zoomFactor, mouseEvents.x, mouseEvents.y);
            }
            outputImage.action();
        }
    };

    this.mouseEvents.downAction = function(mouseEvents) {
        outputImage.leftMouseButton = (mouseEvents.button === 0);
        if (outputImage.leftMouseButton) {
            if (outputImage.showsTrajectory) {
                Make.updateOutputImage();
            }
        } else {
            outputImage.centerAction(mouseEvents);
        }
        outputImage.showsTrajectory = !outputImage.leftMouseButton;
    };

    // mouse move shifts image for left button
    this.mouseEvents.dragAction = function(mouseEvents) {
        if (outputImage.leftMouseButton) {
            outputImage.move(mouseEvents);
        } else {
            outputImage.centerAction(mouseEvents);
        }
    };

    this.mouseEvents.upAction = function(mouseEvents) {
        outputImage.leftMouseButton = true;
    };

    this.mouseEvents.outAction = function(mouseEvents) {
        if (!outputImage.leftMouseButton) {
            Make.updateOutputImage();
        }
        outputImage.leftMouseButton = true;
        outputImage.showsTrajectory = false;
    };

    // touch can move and scale, single touch move does same as mouse move
    this.touchEvents.moveAction = function(touchEvents) {
        if (touchEvents.touches.length === 1) {
            outputImage.move(touchEvents);
        } else if (touchEvents.touches.length === 2) {
            if (outputImage.canZoom) {
                outputImage.zoom(touchEvents.lastDistance / touchEvents.distance, touchEvents.centerX, touchEvents.centerY);
                outputImage.shift(touchEvents.dx, touchEvents.dy);
                outputImage.action();
            }
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
     * place the output pixel canvas into the div and set the div's overflow behaviour
     * use if the dimensions of the surrounding div changes, but the image itself does not change dimensions
     * @method OutputImage#place
     */
    OutputImage.prototype.place = function() {
        // adjust overflow of conatining divName
        if (this.pixelCanvas.width <= this.divWidth) {
            DOM.style("#" + this.divName, "overflowX", "hidden");
            DOM.style("#" + this.idName, "left", 0.5 * (this.divWidth - this.pixelCanvas.width) + px);
        } else {
            DOM.style("#" + this.divName, "overflowX", "scroll");
            DOM.style("#" + this.idName, "left", 0 + px);
        }
        if (this.pixelCanvas.height <= this.divHeight) {
            DOM.style("#" + this.divName, "overflowY", "hidden");
            DOM.style("#" + this.idName, "top", 0.5 * (this.divHeight - this.pixelCanvas.height) + px);
        } else {
            DOM.style("#" + this.divName, "overflowY", "scroll");
            DOM.style("#" + this.idName, "top", 0 + px);
        }
    };

    /**
     * set size of the output canvas and its scale, create pixel, use together with other size dependent setup
     * keeps center in place
     * @method OutputImage#setSize
     * @param {float} width
     * @param {float} height - default is width
     */
    OutputImage.prototype.setSize = function(width, height = width) {
        width = Math.round(width);
        height = Math.round(height);
        const centerX = this.cornerX + 0.5 * this.scale * this.pixelCanvas.width;
        const centerY = this.cornerY + 0.5 * this.scale * this.pixelCanvas.height;
        if (this.pixelCanvas.width > 0) {
            this.scale *= Math.sqrt((this.pixelCanvas.width - 1) * (this.pixelCanvas.height - 1) / (width - 1) / (height - 1));
            this.cornerX = centerX - 0.5 * this.scale * width;
            this.cornerY = centerY - 0.5 * this.scale * height;
        }
        this.pixelCanvas.setupOnscreen(width, height); // does nothing if size has not changed
        this.place();
    };
}());


(function() {
    "use strict";


    /**
     * set Position of the enclosing div , preset default is (0,0)
     * @method OutputImage#setDivPosition
     * @param {float} left
     * @param {float} top 
     */
    OutputImage.prototype.setDivPosition = function(left, top) {
        this.left = Math.floor(left);
        this.top = Math.floor(top);
        this.bigDiv.setPosition(this.left, this.top);
    };

    /**
     * set dimensions of the enclosing div 
     * @method OutputImage#setDivDimensions
     * @param {float} width
     * @param {float} height 
     */
    OutputImage.prototype.setDivDimensions = function(width, height) {
        this.divWidth = Math.floor(width);
        this.divHeight = Math.floor(height);
        this.bigDiv.setDimensions(this.divWidth, this.divHeight);
    };

    /**
     * set the cursor shape (style "default","arrow","none",...) on the output image
     * @method OutputImage#setCursorStyle
     * @param {String} shape
     */
    OutputImage.prototype.setCursorStyle = function(shape) {
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
     * call in beginning of method to draw output
     * @method OutputImage#adjustCanvasTransform
     */
    OutputImage.prototype.adjustCanvasTransform = function() {
        let context = this.pixelCanvas.canvasContext;
        context.resetTransform();
        //      context.setTransform(1, 0, 0, 1, -this.cornerX / this.scale, -this.cornerY / this.scale); // unshift
        context.translate(-this.cornerX / this.scale, -this.cornerY / this.scale); // unshift
        // context.transform(1 / this.scale, 0, 0, 1 / this.scale, 0, 0);
        context.scale(1 / this.scale, 1 / this.scale);
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
    };

    /**
     * set coordinates, transform and adjust canvas transform for given range of smaller axis
     * @method OutputImage#setRanges
     * @param {float} range - coordinates for smaller side go from -range to +range
     */
    OutputImage.prototype.setRanges = function(range) {
        if (this.pixelCanvas.width > 0) {
            if (this.pixelCanvas.width > this.pixelCanvas.height) { // height is smaller, determines scale
                this.cornerY = -range;
                this.scale = 2 * range / (this.pixelCanvas.height - 1);
                this.cornerX = -range * this.pixelCanvas.width / this.pixelCanvas.height;
            } else {
                this.cornerX = -range;
                this.scale = 2 * range / (this.pixelCanvas.width - 1);
                this.cornerY = -range * this.pixelCanvas.height / this.pixelCanvas.width;
            }

        } else {
            console.log(" ***Output.setCoordinates: width of canvas=0");
        }
    };

    /**
     * stop shift
     * @method OutputImage.stopShift
     */
    OutputImage.prototype.stopShift = function() {
        this.canMove = false;
    };

    /**
     * move the image with data given by mouse or touch events
     * @method OutputImage.prototype.shift
     * @param {float} dx
     * @param {float} dy
     */
    OutputImage.prototype.shift = function(dx, dy) {
        if (this.canMove) {
            this.cornerX -= dx * this.scale;
            this.cornerY -= dy * this.scale;
        }
    };

    /**
     * stop zoom
     * @method OutputImage.stopZoom
     */
    OutputImage.prototype.stopZoom = function() {
        this.canZoom = false;
    };


    /**
     * zoom with given factor to/from given point (mouse position) as center
     * @method OutputImage#zoom
     * @param {float} factor - zoom factor
     * @param {float} x - coordinate of zooming center
     * @param {float} y - coordinate of zooming center
     */
    OutputImage.prototype.zoom = function(factor, x, y) {
        if (this.canZoom) {
            this.cornerX += this.scale * (1 - factor) * x;
            this.cornerY += this.scale * (1 - factor) * y;
            this.scale *= factor;
        }
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