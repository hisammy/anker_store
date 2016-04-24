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

router.get('/anker_qc/admin', (req, res, next) => {

  getApi('get', '/api/deals/deals_audios/all_entries', {
    "country_code": 'US',
    "zone": "1"
  }, {
    'token': req.cookies ? req.cookies.token : ''
  }).then(function(r) {
    if (r.status === 402 || r.status === 401) {
      res.redirect('/deals/anker_qc');
    } else {
      var new_data = req.query;
      s3load(['qcLang.json', 'qcData.json'], function(result) {
        var qcLang, qcData;
        result.map(function(item) {
          var json = eval('(' + item + ')');
          if(json.US.home) {
            qcLang = json;
          } else {
            qcData = json;
          }
        })
        if (new_data.type === 'lang') {
          qcLang[new_data.country_code] = new_data.lang;
          s3update('qcLang.json', JSON.stringify(qcLang));
        }
        if (new_data.type === 'data') {
          qcData[new_data.country_code] = new_data.data;
          s3update('qcData.json', JSON.stringify(qcData));
        }
        res.render('qc_admin', {
          title: 'Anker | qc',
          lang: qcLang,
          data: qcData
        })
      });
    }
  })

})


/* Aduio 页面方法 */

router.get('/anker_qc/us', function(req, res, next) {
  redirect(req, res, next, 'US');
});
router.get('/anker_qc/uk', function(req, res, next) {
  redirect(req, res, next, 'UK');
});
router.get('/anker_qc/de', function(req, res, next) {
  redirect(req, res, next, 'DE');
});
router.get('/anker_qc', function(req, res, next) {
  redirect(req, res, next, '');
});
function redirect(req, res, next, country) {
    s3load(['qcLang.json', 'qcData.json'], function(result) {
    var qcLang, qcData;
    result.map(function(item) {
      var json = eval('(' + item + ')');
      if(json.US.home) {
        qcLang = json;
      } else {
        qcData = json;
      }
    })
    var isSelectCountry = country;
    country = country || 'US';
    dayIndex = 0;
    var reg = new RegExp("(^|&)tag=([^&]*)(&|$)");
    for (i in qcData[country]) {
      qcData[country][i].map(function(item) {
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
      })
    };
    var d = new Date(),
      isOver = false;
    d = moment.tz(d, "America/Los_Angeles");
    dayIndex = d.format("DD") - 7;
    dayIndex >= 0 ? dayIndex : 0;
    if ((d.format("MM")) > 3 || d.format("DD") > 13) {
      isOver = true;
    }
    isOver=true;
    var phoneList = ["Samsung Galaxy S6", "Samsung Galaxy Note Edge", "HTC One M9", "Sony Xperia Z5", "LG G4", "Motorola Moto X Style", "Google Nexus 6"];
    res.render('qc', {
      title: 'Anker | Quick Charge Revolution',
      dayIndex: dayIndex,
      isOver: isOver,
      isSelectCountry: isSelectCountry,
      verson: "8",
      config: config,
      lang: qcLang[country],
      qcList: qcData[country],
      phoneImg: dayIndex + "phone.jpg",
      phoneName: phoneList[dayIndex],
      country: country
    });
  });
}

function s3update(key, data) {
  var s3 = new AWS.S3({
    params: {
      Bucket: 'm-anker-com', //Bucket路径
      Key: key, //檔案名稱
      ACL: 'public-read' //檔案權限
    }
  });
  s3.upload({Body: data}, function(err, data) {
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
    s3.getObject().on('httpData',
      function(chunk) {
        result.push(chunk.toString('utf8'))
      }).on('httpDone',
      function() {
        if(result.length >= keys.length) {
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