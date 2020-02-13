/**
 * an object that controls a canvas
 * you can set its dimensions (it is square orrectangle)
 * it can resize automatically
 * you can download the image (custom name)
 * @constructor ParamCanvas
 * @param {ParamGui} gui 
 * @param {html div element} container - where the canvas lives
 * @param {boolean} isRectangular - optional, default: true
 * @param {boolean} canAutoResize - does it resize with the container, optional, default: true
 */


import {
    ParamGui,
    saveAs
}
from "./modules.js";


export function ParamCanvas(gui, container, isRectangular = true, canAutoResize = true) {
    this.gui = gui;
    this.container = container;
    this.canvas = document.createElement("canvas");

    this.canvas.style.backgroundColor = "blue";

    container.appendChild(this.canvas);
    this.canvasContext = this.canvas.getContext("2d");



    this.isRectangular = isRectangular;
    this.canAutoResize = canAutoResize;
    const paramCanvas = this;
    // updating after size change, define later
    this.updateImage = function() {
        console.log("update image " + this.canvas.width + " " + this.canvas.height);
    };
    let saveAsName = "picture";
    // the save button and text field for changing the name
    const saveButton = gui.addButton("save", function() {
            // for some crazy reason, this clears the console
            paramCanvas.canvas.toBlob(function(blob) {
                saveAs(blob, saveAsName + '.png');
            }, 'image/png');

        })
        .setMinLabelWidth(0);

    const saveNameInput = saveButton.addTextInput("as", name, function(newName) {
            saveAsName = newName;
        })
        .setMinLabelWidth(20);


    if (isRectangular) {
        this.widthController = gui.addNumberButton("width", 200, 1, 10000)
            .setMinLabelWidth(40)
            .createMulDivButtons()
            .createSuggestButton(5000)
            .onChange(function(width) {
                paramCanvas.autoResizeController.setValueOnly(false);
                paramCanvas.canvas.width = width;
                paramCanvas.updateScrollbars();
                paramCanvas.updateImage();
            });
        this.heightController = this.widthController.addNumberButton("height", 200, 1, 10000)
            .setMinLabelWidth(40)
            .createMulDivButtons()
            .createSuggestButton(5000)
            .onChange(function(height) {
                paramCanvas.autoResizeController.setValueOnly(false);
                paramCanvas.canvas.height = height;
                paramCanvas.updateScrollbars();
                paramCanvas.updateImage();
            });
        // resize to the container dimensions, for rectangular canvas
        this.resize = function() {
            this.container.style.overflow = "hidden";
            const height = this.container.clientHeight;
            const width = this.container.clientWidth;
            this.canvas.height = height;
            this.canvas.width = width;
            this.heightController.setValueOnly(height);
            this.widthController.setValueOnly(width);
            this.updateImage();
        };
    } else {
        this.sizeController = gui.addNumberButton("size", 200, 1, 10000)
            .createMulDivButtons()
            .createSuggestButton(5000)
            .onChange(function(size) {
                paramCanvas.autoResizeController.setValueOnly(false);
                paramCanvas.canvas.height = size;
                paramCanvas.canvas.width = size;
                paramCanvas.updateScrollbars();
                paramCanvas.updateImage();
            });

        // resize to the smaller container dimension, for square canvas
        this.resize = function() {
            this.container.style.overflow = "hidden";
            const size = Math.min(this.container.clientHeight, this.container.clientWidth);
            this.canvas.height = size;
            this.canvas.width = size;
            this.sizeController.setValueOnly(size);
            this.updateImage();
        };
    }
    this.resize();

    function autoResize() {
        if (paramCanvas.autoResizeController.getValue()) {
            paramCanvas.resize();
        }
    }

    if (canAutoResize) { // resizing later
        this.autoResizeController = gui.addBooleanButton("auto resize:", true, autoResize);
        window.addEventListener("resize", autoResize, false);
    }
}

/**
 * set the x- and y-scrollbars of the container depending on the content
 * @method ParamCanvas#updateScrollbars
 */
ParamCanvas.prototype.updateScrollbars = function() {
    this.container.style.overflow = "hidden";
    // test if width overflows and we have to use overflowX="scroll"
    if (this.canvas.width > this.container.clientWidth) {
        this.container.style.overflowX = "scroll";
    }
    // test if height overflows and we have to use overflowY="scroll"
    if (this.canvas.height > this.container.clientHeight) {
        this.container.style.overflowY = "scroll";
        // now the width might overflow into the scroll bar. Thus test again
        // test if width overflows and we have to use overflowX="scroll"
        if (this.canvas.width > this.container.clientWidth) {
            this.container.style.overflowX = "scroll";
        }
    }
};