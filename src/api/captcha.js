// local没有nginx转发验证码, 所以用node重做转发逻辑

import { config } from '../../build/config';
import request from 'superagent';

import { Router } from 'express';
const router = new Router();

router.use('*', async (req, res, next) => {
  let cookies = req.cookies;
  let headers = {'platform': config.platform};
  if(cookies['token']) {
    headers['X-Spree-Token'] = cookies['token'];
  }
  // console.log(config.api + req.url, headers, cookies);
  request('get', `${config.api}/simple_captcha${req.url}`)
    .set(headers)
    .pipe(res);
});

export default router;