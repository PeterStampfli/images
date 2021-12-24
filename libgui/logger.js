/**
 * showing messages in a container div
 * typically use the function log() that creates a logger and logs
 * @constructor Logger
 * @param {ParamGui} gui - there the logger is
 * @param {dom element} container - a div
 */

import {
    ParamGui,
    guiUtils
}
from "./modules.js";

export function Logger(gui, container) {
    this.container = container;
    gui.elements.push(this);
    const logger = this;
    this.clearButton = gui.add({
        type: "button",
        buttonText: "clear the log",
        onClick: function() {
            logger.clear();
        }
    });
    this.clearButton.domElement.style.textAlign = "center";
    this.clearButton.deleteLabel();
}

// spacing between messages in px
Logger.spacing = 5;

/**
 * add a log message as a <p>
 * @method Logger#log
 * @param {string} message - may include html
 */
Logger.prototype.log = function(message='') {
    const paragraph = document.createElement("p");
    paragraph.innerHTML = message;
    if (this.container.firstChild) {
        paragraph.style.marginTop = Logger.spacing + "px";
    } else {
        paragraph.style.marginTop = "0px";
    }
    paragraph.style.marginBottom = "0px";
    this.container.appendChild(paragraph);
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
    const container = this.container;
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

/**
 * destroy the logger, remove container element
 * @method Logger#destroy
 */
Logger.prototype.destroy = function() {
    this.clear();
    this.clearButton.destroy();
    this.container.remove();
};

/**
 * log messages/create logger
 * first message creates the logger in its own gui
 * @function log
 * @param {string} message - text to add, no message clears the log
 */
let logger = false;

export function log(message) {
    if (!logger) {
        logger = new ParamGui({
            name: "log",
            width: "600",
            horizontalShift: 80,
            verticalPosition: "top",
            verticalShift: 40,
            closed:false
        }).addLogger();
        logger.container.style.height = "";
    }
    if (arguments.length===0){
        logger.clear();
    } else {
    logger.log(message);
}
}