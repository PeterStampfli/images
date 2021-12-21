function element = randomChoice(vector)
% find a random element in vector
[~,nChoices]=size(vector);
element = vector(randi(nChoices));
end

