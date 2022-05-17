/*==========================================================
 * scale: Scales a map such that a given input length fits a given output length (default is 1)
 * scaelfactor = output length / input length
 *
 * scale(map, inLength, outLength);
 * scale(map, inLength);
 *
 * Input:
 * first the map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 *
 * additional input: 
 * 2 lengths, inLength, outLength (default is 1)
 * scales the map by factor = outLength / inlength
 * to match the input length to the output length
 *
 * returns nothing and modifies the map argument if used as a procedure:
 * scale(map, inLength, outLength);
 *
 * returns a modified map and does not change the map argument if used as a function:
 * newMap = scale(map, inLength, outLength);
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <stdbool.h>
#define INVALID -10000
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int maxIterations, minIterations, iterations;
    int nX, nY, nXnY, nXnY2, index;
    float inverted, x, y;
    float *inMap, *outMap;
    float inLength, outLength, factor;
    bool returnsMap;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 2) {
        mexErrMsgIdAndTxt("scale:nrhs","A map input plus input length and optional output length required.");
    }
    /* check number of dimensions of the map (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("scale:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("scale:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("scale:nlhs","Has zero or one return parameter.");
    }
    /* get the map*/
#if MX_HAS_INTERLEAVED_COMPLEX
    inMap = mxGetSingles(prhs[0]);
#else
    inMap = (float *) mxGetPr(prhs[0]);
#endif
    if (nlhs == 0){
        returnsMap = false;
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
    /* get geometry parameters*/
    inLength = (int) mxGetScalar(prhs[1]);
    if(nrhs < 3) {
        outLength = 1;
    } else {
        outLength = (int) mxGetScalar(prhs[2]);
    }
    factor = outLength / inLength;
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
        outMap[index] = factor * inMap[index];
        outMap[index + nXnY] = factor * inMap[index + nXnY];
        outMap[index + nXnY2] = inverted;
    }
}