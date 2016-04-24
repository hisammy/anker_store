(function(){
  window.onload = function() {
    FastClick.attach(document.body);
    var postion = 'left';
    localStorage.removeItem("is_active");
    if($.cookie('token')) {
      var email = localStorage.getItem('email')
      getCode(); //|| sessionStorage.getItem("powerHouseEmail");
      //subscribe(email);
    }
    /*
    if(inviter_code){
      sessionStorage.removeItem("powerHouseEmail");
    }*/
  }

  function subscribe(userEmail) {
      var  screens={};
      screens.width = Math.min(window.screen.width, window.innerWidth);
      screens.height = Math.min(window.screen.height, window.innerHeight);
      screens.colorDepth = window.screen.colorDepth || 0;
      const body = {
        'register_source': encodeURIComponent(location.href),
        'email': userEmail,
        'is_subscribe': true,
        'sub_type':'share'
      };
      if(inviter_code){
          body.body = inviter_code;
      }
      $.ajax({
         method: "POST",
          url: "/api/content?path=/api/registrations/subscribe",
          contentType: 'application/json',
          data: JSON.stringify(body),
        }).done(function(res){
            /*if(!$.cookie('token')){
              sessionStorage.setItem("powerHouseEmail",userEmail);
            }*/
            if(!res.is_active && !res.invitation_code){
              alert('Dear ianker.com customer, please merge your account to anker.com. To do so, go to the anker.com login page and enter your email address and original password. Your accounts will be merged and you will get your unique referral code.');
              
            }else{
              localStorage.setItem("is_active",res.is_active);
              location.href=location.protocol+"//" + location.host +"/deals/powerhousedetail?invitation_code="+res.invitation_code;
           }
        })
  }
  function googleLoginDig() {
    var webconfig = {
      'client_id': config.GOOGLE_APP_ID,
      'scope':'https://www.googleapis.com/auth/userinfo.email',
      'collection': 'visible'
    }
    gapi.auth.authorize(webconfig, function(authResult){
      gapi.client.load('plus', 'v1', function(){
        gapi.client.plus.people.get({userId: 'me'}).execute(function(resp){
            var email = resp.emails ? resp.emails[0].value : '';
            var user = {
            "login": email,
            "uid": resp.id,
            "third_party": "google",
            "nick_name": resp.displayName || email.split('@')[0]
          };
          third_party_login(user);
        });
      });
    });
  };
  function facebookLoginDig() {
    if (FB.getUserID() != "") {
      FB.api('/me', function () {
        FB.logout();
      })
    }
    FB.login(function(response){
      if (response.status === "connected") {
        FB.api('/me?fields=name,email', {locale: 'en_US', fields: 'name, email'}, function(response) {
          if (!response.error) {
            var user = {
              "login": response.email || "",
              "uid": response.id,
              "third_party": "facebook",
              "nick_name": response.name
            };
            third_party_login(user);
          }
        });
      }
    }, {scope: 'public_profile,email,user_birthday'});
  };
  function third_party_login(user){
    user.inviter_code = inviter_code;
    var body = {
      "register_source": encodeURIComponent(location.href),
      "user": user
    };
    $.ajax({
      url:"/api/content?path=/api/sessions/third_party_login",
      data:JSON.stringify(body),
      method:"post",
      contentType: 'application/json'
    }).done(function(json){
      if (json.token) {
        localStorage.setItem("is_active","true");
       
        AppActions.signOut();
        json.loginType = 'third_party_login';
        AppActions.signIn(json);
        //this.loginBack(AppActions.getUrlParam().back);
        AppActions.setCart(json.item_count);
        location.href=location.protocol+"//" + location.host +"/deals/powerhousedetail?invitation_code="+json.invitation_code;
      }
    })    
  };
  function getCode(){
    $.ajax({
         method: "get",
        url: "/api/content?path=/api/users/obtain_invitation",
        contentType: 'application/json',
        headers: {'token': $.cookie('token')},
        data:{nowDate:new Date().getTime()},
        }).done(function(res){
          localStorage.setItem("is_active","true");
          location.href=location.protocol+"//" + location.host +"/deals/powerhousedetail?invitation_code="+res.invitation_code;
        })
  }
})()
var AppActions = {
  getUser: function() {
    return {
      'token': $.cookie('token') || '',
      'order_id': $.cookie('order_id') || '',
      'order_token': $.cookie('order_token') || '',
      'email': localStorage.getItem('email') || '',
      'nick_name': localStorage.getItem('nick_name') || localStorage.getItem('email') || 'Account',
      'avatar': localStorage.getItem('avatar_image') || '',
      'loginType': localStorage.getItem('loginType'),
      'invitation_code': localStorage.getItem('invitation_code') || '',
      'is_power_user': localStorage.getItem('is_power_user') || '',
    };
  },
  getCountry: function() {
    return $.cookie('country');
  },
  setCart: function(n) {
    if(this.getCountry() == 'US') {
      n = n || 0;
      $.cookie('cart_count', n, { expires: 365, path: '/' });
      var cartCount = document.getElementById('cartCount');
      if (cartCount) {
        cartCount.innerHTML = n;
        if(n  == 0) {
          cartCount.classList.add('hide');
        } else {
          cartCount.classList.remove('hide');
        }
      };
    }
  },
  signOut: function() {
    $.cookie('token', null, {path: '/'});
    $.cookie('order_id', null, {path: '/'});
    $.cookie('order_token', null, {path: '/'});
    $.cookie('cart_count', null, {path: '/'});
    this.setCart(0);
    localStorage.removeItem('email');
    localStorage.removeItem('profile');
    localStorage.removeItem('nick_name');
    localStorage.removeItem('avatar_image');
    localStorage.removeItem('invitation_code');
    localStorage.removeItem('user_password');
    localStorage.removeItem('order_price');
    localStorage.removeItem('purchase');
    localStorage.removeItem('country_code');
  },
  signIn: function(json) {
    $.cookie('token', json.token, { expires: 365, path: '/' });
    if (json.id) {
      localStorage.setItem('user_id', json.id);
      ga('create', config.GOOGLE_TRACKING_ID, {user_id: localStorage.getItem('user_id')});
      ga('set', 'userId', localStorage.getItem('user_id'));
      ga('set', 'dimension1', localStorage.getItem('user_id'));
    }
    if (json.email) localStorage.setItem('email', json.email);
    if (json.nick_name) localStorage.setItem('nick_name', json.nick_name);
    json.is_power_user ? localStorage.setItem('is_power_user', '1') : localStorage.removeItem("is_power_user");
    if (json.order_id && json.order_token) {
      $.cookie('order_id', json.order_id, { expires: 365, path: '/' });
      $.cookie('order_token', json.order_token, { expires: 365, path: '/' });
    } else {
      $.cookie('order_id', null, {path: '/'});
      $.cookie('order_token', null, {path: '/'});
      this.setCart(0);
    }
    json.loginType ? localStorage.setItem('loginType', json.loginType) : localStorage.removeItem('loginType');
    localStorage.removeItem('user_password');
    localStorage.removeItem('order_price');
    localStorage.removeItem('purchase');
  },
  getUrlParam: function() {
    var search = location.search.replace('?', '').split('&');
    var params = {};
    for (var i in search) {
      var key = search[i].split('=')[0];
      var value = search[i].split('=')[1];
      params[key] = value;
    }
    return params;
  },
};
