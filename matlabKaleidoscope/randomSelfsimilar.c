/*==========================================================
 * create selfsimilar image from random choice of contractions
 * for each pixel (h,k):
 * image(h,k) is float between 0 and 1
 *
 * (c-indices, starting with 0, row index first)
 *
 * depending on:
 * mPixels - number of (mega)pixels, in units of 1'000'000, default = 1
 * nPoints - number of points to generate, in units of 1'000'000
 * range - vector [xMin, xMax, yMin, yMax]
 *      xMin - lower value of x-coordinates
 *      xMax - upper value of x-coordinates
 *      yMin - lower Value of y-coordinates
 *      yMax - upper Value of y-coordinates
 * initial point - vector [x, y]
 * 2 or more mappings - vector [centerX, centerY, angle, reduction]
 *      centerX - x-coordinate of center
 *      centerY - y-coordinate of center
 *      angle - rotation angle
 *      reduction - scaling factor <=1
 * all are double precision scalar (Matlab default)
 *
 * returns the image
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <complex.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)
#define PI 3.14159f

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    float nPixels, xMin, xMax, yMin, yMax;
    int nPoints, iter;
    int nX, nY, nXnY;
    float dx, dy, dxdy;
    float *image;
    double *region;
    double *start;
    float complex startZ, z;
    int nMaps, index;
    double *mapData;
    float complex centers[10], factors[10];
    /* check that output is possible*/
    if (nlhs != 1) {
        mexErrMsgIdAndTxt("randomSelfsimilar:nlhs","One output matrix for the image required.");
    }
    /* do variable inputs*/
    if (nrhs < 6){
         mexErrMsgIdAndTxt("randomSelfsimilar:nrhs","At least 6 input items required.");
    }    
    /* get number of pixels*/
    nPixels = 1e6f * (float) mxGetScalar(prhs[0]);
    /* get number of points*/
    nPoints = (int) 1e6f * (float) mxGetScalar(prhs[1]);
    /* get region*/
    if (mxGetNumberOfElements(prhs[2]) != 4) {
                mexErrMsgIdAndTxt("randomSelfsimilar:region","Region requires 4 numbers.");
    } 
#if MX_HAS_INTERLEAVED_COMPLEX
    region = mxGetDoubles(plhs[2]);
#else
    region = (double *) mxGetPr(plhs[2]);
#endif
    xMin = region[0];
    xMax = region[1];
    yMin = region[2];
    yMax = region[3];
    /* get array dimensions*/
    dx = xMax - xMin;
    dy = yMax - yMin;
    dxdy = dx / dy;
    nX = (int) sqrt(nPixels * dxdy);
    nY = (int) sqrt(nPixels / dxdy);
    nXnY = nX * nY;
    dx /= nX;
    dy /= nY;
    /* create array*/
    /* attention: row first - corresponds to y dimension*/
    plhs[0]=mxCreateNumericMatrix(nY, nX, mxSINGLE_CLASS, mxREAL);
#if MX_HAS_INTERLEAVED_COMPLEX
    image = mxGetSingles(plhs[0]);
#else
    image = (float *) mxGetPr(plhs[0]);
#endif
    /* get starting point*/
      if (mxGetNumberOfElements(prhs[3]) != 2) {
                mexErrMsgIdAndTxt("randomSelfsimilar:startPoint","Starting point requires 2 numbers.");
    } 
#if MX_HAS_INTERLEAVED_COMPLEX
    start = mxGetDoubles(plhs[3]);
#else
    start = (double *) mxGetPr(plhs[3]);
#endif
    startZ = start[0] + start[1] * I;
    /* read the mappings*/
    nMaps = nrhs - 4;
      if (nMaps > 10) {
                mexErrMsgIdAndTxt("randomSelfsimilar:nMaps","Maximum of 10 maps exceeded.");
    } 
    for (index=0; index < nMaps; index++){
     if (mxGetNumberOfElements(prhs[index+4]) != 4) {
                mexErrMsgIdAndTxt("randomSelfsimilar:map","A map has to have 4 parameters.");
    } 
#if MX_HAS_INTERLEAVED_COMPLEX
    mapData = mxGetDoubles(plhs[index +4]);
#else
    mapData = (double *) mxGetPr(plhs[index + 4]);
#endif
    centers[index] = ((float) mapData[0]) + ((float) mapData[1]) * I;
        factors[index] = ((float) mapData[3]) * (cos(0.5f * PI * ((float) mapData[2])) + sin(0.5f * PI *((float) mapData[2])) * I);
    }
    /* initialization? */
    for (index = 0; index < nXnY; index++){
        image[index] = 0;
    }
    /* doing the mappings*/
    z = startZ;
    for (iter = 0; iter < nPoints; iter++){
        int mapIndex = rand() % nMaps;
        float complex center = centers[mapIndex];
        z = center + factors[mapIndex] * (z - center);
        int j = (creal(z)-xMin)/dx;
        if ((j<0) || (j >= nX)){
            continue;
        }
    }
}