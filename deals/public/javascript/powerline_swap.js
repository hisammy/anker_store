(function(){
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
    var nick_name = localStorage.getItem('nick_name');
    var email = localStorage.getItem('email') || 'Account';
    if($.cookie('token')) {
      $(".one > div").html("1. "+(nick_name ? nick_name : email)).css("color","#37a7e1");
      if(userBody.ok){
        $("#getCode").css("background-color","#00a2e1");
      }
      if(userBody.user_country){
        $("#selectCountry").attr("disabled","true");
        selectCountry = userBody.user_country;
        $.cookie("swapCountry",selectCountry);
      }
    }
    $("#selectCountry").val(selectCountry.toLowerCase());
    $("#facebookShare").on("click",function(event){
      ga('send','event','Campaign','FB','SWAP');
      shareConfirm(event, 'facebook');
    })
    $("#tweetShare").on("click",function(event){
      ga('send','event','Campaign','TW','SWAP');
      shareConfirm(event, 'Twitter');
    })
    $("#googleShare").on("click",function(event){
      ga('send','event','Campaign','G','SWAP');
      shareConfirm(event, 'google');
    })
    $("#videoLink").on("click",function(){
      ga('send','event','Campaign','BestCable','SWAP');
    })
    $("[key-name]").on("click",function(event){
      var name = $(event.target).attr("key-name");
      ga('send','event','Campaign',name,'SWAP');
    })
    $("#login").on("click",function(){
      ga('send','event','Campaign','Login','SWAP');
      location.href="/login?back=deals/powerline_swap";
    })
    $("#register").on("click",function(){
      ga('send','event','Campaign','Register','SWAP');
    })
    $("#selectCountry").on("change",function(){
      if(!$.cookie('token')){
        $(this).val($(this).val()=="us"?"uk":"us");
        alert("Please complete previous step!");
      }else{
        $.cookie("swapCountry",$(this).val());
        location.href="/deals/powerline_swap";
      }
    })
    var controlWidth = $("#divList1").width();
    $(".itemList li").width(controlWidth);
    $("#getCode").on("click",getCode);
    $(".itemList").on("click","i",function(event){
        var btn = $(event.target),
            pUl = btn.closest(".container").children().eq(0),
            itemIndex = pUl.attr("itemIndex"),
            data_type = btn.attr("data-type"),
            data_index = parseInt(pUl.attr("data-index")),
            itemCount = pUl.attr("itemCount");
        data_index = data_type == "up" ? data_index -1 :  data_index +1 ;
        if(data_type == "down" && data_index>itemCount){
          data_index = 0;
        }else if(data_type =="up" && data_index <= -1){
            data_index = itemCount;
        }
        pUl.css("transform","translate3d(-"+(data_index*controlWidth)+"px, 0px, 0px)");
        pUl.attr("data-index",data_index);
    })
    countdown();
    function countdown(){
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
  function getStatus(){
    if($.cookie('token')) {
        $.ajax({
          method: "get",
          url: "/api/content?path=/api/powerline_swap/status",
          headers: {token: $.cookie('token')},
          contentType: 'application/json',
          success: function(r) {
            r.user_country ? $("#selectCountry").attr("disabled","true") :'';
            if(r.ok){
                $("#getCode").css("background-color","#00a2e1");
            }
            /*else if(r.code=="fail"){
                $(".error").html("Unlucky, today’s codes have all been collected, but you can try again tomorrow.");
            }else if(r.code =="existe"){
              $(".error").html("Your account has already participated in today’s Cable Swap.")
            }else if(r.code =="not_started"){
              $(".error").html("You’re ready for the Cable Swap! Return April 2nd at 12:00 PM PST for your chance to collect a $0.01 code.")
            }*/
          },
          error:function(r){
            if(r.status>499 && r.status<599){
              alert('System busy, please try agian');
            }
          }
        })
      }else{
        alert("Please complete all the steps to retrieve the code.");
      }
  }
  function getCode(){
    ga('send','event','Campaign','ClickCODE','SWAP');
    if($.cookie('token')) {
        $.ajax({
          method: "POST",
          url: "/api/content?path=/api/powerline_swap/get_code",
          headers: {'token': $.cookie('token')},
          contentType: 'application/json',
          success: function(r) {
              if(r.ok){
                ga('send','event','Campaign','GetCODE','SWAP');
                alert('Congratulations! You’ve won a $0.01 code. The code has been sent to your email. If you can’t find it, please check your junk mail. Any issues please contact marketing@anker.com.')
              }
          },
          error:function(r){
            if(r.status === 422){
              switch(r.responseJSON.code){
                  case "not_started" :
                    alert("You’re ready for the Cable Swap! Return April 2nd at 12:00 PM PDT for your chance to collect a $0.01 code.")
                    break;
                  case "uncompleted":
                    alert("Please complete all the steps to retrieve the code.");
                    break;
                  case "existe" :
                    alert("Your account has already participated in today’s Cable Swap.")
                    break;
                  case "fail" :
                    alert("Unlucky, today’s codes have all been collected, but you can try again tomorrow.")
                    break;
                  case "access_forbidden" :
                    alert("Please complete all the steps to retrieve the code.");
                    $.cookie('token',"");
                    break;
                }
            }
            if(r.status == 401){
              alert("Get Code failed, please login again");
              $.removeCookie("token",{"path":"/"});
              location.href="/login?back=deals/powerline_swap";
            }
            if(r.status>499 && r.status<599){
              alert('System busy, please try agian');
            }
          }
        })
      }else{
        if($("#login").length ==0){
          alert("Get Code failed, please login again");
          location.href="/login?back=deals/powerline_swap";
        }else{
          alert("Please complete all the steps to retrieve the code.");
        }
      }
  }
  //签到
  function shareEntries(type) {
      var  screens={};
      screens.width = Math.min(window.screen.width, window.innerWidth);
      screens.height = Math.min(window.screen.height, window.innerHeight);
      screens.colorDepth = window.screen.colorDepth || 0;
      if($.cookie('token')) {
        $.ajax({
          method: "POST",
          url: "/api/content?path=/api/powerline_swap/check_in",
          headers: {'token': $.cookie('token')},
          contentType: 'application/json',
          data: JSON.stringify({"social_platform": type,"country": $("#selectCountry").val().toUpperCase()}),
          success: function(r) {
            getStatus();
          },
          error:function(r){
            if(r.status == 401){
              alert("Share failed, please login again");
              $.removeCookie("token",{"path":"/"});
              location.href="/login?back=deals/powerline_swap";
            }
            if(r.status>499 && r.status<599){
              alert('System busy, please try agian');
            }
          }
        })
      }
  }
function shareConfirm(event, val) {
 // ga('send', 'event', 'Valentine s Day Giveaway', 'btn_click', val);
 var selectCountry = $("#selectCountry").val();
  if($.cookie('token') && selectCountry) {
    if (val === 'facebook') {
      FBShare(location.href);
    }else if(val === "google"){
      window.open("https://plus.google.com/share?url="+encodeURIComponent(location.href+"?verson=2"),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
      shareEntries("google");
    }
    return true;
  } else {
    event.preventDefault();
    event.stopPropagation();
    if($("#login").length ==0){
      alert("Share failed, please login again");
      location.href="/login?back=deals/powerline_swap";
    }else{
      alert("Please complete previous step!");
    }
    return false;
  }
}
function FBShare(url) {
    url = url || location.href;
    FB.ui({
      method: 'share',
      href: url,
    }, function (response) {
      if(response) {
        //不论'取消'还是分享'都会返回空数组，视为分享成功
        shareEntries('facebook');
       // $("#shareTips").show();
      }
    });
  };
(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));
window.fbAsyncInit = function() {
  FB.init({
    appId      : config.FB_APP_ID,
    xfbml      : true,
    version    : 'v2.5'
  });
};
})()


