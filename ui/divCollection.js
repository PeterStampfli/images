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
    divCollection.handleZIndex=9;
    // basic z-index for divs, will be augmented by index to displayedIds
    divCollection.divBaseZIndex=10;

    // private things
    const px = "px";
    // collection of divs with controls
    // list of id names (Strings), for (re)sizing
    const ids = [];
    // list of relative widths
    const widths = [];
    // list fo displayed ids, in inverse order of visibility, first is drawn first
   const displayedIds=[];
   
   divCollection.log=function(){
       console.log("all ids");
       console.log(ids);
       console.log("widths");
       console.log(widths);
       console.log("displayed");
       console.log(displayedIds);
   }
   
   // update the z-indices of the divs according to indices
   function updateZIndices(){
       for (var i=0;i<displayedIds;i++){
           DOM.style("#"+displayedIds[i],"zIndex",divCollection.divBaseZIndex+i);
       }
   }
   
   // move element at given index to the end/top to make it full visible/remove
   function moveToTop(index){
    const element=displayedIds[index];
    for (var i=index+1;i<displayedIds.length;i++){
        displayedIds[i-1]=displayedIds[i];
   }
   displayedIds[displayedIds.length-1]=element;
   }
   
   // add an element to the list of displayedIds, if already there, move to top 
   divCollection.display=function(id){
        index=displayedIds.indexOf(id);
        if (index<0){
            displayedIds.push(id);
        }
        else {
            moveToTop(index);
        }
        updateZIndices();
   }
       
   
    
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
        DOM.style("p,h1,table", "margin", divCollection.marginToFontsize * fontsize + px);
        DOM.style("button,input", "borderWidth", divCollection.borderWidthToFontsize * fontsize + px);

        for (var i = 0; i < ids.length; i++) {
            if (widths[i] > 0) {
                DOM.style("#" + ids[i], "width", Math.min(widths[i] * controlWidth, window.innerWidth) + px);
            }
        }
    };   
    
    
    
    // hiding anything
    
    
    
    
    }());


