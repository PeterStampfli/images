/**
 * showing messages in a container div
 * @constructor Logger
 * @param {dom element} container - a div
 */

import {
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