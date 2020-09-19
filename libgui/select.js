/* jshint esversion: 6 */

/**
 * selecting a choice of names, use the corresponding index for further work
 * @constructor Select
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Button,
    guiUtils
} from "./modules.js";

export function Select(parent) {
    this.element = document.createElement("select");
    guiUtils.style(this.element)
        .verticalAlign("middle")
        .cursor("pointer")
        .parent(parent);
    this.hover = false;
    this.active = true;
    this.colorStyleDefaults();
    this.updateStyle();
    this.nOptions = 0;

    var select = this;

    /**
     * action upon change, strategy pattern
     * @method Select#onChange
     */
    this.onChange = function() {
        console.log("onChange " + select.getIndex());
    };

    /**
     * action upon start of user interaction
     * @method Select#uponInteraction (open popup, close others)
     */
    this.onInteraction = function() {
        console.log("onInteraction");
    };

    /**
     * action upon change
     */
    this.element.onchange = function() {
        select.onChange();
    };

    // hovering
    this.element.onmouseenter = function() {
        if (select.active) {
            select.hover = true;
            select.element.focus(); // to be able to use mousewheel
            select.updateStyle();
        }
    };

    this.element.onmouseleave = function() {
        if (select.active) {
            select.hover = false;
            select.updateStyle();
        }
    };

    function interaction() {
        if (select.active) {
            select.onInteraction();
        }
    }

    this.element.addEventListener("mousedown", interaction, false);

    this.element.addEventListener("keydown", interaction, false);

    this.removeEvents = function() {
        this.element.removeEventListener("mousedown", interaction, false);
        this.element.removeEventListener("keydown", interaction, false);
    };

    // no wheel scrolling as this interferes with scrolling through a large UI
}

/**
 * update the color style of the element depending on whether its pressed or hovered
 * always call if states change, use for other buttons too
 * @method Select#updateStyle
 */
Select.prototype.updateStyle = function() {
    if (this.active) {
        if (this.hover) {
            guiUtils.style(this.element)
                .color(this.colorUpHover)
                .backgroundColor(this.backgroundColorUpHover);
        } else {
            guiUtils.style(this.element)
                .color(this.colorUp)
                .backgroundColor(this.backgroundColorUp);
        }
    } else {
        guiUtils.style(this.element)
            .color(this.colorInactive)
            .backgroundColor(this.backgroundColorInactive);
    }
};

/**
 * setup the color styles defaults, use for other buttons too
 * @method Select#colorStyleDefaults
 */
Select.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

/**
 * set fontsize of the button, in px
 * @method Select#setFontSize
 * @param {integer} size
 */
Select.prototype.setFontSize = function(size) {
    this.element.style.fontSize = size + "px";
};

/**
 * set if button is active
 * @method Select#setActive
 * @param {boolean} on
 */
Select.prototype.setActive = Button.prototype.setActive;

/**
 * add options from simple variables, arrays (final elements are simple), objects (takes the keys)
 * @method Select#addOption
 * @param {... String|number|Array|object} names
 */
Select.prototype.addOptions = function(names) {
    const length = arguments.length;
    if (length === 1) {
        if (Array.isArray(names)) {
            names.forEach(name => this.addOptions(name));
        } else if (typeof names === "object") {
            this.addOptions(Object.keys(names));
        } else {
            // here we have a simple value (number, string, boolean), make it an option
            const option = document.createElement("option");
            option.textContent = "" + names;
            this.element.appendChild(option);
            this.nOptions++;
        }
    } else {
        for (var i = 0; i < length; i++) {
            this.addOptions(arguments[i]);
        }
    }
};

/**
 * clear all options, leaving empty select
 * @method Select#clear
 */
Select.prototype.clear = function() {
    this.nOptions = 0;
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }
};

/**
 * get the index, returns -1 if empty
 * @method Select#getIndex
 * @return integer, the selected index
 */
Select.prototype.getIndex = function() {
    const result = this.element.selectedIndex;
    return result;
};

/**
 * set the selected index, limited to the actual range
 * does NOT call onChange
 * @method Select#setIndex
 * @param {int} index
 */
Select.prototype.setIndex = function(index) {
    index = Math.max(0, Math.min(this.nOptions - 1, index));
    this.element.selectedIndex = index;
};

/**
 * change the (selected) index, restricted to lenght of this.names
 * call onChange only if changes
 * @method Select#changeIndex
 * @param {integer} delta
 */
Select.prototype.changeIndex = function(delta) {
    const lastIndex = this.getIndex();
    this.setIndex(this.getIndex() + delta, true);
    if (lastIndex !== this.getIndex()) {
        this.onChange();
    }
};

/**
 * open the select
 * @method Select#open
 */
Select.prototype.open = function() {
    guiUtils.displayInlineBlock(this.element);
};

/**
 * close the select
 * @method Select#close
 */
Select.prototype.close = function() {
    guiUtils.displayNone(this.element);
};

/**
 * destroy the select thing, taking care of all references, deletes the associated html element
 * may be too careful
 * set reference to the select to null
 * @method NumberButton#destroy
 */
Select.prototype.destroy = function() {
    this.element.onchange = null;
    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.onwheel = null;
    this.removeEvents();
    this.element.remove();
    this.element = null;
    this.onChange = null;
    this.onInteraction = null;
};