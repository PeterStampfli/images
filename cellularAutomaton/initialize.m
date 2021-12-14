% initialize the cells and set weights for sum, transition table
% make greyscale

nStates=4;
center=[1,2];
weights=[1,1,1];

map = makeGreyscaleMap(nStates);
cells(:,:)=0;
makeCenter(cells,center);
table = sawtoothTable(nStates,weights);