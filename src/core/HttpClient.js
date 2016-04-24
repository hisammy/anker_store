/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import request from 'superagent';
import queryString from 'query-string';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import Dialog from '../utils/Dialog';
import AppActions from '../core/AppActions';
import Location from './Location';
import Cookie from '../utils/Cookie';
import Verify from '../utils/Verify';

function getUrl(path) {
  if (path.startsWith('http') || canUseDOM) {
    return path;
  }
  return process.env.WEBSITE_HOSTNAME ?
    `http://${process.env.WEBSITE_HOSTNAME}${path}` :
    `http://127.0.0.1:${global.server.get('port')}${path}`;
}

const HttpClient = {

  file: (method, path, filepath) => new Promise((resolve, reject) => {
    request(method, getUrl(path))
      .attach('avartar', filepath)
      .end((err, res) => {
        resolve(res.body);
      })
  }),

  post: (method, path, query, cookies, silent) => new Promise((resolve, reject) => {

    //非静默加载 动画效果开始
    if (!silent) {
      AppActions.loading(true)
    };

    //如果浏览器端请求，肯定没有传Cookie过来，直接到document.cookie里面取
    var output = {};
    if (global.window) {
      document.cookie.split(/\s*;\s*/).forEach(function(pair) {
        pair = pair.split(/\s*=\s*/);
        if(pair[0] && /\[|=|\]/g.test(pair[0]) === false) {
          output[pair[0]] = pair.splice(1).join('=');
        }
      });
    } else {
      for(var i in cookies) {
        // console.log(i, /\[|=|:|\]/g.test(i));
        if(i && /\[|=|:|\]/g.test(i) === false) {
          output[i] = cookies[i];
        }
      }
    }
    cookies = output;

    //为请求加入cachetime时间戳，禁止浏览器缓存
    query = !query ? {} : query;
    query.cachetime = Verify.dateFormat(new Date(), 'hhmmss');

    //如果是”忘记密码”页面，且没有user_token和url_token则跳转登陆
    if (path === '/password' && !AppActions.getUser().token && !AppActions.getUrlParam().token) {
      Location.push( '/login');
      return resolve();
    }
    // console.log('unauth_redirect', query.unauth_redirect, global.window ? 1 : 0);
    if (query.unauth_redirect) {
      if (!AppActions.getUser().token) { // 一些页面需要登录的, 跳过API, 直接登录
        setTimeout(function () {
          Location.push( '/login?back=' + query.unauth_redirect.slice(1));
        }, 0);
        return resolve();
      }
      delete query.unauth_redirect;
    }
    let screens = {}
    if (global.window) {
      screens.width = Math.min(window.screen.width, window.innerWidth);
      screens.height = Math.min(window.screen.height, window.innerHeight);
      screens.colorDepth = window.screen.colorDepth || 0;
    }

    //模版层读取数据总出口
    request(method, getUrl(path))
      .query((method === 'get' && query) ? query : {})
      .send(query ? query : {})
      .set(cookies ? cookies : {})
      .set('_screens', JSON.stringify(screens))
      // .set('user-agent', 'navigator.userAgent')
      .accept('application/json')
      .end((err, res) => {
        //非静默加载 动画效果结束
        if (!silent) {
          AppActions.loading(false)
        };
        if (res.status === 401) {           //如果node端返回401状态(通常为api端返回)
          if (AppActions.getUser().token) { //且没有user_token
            AppActions.signOut();           //则退出客户端登录
          }
          if(res.body.code === 'invalid_order') {  //如果游客用户有order没user遇到401，则清空当前order
            AppActions.removeOrder();
          }
          if (global.window) {
            const pathname = location.pathname.slice(1);
            const search = 'login' == pathname ? location.search : '?back=' + pathname + location.search;
            Location.push( '/login' + search); //跳转“登陆”页面
          } else {
            resolve();
          }
        } else {
          Object.prototype.toString.call(res.body) === '[object Object]' ?  res.body.status = res.status : '';
          resolve(res.body);
        }
      });


  }),

};

export default HttpClient;
