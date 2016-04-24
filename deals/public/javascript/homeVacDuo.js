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
    $(".btn").on("click",function(){
      var reg = /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/,
          userEmail = $("#userEmail").val() || localStorage.getItem('email');
        if(!reg.test(userEmail)){
            alert("Please enter a valid email address (Example: name@domain.com)");
            return;
        }else{
            shareEntries();
        }
    })
    if($.cookie('token')) {
      var email = localStorage.getItem('email');
      if(email){
          $(".loginDivInput").html(email).css({"color":"#37a7e1","text-align":"center"});
      }
      $(".btn").val("JOIN NOW");
    }
    $(".shareDiv").on("click","img",function(event){
        var shareType = $(event.target).attr("shareType");
        if(shareType=="google"){
          window.open("https://plus.google.com/share?url="+encodeURIComponent(location.href+"?verson=1"),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
        }else if(shareType=="facebook"){
          FB.ui({
            method: 'share',
            href: location.href,
          }, function (response) {
          });
        } 
    })
  }
  //签到
  function shareEntries() {
      var  screens={};
      screens.width = Math.min(window.screen.width, window.innerWidth);
      screens.height = Math.min(window.screen.height, window.innerHeight);
      screens.colorDepth = window.screen.colorDepth || 0;
      $.ajax({
        method: "POST",
        url: "/api/content?path=/api/registrations/home_vacduo",
        contentType: 'application/json',
        headers:{'_screens':JSON.stringify(screens)},
        data: JSON.stringify({
        'register_source': encodeURIComponent(location.href),
        'email': $("#userEmail").val() || localStorage.getItem('email'),
        'country_code':'US'
      }),
        success: function(r) {
          if(r.result =="success"){
            alert("Congratulations! You’ve won the HomeVac Duo for just $99.99. We will sent e-mail with code to you as soon.");
          }else if(r.result =="faild" && r.is_new =="true" && r.error=="shortage"){
              alert("Thank you for registration, but today code is claimed.")
          }else if(r.result =="faild" && r.is_new =="false" && r.error=="shortage"){
              alert("Today code is claimed.")
          }
          else if(r.result =="faild" && r.error =="assigned"){
            alert("This email has been joined.");
          }
        },
        error:function(r){
            alert(r.responseJSON.error);
        }
      });
  }
window.fbAsyncInit = function() {
  FB.init({
    appId      : config.FB_APP_ID,
    xfbml      : true,
    version    : 'v2.5'
  });
};
})()


