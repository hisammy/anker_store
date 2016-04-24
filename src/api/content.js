/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import { join } from 'path';
import { Router } from 'express';
import bodyParser from 'body-parser';
import queryString from 'query-string';
import formidable from 'formidable';
import fs from 'fs';
import request from 'superagent';
import { config } from '../../build/config';

const router = new Router();
router.use(bodyParser.json());
var req_his = 0;

router.use('*', async (req, res, next) => {

  //访问非首页时，如果没有国家参数，默认给US
  if(!req.cookies.country) {
    res.cookie('country', 'US', { 'path': '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 365)) });
  }

  // console.log(req.ip, req.ips, req.headers['user-agent']);
  // res.setHeader('__', req.ip); // 在API的Response Headers输出
  let ip = req.ip.split(':'); // 本地node返回IPV6: ::ffff:127.0.0.1
  ip = ip[ip.length - 1];
  var extendHeaders = { // 传给每个API的header
    'ip': ip, // (req.headers['x-forwarded-for'] || req.connection.remoteAddress)
    'agent': req.headers['user-agent'] || ''
  };
  if(req.cookies.device) {
    extendHeaders.device = req.cookies.device;
  }
  // 禁止JS, 也可以获取: routes.js的Http.post传state.agent; HttpClient的post增加agent参数;

  const path = req.query.path;
  delete req.query.path;
  const cookies = req.headers;
  const params = req.method.toLowerCase() === 'get' ? req.query : req.body;
  let json = {};
  json = path.split('/')[1] === 'api'
    ? await getApi(req.method, path, params, cookies, extendHeaders)
    : await readFile(join(__dirname, path), { encoding: 'utf8' });
   try {
      res.status(json ? json.status : '502').send(json ? json.body : {});
    } catch (err) {
      next(err);
  }
})

/*
 * 读取外部文件出口
 *
 */
const exists = filename => new Promise(resolve => {
  fs.exists(filename, resolve);
});
const readFile = filename => new Promise(resolve => {
  fs.readFile(filename, 'utf8', (err, res) => {
    try {
      resolve({
        'body': {
          'file': res
        },
        'status': 200
      })
    } catch (e) {
      resolve({
        'body': {
          'file': 'no file'
        },
        'status': 404
      })
    }
  });
});


/*
 * API请求总出口
 *
 */
const getApi = (method, path, params, cookies, extendHeaders = {}) => new Promise(resolve => {

  //是否需要token检测
  let token_need = true;
  const token_need_reg = [
    /^\/$/,
    /^\/index$/,
    /^\/activity$/,
    /^\/search$/,
    /^\/products$/,
    /^\/product$/,
    /^\/api\/products\/\d+\/reviews$/
  ];
  token_need_reg.map((item) =>  {
    if (item.test(path)) {
      token_need = false;
      return;
    }
  });

  let headers = {'platform': config.platform};
  headers = Object.assign(headers, extendHeaders);
  if (cookies) {
    headers['country'] = (cookies['country'] || 'US').toUpperCase(); // 国家默认US for API(搜索引擎需要数据) // isSpider(UA)
    if (cookies['order_token']) {
      headers['X-Spree-Order-Token'] = cookies['order_token'];
    }
    if (cookies['token'] && token_need) {
      headers['X-Spree-Token'] = cookies['token'];
    }
  }
  /*去掉浏览器端的cachetime参数，以免破坏api端缓存机制*/
  if(params['cachetime']) {
    delete params.cachetime;
  }

  /*历史订单token判断*/
  if (params['his'] && cookies['temp_order_token']) {
    headers['X-Spree-Order-Token'] = cookies['temp_order_token'];
  }

  /*广告影响代码ref提交*/
  if (path === '/api/orders/populate' || path === '/api/registrations' || path === '/api/sessions/third_party_login') {
    let ref = [];
    for (let i in cookies) {
      if(i.indexOf('ref_') === 0) {
        ref.push(cookies[i] + '____' + i.replace('ref_',''))
      }
    }
    ref = ref.sort();
    for(let i in ref) {
      ref[i] = ref[i].split('____').pop();
    }
    params.ref = ref.toString();
  }

  request(method, config.api + path)
    .send(params)
    .set(headers)
    .accept('application/json')
    .end((err, res) => {

      /*
       * 隐藏头部信息值
       */
      for (let i in headers) {
        if (i.indexOf('Token') > -1) {
          headers[i] = '****************';
        }
      }
      /*
       * 隐藏密码参数值
       */
      for (let i in params) {
        if (i.indexOf('password') > -1) {
          params[i] = '********';
        }
      }
      /*
       * 打印传输信息
       */
      console.log(res ? `method:${method} path:${config.api}${path} status:${res.status}\n ${JSON.stringify(params)} \n ${JSON.stringify(headers)} \n ${res.body && res.body.error || res.body.exception ? ('\n' + JSON.stringify(res.body)) : ''}` : '502');

      try {
        resolve(res)
      } catch (e) {
        resolve({
          'body': {
            'data': 'no api'
          },
          'status': 404
        })
      }
    })
});

export default router;
