/**
 * common to mouse and touch events
 * @namespace MouseAndTouch
 */

/* jshint esversion:6 */

var MouseAndTouch = {};

(function() {
    "use strict";
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
        let x = event.pageX;
        let y = event.pageY;
        // take into account offset of this element and all containing elements as long as position not fixed
        while (element != body) {
            x -= element.offsetLeft;
            y -= element.offsetTop;
            if (element.style.position == "fixed") {
                x -= window.pageXOffset;
                y -= window.pageYOffset;
                break;
            }
            element = element.offsetParent; // important: does not double count offsets
        }
        return [x, y];
    };

}());

/**
 * attaches mouse events to a html element and organizes basic mouse data, prevents default
 * @constructor MouseEvents
 * @param {String} idName - of the HTML element
 */

function MouseEvents(idName) {
    this.element = document.getElementById(idName);
    // element is ususually a div or canvas (initially cannot have focus)
    // make that it can have focus
    this.element.setAttribute("tabindex", "1");
    // no special "focus border"
    this.element.style.outlineStyle = "none";
    // switch events off or on, default is on, switching from outside (eg presentation)
    this.isActive = true;
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

    // event action - strategy pattern
    this.downAction = function(mouseEvents) {}; // mouse down 
    this.dragAction = function(mouseEvents) {}; // mouse drag (move with button pressed)
    this.moveAction = function(mouseEvents) {}; // mouse move (move with button released)
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
        if (mouseEvents.isActive) {
            mouseEvents.button = event.button; // left or right button
            mouseEvents.update(event);
            mouseEvents.pressed = true;
            thisElement.focus();
            mouseEvents.downAction(mouseEvents);
        }
        return false;
    };

    this.element.onmouseup = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.isActive) {
            mouseEvents.update(event);
            if (mouseEvents.pressed) {
                mouseEvents.pressed = false;
                mouseEvents.upAction(mouseEvents);
            }
        }
        return false;
    };

    this.element.onmouseenter = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.isActive) {
            mouseEvents.mouseInside = true;
            thisElement.focus();
        }
        return false;
    };

    this.element.onmouseleave = function(event) {
        MouseAndTouch.preventDefault(event);
        thisElement.blur();
        if (mouseEvents.isActive) {
            mouseEvents.update(event);
            mouseEvents.mouseInside = false;
            if (mouseEvents.pressed) {
                mouseEvents.pressed = false;
                mouseEvents.outAction(mouseEvents);
            }
        }
        return false;
    };

    this.element.onmousemove = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.isActive) {
            mouseEvents.update(event);
            if (mouseEvents.pressed) {
                mouseEvents.dragAction(mouseEvents);
            } else {
                mouseEvents.moveAction(mouseEvents);
            }
        }
        return false;
    };

    this.element.onwheel = function(event) {
        if (mouseEvents.isActive) {
            mouseEvents.update(event);
            if (!mouseEvents.wheelAction(mouseEvents)) {
                MouseAndTouch.preventDefault(event);
            }

        }
        return false;
    };

    // keys for wheel actions
    // requires that element can have focus
    // to make that canvas can have focus use
    //    this.canvas.setAttribute("tabindex","1")
    // to have no border if is in focus use:
    //      this.canvas.style.outlineStyle="none";

    this.element.onkeydown = function(event) {
        let key = event.key;
        if (mouseEvents.isActive) {
            if (mouseEvents.mouseInside) {
                if (key == mouseEvents.upKey) {
                    mouseEvents.wheelDelta = 1;
                    if (!mouseEvents.wheelAction(mouseEvents)) {
                        MouseAndTouch.preventDefault(event);
                    }
                } else if (key == mouseEvents.downKey) {
                    mouseEvents.wheelDelta = -1;
                    if (!mouseEvents.wheelAction(mouseEvents)) {
                        MouseAndTouch.preventDefault(event);
                    }
                }
            }
        }
    };
}

(function() {
    "use strict";

    /**
     * switch mouse events on or off 
     * @method MouseEvents.setIsActive
     * @param {boolean} on - if false there will be no mouse events
     */
    MouseEvents.prototype.setIsActive = function(on) {
        this.isActive = on;
    };

    /**
     * read the mouse position relative to element, calculate changes, update data, prevent defaut (scroll)
     * for fixed elements subtract scroll
     * @method MouseEvents#update
     * @param {Event} event - object, containing event data
     */
    MouseEvents.prototype.update = function(event) {
        this.button = event.button;
        this.lastX = this.x;
        this.lastY = this.y;
        [this.x, this.y] = MouseAndTouch.relativePosition(event, this.element);
        this.dx = this.x - this.lastX;
        this.dy = this.y - this.lastY;
        this.wheelDelta = event.deltaY;
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
        this.downAction = null;
        this.dragAction = null;
        this.moveAction = null;
        this.upAction = null;
        this.outAction = null;
        this.wheelAction = null;
    };

}());
