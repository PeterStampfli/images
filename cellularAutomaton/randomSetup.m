function randomSetup()
%SETUP: create cell-, sum- and image arrays
%depending on size of image and size of active cell array
%cells- and sums-array are int32
%image array is int32 (?)
%imageSize and pixelSize have integer values
global cells sums table weights;
global image colorMap;
global interpolation boundary;

% choose random number of cells in each direction, including border
nCellsChoices = [15, 20, 40, 80];
[~, nChoices] = size(nCellsChoices);
nCells = nCellsChoices(randi(nChoices));
% make it odd
nCells = 2 * floor(nCells/2) + 5;
% create cells and sums array
cells = zeros(nCells, 'int32');
sums = zeros(nCells, 'int32');

% number of states
nStates = randomChoice([4, 8, 16, 32]);

% initial patterns
configs = [1, 1, 0, 0, 0, 0; 1, 1, 1, 0, 0, 0; 1, 1, 1, 0, 1, 0; 1, 1, 1, 1, 0, 0; 1, 1, 1, 1, 1, 1];
[nConfigs, ~] = size(configs);
initialCells = configs(randi(nConfigs), :);
centerCell = randomChoice([0, 1, 1, 1, 2]);
initialCells(1) = centerCell;
makeCenter(cells, initialCells);
border = randomChoice([0, 0, 0, 1, 2]);
setBoundary(cells, border);

% sum and transition
weights = configs(randi(nConfigs), :);
centerCell = randomChoice([0, 1, 1, 1, 2]);
weights(1) = centerCell;
tableChoice = randomChoice([0, 1]);
switch (tableChoice)
    case 0
        table = sawtoothTable(nStates, weights);
    case 1
        table = triangleTable(nStates, weights);
    otherwise
        table = sawtoothTable(nStates, weights);
end
boundary = randomChoice([-1, -1, 0, 0, 1]);

% create image array, indexed colors
imageSize = 1000;
image = zeros(imageSize, 'int32');
interpolation = randi(3);

colorMapChoice = randomChoice([1, 2, 3]);
switch (colorMapChoice)
    case 1
        colorMap = greyScaleMap(nStates);
    case 2
        colorMap = redYellowWhiteMap(nStates);
    case 3
        colorMap = randomBlueMap(nStates);
    otherwise
        colorMap = greyScaleMap(nStates);
end
end