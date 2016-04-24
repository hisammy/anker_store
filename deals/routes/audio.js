var request = require('superagent');
var express = require('express');
var router = express.Router();
var config = require('../../build/config').config;
var path = require('path');
var fs = require("fs");

/* Audio 管理页面*/
router.get('/music_for_you/admin', (req, res, next) => {

  getApi('get', '/api/deals/deals_audios/all_entries', {
    "country_code": 'US',
    "zone": "1-2"
  }, {
    'token': req.cookies ? req.cookies.token : ''
  }).then(function(r) {
    if (r.status === 402 || r.status === 401) {
      res.redirect('/deals/music_for_you');
    } else {

      var new_data = req.query;
      var data = {};
      if (new_data.US && new_data.UK) {
        fs.writeFile(path.join(__dirname, '../deals/data/musicForYou.json'), JSON.stringify(new_data), 'utf8');
        data = new_data;
      } else {
        data = eval('(' + fs.readFileSync(path.join(__dirname, '../deals/data/musicForYou.json'), 'utf8') + ')');
      }

      var days = ['1-2', '3-4', '5-6', '7-8', '9-10', '11-12', '13-14'];

      res.render('audio_admin', {
        title: 'Anker | Valentine\'s Day Giveaway',
        data: data,
        days: days
      });

    }
  })

});

/* Aduio 页面方法 */
router.get('/music_for_you', (req, res, next) => {
  var country = req.query.country ? req.query.country : 'US';

  var data = fs.readFileSync(path.join(__dirname, '../deals/data/musicForYou.json'), 'utf8')
  var products = eval('(' + data + ')');

  res.render('audio', {
    title: 'Anker | Valentine\'s Day Giveaway',
    data: products[country],
    config: config,
    country: country
  });

});

const getApi = (method, path, params, cookies) => new Promise(resolve => {
  var headers = {
    'platform': config.platform
  };
  if (cookies['token']) {
    headers['X-Spree-Token'] = cookies['token'];
  }
  request(method, config.api + path)
    .send(params)
    .set(headers)
    .accept('application/json')
    .end(function(err, res) {
      try {
        resolve(res);
      } catch ( e ) {
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
