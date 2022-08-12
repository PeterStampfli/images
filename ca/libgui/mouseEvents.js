/* jshint esversion: 6 */

import {
    keyboard
}
from "./modules.js";

/**
 * common to mouse and touch events
 * @namespace MouseAndTouch
 */

export const MouseAndTouch = {};

/**
 * prevent defaults (and bubbling ??)
 * @method MouseAndTouch.preventDefault
 * @param {Event} event
 */
MouseAndTouch.preventDefault = function(event) {
    event.preventDefault();
    event.stopPropagation();
};

// search for parent nodes until we get at the "body" node
var body = document.getElementsByTagName("body")[0];

/**
 * get the position of an event relative to upper left corner of an element
 * @method MouseAndTouch.relativePosition
 * @param {Event} event or other objec with pageX and pageY data
 * @param {Element} element
 */
MouseAndTouch.relativePosition = function(event, element) {
    console.error('use "event.offsetX,event.offsetY" instead of MouseAndTouch.relativePosition');
    return [event.offsetX, event.offsetY];
};

/**
 * attaches mouse events to a html element and organizes basic mouse data, prevents default
 * @constructor MouseEvents
 * @param {domElement} element - an HTML element
 */

export function MouseEvents(element) {
    this.element = element;
    // element is ususually a div or canvas (initially cannot have focus)
    // make that it can have focus
    this.element.setAttribute("tabindex", "1");
    // no special "focus border"
    this.element.style.outlineStyle = "none";
    // switch events off or on, default is on, switching from outside (eg presentation)
    this.active = true;
    // the event data
    // event.button=0 for left 2 for right button
    this.button = -1;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.dx = 0;
    this.dy = 0;
    this.pressed = false;
    this.mouseInside = false;
    this.wheelDelta = 0;
    // keys for wheel action, defaults, Z zooms in, z zooms out
    this.upKey = "ArrowUp";
    this.downKey = "ArrowDown";

    // event action
    this.inAction = function(mouseEvents) {}; // mouse in (enter)
    this.moveAction = function(mouseEvents) {}; // mouse move (move with button released)
    this.downAction = function(mouseEvents) {}; // mouse down 
    this.dragAction = function(mouseEvents) {}; // mouse drag (move with button pressed)
    this.upAction = function(mouseEvents) {}; // mouse up
    this.outAction = function(mouseEvents) {}; // mouse out (leave)
    this.wheelAction = function(mouseEvents) {}; // mouse wheel or keyboard keys

    var mouseEvents = this; // hook to this for callback functions
    const thisElement = this.element;

    // we have only one single mouse event
    // so it is not necessary to use this.element.addEventListener("...",script)
    // event.button=0 for left 2 for right button

    this.element.onmousedown = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.active) {
            mouseEvents.button = event.button; // left or right button
            mouseEvents.update(event);
            mouseEvents.updateShiftCtrl();
            mouseEvents.pressed = true;
            thisElement.focus();
            mouseEvents.downAction(mouseEvents);
        }
        return false;
    };

    this.element.onmouseup = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.active) {
            mouseEvents.update(event);
            mouseEvents.updateShiftCtrl();
            if (mouseEvents.pressed) {
                mouseEvents.pressed = false;
                mouseEvents.upAction(mouseEvents);
            }
        }
        return false;
    };

    this.element.onmouseenter = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.active) {
            this.x = event.offsetX;
            this.y = event.offsetY;
            this.dx = 0;
            this.dy = 0;
            this.lastX = this.x;
            this.lastY = this.y;
            mouseEvents.mouseInside = true;
            thisElement.focus();
            mouseEvents.inAction(mouseEvents);
        }
        return false;
    };

    this.element.onmouseleave = function(event) {
        MouseAndTouch.preventDefault(event);
        thisElement.blur();
        if (mouseEvents.active) {
            mouseEvents.update(event);
            mouseEvents.updateShiftCtrl();
            mouseEvents.mouseInside = false;
            mouseEvents.pressed = false;
            mouseEvents.outAction(mouseEvents); // out action even if no mouse button pressed
        }
        return false;
    };

    this.element.onmousemove = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.active) {
            mouseEvents.update(event);
            mouseEvents.updateShiftCtrl();
            if (mouseEvents.pressed) {
                mouseEvents.dragAction(mouseEvents);
            } else {
                mouseEvents.moveAction(mouseEvents);
            }
        }
        return false;
    };

    // be careful not to interfere with ui scrolling

    this.onWheelHandler = function(event) {
        if (mouseEvents.active) {
            mouseEvents.update(event);
            mouseEvents.updateShiftCtrl();
            if (!mouseEvents.wheelAction(mouseEvents)) {
                MouseAndTouch.preventDefault(event);
            }
        }
        return false;
    };
    this.element.onwheel = this.onWheelHandler;

    // keys for wheel actions
    // requires that element can have focus
    // to make that canvas can have focus use
    //    this.canvas.setAttribute("tabindex","1")
    // to have no border if is in focus use:
    //      this.canvas.style.outlineStyle="none";

    this.element.onkeydown = function(event) {
        let key = event.key;
        if (mouseEvents.active) {
            if (mouseEvents.mouseInside) {
                mouseEvents.updateShiftCtrl();
                if (key == mouseEvents.upKey) {
                    mouseEvents.wheelDelta = -1;
                    if (!mouseEvents.wheelAction(mouseEvents)) {
                        MouseAndTouch.preventDefault(event);
                    }
                } else if (key == mouseEvents.downKey) {
                    mouseEvents.wheelDelta = 1;
                    if (!mouseEvents.wheelAction(mouseEvents)) {
                        MouseAndTouch.preventDefault(event);
                    }
                }
            }
        }
    };
}

/**
 * switch mouse events on or off 
 * @method MouseEvents.setIsActive
 * @param {boolean} on - if false there will be no mouse events
 */
MouseEvents.prototype.setIsActive = function(on) {
    this.active = on;
};

/**
 * set pressed===false
 * @method MouseEvents.setPressedFalse
 */
MouseEvents.prototype.setPressedFalse = function() {
    this.pressed = false;
};

/**
 * read the mouse position relative to element, calculate changes, update data, prevent defaut (scroll)
 * for fixed elements subtract scroll
 * @method MouseEvents#update
 * @param {Event} event - object, containing event data
 */
MouseEvents.prototype.update = function(event) {
    this.button = event.button;
    this.x = event.offsetX;
    this.y = event.offsetY;
    this.dx = this.x - this.lastX;
    this.dy = this.y - this.lastY;
    this.lastX = this.x;
    this.lastY = this.y;
    this.wheelDelta = event.deltaY;
};

/**
 * update the event.shiftPressed and event.ctrlPressed fields
 * @method MouseEvents.updateShiftCtrl
 */
MouseEvents.prototype.updateShiftCtrl = function() {
    this.shiftPressed = keyboard.shiftPressed;
    this.ctrlPressed = keyboard.ctrlPressed;
};

/**
 * destroy the mouse events, taking care of all references
 * maybe too careful
 * @method MouseEvents#destroy
 */
MouseEvents.prototype.destroy = function() {
    this.element.onmousedown = null;
    this.element.onmouseup = null;
    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.onmousemove = null;
    this.element.onwheel = null;
    this.element.onkeydown = null;
    this.inAction = null;
    this.downAction = null;
    this.dragAction = null;
    this.moveAction = null;
    this.upAction = null;
    this.outAction = null;
    this.wheelAction = null;
};