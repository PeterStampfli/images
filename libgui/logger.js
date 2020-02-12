/**
 * showing messages in a parent div
 * @constructor Logger
 * @param {dom element} parent - a div
 */

import {
    guiUtils
}
from "./modules.js";

export function Logger(parent) {
    this.parent = parent;
    this.ps = []; // each message as a <p>
}

// spacing between messages in px
Logger.spacing = 5;

/**
 * add a log message as a <p>
 * @method Logger#log
 * @param {string} message - may include html
 */
Logger.prototype.log = function(message) {
    const mp = document.createElement("p");
    mp.innerHTML = message;
    if (this.ps.length > 0) {
        mp.style.marginTop = Logger.spacing + "px";
    } else {
        mp.style.marginTop = "0px";
    }
    mp.style.marginBottom = "0px";
    this.parent.appendChild(mp);
    this.ps.push(mp);
};

/**
 * register parent domElement in guiUtils for styling
 * see docu of guiUtils.style
 * use: logger.style().backgroundColor("red")
 * @method Logger#style
 * @return guiUtils
 */
Logger.prototype.style = function() {
    return guiUtils.style(this.parent);
};

/**
 * clear the log
 * @method Logger#clear
 */
Logger.prototype.clear = function() {
    this.ps.forEach(p => p.remove());
    this.ps.length = 0;
};

/**
 * destroy the logger, remove parent element
 * @method Logger#destroy
 */
Logger.prototype.destroy = function() {
    this.clear();
    this.parent.remove();
};


/*
 * a prefab logger that replaces part of the console
 * in its own gui at the bottom left
 */
//let logger = false;



/**
 * log something
 * first message creates the logger
 * @method ParamGui.log
 * @param {string} message
 */
 /*
ParamGui.log = function(message) {
    console.log(message)
    if (!logger) {
        logger = new ParamGui({
            name: "log",
            width: "600",
            horizontalPosition: "left",
            loggerHeight: 300
        }).addLogger();
    }

    console.log(logger)
    logger.log(message);
};
*/