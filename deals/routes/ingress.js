var request = require('superagent');
var express = require('express');
var moment = require('moment-timezone');
var router = express.Router();
var fs = require("fs");
var path = require('path');

var config = {};


router.get('/ingress_giveaway',function(req, res, next){
  config = res.locals.config;
  res.render('ingress', { title: 'Anker | 300 Portable Charger Giveaway', verson:"1", config: config});
});
const getApi = (method, path, params, cookies) => new Promise(resolve => {
  // console.log(config.api + path);
  var headers = {'platform': config.platform};
  if(cookies['token']) {
    headers['X-Spree-Token'] = cookies['token'];
  }
  request(method, config.api + path)
  .send(params)
  .set(headers)
  .accept('application/json')
  .end(function(err, res) {
    try {
        resolve(res);
      } catch(e) {
        resolve({
          'body': {
            'title': 'Error',
            'content': 'Error',
          },
          'status': 404
        });
      }
  });
});


module.exports = router;
