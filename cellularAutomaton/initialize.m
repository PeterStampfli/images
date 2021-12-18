function initialize();
% initialize the cells and set weights for sum, transition table
global table;
nStates=4;
% only different for interpolation
nColors=nStates;
imageFactor=(nColors-1)/(nStates-1);
center=[1,0];
weights=[1,1,1];

map = greyscaleMap(nColors);
cells(:,:)=0;
makeCenter(cells,center);
table = sawtoothTable(nStates,weights);