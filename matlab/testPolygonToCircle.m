s=1000;
im=zeros(s,s,3);
for ix=1:s
    for iy=1:s
        x=2*ix/s-1;
        y=2*iy/s-1;
        [x,y]=polygonToCircle(4,x,y);
        [r,g,b]=circleTestPattern(x,y);
        im(ix,iy,1)=r;  
        im(ix,iy,2)=g;
        im(ix,iy,3)=b;
        im(ix,iy,:)=[r,g,b];
    end
end
imshow(im)
                