import sm from 'sitemap';
import path from 'path';
import fs from './lib/fs';
import request from 'superagent';
import { config } from '../build/config';

async function sitemap() {

  var option = {
    "hostname": "https://www.anker.com",
    "cacheTime": 600000,
    "urls": [
      {
        url: '/country/'
      },
      {
        url: '/',
        changefreq: 'daily',
        priority: 0.7
      },
      {
        url: '/cart',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/activity/',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/poweruser/',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/search/',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/about',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/contact',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/business',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/poweriq',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/login',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/register',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/password',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/forget',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/profile',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/orders/',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/address',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/rewards',
        changefreq: 'daily',
        priority: 0.3
      },

      {
        url: '/support/download',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/support/warranty',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/support/terms',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/support/refund-exchange',
        changefreq: 'daily',
        priority: 0.3
      },
      {
        url: '/support/privacy-policy',
        changefreq: 'daily',
        priority: 0.3
      },

      {
        url: '/products/',
        changefreq: 'daily',
        priority: 0.3
      }
    ]
  };

  request("get", config.api + '/api/taxonomies/').end((err, res) => {
    if (err) {
      return console.log("sitemap:taxonomies=> %s", err);
    }
    res.body.taxonomies[0].root.taxons.map((item, i) => {
      option.urls.push({
        url: ('/products/taxons/' + item.id + '/' + item.name),
        changefreq: 'daily',
        priority: 0.3
      })
    });
  })

  var fullback = [];
  config.country_list.map((country, i) => {
    request("get", config.api + '/api/products/search?per_page=2000&country=' + country.code).end((err, res) => {
      fullback.push(i);
      if (err) {
        return console.log("sitemap:%s=> %s", country.code, err);
      }
      if (res.body) {
        res.body.products.map((item) => {
          item.variants.map((item) => {
            option.urls.push({
              url: ('/products/' + item.sku + '?country=' + country.code),
              changefreq: 'daily',
              priority: 0.3
            })
          })
        })
      }
      if (fullback.length === config.country_list.length) {
        var sitemap = sm.createSitemap(option);
        fs.writeFile(path.join(__dirname, '../build/public/sitemap.xml'), sitemap, 'utf8')
        if (process.env.NODE_ENV === 'production') {
          //提交sitemap
          var sites = {
            "google": "http://www.google.com/ping?sitemap=https://www.anker.com/sitemap.xml",
            "bing": "http://www.bing.com/ping?sitemap=https://www.anker.com/sitemap.xml"
          };
          for (i in sites) {
            request('get', sites[i]).end((error, response) => {
              console.log("Submit sitemap", response.status === 200 ? "Successed." : "Failed.");
            });
          }
          ;
        }
      }
    })
  })
}

export default sitemap;
