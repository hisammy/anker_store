/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import Cookie from '../utils/Cookie';
import { config } from '../../build/config';

export default {
  setCart(n) {
    if(this.getCountry() == 'US') {
      n = n || 0;
      Cookie.save('cart_count', n ,{path: '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});
      const cartCount = document.getElementById('cartCount');
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
  getUser() {
    if (global.server) return {};
    return {
      'token': !Cookie.load('token') ? '' : Cookie.load('token'),
      'order_id': !Cookie.load('order_id') ? '' : Cookie.load('order_id'),
      'order_token': !Cookie.load('order_token') ? '' : Cookie.load('order_token'),
      'email': !localStorage.getItem('email') ? '' : localStorage.getItem('email'),
      'nick_name': !localStorage.getItem('nick_name') ? !localStorage.getItem('email') ? 'Account' : localStorage.getItem('email') : localStorage.getItem('nick_name'),
      'avatar': !localStorage.getItem('avatar_image') ? '' : localStorage.getItem('avatar_image'),
      'loginType': localStorage.getItem('loginType'),
      'invitation_code': !localStorage.getItem('invitation_code') ? '' : localStorage.getItem('invitation_code'),
      'is_power_user': !localStorage.getItem('is_power_user') ? '' : localStorage.getItem('is_power_user')
    };
  },
  setCountry: (country) => {
    Cookie.save('country', country ,{path: '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});
  },
  getCountry() {
    return Cookie.load('country');
  },
  removeOrder() {
    Cookie.remove('order_id', {path: '/'});
    Cookie.remove('order_token', {path: '/'});
    this.setCart(0);
  },
  tempOrderToken(token) {
    Cookie.save('temp_order_token', token, {path: '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});
  },
  visitor(json) {
    Cookie.save('order_id', json.number, {path: '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});
    Cookie.save('order_token', json.token, {path: '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});
  },
  regWithAddress(json) {
    if (global.server) return false;
    Cookie.save('token', json.token, {path: '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});
    localStorage.setItem('email', json.email);
    localStorage.setItem('nick_name', json.nick_name);
  },
  signIn(json) {
    if (global.server) return false;
    Cookie.save('token', json.token, {path: '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});
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
      Cookie.save('order_id', json.order_id, {path: '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});
      Cookie.save('order_token', json.order_token, {path: '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});
    } else {
      Cookie.remove('order_id', {path: '/'});
      Cookie.remove('order_token', {path: '/'});
      this.setCart(0);
    }
    json.loginType ? localStorage.setItem('loginType', json.loginType) : localStorage.removeItem('loginType');
    localStorage.removeItem('user_password');
    localStorage.removeItem('order_price');
    localStorage.removeItem('purchase');

    /*if (json.profile) {
     localStorage.setItem('email', (json.profile.email ? json.profile.email : ''));
     localStorage.setItem('nick_name', (json.profile.nick_name ? json.profile.nick_name : ''));
     localStorage.setItem('avatar_image', (json.profile.avatar_image ? json.profile.avatar_image.mini_url : ''));
     localStorage.setItem('invitation_code', (json.profile.invitation_code ? json.profile.invitation_code : ''));
     }*/
  },
  signOut() {
    Cookie.remove('token', {path: '/'});
    Cookie.remove('order_id', {path: '/'});
    Cookie.remove('order_token', {path: '/'});
    Cookie.remove('cart_count', {path: '/'});
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
  setProfile(json) {
    localStorage.setItem('email', json.email || json.login || '');
    localStorage.setItem('nick_name', (json.nick_name ? json.nick_name : ''));
    localStorage.setItem('avatar_image', (json.avatar_image ? json.avatar_image.mini_url : ''));
    localStorage.setItem('invitation_code', (json.invitation_code ? json.invitation_code : ''));
    json.is_power_user ? localStorage.setItem('is_power_user', '1') : localStorage.removeItem("is_power_user");
  },
  getUrlParam() {
    if (global.server) return {};
    let search = window.location.search.replace('?', '').split('&');
    let params = {};
    for (let i in search) {
      let key = search[i].split('=')[0];
      let value = search[i].substr(key.length+1);
      params[key] = value;
    }
    return (params);
  },
  loading(bool) {
    if (global.server) return false;
    let loading = document.createElement('div');
    loading.id = 'loading';
    loading.innerHTML = '<div class="loading-cell"><i class="iconfont">&#xe67b;</i><b><em><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></em></b><span>Loading...</span></div>';
    if (bool) {
      if (!document.getElementById('loading')) {
        document.body.appendChild(loading);
      }
    } else {
      if (document.getElementById('loading')) {
        document.getElementById('loading').parentNode.removeChild(document.getElementById('loading'));
      }
    }
  }
};
