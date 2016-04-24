var request = require('superagent');
var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');
var config = {};

/* Aduio 页面方法 */
router.get('/powerhouse', (req, res, next) => {
  var invitation_code =  req.query.inviter_code || req.query.ic;
   config = res.locals.config;
  res.render('powerHouse', { title: 'Anker | PowerHouse',config:config,verson:"22",token: (req.cookies ? req.cookies.token:''),invitation_code:invitation_code});
});
router.get('/ph', (req, res, next) => {
  var invitation_code =  req.query.ic || req.query.inviter_code;
   config = res.locals.config;
  res.render('powerHouse', { title: 'Anker | PowerHouse',config:config,verson:"22",token: (req.cookies ? req.cookies.token:''),invitation_code:invitation_code});
});
router.get('/powerhousedetail', (req, res, next) => {
  config = res.locals.config;
  var d = new Date();
  d = moment.tz(d, "America/Los_Angeles");
  var nowDate = (new Date(moment.tz(new Date("2016-04-18T23:59:59-07:00"), "America/Los_Angeles").format()).getTime()) - (new Date(moment.tz(new Date(), "America/Los_Angeles").format()).getTime());
  var invitation_code =  req.query.invitation_code;
  res.render('powerhousedetail', { title: 'Anker | PowerHouse', config:config,nowDate:nowDate,token: (req.cookies ? req.cookies.token:''),verson:"22",days:(19 - d.format("DD")),invitation_code:invitation_code});
});
const getApi = (path, params) => new Promise(resolve => {
  // console.log(config.api + path);
  request('get', config.api + path)
  .send(params)
  // .set(headers)
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
