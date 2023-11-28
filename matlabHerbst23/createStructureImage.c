/*==========================================================
 * createStructureImage: create an image of the structure of a map
 * for an even number of inversions the pixel's color is black
 * for an odd number its color is white
 * pixels that are not part of the image are shown in grey
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
    float inverted;
    float *image, *map;
    /* check for proper number of arguments (else crash)*/
    if(nrhs != 1) {
        mexErrMsgIdAndTxt("createStructureImage:nrhs","A map input required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("createStructureImage:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
       if(dims[2] != 3) {
        mexErrMsgIdAndTxt("createStructureImage:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that output is possible*/
    if (nlhs != 1) {
        mexErrMsgIdAndTxt("createStructureImage:nlhs","One output matrix for the image required.");
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
        if (inverted < 0.1f) {
            inverted=0.5f;
        }
        image[index] = inverted;
    }
}
