window.onload = function() {
  FastClick.attach(document.body);
  $.getScript('//platform.twitter.com/widgets.js', function() {
    function handleTweetEvent(event) {
      if (event) {
        //不论'取消'还是分享'都会返回对象，视为分享成功
        ga('send','event','Campaign','Tweet','QC');
        shareEntries('twitter');
      }
    }
    twttr.events.bind('tweet', handleTweetEvent);
  });
  /*winner();*/
  var nick_name = localStorage.getItem('nick_name');
  var email = localStorage.getItem('email') || 'Account';
  var country_code = localStorage.getItem('country_code');
  if($.cookie('token')) {
    $("#step1").html(nick_name ? nick_name : email).css("color","#37a7e1");
    $(".step1>i").css("color","#37a7e1");
    $(".line1").css("background-color","#37a7e1");
  }
  $("#facebookShare").on("click",function(event){
  	shareConfirm(event, 'Facebook');
  })
  $("#tweetShare").on("click",function(event){
  	shareConfirm(event, 'Twitter');
  })
  
  $("#batteryBtn").on("click",countdown);
  $(".revolutionList").on("click",".bnt",function(){
    ga('send','event','Campaign','Register','QC');
  })
  $("#register").on("click",function(){
    ga('send','event','Campaign','Product','QC');
  })
	$("#step2").on("click",".setup",function(){
			$("#country1").show();
      $("#step2>.setup").css("visibility","hidden");
      $(".step2>i").css("color","#37a7e1");
      $(".line2").css("background-color","#37a7e1");
      $(".empty1").css("border-top","1px solid #37a7e1");
      selectCountry="us";
	})
  $("#login").on("click",function(){
    var country_code = selectCountry;
    ga('send','event','Campaign','Login','QC');
    location.href="/login?back=deals/anker_qc"+(country_code ? ("/" + country_code.toLowerCase()) : "");
  })
	if(selectCountry) {
	  localStorage.setItem('country_code', selectCountry);
	  $("#step2 .setup").css("visibility","hidden");
	  $("#country1").show();
    $(".step2>i").css("color","#37a7e1");
    $(".line2").css("background-color","#37a7e1");
    $(".empty1").css("border-top","1px solid #37a7e1");
	  //签到
	}
}
window.fbAsyncInit = function() {
  FB.init({
    appId      : config.FB_APP_ID,
    xfbml      : true,
    version    : 'v2.5'
  });
};
(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
//签到
function shareEntries(type) {
  if($.cookie('token')) {
    $.ajax({
      method: "POST",
      url: "/api/content?path=/api/deals/deals_audios/",
      headers: {'token': $.cookie('token')},
      contentType: 'application/json',
      data: JSON.stringify({"deals_type":"QC","action_type": type, "country_code": selectCountry.toUpperCase() || 'US'}),
      success: function(r) {
      	$(".step3>i").css("color","#37a7e1");
        $(".line3").css("background-color","#37a7e1");
        $(".empty2").css("border-top","1px solid #37a7e1");
        $("#shareTips").show();
        $("#tweetShare,.noLink,#facebookShare").css("color","#37a7e1");
      },
      complete: function(r) {
        if(r.status === 401) logOut();
      }
    });
  }
}
//分享步骤错误提示
function shareConfirm(event, val) {
 // ga('send', 'event', 'Valentine s Day Giveaway', 'btn_click', val);
  if($.cookie('token') && selectCountry) {
    if (val === 'Facebook') {
      FBShare(location.href);
    }
    return true;
  } else {
    event.preventDefault();
    event.stopPropagation();
    dialog.confirm({
      'content': lang.alertTips
    }, function() {
      //
    }, '', 'OK');
    return false;
  }
}
function countdown(){
  $("#batteryBtn").off("click",countdown);
  ga('send','event','Campaign','CountDown','QC');
  var sec = 30000,fourIndex = 9,threeIndex = 9,windowWidth = $(window).width();
    $("#progress2,#progress3").css({"height":"0","background-color":"red"});
    $(".progressTisp").html("0%");
    $(".battery1").removeClass("start");
    $("#progressAllTisp3,#progressAllTisp2").html("0");
    var first = 0,
      secondHeight = 54,
      threeHeight=61,
      allHeight=87;
    if(windowWidth === 320){
        secondHeight=37;
        threeHeight = 42;
        allHeight = 60;
    }
    var minsecHeight = secondHeight/3000,
      minthreeHeight = threeHeight/3000,
      nowSecHeight = 0,
      nowThreeHieght = 0,count = 0;
    //0.00566;
    var time = setInterval(function(){
        sec = sec - 10; 
        var one = Math.floor(sec/10000);
        var two = Math.floor(sec/1000);
        if(two>=10){
          two = two.toString().substr(1,1);
        }
        $(".imgOne img").hide();
        $(".imgOne .img"+one).show();

        $(".imgTwo img").hide();
        $(".imgTwo .img"+two).show();

        $(".imgThree img").hide();
        $(".imgThree .img"+threeIndex).show();

        $(".imgFour img").hide();
        $(".imgFour .img"+fourIndex).show();
        first = (first + 0.005667);
        count ++ 
        
        nowSecHeight = nowSecHeight + minsecHeight;
        nowThreeHieght = nowThreeHieght + minthreeHeight;

        $("#progress2").height(nowSecHeight);
        $("#progress3").height(nowThreeHieght)

        var progress = Math.floor((62/3000)*count)
        $("#progressTisp2").html(progress+"%");
        if(progress>=20){
          $("#progress2").css("background-color","#24ce7b");
        }
        var progress = Math.floor((75/3000)*count)
        $("#progressAllTisp2").html(progress);

         var progress = Math.floor((70/3000)*count)
        $("#progressTisp3").html(progress+"%");
        if(progress>=20){
          $("#progress3").css("background-color","#24ce7b");
        }
        var progress = Math.floor((85/3000)*count)
        $("#progressAllTisp3").html(progress);

         
       // second = (second + 0.020667);
        $("#progressTisp1").html(Math.floor(first)+"%");
        //$("#progressTisp2").html(Math.floor(second)+"%");
        fourIndex -- ;
        if(fourIndex == -1){
          fourIndex = 9;
          threeIndex -- 
          if(threeIndex == -1){
              threeIndex = 9;
          }
        }
        if(sec==0){
          clearInterval(time);
          $("#batteryBtn").on("click",countdown);
        }
    },10)
    /*
    $("#progress1").animate({"height":"15px"},{
      duration:30000,
      "step":function(ev){
       // var progress = Math.floor(ev/87*100);
        //$("#progressTisp1").html(progress+"%");
      }
    });
    
    $("#progress2").animate({"height":secondHeight},{
      duration:30000,
      "step":function(ev){
        var progress = Math.floor(ev/allHeight*100)
        $("#progressTisp2").html(progress+"%");
        if(progress>=20){
          $("#progress2").css("background-color","#24ce7b");
        }
        var progress = Math.floor(ev/secondHeight*75)
        $("#progressAllTisp2").html(progress);
      }
    });
   
    $("#progress3").animate({"height":threeHeight},{
      duration:30000,
      "step":function(ev){
        var progress = Math.floor(ev/allHeight*100)
        $("#progressTisp3").html(progress+"%");
        if(progress>=20){
          $("#progress3").css("background-color","#24ce7b");
        }
        var progress = Math.floor(ev/threeHeight*240)
        $("#progressAllTisp3").html(progress);
      }
    });
     */
    $(".battery1").addClass("start");
}
function FBShare(url) {
    ga('send','event','Campaign','Share','QC');
    url = url || location.href;
    FB.ui({
      method: 'share',
      href: url,
    }, function (response) {
      if(response) {
        //不论'取消'还是分享'都会返回空数组，视为分享成功
        shareEntries('facebook');
        $("#shareTips").show();
      }
    });
  };
function GetQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}
//获取中奖信息
function winner() {
  $.ajax({
    method: 'GET',
    url: '/api/content?path=/api/deals/deals_audios/winner',
    data: {'country_code': selectCountry || 'US'},
    success: function(r) {
      r.map(function(item){
        if(item.zone == dayIndex){
            $("#winnerId").html(item.email);
        }
      })
    },
    complete: function(r) {
      if(r.status === 401) logOut();
    }
  })
};
