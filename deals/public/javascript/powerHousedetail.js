(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
(function(){
  window.onload = function() {
    FastClick.attach(document.body);
    //alert(navigator.platform);  
    subscribe();
  }

  function subscribe() {
      var  screens={};
      screens.width = Math.min(window.screen.width, window.innerWidth);
      screens.height = Math.min(window.screen.height, window.innerHeight);
      screens.colorDepth = window.screen.colorDepth || 0;
      const body = {
        'register_source': encodeURIComponent(location.href),
        'invitation_code': inviter_code1,
        'nowDate' : new Date().getTime()
      };
      $.ajax({
         method: "get",
        url: "/api/content?path=/api/users/inviter_count",
        contentType: 'application/json',
        data: body
        }).done(function(res){
            if(res.inviter_count > 0){
              var ispc = isPC();
              if(res.inviter_count <11){
                  ispc ? $(".line").css("width",5*res.inviter_count+"%") : $(".line").css("height",20*res.inviter_count+"px");
                  res.inviter_count>=5 ? $(".index").eq(0).addClass("on") : '';
                  res.inviter_count ==10 ? $(".index").eq(1).addClass("on") : '';
              }
              else if(res.inviter_count >10 && res.inviter_count<31){
                  ispc ? $(".line").css("width",(50 + 1.25*(res.inviter_count-10))+"%") : $(".line").css("height",(200 + 5*(res.inviter_count-10))+"px");
                  $(".index").eq(0).addClass("on")
                  $(".index").eq(1).addClass("on")
                  res.inviter_count ==30 ? $(".index").eq(2).addClass("on") : '';
              }else if(res.inviter_count >= 31){
                $(".index").eq(0).addClass("on")
                $(".index").eq(1).addClass("on")
                $(".index").eq(2).addClass("on")
                ispc ? $(".line").css("width",(75 + 0.35714285714286*(res.inviter_count-30))+"%") : $(".line").css("height",(300 + 1.4285714*(res.inviter_count-30))+"px");
                res.inviter_count >=100 ? $(".index").eq(3).addClass("on") : '';
              }
            }
           
        })
  }
  //countdown();
  function countdown(){
    if(nowDate>0){
      var t = setInterval(function(){
        nowDate = nowDate - 1000;
        var hours = Math.floor(nowDate / (1000 * 60 * 60));
        var minutes =Math.floor((nowDate % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((nowDate % (1000 * 60)) / 1000);
          $("#hours").html(hours);
          $("#minutes").html(minutes);
          $("#seconds").html(seconds);
        if(nowDate<=0){
          clearInterval(t);
        }
      },1000)
    }
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
  window.fbAsyncInit = function() {
  FB.init({
    appId      : config.FB_APP_ID,
    xfbml      : true,
    version    : 'v2.5'
  });
};
})()


