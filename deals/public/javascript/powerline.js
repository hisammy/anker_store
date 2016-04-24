window.onload = function() {
    var isLoadOk = true,
    	loadIndex = 0,
    	count = $('.num').length,
    	single_hh = $(window).height(),
    	header = $('.Header'),
    	headerHeight = ($(".registerTips").height() + $(".Header-fixed").height()) || 0,
    	isPc = isPC();

    $(".num").height(single_hh);
    $("#num0").css("margin-top",headerHeight);
    $('.num_box').attr("class","num_box page0");
    $("#num0").height(single_hh - headerHeight);
    if(!isPc){
        WSCMobileSlide({
            "WSCSlideTransition": "WSCSlideTransition",
            "WSCSlideWrapper": $(".WSCSlideWrapper"),
            "WSCSlide": $(".WSCSlide"),
            "WSCSlide_img": $(".WSCSlide_img"),
            "timerNum": 3000
        });
        $(".WSCSlideWrapper").width($(window).width());
        var hammer = new Hammer(document.getElementById("con"));
        
        hammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL});
          hammer.on("swipedown",function(ev){
            qpgd(1);
          })
          hammer.on("swipeup",function(ev){
            qpgd(-1);
          })
    }else{
        $('.num_box').mousewheel(function(event, delta) {
        	qpgd(delta);
        });
    }
    function qpgd(a){
        if (isLoadOk == false){
            return;
        }
        isLoadOk=false;
        if(a<0 && count>loadIndex+1){ // 向下翻；
        	loadIndex ++
        }else if(a>0 && loadIndex !=0)
        {
        	loadIndex --;
        }
        if (loadIndex > 0) {
        	header.hide();
        } else {
        	header.show();
        }
        var _height = single_hh*loadIndex;
        $(".num_box").css("transform","translate3d(0px, -"+_height+"px, 0px)");
        $('.num_box').attr("class","num_box page"+loadIndex);
        $(".tool a").removeClass("circle").addClass("noCircle");
        $("#index"+loadIndex).addClass("circle").removeClass("noCircle");
        ga('send', 'event', 'powerline_lightning', 'pages', loadIndex);
        setTimeout(function(){
         isLoadOk=true;
        },1000);
    }

    if(isPc){
    	$(".num2div").height(single_hh -$(".divImg").eq(0).height());
    	$(".num3Heard").height(single_hh - $(".num3Contetn").outerHeight());
    }else{
    	$(".num2div").height(240);
    	$(".num3Heard").height(136);
    }
    var num8Height = single_hh -96 - $("#powerlineList").outerHeight();
    if(num8Height>0){
    	$("#num8 .head").css("margin",(num8Height/2)+"px 0");
    }
	var num1Height = single_hh - $(".childNum").outerHeight() - $("#num1 .foot").outerHeight()-$("#num1 .heard").outerHeight();
	if(num1Height>0){
			$("#num1 .heard").css("padding-top",(num1Height/2));
	}else{
		$("#num1 .heard").css("padding",0);
		$("#num1 .foot").css("padding",0);
	}
    var m7Height = single_hh-$(".num7Pc").height()-42;
    if($(".num7Pc").is(":hidden")){
        m7Height = single_hh-$(".num7M").height()-42;
    }
    if(m7Height>0){
        $("#num7 .head").css("margin-top",m7Height/2);
    }
    //翻页
    $(".num7Pc").on("click","a",function(event){
    	var type = $(event.target).attr("index");
        $("#img1").attr("src","images/powerline/16_"+type+".png");
        $(".num7Pc").find("a").removeClass("select");
        $(this).addClass("select");
    })
    $(".num7M").on("click","a",function(event){
    	var type = $(event.target).attr("index");
    		$("#imgM").attr("src","images/powerline/16-"+type+"m.jpg");
    		$(".num7M").find("a").removeClass("select");
    		$(this).addClass("select");
    })
    //右侧的快捷栏
    $(".tool").on("click","a",function(event){
    	loadIndex = parseInt($(event.target).attr("index"));
    	if (loadIndex > 0) {
    		header.hide();
    	} else {
    		header.show();
    	}

        var _height = single_hh*loadIndex;
        $(".num_box").css("transform","translate3d(0px, -"+_height+"px, 0px)");
    	$('.num_box').attr("class","num_box page"+loadIndex);
    	$(".tool a").removeClass("circle").addClass("noCircle");
    	$("#index"+loadIndex).addClass("circle").removeClass("noCircle");
        ga('send', 'event', 'powerline_lightning', 'pages', loadIndex);
    })
    $(".down").on("click","img",function(){
        qpgd(-1);
    })
    $("#powerlineList").on("click","a",function(event){
        ga('send', 'event', 'powerline_lightning', 'open', $(event.target).attr("name"));
    })
    //关闭x 重新计算高度；
    $("#close").on("click",function(){
        var height = $(".Header-fixed").height()+7;
        $("#num0").height(single_hh - height).css("margin-top",height);
    })
}
function isPC(){
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
  function WSCMobileSlide(arg_obj) {
    function getTransform(el) {
        var style = window.getComputedStyle($(el).get(0));
        var matrix = new WebKitCSSMatrix(style.webkitTransform);
        return matrix;
    }

    function slideAnimate(x, y) {
        if (Math.abs(x) >= y) {
            // $(".WSCSlide").removeClass("WSCSlideTransition");
            $(".WSCSlide").css("-webkit-transform", "translate3d(0,0,0)");
        } else {
            // $(".WSCSlide").addClass("WSCSlideTransition");
            $(".WSCSlide").css("-webkit-transform", "translate3d(" + x + "px,0,0)");
        }
    }

    function getSlideTimer(timeNum) {
        if(typeof(timeNum) == "undefined"){
            timeNum = 3000;
        }
        var slideTimer = setInterval(function() {
            var x = getTransform(".WSCSlide").m41;
            x = x - ImgWidth;
            slideAnimate(x, endPosition);

        }, timeNum);
        return slideTimer;
    }


    function touchDragMe($element) {
        var gundongX = 0;
        var gundongY = 0;
        var d = document;
        var g = 'getElementById';
        var moveEle = $element;
        var stx = sty = etx = ety = curX = curY = 0;

        moveEle.on("touchstart", function(event) { //touchstart
            $element.removeClass(transitionName);
            clearInterval(slideTimer);
            var event = event.originalEvent;
            gundongX = 0;
            gundongY = 0;


            // 元素当前位置
            etx = parseInt(getT3d(moveEle, "x"));
            ety = parseInt(getT3d(moveEle, "y"));

            // 手指位置
            stx = event.touches[0].pageX;
            sty = event.touches[0].pageY;
        });

        moveEle.on("touchmove", function(event) {
            var event = event.originalEvent;
            // 防止拖动页面
            event.preventDefault();

            // 手指位置 减去 元素当前位置 就是 要移动的距离
            gundongX = event.touches[0].pageX - stx;
            gundongY = event.touches[0].pageY - sty;

            // 目标位置 就是 要移动的距离 加上 元素当前位置
            curX = gundongX + etx;
            curY = gundongY + ety;

            // 自由移动
            // moveEle.style.webkitTransform = 'translate3d(' + (curX) + 'px, ' + (curY) + 'px,0px)';
            // 只能移动Y轴方向
            // var realMoveEle = moveEle[0];
            moveEle[0].style.webkitTransform = 'translate3d(' + (curX) + 'px, ' + 0 + 'px,0px)';


        });
        moveEle.on("touchend", function(event) {
            // 手指接触屏幕的位置
            var oriX = etx;
            var oriY = ety;

            // 手指离开屏幕的位置
            etx = curX;
            ety = curY;

            var slidePosition = 0;
            for (var i = 0; i < ImgWidth_arr_length - 1; i++) {
                if (Math.abs(etx) > ImgWidth_arr[i]) {

                    if (oriX > etx) {
                        // 左滑
                        slidePosition = -ImgWidth_arr[i + 1];
                    } else {
                        // 右滑
                        slidePosition = -ImgWidth_arr[i];
                    }
                }

            }
            $element.addClass(transitionName);
            slideAnimate(slidePosition, endPosition);
            slideTimer = getSlideTimer(timerNum);
        });

        function getT3d(elem, ename) {
            var elem = elem[0];
            var str1 = elem.style.webkitTransform;
            if (str1 == "") return "0";
            str1 = str1.replace("translate3d(", "");
            str1 = str1.replace(")", "");
            var carr = str1.split(",");

            if (ename == "x") return carr[0];
            else if (ename == "y") return carr[1];
            else if (ename == "z") return carr[2];
            else return "";
        }
    }


    var transitionName = arg_obj["WSCSlideTransition"] || "WSCSlideTransition";
    var $WSCSlideWrapper = arg_obj["WSCSlideWrapper"] || $(".WSCSlideWrapper");
    var $WSCSlide = arg_obj["WSCSlide"] || $(".WSCSlide");
    var $WSCSlide_img = arg_obj["WSCSlide_img"] || $(".WSCSlide_img");
    var timerNum = arg_obj["timerNum"] || 3000;

    

    var ImgWidth_arr_length = $WSCSlide_img.length;
    var ImgWidth =$(window).width(); //$WSCSlide_img.width();
    $WSCSlide_img.width(ImgWidth);

    $WSCSlide.width(ImgWidth * ImgWidth_arr_length);

    var WSCSlideWidth = $WSCSlide.width();
    // 轮播图终止位置
    var endPosition = ImgWidth * ImgWidth_arr_length;

    var ImgWidth_arr = [];
    for (var i = 0; i < ImgWidth_arr_length; i++) {
        ImgWidth_arr.push(i * ImgWidth);
    }

    var slideTimer = getSlideTimer(timerNum);

    touchDragMe($WSCSlide, slideTimer);

    return slideTimer;
}
