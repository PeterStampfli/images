/**
 * attaches mouse events to a html element and organizes basic mouse data
 * @constructor MouseEvents
 * @param {String} idName - of the HTML element
 */

/* jshint esversion:6 */

function MouseEvents(idName) {
    this.element = document.getElementById(idName);
    // the event data
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.dx = 0;
    this.dy = 0;
    this.pressed = false;
    this.wheelDelta = 0;
    // event action - strategy pattern

    // do nothing function as default
    var doNothing = function(mouseEvents) {};

    this.downAction = doNothing;
    this.moveAction = doNothing;
    this.upAction = doNothing;
    this.outAction = doNothing;
    this.wheelAction = doNothing;

    var mouseEvents = this;

    this.element.onmousedown = function(event) {
        mouseEvents.update(event);
        mouseEvents.pressed = true;
        mouseEvents.downAction(mouseEvents);
    };

    this.element.onmouseup = function(event) {
        mouseEvents.update(event);
        if (mouseEvents.pressed) {
            mouseEvents.pressed = false;
            mouseEvents.upAction(mouseEvents);
        }
    };

    this.element.onmouseleave = function(event) {
        mouseEvents.update(event);
        if (mouseEvents.pressed) {
            mouseEvents.pressed = false;
            mouseEvents.outAction(mouseEvents);
        }
    };

    this.element.onmousemove = function(event) {
        mouseEvents.update(event);
        if (mouseEvents.pressed) {
            mouseEvents.moveAction(mouseEvents);
        }
    };

    this.element.onwheel = function(event) {
        mouseEvents.update(event);
        mouseEvents.wheelAction(mouseEvents);
    };
}


(function() {
    "use strict";

    /**
     * read the mouse position relative to element, calculate changes, update data
     * @method MouseEvents#update
     * @param {Event} event - object, containing event data
     */
    MouseEvents.prototype.update = function(event) {
        this.lastX = this.x;
        this.lastY = this.y;
        this.x = event.pageX - this.element.offsetLeft;
        this.y = event.pageY - this.element.offsetTop;
        this.dx = this.x - this.lastX;
        this.dy = this.y - this.lastY;
        this.wheelDelta = event.deltaY;
    };
}());
