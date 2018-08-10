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
    };

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
            element = element.parentNode;
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
    // switch events off or on, default is on, switching from outside (eg presentation)
    this.isActive = true;
    // the event data
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
    this.upKey = "Z";
    this.downKey = "z";

    // event action - strategy pattern
    this.downAction = function(mouseEvents) {}; // mouse down 
    this.dragAction = function(mouseEvents) {}; // mouse drag (move with button pressed)
    this.moveAction = function(mouseEvents) {}; // mouse move (move with button released)
    this.upAction = function(mouseEvents) {}; // mouse up
    this.outAction = function(mouseEvents) {}; // mouse out (leave)
    this.wheelAction = function(mouseEvents) {}; // mouse wheel or keyboard keys

    var mouseEvents = this; // hook to this for callback functions

    // we have only one single mouse event
    // so it is not necessary to use this.element.addEventListener("...",script)

    this.element.onmousedown = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.isActive) {
            mouseEvents.update(event);
            mouseEvents.pressed = true;
            mouseEvents.downAction(mouseEvents);
        }
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
    };

    this.element.onmouseenter = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.isActive) {
            mouseEvents.mouseInside = true;
        }
    };

    this.element.onmouseleave = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.isActive) {
            mouseEvents.update(event);
            mouseEvents.mouseInside = false;
            if (mouseEvents.pressed) {
                mouseEvents.pressed = false;
                mouseEvents.outAction(mouseEvents);
            }
        }
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
    };

    this.element.onwheel = function(event) {
        MouseAndTouch.preventDefault(event);
        if (mouseEvents.isActive) {
            mouseEvents.update(event);
            mouseEvents.wheelAction(mouseEvents);
        }
    };

    // using keys for wheel actions
    KeyboardEvents.addKeydownListener(this);

    this.keydown = function(key) {
        if (mouseEvents.isActive) {
            if (mouseEvents.mouseInside) {
                if (key == mouseEvents.upKey) {
                    mouseEvents.wheelDelta = 1;
                    mouseEvents.wheelAction(mouseEvents);
                } else if (key == mouseEvents.downKey) {
                    mouseEvents.wheelDelta = -1;
                    mouseEvents.wheelAction(mouseEvents);
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
        this.lastX = this.x;
        this.lastY = this.y;
        [this.x, this.y] = MouseAndTouch.relativePosition(event, this.element);
        this.dx = this.x - this.lastX;
        this.dy = this.y - this.lastY;
        this.wheelDelta = event.deltaY;
    };
}());
