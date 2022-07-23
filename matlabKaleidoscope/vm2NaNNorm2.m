%--------------------------------------------------------------------------
function [x, y] = vm2NaNNorm2(vm, hw_crop)
    hi = hw_crop(1); 
    wi = hw_crop(2);
    % SPLIT VECTORMAP %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    x = vm(:,:,1); 
    y = vm(:,:,2);                                                               
    
    [x_min,x_max,y_min,y_max]  = getRangeMap(vm);  
    
    map_width = x_max - x_min;
    map_height = y_max - y_min;
    % mache alles in single precision, hi and wi are double precision?
    % getRangeMap returns single precision
    % check that all is single
    scale = single(min((wi - 1) / map_width, (hi - 1) / map_height));
    
    offsetX = 1 - scale * x_min;
    offsetY = 1 - scale * y_min;
    x = scale * x + offsetX;
    y = scale * y + offsetY;
  
end
%--------------------------------------------------------------------------
