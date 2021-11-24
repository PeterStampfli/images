/*==========================================================
 *
 * image = randomSelfsimilar(mPixels, nPoints, range, initial, map, ...)
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
 *      weight - relative, >= 0
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
    float weights[10];
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
    region = mxGetDoubles(prhs[2]);
#else
    region = (double *) mxGetPr(prhs[2]);
#endif
    PRINTF(region[0]);
    xMin = (float) region[0];
    xMax = (float) region[1];
    yMin = (float) region[2];
    yMax = (float) region[3];
    /* get array dimensions*/
    PRINTF(xMin);
    dx = xMax - xMin;
    dy = yMax - yMin;
    dxdy = dx / dy;
    PRINTF(nPixels);
    PRINTF(dx);
    nX = (int) sqrtf(nPixels * dxdy);
    nY = (int) sqrtf(nPixels / dxdy);
    nXnY = nX * nY;
    dx /= nX;
    dy /= nY;
    /* create array*/
    /* attention: row first - corresponds to y dimension*/
    PRINTI(nY);
    PRINTI(nX);
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
    start = mxGetDoubles(prhs[3]);
#else
    start = (double *) mxGetPr(prhs[3]);
#endif
    startZ = start[0] + start[1] * I;
    /* read the mappings*/
    nMaps = nrhs - 4;
    if (nMaps > 10) {
        mexErrMsgIdAndTxt("randomSelfsimilar:nMaps","Maximum of 10 maps exceeded.");
    }
    float sumWeights = 0;
    for (index=0; index < nMaps; index++){
        if (mxGetNumberOfElements(prhs[index+4]) != 5) {
            mexErrMsgIdAndTxt("randomSelfsimilar:map","A map has to have 5 parameters.");
        }
#if MX_HAS_INTERLEAVED_COMPLEX
        mapData = mxGetDoubles(prhs[index +4]);
#else
        mapData = (double *) mxGetPr(prhs[index + 4]);
#endif
        centers[index] = ((float) mapData[0]) + ((float) mapData[1]) * I;
        factors[index] = ((float) mapData[3]) * (cos(0.5f * PI * ((float) mapData[2])) + sin(0.5f * PI *((float) mapData[2])) * I);
        weights[index] = (float) mapData[4];
        sumWeights += weights[index];
    }
    /* normalize weights*/
    for (index=0; index < nMaps; index++){
        weights[index]/=sumWeights;
    }
    /* initialization? */
    for (index = 0; index < nXnY; index++){
        image[index] = 0;
    }
    /* doing the mappings*/
    z = startZ;
    for (iter = 0; iter < nPoints; iter++){
        float choice = rand() / ((float) RAND_MAX);
        int mapIndex;
        for (mapIndex=0; mapIndex < nMaps; mapIndex++){
            choice -= weights[mapIndex];
            if (choice < 0){
                break;
            }
        }
        float complex center = centers[mapIndex];
        z = center + factors[mapIndex] * (z - center);
        int j = (creal(z) - xMin) / dx;
        if ((j < 0) || (j >= nX)){
            continue;
        }
        int k = (cimag(z) - yMin) / dy;
        if ((k < 0) || (k >= nY)){
            continue;
        }
        image[k + nX * j] +=1;
    }
    /* renormalize*/
    float maxImage=0;
    for (index = 0; index < nXnY; index++){
        maxImage = fminf(maxImage, image[index]);
    }
    maxImage = 1 / maxImage;
    for (index = 0; index < nXnY; index++){
        image[index] *= maxImage;
    }
}