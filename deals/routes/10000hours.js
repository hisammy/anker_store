var express = require('express');
var router = express.Router();
var request = require('superagent');
var path = require('path');
var fs = require('fs');

var xls = fs.readFileSync(path.join(__dirname, '../deals/data/10000hours.txt'), 'utf8');

var config = {};

router.get('*', function(req, res, next) {
  // console.log(res.locals.config);
  config = res.locals.config;
  var isMobile = -1 !== req.path.indexOf('/m');
  var query = req.query || {};
  var tagKey = query.tag;
  // console.log(isMobile, query);
  var countrys = ['us', 'uk', 'de'];
  if (query.debug) countrys.push('jp');
  var country = (query.country || '').toLocaleLowerCase();
  country = (-1 !== countrys.indexOf(country) && country || 'us');
  var data = require('../locales/10000hours/' +(country == 'uk' ? 'us' : country)+ '.json');
  // console.log(JSON.stringify(data));
  // http://m.oceanwing.com/product/rest/selling/price/list?marketplace=amazon_uk (AFN=1 && is_on_sale=1)
  var products = require('../locales/10000hours/' +country+ '_products.json');
  // console.log(JSON.stringify(products));
  var affiliateMap = formatXls(xls, 0, 1);
  var tagVal = affiliateMap[tagKey];
  // console.log(tagKey, tagVal);
  getSKUs(products).then(function(r) {
    var json = r.body;
    // console.log(json, Array.isArray(json));
    var caches = {};
    if (Array.isArray(json)) {
      json.map((item, i) => {
        caches[item.sku] = item || {};
      });
    }
    // console.log(caches);
    var tpl = isMobile ? '10000hours_m' : '10000hours';
    res.render(tpl, {
      title: '10000 hours - Anker',
      keywords: "battery charger, power bank, portable charger,external battery,battery pack,portable battery,mobile charger,portable battery,backup charger,backup battery,best battery,slim power bank,usb port,high volume",
      test: query.debug,
      countrys: countrys,
      country: country,
      data: data,
      products: products,
      caches: caches,
      affiliate: {
        format: affiliateUrl,
        key: tagKey,
        val: tagVal,
      }
    });
  });
});

const getSKUs = (products) => {
  var skus = [];
  products.series.map((item, i) => {
    // skus = skus.concat(item.list.map((o) => o.sku));
    skus = skus.concat(item.list.map((o) => `${products.marketplace}:${o.sku}`)); // amazon:A3102
  });
  // http://a1.next.ost/api/variants/market_prices?market_skus[]=amazon:A1271011&market_skus[]=amazon_uk:A1263011
  // console.log(skus);
  return getApi(`/api/variants/market_prices`, {market_skus: skus});
};

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

const formatXls = (xls, keyIndex, valIndex) => {
  var hasKey = keyIndex >= 0;
  var ret = hasKey ? {} : [];
  xls = xls.split('\n');
  // console.log(xls);
  xls.map((item, i) => {
    var arr = item.trim().split('\t');
    if (hasKey) {
      ret[arr[keyIndex]] = valIndex >= 0 ? arr[valIndex] : arr;
    } else {
      ret.push(arr);
    }
  });
  return ret;
};

const affiliateUrl = (key, val, url) => {
  // console.log(key, val, url);
  if (!val) return url;
  url = url.replace(/&tag=[^&]+/, '&tag=' + val);
  url = url.replace(/&linkId=.*$/, '&linkId=' + key);
  return url;
};

module.exports = router;
