var request = require('superagent');
var express = require('express');
var moment = require('moment-timezone');
var router = express.Router();
var config = require('../../build/config').config;
var fs = require("fs");
var path = require('path');
var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey
});

router.all('/powerline_swap/admin', (req, res, next) => {
  getApi('get', '/api/deals/deals_audios/all_entries', {
    "country_code": 'US',
    "zone": "1"
  }, {
    'token': req.cookies ? req.cookies.token : ''
  }).then(function(r) {
    if (r.status === 200) {
      var new_data = req.body;
      s3load(['plData.json'], function(result) {
        var plData = eval('(' + result[0] + ')');
        if (new_data.type === 'data') {
          plData[new_data.country_code] = new_data.data;
          s3update('plData.json', JSON.stringify(plData));
        }
        res.render('powerline_admin', {
          title: 'Anker | PowerLine Swap',
          data: plData
        })
      });
    } else {
      res.redirect('/deals/powerline_swap');
    }
  })
})

router.get('/powerline_swap', function(req, res, next) {
  var country_code = 'US';
  if (req.cookies.token) {
    country_code = (req.cookies.swapCountry || 'US').toUpperCase();
  }
  s3load(['plData.json'], function(result) {
    var plData = eval('(' + result[0] + ')');
    var d = new Date(),
      isOver = false;
    d = moment.tz(d, "America/Los_Angeles");
    if ((d.format("MM")) > 3 && d.format("DD") > 1) {
      if ((d.format("MM")) == 4 && d.format("DD") == 2) {
        if (d.format("HH") >= 12) {
          isOver = true;
        }
      } else {
        isOver = true;
      }
    }
    var nowDate = (new Date(moment.tz(new Date("2016-04-07T12:00:00-07:00"), "America/Los_Angeles").format()).getTime()) - (new Date(moment.tz(new Date(), "America/Los_Angeles").format()).getTime());
    getApi("get", "/api/powerline_swap/status", {}, req.cookies).then(function(r) {
      country_code = r.user_country ? r.user_country : country_code;
      var list = ["powerline", "powerline2", "powerline+", "powerline+2","usbc","usbc2"];
      for (var i = 0; i < list.length; i++) {
        plData[country_code][list[i]].map(function(item) {
          var search = {},
            index = item.amazonUrl.indexOf("?") + 1;
          if (index != -1) {
            var str = item.amazonUrl.substr(index);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
              search[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
          }
          if (req.query.utm_term && search.tag) {
            item.amazonUrl = item.amazonUrl.replace("tag=" + search.tag, "tag=" + req.query.utm_term);
          }
          item.color = item.color.split(',');
          return item;
        })
      }
      res.render('powerline_swap', {
        title: 'Anker | PowerLine Swap',
        nowDate: nowDate,
        powerline: plData[country_code],
        config: config,
        country: country_code,
        isShow: isOver,
        userBody: r.body,
        verson: "13"
      });
    })
  });
});

function s3update(key, data) {
  var s3 = new AWS.S3({
    params: {
      Bucket: 'm-anker-com', //Bucket路径
      Key: key, //檔案名稱
      ACL: 'public-read' //檔案權限
    }
  });
  s3.upload({
    Body: data
  }, function(err, data) {
    console.log(err)
  })
}

function s3load(keys, callback) {
  var result = [];
  keys.map(function(item) {
    var s3 = new AWS.S3({
      params: {
        Bucket: 'm-anker-com', //Bucket路径
        Key: item //檔案名稱
      }
    });
    s3.getObject().on('httpData', function(chunk) {
      result.push(chunk.toString('utf8'))
    }).on('httpDone', function() {
      if (result.length >= keys.length) {
        callback(result);
      }
    }
    ).send();
  })
}

const getApi = (method, path, params, cookies) => new Promise(resolve => {
  var headers = {
    'platform': config.platform
  };
  if (cookies && cookies['token']) {
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
