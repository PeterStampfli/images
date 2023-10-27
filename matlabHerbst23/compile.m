% compile the c-codes
% first set the working directory to the folder where the c-code is:
% you need to change the folder path
cd /home/peter/images/matlabKaleidoscope
cd /home/peter/images/matlabHerbst23
% compile
% compiler flags for C compiler
% in matlab (for -Wall in this example)
% mex -v CFLAGS='$CFLAGS -Wall' whatever.c 
% https://gcc.gnu.org/onlinedocs/gcc-3.4.6/gcc/Optimize-Options.html
mex identityMap.c
mex basicKaleidoscope.c
%mex poincarePlaneToDisc.c
mex createStructureImage.c
mex getRangeMap.c
%mex polygonToCircle.c
% takes some time, if ok shows 3 times:
% Building with 'gcc'.
% MEX completed successfully.