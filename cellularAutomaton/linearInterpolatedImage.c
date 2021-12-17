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
 * optional: imageFactor, default 1
 *  scaless from states to image colors, for intermediate values
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
    int center, i, j, jImageSize, jCell, jCellSize, jPlusCellSize, iCell;
    float dx, dy, dyPlus, dxPlus;
    float scale, offset, sum, imageFactor;
    if(nrhs < 2) {
        mexErrMsgIdAndTxt("nearestNeighbourImage:nrhs","A cell array and an image array input required.");
    }
    /* check number of dimensions of the cell (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) != 2 ) {
        mexErrMsgIdAndTxt("nearestNeighbourImage:dims","The cell array has to have two dimensions.");
    }
    if(mxGetNumberOfDimensions(prhs[1]) != 2 ) {
        mexErrMsgIdAndTxt("nearestNeighbourImage:dims","The image array has to have two dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    cellSize = dims[0];
    dims = mxGetDimensions(prhs[1]);
    imageSize = dims[0];
    scale = (cellSize - 4) / ((float) imageSize);
    offset = (3 + scale) / 2;
#if MX_HAS_INTERLEAVED_COMPLEX
    cells = mxGetInt32s(prhs[0]);
    image = mxGetInt32s(prhs[1]);
#else
    cells = (int *) mxGetPr(prhs[0]);
    image = (int *) mxGetPr(prhs[1]);
#endif
  if (nrhs >= 3){
        imageFactor = (float) mxGetScalar(prhs[2]);
    } else {
        imageFactor = 1;
    }
    for (j = 0; j < imageSize; j++){
        jImageSize = j * imageSize;
        dy = j * scale + offset;
        jCell = (int) floorf(dy);
        jCellSize = cellSize * jCell;
        jPlusCellSize = jCellSize + cellSize;
        dy -= jCell;
        dyPlus = 1.0f - dy;
        for (i = 0; i < imageSize; i++){
            dx = i * scale + offset;
            iCell = (int) floorf(dx);
            dx -= iCell;
            dxPlus = 1.0f - dx;
            sum = dyPlus * (dxPlus * cells[jCellSize + iCell] + dx * cells[jCellSize + iCell + 1]);
            sum += dy * (dxPlus * cells[jPlusCellSize + iCell] + dx * cells[jPlusCellSize + iCell + 1]);
            image[jImageSize + i] = (int) roundf(imageFactor * sum);
        }
    }
}