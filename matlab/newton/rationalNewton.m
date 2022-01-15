colors=[1,0,0; 0,1,0; 0,0,1; 1,1,0; 0 1 1; 1 0 1; 0 1 1];

rs=[roots(3,1) ];
ps=[roots(3,-0.5)];
[~,dim]=size(rs);
[~,dimps]=size(ps);
eps=0.05;
itemax=100;

nPixels=800;
image=ones(nPixels,nPixels,3);
width=4;
centerX=-0;
centerY=0;
dx=width/nPixels;
zeroSize=0.05;
nPixels2=nPixels/2;
zLimit=300;

for h=1:nPixels
    for k=1:nPixels
        z=((k-nPixels2)-i*(h-nPixels2))*dx+centerX+centerY*i;
        iniz=z;
        notAtZero=true;
        for ix=1:dim
            if (abs(z-rs(ix))<zeroSize)
                notAtZero=false;
                image(h,k,:)=0;
                break;
            end;
        end
        if (dimps>0)
            for ix=1:dimps
                if (abs(z-ps(ix))<zeroSize)
                    notAtZero=false;
                    image(h,k,:)=1;
                    break;
                end;
            end
        end
        
        if (notAtZero)
            iter=0;
            minerr=1000;
            while (minerr>zeroSize)&&(iter<itemax)
                iter=iter+1;
                iminerr=-1;
                minerr=1000;
                corr=0;
                for ix=1:dim
                    dz=z-rs(ix);
                    d=abs(dz);
                    if (minerr>d)
                        minerr=d;
                        if (d<eps)
                            iminerr=ix;
                            break;
                        end
                    end
                    corr=corr+1/dz;
                end
                if (dimps>0)
                    for ix=1:dimps
                        corr=corr-1/(z-ps(ix));
                    end
                end
                z=z-1/corr;
                if (abs(z)>zLimit)
                    %      minerr=0;
                    %      iminerr=dim+1;
                end
            end
            if (iminerr<0)
                            image(h,k,:)=0.5;
            else
            image(h,k,:)=colors(iminerr,:);
            end
        end
    end
end
imshow(image)
%imwrite(image,"newton55other.jpg")