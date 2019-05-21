/**
 * layout/managing multiple control  divs in the html main page
 * 
 * @namespace divCollection
 */

/* jshint esversion:6 */

const divCollection = {};

(function() {
    "use strict";

    // design parameters with default values
    // you can change the values, best at startup in window.onload (?)

    divCollection.backgroundColor = "#eeeeee";
    // fontsize as a fraction of smaller window dimension
    divCollection.fontsizeToWindow = 0.025;
    // width of basic control panel as multiple of font size
    divCollection.controlWidthToFontsize = 20;
    // width of the top navigation button as a multiple of basic control panel size
    divCollection.navButtonWidthToControlWidth = 0.75;
    // h1 titel font size is larger 
    divCollection.relativeH1Fontsize = 1.0;
    // relative size of margins
    divCollection.marginToFontsize = 0.5;
    // weight of button borders
    divCollection.borderWidthToFontsize = 0.15;
    // z-index for handles
    divCollection.handleZIndex = 9;
    // basic z-index for divs, will be augmented by index to displayed
    divCollection.divBaseZIndex = 10;

    // private things
    const px = "px";
    // collection of divs with controls
    // list of id names (Strings)of the divs, for (re)sizing
    const divIds = [];
    // list of id names (Strings) of the handles, for (re)sizing
    const handleIds = [];
    // list of relative widths
    const widths = [];
    // list for display divs, indices to the list, in inverse order of visibility, first is drawn first
    const displayed = [];

    divCollection.log = function() {
        console.log("all div ids");
        console.log(divIds);
        console.log("all widths");
        console.log(widths);
        console.log("all handle ids");
        console.log(handleIds);
        console.log("displayed");
        console.log(displayed);
    };

    // update the z-indices of the divs according to indices
    function updateZIndices() {
        for (var i = 0; i < displayed.length; i++) {
            DOM.style("#" + divIds[displayed[i]], "zIndex", divCollection.divBaseZIndex + i + "");
        }
    }

    // move element at given index to the end/top to make it full visible/remove
    function moveToTop(index) {
        const element = displayed[index];
        for (var i = index + 1; i < displayed.length; i++) {
            displayed[i - 1] = displayed[i];
        }
        displayed[displayed.length - 1] = element;
    }

    // add an element to the list of displayed, if already there, move to top 
    divCollection.show = function(id) {
        const indexOfId = divIds.indexOf(id); // find index to the id
        if (indexOfId >= 0) {
            const index = displayed.indexOf(indexOfId);
            if (index < 0) { // previously hidden
                DOM.style("#" + id, "display", "block");
                displayed.push(indexOfId);
            } else {
                moveToTop(index);
            }
            updateZIndices();
        }
    };

    // hide the element at the top of the list
    divCollection.hideTop = function() {
        const indexOfId = displayed.pop();
        DOM.style("#" + divIds[indexOfId], "display", "none");
        console.log("hiding " + divIds[indexOfId]);
        updateZIndices();
    };

    // hide an element/ make it invisible
    divCollection.hide = function(id) {
        let indexOfId = divIds.indexOf(id); // find index to the id
        console.log("index to id " + indexOfId);
        if (indexOfId >= 0) {
            const index = displayed.indexOf(indexOfId);
            if (index >= 0) {
                console.log(index);
                moveToTop(index);
                divCollection.hideTop();
                console.log(displayed);
            }
        }
    };

    // add a hide button to the top of the div 
    // return id of button
    function createHideButton(divId) {
        const hideButtonId = divId + "hideButtonAtTop";
        DOM.create("button", hideButtonId, "body", "hide");
        DOM.style("#" + hideButtonId, "float", "right");
        DOM.class("#" + hideButtonId, "hasMargin");
        const hideButton = new Button(hideButtonId);
        hideButton.onClick = function() {
            console.log("hidebutton");
            divCollection.hide(divId);
        };
        return hideButtonId;
    }

    divCollection.hideButtonAtTop = function(divId) {
        const hideButtonId = createHideButton(divId);
        const theDiv = document.getElementById(divId);
        theDiv.insertBefore(document.getElementById(hideButtonId), theDiv.firstChild);
    };

    divCollection.hideButtonAtBottom = function(divId) {
        const hideButtonId = createHideButton(divId);
        const theDiv = document.getElementById(divId);
        theDiv.insertBefore(document.getElementById(hideButtonId), null);
    };


    /**
     * register a div ( for setting dimensions) and apply basic styles, hide
     */
    divCollection.register = function(divId, width = 1, handleId = "") {
        if (DOM.idExists(divId)) {
            divIds.push(divId);
            widths.push(width);
            handleIds.push(handleId);
            DOM.style("#" + divId, "maxHeight", window.innerHeight + px);
            DOM.style("#" + divId, "overflow", "auto", "display", "none");
            DOM.style("#" + divId, "backgroundColor", divCollection.backgroundColor);
            // make the div go to top if clicked, and visible !
            const element = document.getElementById(divId);
            element.onclick = function() {
                console.log("element on click " + divId);
                let indexOfId = divIds.indexOf(divId); // find index to the id
                console.log("index to id " + indexOfId);
                if (indexOfId >= 0) {
                    const index = displayed.indexOf(indexOfId);
                    if (index >= 0) {
                        divCollection.show(divId);
                    }
                }
            };
        } else {
            console.log("**** divCollection.register: no element with id " + divId);
        }
    };


    // setting dimensions, call in startup and resize

    divCollection.setDimensions = function() {
        // set the font size, depending on the window height 
        // trying to fit controls to window without vertical scrolling
        const fontsize = divCollection.fontsizeToWindow * window.innerHeight;
        // beware of too narrow portrait format
        // the lines in controls should be short
        // prevents horizontal scrolling
        // worst case might cause vertical scrolling
        const controlWidth = Math.min(divCollection.controlWidthToFontsize * fontsize, window.innerWidth);
        DOM.style("h1", "fontSize", divCollection.relativeH1Fontsize * fontsize + px);
        DOM.style("p,button,input,table,select", "fontSize", fontsize + px);
        // class "hasMargin" for buttons ... with margin
        DOM.style("p,h1,table,.hasMargin", "margin", divCollection.marginToFontsize * fontsize + px);
        DOM.style("button,input", "borderWidth", divCollection.borderWidthToFontsize * fontsize + px);

        for (var i = 0; i < divIds.length; i++) {
            if (widths[i] > 0) {
                DOM.style("#" + divIds[i], "width", Math.min(widths[i] * controlWidth, window.innerWidth) + px);
            }
        }
    };


    // keyboard event to hide top div 
    divCollection.addHideKey = function(key) {
        KeyboardEvents.addFunction(function() {
            divCollection.hideTop();
        }, key);
    };




}());
