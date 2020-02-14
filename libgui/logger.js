/**
 * showing messages in a container div
 * @constructor Logger
 * @param {dom element} container - a div
 */

import {
    ParamGui,
    guiUtils,
}
from "./modules.js";

export function Logger(container) {
    this.container = container;
    this.paragraphs = []; // each message as a <p>
}

// spacing between messages in px
Logger.spacing = 5;

/**
 * add a log message as a <p>
 * @method Logger#log
 * @param {string} message - may include html
 */
Logger.prototype.log = function(message) {
    const paragraph = document.createElement("p");
    paragraph.innerHTML = message;
    if (this.paragraphs.length > 0) {
        paragraph.style.marginTop = Logger.spacing + "px";
    } else {
        paragraph.style.marginTop = "0px";
    }
    paragraph.style.marginBottom = "0px";
    this.container.appendChild(paragraph);
    this.paragraphs.push(paragraph);
};

/**
 * register container domElement in guiUtils for styling
 * see docu of guiUtils.style
 * use: logger.style().backgroundColor("red")
 * @method Logger#style
 * @return guiUtils
 */
Logger.prototype.style = function() {
    return guiUtils.style(this.container);
};

/**
 * clear the log
 * @method Logger#clear
 */
Logger.prototype.clear = function() {
    this.paragraphs.forEach(p => p.remove());
    this.paragraphs.length = 0;
};

/**
 * destroy the logger, remove container element
 * @method Logger#destroy
 */
Logger.prototype.destroy = function() {
    this.clear();
    this.container.remove();
};



/**
 * add a logger with a clear button
 * (the clear button is in the controller object: logger.clearButton)
 * best wrap it onto a folder logger=gui.addFolder(someName,{closed:false}).addLogger();
 * @method ParamGui#addLogger
 * @return {Logger} object
 */
ParamGui.prototype.addLogger = function() {
    const domElement = document.createElement("div");
    // make a regular spacing between elements
    domElement.style.padding = this.design.paddingVertical + "px";
    domElement.style.fontSize = this.design.labelFontSize + "px";
    domElement.style.height = this.design.loggerHeight + "px";
    domElement.style.backgroundColor = this.design.loggerBackgroundColor;
    domElement.style.color = this.design.loggerColor;
    domElement.style.overflowY = "auto";
    const logger = new Logger(domElement);
    this.bodyDiv.appendChild(domElement);
    this.elements.push(logger);
    logger.buttonController = this.addButton("clear the log", function() {
        logger.clear();
    });
    logger.buttonController.domElement.style.textAlign = "center";
    logger.buttonController.deleteLabel();
    return logger;
};

/*
 * a prefab logger that replaces part of the console
 * in its own gui
 */

let logger = false;

/**
 * log something
 * first message creates the logger
 * @function log
 * @param {string} message
 */
export function log(message) {
    if (!logger) {
        logger = new ParamGui({
            name: "log",
            width: "600",
            horizontalShift: 80,
            verticalPosition: "top",
            verticalShift: 40
        }).addLogger();
        logger.container.style.height = "";

    }
    logger.log(message);
}



// attach this handler to resize events
//window.addEventListener("resize", ParamGui.resize, false);
/*
ParamGui.prototype.resize = function() {
    if (this.isRoot() && this.autoPlace) {
        const design = this.design;
        // get the height of the title div
        const titleHeight = this.titleDiv.offsetHeight;
        const maxHeight = document.documentElement.clientHeight - titleHeight - 2 * design.borderWidth - design.verticalShift;
        this.bodyDiv.style.maxHeight = maxHeight + "px";
    }
};
*/
