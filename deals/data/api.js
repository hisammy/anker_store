exports.api = {

  getVariant : (param, func) => {
    this.api.getApi(`/api/variants?${param}`, '').then(function(r) {
      var prod = {
        'master': [],
        'sub': []
      };
      if(r.body.variants && r.body.variants.length) {
        r.body.variants.map((item, i) => {
          if(i<3) {
            prod.master.push(item);
          } else {
            prod.sub.push(item);
          }
        })
      }
      func(prod);
    });
  },

  getApi : (path, params) => new Promise(resolve => {
    request("get", config.api + path)
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
  })

}