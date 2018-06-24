/**
 * attaches mouse events to a html element and organizes basic mouse data, prevents default
 * set position fixed of the html element in the beginning, before creating this, 
 * or you have to correct this.elementPositionFixed=true later !!!
 * @constructor MouseEvents
 * @param {String} idName - of the HTML element
 */

/* jshint esversion:6 */

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

    var mouseEvents = this;

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
        event.preventDefault();
        this.lastX = this.x;
        this.lastY = this.y;
        this.x = event.pageX;
        this.y = event.pageY;
        let element = this.element;
        // take into account offset of this element and all containing elements as long as position not fixed
        while (element != null) {
            this.x -= element.offsetLeft;
            this.y -= element.offsetTop;
            if (element.style.position == "fixed") {
                this.x -= window.pageXOffset;
                this.y -= window.pageYOffset;
                break;
            }
            element = element.parentNode;
        }
        this.dx = this.x - this.lastX;
        this.dy = this.y - this.lastY;
        this.wheelDelta = event.deltaY;
    };
}());
