#include "mex.h"

void mexFunction( int nlhs, mxArray *plhs[],
                  int nrhs, const mxArray *prhs[])
{
    double *vector;
    /* check for proper number of arguments (else crash)*/
    if(nrhs!=1) {
        mexErrMsgIdAndTxt("procedure:nrhs","one input required.");
    }
          /* make sure the first input argument is vector with three elms */
    if(   mxGetNumberOfElements(prhs[0])!=3 ) {
        mexErrMsgIdAndTxt("procedure:not3Vector","Input has to be a vector of 3 elms.");
    }
    
    #if MX_HAS_INTERLEAVED_COMPLEX
    vector = mxGetDoubles(prhs[0]);
    #else
    vector = mxGetPr(prhs[0]);
    #endif
 printf("%f\n",vector[0]);
 vector[0]=123;
 vector[1]=vector[1]+vector[2];
}
