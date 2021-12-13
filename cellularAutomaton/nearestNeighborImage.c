/*==========================================================
 * make nearest neighbour image from cell array
 *
 * Input:
 * first the cell array, square int32 array, odd size
 *  int type in c is mxINT32_CLASS in Matlab
 *  the double border does not count for the image
 *
 * image array of integers
 *
 * maps pixels to cells with nearest neighbor interpolation
 * show image with mapped colors, imshow(image,colors)
 *
 *  cd /home/peter/images/cellularAutomaton
 *========================================================*/

#include "mex.h"
#include <math.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int cellSize, imageSize, *cells, *image;
    int center, i, j, jImageSize, jCellSize;
    float scale;
    if(nrhs < 2) {
        mexErrMsgIdAndTxt("nearestNeighbourImage:nrhs","A cell array and an image array input required.");
    }
    /* check number of dimensions of the cell (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) != 2 ) {
        mexErrMsgIdAndTxt("nearestNeighbourImage:dims","The cell array has to have two dimensions.");
    }
    if(mxGetNumberOfDimensions(prhs[2]) != 2 ) {
        mexErrMsgIdAndTxt("nearestNeighbourImage:dims","The image array has to have two dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    cellSize = dims[0];
    dims = mxGetDimensions(prhs[1]);
    imageSize = dims[0];
    scale = (cellSize - 4) / ((float) imageSize);
#if MX_HAS_INTERLEAVED_COMPLEX
    cells = mxGetInt32s(prhs[0]);
    image = mxGetInt32s(prhs[1]);
#else
    cells = (int *) mxGetPr(prhs[0]);
    image = (int *) mxGetPr(prhs[1]);
#endif
    for (j = 0; j < imageSize; j++){
        jImageSize = j * imageSize;
        jCellSize = cellsize * (2 + (int) floor(j * scale));
        for (i = 0; i < imageSize; i++){
            iCell = 2 + ((int) floor(i * scale);
            
        }
    }
}