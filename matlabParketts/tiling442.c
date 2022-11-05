/*==========================================================
 * tiling442: Makes that the points of map lie inside x=0...size and y=0...size
 * using vertical and horizontal mirroring at x=0, x=width, y=0, y=height
 * and mirror at x=y
 *
 * simulates a kaleiddoscope with *442 orbifold
 *
 * Input:
 * first the map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 *
 * additional parameter:size
 *      simulates mirrors at x=0, x=size,y=0,y=size and x=y   
 *
 * modifies the map, returns nothing if used as a procedure
 * tiling442(map, size);
 * does not change the map and returns a modified map if used as  a function
 * newMap = tiling442(map, size);
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

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int nX, nY, nXnY, nXnY2, index;
    float inverted;
    float *inMap, *outMap;
    float r, phi, width, height, width2, height2, x, y, h;
    bool returnsMap = false;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 2) {
        mexErrMsgIdAndTxt("442Map:nrhs","A map input and (scalar) size required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("mirrorsMap:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("mirrorsMap:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("mirrorsMap:nlhs","Has zero or one return parameter.");
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
    width = (float) mxGetScalar(prhs[1]);
    height = width;
    width2 = 2 * width;
    height2 = 2 * height;
    
    /* do the map*/
    /* row first order*/
    nX = dims[1];
    nY = dims[0];
    nXnY = nX * nY;
    nXnY2 = 2 * nXnY;
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
        if (x < 0) {
            x = -x;
            inverted = 1 - inverted;
        }
        x = fmodf(x, width2);
        if (x > width) {
            x = width2 - x;
            inverted = 1 - inverted;
        }
        y = inMap[index + nXnY];
        if (y < 0) {
            y = -y;
            inverted = 1 - inverted;
        }
        y = fmodf(y, height2);
        if (y > height) {
            y = height2 - y;
            inverted = 1 - inverted;
        }
        if (y > x){
            h = x;
            x = y;
            y = h;
            inverted = 1 - inverted;
        }
        outMap[index] = x;
        outMap[index + nXnY] = y;
        outMap[index + nXnY2] = inverted;
    }
}
