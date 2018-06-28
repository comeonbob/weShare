# canvas 的使用
作者： 逸凡
时间： 2018-01-29

## 介绍
Canvas
	获取绘图上下文
	var gd = oC.getContext('2d');

	重新开始路径
	gd.beginPath();

	开始
	gd.moveTo(x,y)
	结束
	gd.lineTo(x,y)

	闭合路径
	gd.closePath();

	描边
	gd.stroke()

	描边颜色
	gd.strokeStyle

	线宽
	gd.lineWidth

	填充
	gd.fill()

	填充颜色
	gd.fillStyle

	清屏
	gd.clearRect(x,y,w,h);

	画矩形
		a)
			gd.rect(x,y,w,h);
			stroke()/fill()
		b)
			gd.fillRect(x,y,w,h)
		c)
			gd.strokeRect(x,y,w,h)

	运动
		先清屏，再画图

画弧
	gd.arc(cx,cy,r,s,e,b);
		cx,cy 		圆心坐标
		r 			半径
		s 			开始弧度
		e 			结束弧度
		b 			是否逆时针
	gd.stroke()/fill();

饼图
	先求和
	求出每个数字的比例
	通过比例求出角度

改变线条端点样式
	gd.lineCap = round 			圆
	gd.lineCap = butt 			平

文字
	gd.font = '大小 字体类型';
		必须一起设置，否则不生效
	gd.textAlign			水平对齐方式
	gd.textBaseline 		基线对齐方式
		middle		中间对齐
	gd.fillText(str,x,y); 		填充文字
	gd.strokeText(str,x,y); 	描边文字
			位置是
				x 		左侧
				y 		基线

事件
	1.算位置
	2.gd.isPointInPath(pageX,pageY)
		总结：
			gd.isPointInPath只能给最后一个图形加

拖拽

渐变
	创建线性渐变
	var lg = gd.createLinearGradient(x1,y1,x2,y2);
	设置颜色
	lg.addColorStop(系数,颜色);

变形
	旋转 		rotate
	平移 		translate
	缩放 		scale


	旋转
		gd.rotate(弧度);

	平移
		gd.translate(x,y);

	缩放
		gd.scale(x,y);


		画布左上角是原心,原心是不可以改变的。
		操作的是整个画布
		变形会叠加
		操作完，画图，画完图之后，把画布还原回去

	还原画布
		gd.save(); 			保存画布当前状态
		gd.restore(); 		还原回保存的状态

		如果要用变形
			1.gd.save();	保存
			2.操作
			3.画图
			4.gd.restore();	还原

	矩形左上角旋转
		先保存
		把画布偏移到左上角位置
		旋转
		画图 	要画在0,0的位置
		还原
	矩形中心旋转

设置图片背景
	gd.createPattern(oImg,'平铺方式');
							no-repeat
							repeat-x
							repeat-y
							repeat
	背景是从画布左上角走的

	导出图片
		oC.toDataURL([mime-type]);

		可以指定图片类型
		oC.toDataURL('image/png');
		oC.toDataURL('image/jpeg');

引入图片
	gd.drawImage(oImg,dx,dy);

	gd.drawImage(
		oImg,
		dx,dy,[dw],[dh]
	);

	gd.drawImage(
		oImg,
		[sx],[sy],[sw],[sh],
		dx,dy,[dw],[dh]
	);

总结：
	canvas一切操作都在画图之前

像素级操作
	比较耗费性能，必须配合服务器环境
	var result = gd.getImageData(x,y,w,h);
	var d = result.data;
	d所有像素点
		四个为一组 	r,g,b,a,r,g,b,a...

	操作完成，要还回去
	gd.putImageData(result,x,y);

效果
	复古效果：
	    d[i]=(r*0.393)+(g*0.769)+(b*0.189); 	// red
	    d[i+1]=(r*0.349)+(g*0.686)+(b*0.168); 	// green
	    d[i+2]=(r*0.272)+(g*0.534)+(b*0.131); 	// blue
	红色蒙版效果：
	    d[i]=(r+g+b)/3;        // 红色通道取平均值
	    d[i+1]=d[i+2]=0;  		// 绿色通道和蓝色通道都设为0

	图片曝光(高亮效果)：
	    d[i]+=200;
	    d[i+1]+=200;
	    d[i+2]+=200;
	颜色反转：
	    d[i]=255-d[i];
	    d[i+1]=255-d[i+1];
	    d[i+2]=255-d[i+2];	

计算机图形学
像素级操作非常耗费性能，尽量少用。


## 源码
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        *{
            margin: 0;
            padding: 0;
        }
        html,body{
            height: 100%;
        }
        body{
            overflow: hidden;
        }
        canvas{
            background:#000;
        }
    </style>
    <script>
        function rnd(n,m){
            return Math.floor(Math.random()*(m-n)+n);
        }
        document.addEventListener('DOMContentLoaded',function(){
            var oC=document.querySelector('canvas');
            oC.width=document.documentElement.clientWidth;
            oC.height=document.documentElement.clientHeight;
            var gd=oC.getContext('2d');
            var N=5;
            var Len=40;
            var aPoint=[];
            var aOldPoint=[];
            for(var i=0;i<N;i++){
                aPoint[i]={
                    x:rnd(0,oC.width),
                    y:rnd(0,oC.height),
                    iSpeedX:rnd(-10,10),
                    iSpeedY:rnd(-10,10)
                }
            }
            setInterval(function(){
                gd.clearRect(0,0,oC.width,oC.height);
                for(var i=0;i<aPoint.length;i++){
                    if(aPoint[i].x<0||aPoint[i].x>=document.documentElement.clientWidth-1){
                        aPoint[i].iSpeedX*=-1;
                    }
                    if(aPoint[i].y<0||aPoint[i].y>=document.documentElement.clientHeight-1){
                        aPoint[i].iSpeedY*=-1;
                    }
                    aPoint[i].x+=aPoint[i].iSpeedX;
                    aPoint[i].y+=aPoint[i].iSpeedY;
                }
                for(var i=0;i<aPoint.length;i++){
                    createPoint(aPoint[i]);
                }
                gd.beginPath();//一组矩形连接
                gd.moveTo(aPoint[0].x,aPoint[0].y);
                for(var i=1;i<aPoint.length;i++){
                    gd.lineTo(aPoint[i].x,aPoint[i].y);
                }
                gd.closePath();
                gd.strokeStyle='rgb(225,225,225)';
                gd.stroke();
                var arr=[];
                for(var i=0;i<aPoint.length;i++){
                    arr[i]={
                        x:aPoint[i].x,
                        y:aPoint[i].y,
                        iSpeedX:aPoint[i].iSpeedX,
                        iSpeedY:aPoint[i].iSpeedY
                    }
                }
                aOldPoint.push(arr);
                if(aOldPoint.length>Len){
                    aOldPoint.shift();
                }
                for(var i=0;i<aOldPoint.length;i++){//多组矩形连接
                    gd.beginPath();
                    gd.moveTo(aOldPoint[i][0].x,aOldPoint[i][0].y);
                    for(var j=1;j<aOldPoint[i].length;j++){
                        gd.lineTo(aOldPoint[i][j].x,aOldPoint[i][j].y);
                    }
                    gd.closePath();
                    gd.strokeStyle='rgba(225,225,225,'+i/Len+')';
                    gd.stroke();
                }
            },30);
            function createPoint(point){//创建矩形
                gd.beginPath();
                gd.rect(point.x,point.y,1,1);
                gd.fillStyle='#fff';
                gd.fill();
            }
        },false)
    </script>
</head>
<body>
    <canvas></canvas>
</body>
</html>
```