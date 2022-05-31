/*==========================================================
 * createJuliaImage: create an image of a Julia set
 * valid points of the map in black, invalid points in white
 *
 * Input:
 * The map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 * 
 * returns the image as a matrix of singles:
 * pixels values for image pixels are the same as map(h,k,2), parity=0,1
 * except for invalid pixels (map(h,k,2) < 0), then pixel gets 0.5 as value
 *
 * use imshow(im) to get the BW image
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int nX, nY, nXnY, nXnY2, index;
    float inverted, color;
    float *image, *map;
    /* check for proper number of arguments (else crash)*/
    if(nrhs != 1) {
        mexErrMsgIdAndTxt("createJuliaImage:nrhs","A map input required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("createJuliaImage:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
       if(dims[2] != 3) {
        mexErrMsgIdAndTxt("createJuliaImage:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that output is possible*/
    if (nlhs != 1) {
        mexErrMsgIdAndTxt("createJuliaImage:nlhs","One output matrix for the image required.");
    }
    plhs[0]=mxCreateNumericMatrix(dims[0], dims[1], mxSINGLE_CLASS, mxREAL);
#if MX_HAS_INTERLEAVED_COMPLEX
    map = mxGetSingles(prhs[0]);
    image = mxGetSingles(plhs[0]);
#else
    map = (float *) mxGetPr(prhs[0]);
    image = (float *) mxGetPr(plhs[0]);
#endif
    /* do the image*/
    /* row first order*/
    nX = dims[1];
    nY = dims[0];
    nXnY = nX * nY;
    nXnY2 = 2 * nXnY;
    for (index = 0; index < nXnY; index++){
        inverted = map[index + nXnY2];
        if (inverted < 0) {
            color = 1.0f;
        } else {
            color = 0.0f;
        }
        image[index] = color;
    }
}
