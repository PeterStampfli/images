function  PTC_testCircle()
s=1000;
PTC_setCircle(s/2,s/2,s/2);
im=zeros(s,s,3);
for x=1:s
    for y=1:s
        [r,g,b]=PTC_circlePattern(x,y);
        im(y,x,1)=r;
        im(y,x,2)=g;
        im(y,x,3)=b;
    end
end
imshow(im)
end

