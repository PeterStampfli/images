/*==========================================================
 * create cell matrix and sum matrix for cellular automaton
 * Input: size
 *
 * return two matrices of 32 bit integers (c: int type)
 *
 * [cells, sums] = createCells(size);
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
    mwSize size;
        /* check for size parameter*/
    if (nrhs != 1) {
        mexErrMsgIdAndTxt("createCells:nrhs","Size parameter required.");
    }
    size = (mwSize) mxGetScalar(prhs[0]);
      /* check that output is possible*/
    if (nlhs != 2) {
        mexErrMsgIdAndTxt("createCells:nlhs","Two output arrays for cells and sums required.");
    }
    plhs[0] = mxCreateNumericMatrix(size, size, mxINT32_CLASS, mxREAL);
    plhs[1] = mxCreateNumericMatrix(size, size, mxINT32_CLASS, mxREAL);
}