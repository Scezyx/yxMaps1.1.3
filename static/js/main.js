// JavaScript 
	function G(id) {
		return document.getElementById(id);
	}//获取id函数
	
var map = new BMap.Map("allmap");//地图实例
	var point = new BMap.Point(106.55544,291.576526);
	map.centerAndZoom(point,12);
	map.enableDragging();
	map.enableScrollWheelZoom();//启用鼠标滚轮
var p;	//起点
var p1; //终点
//var a=[];
var ret = G("ret").innerHTML;//获取服务器放在页面的数据
ret=JSON.parse(ret);
var j=1;
//转化字符数组
/*for(var i =	0 , j = 0 ; i < ret.length ; i++){
	if(ret[i]==','){
		a[j]=parseFloat(k);
		j++;
		t=j;
		k="";
		continue;
	}
	k+=ret[i];	
}
a[t]=parseFloat(k);
*/
var geolocation = new BMap.Geolocation();
dwjs();
function gotohere(point){
	var driving = new BMap.DrivingRoute(map, {renderOptions:{map: map, autoViewport: true}});
	driving.search(p,point);//规划驾车路线	
}
//定位检索函数
function dwjs(){
	geolocation.getCurrentPosition(function(r){
		if(this.getStatus() == BMAP_STATUS_SUCCESS){
			var mk = new BMap.Marker(r.point);
			map.addOverlay(mk);
			map.panTo(r.point);
			p=r.point;
			map.centerAndZoom(r.point,14);
			mk.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画*/
			var circle = new BMap.Circle(r.point,5000,{fillColor:"blue", strokeWeight: 1 ,fillOpacity: 0.3, strokeOpacity: 0.3});/*创建一个圆实例*/
			map.addOverlay(circle);/*将圆添加到地图中*/
			
			for(var i = 0 ; i < ret.length ; i++){
				let point = new BMap.Point(ret[i].lng,ret[i].lat);

				//判断点是否在圆内
				if(BMapLib.GeoUtils.isPointInCircle(point,circle)){
					ret[i].data=j;
					j++;
					let mk = new BMap.Marker(point);
					
					map.addOverlay(mk);
					let opts = {
						width : 200,     // 信息窗口宽度
						height: 120,     // 信息窗口高度
						title : ret[i].shop_realname , // 信息窗口标题
						enableMessage:true,//设置允许信息窗发送短息
						message:ret[i].shop_realname
					}
					//<a href="">预约洗车</a>
					var html = '地址:'+ret[i].address+'</br><a href="http://localhost:9990/confirm_order?shop_id='+ret[i].shop_id+'" class="button">预约洗车</a> ';
					//html+='<input onclick="gotoWhere(point);" type="button" value="立即洗车" style="margin-top:20px"/>';
					var infoWindow = new BMap.InfoWindow(html, opts);  // 创建信息窗口对象 
					infoWindow.enableCloseOnClick();
					
					//设置数字标签
					var label = new BMap.Label(ret[i].data, {
						offset : new BMap.Size(5, 4)
					}); 
					label.setStyle({
						background:'none',color:'#fff',border:'none'//只要对label样式进行设置就可达到在标注图标上显示数字的效果
					});
					mk.setLabel(label);
					mk.addEventListener("click", (function(){     
						map.openInfoWindow(infoWindow,point); //开启信息窗口
						//a=this.getPosition();//此时算拿到数据了
						//console.log(a);能打印出数据
						G("gotowhere").addEventListener("click",(function(){
							gotohere(point);
						}))
					})); 
				}
			}
	}
	});
}

//立即洗车
function gotoWhere(point){
	var driving = new BMap.DrivingRoute(map, {renderOptions:{map: map, autoViewport: true}});
	driving.search(p,point);//规划驾车路线
}

/*地点输入提示*/
var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
		{"input" : "suggestId"
		,"location" : map
	});

	ac.addEventListener("onhighlight", function(e) {  //鼠标放在下拉列表上的事件
	var str = "";
		var _value = e.fromitem.value;
		var value = "";
		if (e.fromitem.index > -1) {
			value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		}    
		str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;
		
		value = "";
		if (e.toitem.index > -1) {
			_value = e.toitem.value;
			value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		}    
		str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
		G("searchResultPanel").innerHTML = str;
	});

	var myValue;
	ac.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
	var _value = e.item.value;
		myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		G("searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
		
		setPlace();
	});

	function setPlace(){
		map.clearOverlays();    //清除地图上所有覆盖物
		function myFun(){
			var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
			map.centerAndZoom(pp, 18);
			map.addOverlay(new BMap.Marker(pp));    //添加标注
			var driving = new BMap.DrivingRoute(map, {renderOptions:{map: map, autoViewport: true}});
			driving.search(point,pp);//规划驾车路线
		}
		var local = new BMap.LocalSearch(map, { //智能搜索
		  onSearchComplete: myFun
		});
		local.search(myValue);
	}
/*地点输入提示 end*/


/*定位按钮-----------------------------------------------*/

  var geolocationControl = new BMap.GeolocationControl();
  geolocationControl.addEventListener("locationSuccess", function(e){
    // 定位成功事件
    var address = '';
    address += e.addressComponent.province;
    address += e.addressComponent.city;
    address += e.addressComponent.district;
    address += e.addressComponent.street;
    address += e.addressComponent.streetNumber;
    alert("当前定位地址为：" + address);
	map.centerAndZoom(address,14);
  });
  geolocationControl.addEventListener("locationError",function(e){
    // 定位失败事件
    alert("无法获取您的位置");
  });
  
  map.addControl(geolocationControl);
/*定位按钮 end-------------------------------------------*/

//驾车路线
G("SS").onclick=function(){
	var driving = new BMap.DrivingRoute(map);
	console.info(G("suggestId").value);
	myGeo.getPoint(G("suggestId").value, function(p1){
			if (p1) {
				map.centerAndZoom(p1, 14);
				map.addOverlay(new BMap.Marker(p1));
			}else{
				alert("您选择地址没有解析到结果!");
			}
		}, "重庆市");
	var routePolicy = BMAP_DRIVING_POLICY_LEAST_DISTANCE;
	var driving = new BMap.DrivingRoute(map, {renderOptions:{map: map, autoViewport: true}});
	driving.search(point,pp);//规划驾车路线		
}


//刷新地图
G("refresh").onclick=function(){
	j=1;//重新添加标签
	map.clearOverlays();//清除所有覆盖物
	dwjs();//调用定位检索函数
}


