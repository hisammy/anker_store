/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import 'newrelic';
import 'babel-core/polyfill';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import React from 'react';
import ReactDOM from 'react-dom/server';
import Router from './routes';
import Html from './components/Html';
import fs from 'fs';
import assets from './assets.json';
import formidable from 'formidable';
import { isSpider } from './utils/Helper';

const server = global.server = express();

server.enable('trust proxy', true);
server.set('x-powered-by', false);
server.set('port', (process.env.PORT || 5000));
server.use(express.static(path.join(__dirname, 'public')));
server.use(cookieParser());

//
// Airbrake with NODE_EN=production
// -----------------------------------------------------------------------------
var airbrake = require('airbrake').createClient("119787", "ca311138f7420b29e31e9ed3ec9049a6");
server.use(airbrake.expressHandler());

//
// Register API middleware
// -----------------------------------------------------------------------------
server.use('/api/content', require('./api/content'));
server.use('/api/file', require('./api/file'));
server.use('/simple_captcha', require('./api/captcha'));
server.use('/locales', require('./api/locales'));
server.use('/deals', require('../deals/index'));

// 旧官网link跳转
server.get(['/support/fullscreen'], function(req, res) {
  return res.redirect('/');
});

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
server.get('*', async(req, res, next) => {
  //访问非首页时，如果没有国家参数，默认给US
  if(!req.cookies.country && req.path !== '/' && req.path !== '/index') {
    res.cookie('country', 'US', { path: '/', maxAge: 1000 * 60 * 60 * 24 * 365 });
  }

  //广告代码存储
  if(req.query.ref) {
    res.cookie('ref_' + req.query.ref, Date.now(), { path: '/', maxAge: 1000 * 60 * 60 * 24 * 7});
  };
  if(req.query.tag) {
    res.cookie('ref_' + req.query.tag, Date.now(), { path: '/', maxAge: 1000 * 60 * 60 * 24 * 7});
  };

  try {
    let statusCode = 200;
    const data = {title: '', description: '', css: '', body: '', entry: assets.app.js};
    const css = [];
    const context = {
      onInsertCss: value => css.push(value),
      onSetTitle: value => data.title = value,
      onSetMeta: (key, value) => data[key] = value,
      onPageNotFound: () => statusCode = 404
    };
    const UA = req.headers['user-agent'];
    if (UA) {
      const matchIE = UA.match(/MSIE (.*?);/); // http://goo.gl/OLE0P
      const outdatedIE = matchIE ? parseFloat(matchIE[1]) < 11 : false;
      const outdatedURL = '/update-browser.html';
      // console.log('outdatedIE', outdatedIE);
      if (outdatedIE && req.path != outdatedURL) {
        return res.redirect(outdatedURL); // 只能server跳 && 通过指定path跳有时无效
      }
    }
    await Router.dispatch({
      origin: (req.protocol || 'http') + '://' + req.get('host'), // fullUrl = origin + path
      //访问首页时，检测cookie内country参数，如果没有强制跳转country页
      path: !isSpider(UA) && (req.path === '/' || req.path === '/index') && !req.cookies.country ? '/country' : req.path,
      query: req.query,
      cookie: req.cookies,
      agent: UA,
      context
    }, (state, component) => {
      data.body = ReactDOM.renderToString(component);
      data.css = css.join('');
    });

    const html = ReactDOM.renderToStaticMarkup(< Html {...data} />);
    res.status(statusCode).send('<!doctype html>\n' + html);

  } catch (err) {
    next(err);
  }

});

//
// Launch the server
// -----------------------------------------------------------------------------

server.listen(server.get('port'), () => {
  /* eslint-disable no-console */
  console.log('The server is running at http://localhost:' + server.get('port'));
  if (process.send) {
    process.send('online');
  }
});
