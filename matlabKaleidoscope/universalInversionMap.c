/*==========================================================
 * universalInversionMap:  
 *     inverts (x,y) at circle with given radius, center at (centerX,centerY), depending on
 *     if (insideOut>0.5) does inversion for all (x,y) inside the circle
 *        else inversion for all points outside
 *
 * universalInversionMap(map,radius,centerX,centerY,insideOut)
 *
 * Input:
 * first the map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 *
 * additional parameters: 
 * radius
 * centerX
 * centerY
 * insideOut
 * 
 * modifies the map, returns nothing if used as a procedure
 * transform(map, ...);
 * does not change the map and returns a modified map if used as  a function
 * newMap = transform(map, ....);
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <complex.h>
#include <tgmath.h>
#include <stdbool.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)
#define INVALID -1000
#define EPS2 1e-6
#define IEPS2 1e6

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int nX, nY, nXnY, nXnY2, index;
    float inverted;
    float *inMap, *outMap;
    float r, phi, radius, radius2, centerX, centerY, insideOut, r2, factor, x, y, dx, dy;
    bool returnsMap = false;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 5) {
        mexErrMsgIdAndTxt("rescaleMap:nrhs","A map input and (scalars) radius centerX, centerY and insideOut required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("rescaleMap:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("rescaleMap:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("rescaleMap:nlhs","Has zero or one return parameter.");
    }
    /* get the map*/
#if MX_HAS_INTERLEAVED_COMPLEX
    inMap = mxGetSingles(prhs[0]);
#else
    inMap = (float *) mxGetPr(prhs[0]);
#endif
    if (nlhs == 0){
        outMap = inMap;
    } else {
        /* create output map*/
        returnsMap = true;
        plhs[0]=mxCreateNumericArray(3, dims, mxSINGLE_CLASS, mxREAL);
#if MX_HAS_INTERLEAVED_COMPLEX
        outMap = mxGetSingles(plhs[0]);
#else
        outMap = (float *) mxGetPr(plhs[0]);
#endif
    }
    radius = (float) mxGetScalar(prhs[1]);
    radius2 = radius * radius;
    centerX = (float) mxGetScalar(prhs[2]);
    centerY = (float) mxGetScalar(prhs[3]);
    insideOut = (float) mxGetScalar(prhs[4]);
 
    /* do the map*/
    /* row first order*/
    nX = dims[1];
    nY = dims[0];
    nXnY = nX * nY;
    nXnY2 = 2 * nXnY;
    
    if (insideOut > 0.5){
    
        for (index = 0; index < nXnY; index++){
            inverted = inMap[index + nXnY2];
            /* do only transform if pixel is valid*/
            if (inverted < -0.1f) {
                if (returnsMap){
                    /* set element only if new output map*/
                    outMap[index] = INVALID;
                    outMap[index + nXnY] = INVALID;
                    outMap[index + nXnY2] = INVALID;      
                }
                continue;
            }
            x = inMap[index];
            y = inMap[index + nXnY];
            dx = x - centerX;
            dy = y - centerY;
            r2 = dx * dx + dy * dy;
            /*  inside -> out*/
            if (r2 < radius2) {
               if (r2 < EPS2){
                   x = centerX + IEPS2;
                   y = centerY + IEPS2;
               }
               else {
                   factor = radius2 / r2;
                   x = centerX + factor * dx;
                   y = centerY + factor * dy;
               }
               inverted= 1 - inverted;
            }        
            outMap[index] = x;
            outMap[index + nXnY] = y;
            outMap[index + nXnY2] = inverted;
        }
    }
    else {
        for (index = 0; index < nXnY; index++){
            inverted = inMap[index + nXnY2];
            /* do only transform if pixel is valid*/
            if (inverted < -0.1f) {
                if (returnsMap){
                    /* set element only if new output map*/
                    outMap[index] = INVALID;
                    outMap[index + nXnY] = INVALID;
                    outMap[index + nXnY2] = INVALID;      
                }
                continue;
            }
            x = inMap[index];
            y = inMap[index + nXnY];
            dx = x - centerX;
            dy = y - centerY;
            r2 = dx * dx + dy * dy;
            /*  outside->in*/
            if (r2 > radius2) {
               factor = radius2 / r2;
               x = centerX + factor * dx;
               y = centerY + factor * dy;
               inverted= 1 - inverted;
            }        
            outMap[index] = x;
            outMap[index + nXnY] = y;
            outMap[index + nXnY2] = inverted;
        }
    }
}