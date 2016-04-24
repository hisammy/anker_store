var request = require('superagent');
var express = require('express');
var router = express.Router();
var config = {};

/* Aduio 页面方法 */
router.get('/powerline_lightning', (req, res, next) => {
  config = res.locals.config;
  var country = req.query.country ? req.query.country : 'US';
  var param = 'country_code=' + country + '&skus=A8114012,A8114011,A8114021,A8114031,A8114061,A8114091,A8111012,A8111011,A8111021,A8111091,A8111031,A8112012,A8112011,A8112021,A8112091,A8112031,A8113012,A8113011,A8113021,A8113031,A8113091';
  var result = getApi(`/api/variants?${param}`, '').then(function(r) {
    var prod = [[],[],[],[]],
     index0 = 'A8114021,A8114012,A8114011,A8114031,A8114061,A8114091',
     index1 = 'A8111021,A8111012,A8111011,A8111091,A8111031',
     index2 = 'A8112021,A8112012,A8112011,A8112091,A8112031',
     index3 = 'A8113021,A8113012,A8113011,A8113031,A8113091';
    if(r.body.variants && r.body.variants.length) {
      r.body.variants.map((item, i) => {
        if(index0.indexOf(item.sku)>-1){
          item.url = 'http://www.amazon.com/dp/B013JLOTUS/ref=as_li_ss_tl?ie=UTF8&m=A294P4X9EWVXLJ&tag=ianker-20&linkCode=as2&camp=217145&creative=399373&creativeASIN=B013JLOTUS';
          prod[0].push(item);
          if(item.sku==='A8114021'){
            prod[0][0].mini_url = item.images[0].mini_url;
          }
        }else if(index1.indexOf(item.sku)>-1){
          item.url = 'http://www.amazon.com/dp/B013JMBAMC/ref=as_li_ss_tl?ie=UTF8&m=A294P4X9EWVXLJ&tag=ianker-20&linkCode=as2&camp=217145&creative=399373&creativeASIN=B013JMBAMC';
          prod[1].push(item);
          if(item.sku==='A8111021'){
            prod[1][0].mini_url = item.images[0].mini_url;
          }
        }else if(index2.indexOf(item.sku)>-1){
          item.url = 'http://www.amazon.com/dp/B013JNAUMW/ref=as_li_ss_tl?ie=UTF8&m=A294P4X9EWVXLJ&tag=ianker-20&linkCode=as2&camp=217145&creative=399373&creativeASIN=B013JNAUMW';
          prod[2].push(item);
          if(item.sku==='A8112021'){
            prod[2][0].mini_url = item.images[0].mini_url;
          }
        }else{
          item.url = 'http://www.amazon.com/dp/B013JNUHR0/ref=as_li_ss_tl?ie=UTF8&m=A294P4X9EWVXLJ&tag=ianker-20&linkCode=as2&camp=217145&creative=399373&creativeASIN=B013JNUHR0';
          prod[3].push(item);
          if(item.sku==='A8113021'){
            prod[3][0].mini_url = item.images[0].mini_url;
          }
        }
      })
    }
    res.render('powerline', { title: 'Anker | PowerLine Lightning', products: prod, country: country });
  });

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
