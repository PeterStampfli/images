/* jshint esversion: 6 */

/**
 * find radius and center of view
 * either equator of sphere: three view circles are great circles
 * or boundary of poincare disc: three view circles interssect perpendicularly
 * @method view#findCenter
 * @param {boolean} elliptic - with x- and y fields
 * @return boolean, true if ok, false if fail
 */
View.setupThreeCircles = function(elliptic) {
    const center1X = view.circle1.centerX;
    const center1Y = view.circle1.centerY;
    const delta1 = center1X * center1X + center1Y * center1Y -view.circle1.radius2;
    const center2X = view.circle2.centerX;
    const center2Y = view.circle2.centerY;
    const delta2 = center2X * center2X + center2Y * center2Y -view.circle2.radius2;
    const center3X = view.circle3.centerX;
    const center3Y = view.circle3.centerY;
    const delta3 = center3X * center3X + center3Y * center3Y -view.circle3.radius2;
    const center1To2X = center2X - center1X;
    const center1To2Y = center2Y - center1Y;
    const center1To3X = center3X - center1X;
    const center1To3Y = center3Y - center1Y;
    // the system of linear equations for the center of this circle
    const denom = center1To2X * center1To3Y - center1To3X * center1To2Y;
    if (Math.abs(denom) < 0.001 * (Math.abs(center1To2X * center1To3Y) + Math.abs(center1To3X * center1To2Y))) {
        // nearly colinear, fail
        return false;
    }
    view.centerX=0.5*((delta2-delta1)*center1To3Y-(delta3-delta1)*center1To2Y)/denom;
    view.centerY=0.5*((delta3-delta1)*center1To2X-(delta2-delta1)*center1To3X)/denom;
    // use smallest circle for precision
    let r2=0;
    if ((view.circle1<view.circle2)&&(view.circle1<view.circle3)){
r2=(view.centerX-center1X)*(view.centerX-center1X)+(view.centerY-center1Y)*(view.centerY-center1Y)-view.circle1.radius2;

    }else     if ((view.circle2<view.circle3)){
r2=(view.centerX-center2X)*(view.centerX-center2X)+(view.centerY-center2Y)*(view.centerY-center2Y)-view.circle2.radius2;
    }
    else {
r2=(view.centerX-center3X)*(view.centerX-center3X)+(view.centerY-center3Y)*(view.centerY-center3Y)-view.circle3.radius2;

    }
    if (elliptic){
        r2=-r2;
    }
    if (r2>0){
view.radius=Math.sqrt(r2);
return true;
    }
    else {
        return false;
    }

    

};