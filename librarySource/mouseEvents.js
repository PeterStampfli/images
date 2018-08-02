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

    /**
     * get the position of an event relative to upper left corner of an element
     * @method MouseAndTouch.relativePosition
     * @param {Event} event
     * @param {Element} element
     */
    MouseAndTouch.relativePosition = function(event, element) {
        let x = event.pageX;
        let y = event.pageY;
        // take into account offset of this element and all containing elements as long as position not fixed
        while (element != null) {
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
 * set position fixed of the html element in the beginning, before creating this, 
 * or you have to correct this.elementPositionFixed=true later !!!
 * @constructor MouseEvents
 * @param {String} idName - of the HTML element
 */


function MouseEvents(idName) {
    this.element = document.getElementById(idName);
    this.elementPositionFixed = (this.element.style.position == "fixed");
    // switch events off or on
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

    // do nothing function as default
    var doNothing = function(mouseEvents) {};

    this.downAction = doNothing; // mouse down 
    this.dragAction = doNothing; // mouse drag (move with button pressed)
    this.moveAction = doNothing; // mouse move (move with button released)
    this.upAction = doNothing; // mouse up
    this.outAction = doNothing; // mouse out (leave)
    this.wheelAction = doNothing; // mouse wheel or keyboard keys

    var mouseEvents = this;       // hook to this for callback functions

    // we have only one single mouse event
    // so it is not necessary to use this.element.addEventListener("...",script)

    this.element.onmousedown = function(event) {
        if (mouseEvents.isActive) {
            mouseEvents.update(event);
            mouseEvents.pressed = true;
            mouseEvents.downAction(mouseEvents);
        }
    };

    this.element.onmouseup = function(event) {
        if (mouseEvents.isActive) {
            mouseEvents.update(event);
            if (mouseEvents.pressed) {
                mouseEvents.pressed = false;
                mouseEvents.upAction(mouseEvents);
            }
        }
    };

    this.element.onmouseenter = function(event) {
        if (mouseEvents.isActive) {
            mouseEvents.mouseInside = true;
        }
    };

    this.element.onmouseleave = function(event) {
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
     * read the mouse position relative to element, calculate changes, update data, prevent defaut (scroll)
     * for fixed elements subtract scroll
     * @method MouseEvents#update
     * @param {Event} event - object, containing event data
     */
    MouseEvents.prototype.update = function(event) {
        MouseAndTouch.preventDefault(event);
        this.lastX = this.x;
        this.lastY = this.y;
        [this.x, this.y] = MouseAndTouch.relativePosition(event, this.element);
        this.dx = this.x - this.lastX;
        this.dy = this.y - this.lastY;
        this.wheelDelta = event.deltaY;
    };
}());
