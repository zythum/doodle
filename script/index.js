_doodle = {};
_doodle.DOM = {};
_doodle.itemList = [];
_doodle.sideList = [];
_doodle.getXML = function(S){
	S.io({
		type: 'POST',
		url: 'script/getxml.php',
		data: null,
		success: function(data) {
			//alert(data);
			var list = [];
			S.each(data.getElementsByTagName('item'),function(item){
				var title='',des='';
				for(var j=0;j<item.childNodes.length;j++){
					if(item.childNodes[j].nodeName == 'title')
						title = item.childNodes[j].childNodes[0].nodeValue;
					if(item.childNodes[j].nodeName == 'description')
						des = item.childNodes[j].childNodes[0].nodeValue;
				}
				list.push({
					title:title,
					des:des
				});
			});
			_doodle.DOMBuild(list,S);
		},
		dataType:'xml' 
	});
}
_doodle.DOMBuild = function(list,S){
	var DOM = S.DOM, Event = S.Event;
	S.each(list,function(item,i){
		var newNode = DOM.create('<li class="item"></li>');
		newNode.Index = i;
		newNode.innerHTML = item.des+'<div class="title">'+item.title+'</div>';
		_doodle.itemList.push(newNode);
		DOM.append(newNode,_doodle.DOM.itemList);
		setTimeout(function(){
			newNode.style.cssText += ';transform:scale('+(1.3-i/20)+') translate(0,'+(-11*i/(1.3-i/20)+40)+'px);-webkit-transform:scale('+(1.3-i/20)+') translate(0,'+(-11*i/(1.3-i/20)+40)+'px);-moz-transform:scale('+(1.3-i/20)+') translate(0,'+(-11*i/(1.3-i/20)+40)+'px);-o-transform:scale('+(1.3-i/20)+') translate(0,'+(-11*i/(1.3-i/20)+40)+'px);z-index:'+(list.length+100-i)+';';
		},500);
		var newSideNode = DOM.create('<li class="side-item"></li>');
		newSideNode.Index = i;
		newSideNode.innerHTML = DOM.children(newNode,'p')[0].innerHTML;
		Event.on(newSideNode,'click',function(){
			_doodle.choose(this.Index,S);
		});
		_doodle.sideList.push(newSideNode);
		DOM.prepend(newSideNode,_doodle.DOM.sidebar);
	});
}
_doodle.move = function(itemList,forward,S){//forward :nxt/pre
	var DOM = S.DOM, Event = S.Event;
	if(itemList[itemList.length-1].Index <= 0 && forward == 'nxt') return false;
	if(itemList[0].Index >= 0 && forward == 'pre') return false;
	S.each(itemList,function(item){
		//var i = --item.Index;
		var i = 0;
		if(forward == 'nxt') i = -- item.Index;
		else if(forward == 'pre') i = ++ item.Index;
		item.style.cssText += ';transform:scale('+(1.3-i/20)+') translate(0,'+(-11*i/(1.3-i/20)+40)+'px);-webkit-transform:scale('+(1.3-i/20)+') translate(0,'+(-11*i/(1.3-i/20)+40)+'px);-moz-transform:scale('+(1.3-i/20)+') translate(0,'+(-11*i/(1.3-i/20)+40)+'px);-o-transform:scale('+(1.3-i/20)+') translate(0,'+(-11*i/(1.3-i/20)+40)+'px);';
		if(i<0){
			DOM.css(item,'opacity',0);
		}else{
			DOM.css(item,'opacity',1);
		}
	});
}
_doodle.choose = function(num,S){
	if(num < 0 || num > _doodle.itemList.length-1) return false;
	var time = _doodle.itemList[num].Index;
	if(time > 0){
		for(var i=0;i<time;i++){
			_doodle.move(_doodle.itemList,'nxt',S);
		}
	}else if(time < 0){
		for(var i=0;i<Math.abs(time);i++){
			_doodle.move(_doodle.itemList,'pre',S);
		}
	}
}
_doodle.ready = function(fn,S){
	var loop = function(){
		if(_doodle.itemList.length) fn(S);
		else setTimeout(loop,1000);
	};
	loop();
}
KISSY.ready(function(S){	
	var DOM = S.DOM, Event = S.Event;
	_doodle.DOM.itemList = DOM.get('#item-list');
	_doodle.DOM.sidebar = DOM.get('#sidebar');
	_doodle.getXML(S);
	_doodle.ready(function(S){
		var DOM = S.DOM, Event = S.Event;
		var btns = DOM.get('#btns');
		DOM.css(btns,'display','block');
		DOM.css('#sidebar','right','0');
		DOM.hide('#load');
		setTimeout(function(){
			DOM.css(btns,'opacity','0.8');
			S.each(_doodle.itemList,function(item){
				DOM.addClass(_doodle.itemList,'item-shadow');
			});
		},1000);
		// btn click
		Event.on('#btn-nxt','click',function(){
			_doodle.move(_doodle.itemList,'nxt',S);
		});		
		Event.on('#btn-pre','click',function(){
			_doodle.move(_doodle.itemList,'pre',S);
		});
		//keyboard
		Event.on(document,'keyup',function(e){
			// alert(e.keyCode);
			if(e.keyCode == 40 || e.keyCode == 39){
				_doodle.move(_doodle.itemList,'nxt',S);
			}else if(e.keyCode == 38 || e.keyCode == 37){
				_doodle.move(_doodle.itemList,'pre',S);
			};
		});
		//mousewheel
		var mousewheelFlag = true;
		Event.on(window,'mousewheel',function(e){
			if(mousewheelFlag){
				mousewheelFlag = false;
			}else{
				return false;
			}
			if(e.wheelDelta>0){
				_doodle.move(_doodle.itemList,'nxt',S);
			}else{
				_doodle.move(_doodle.itemList,'pre',S);
			}
			setTimeout(function(){mousewheelFlag = true},1000);
		});
		//sidebar
		var sideMousemoveTarget = null;
		Event.on(_doodle.DOM.sidebar,'mousemove',function(e){
			if(e.target === sideMousemoveTarget) return false;
			sideMousemoveTarget = e.target;
			if(sideMousemoveTarget.Index == undefined) return false;
			var index = sideMousemoveTarget.Index;
			S.each(_doodle.sideList,function(item){
				DOM.removeClass(item,'side-item-focus side-item-focus-second side-item-focus-third');
				if(item.Index == index){
					DOM.addClass(item,'side-item-focus');
				}
				else if(item.Index-1 == index || item.Index+1 == index){
					DOM.addClass(item,'side-item-focus-second');
				}
				else if(item.Index-2 == index || item.Index+2 == index){
					DOM.addClass(item,'side-item-focus-third');
				}
			});
			Event.on(_doodle.DOM.sidebar,'mouseleave',function(e){
				S.each(_doodle.sideList,function(item){
					DOM.removeClass(item,'side-item-focus side-item-focus-second side-item-focus-third');
				});
			});		
		});
		Event.on('a','click',function(){return false});
	},S);
	
});





















