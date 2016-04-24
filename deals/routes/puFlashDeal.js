var request = require('superagent');
var express = require('express');
var router = express.Router();
var config = {};

/* Aduio 页面方法 */
router.get('/pu_flash_deal', (req, res, next) => {
  config = res.locals.config;
  var cookies = req.cookies || {};
  var token = cookies.token || '';
  // console.log(cookies);
  getApi('/api/activities/flash_deal_show', {}, cookies).then(function(r) {
    var data = r && r.body || {};
    // console.log(data);
    if (r.status === 402 || r.status === 401) {
      res.redirect('/login?back=poweruser');
    } else {
      res.render('pu_flash_deal', {
        verson: 1,
        title: 'Anker | PU FLASH DEAL',
        token: token,
        banner_text: `<p>At Anker, we’re committed to constant improvement through user feedback. Our Power User programme is one of the main ways we engage with users to learn how we can do better.</p>
        <p>As a Power User, you can sign up to receive free samples of existing and pre-release products in exchange for insightful and unbiased feedback.</p>
        <p>Try our products. Share your experience. Help us get it right.</p>`,
        data: data,
      });
    }
  });
});

const getApi = (path, params, cookies) => new Promise(resolve => {
  var headers = {
    'platform': config.platform
  };
  headers['country'] = (cookies['country'] || 'US').toUpperCase();
  if (cookies['token']) {
    headers['X-Spree-Token'] = cookies['token'];
  }
  request('get', config.api + path)
  .send(params)
  .set(headers)
  .accept('application/json')
  .end(function(err, res){
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
