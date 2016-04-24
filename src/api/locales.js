// I18N
import { join } from 'path';
import fs from 'fs';
// import { config } from '../../build/config';
// import request from 'superagent';

import { Router } from 'express';
import bodyParser from 'body-parser';
const router = new Router();
router.use(bodyParser.json());
const basePath = '../src/locales';

const DefaultCountry = 'US'; // 默认的国家

router.use('*', async (req, res, next) => {
  const params = req.method.toLowerCase() === 'get' ? req.query : req.body;
  const folderMaps = {
    'US': 'US', 'UK': 'US',
    'JP': 'JP', 'DE': 'DE',
  };
  const query = params.query || {};
  const debug = params.debug || query.debug;
  const country = params['country'] || req.cookies['country']; // params['country']: 服务端, req.cookies: 客户端
  const folder = folderMaps[country] || DefaultCountry;
  // 当前URL路径, 作为基本的语言包
  const model = (params.path.split('/')[1] || 'index');
  let models = ['__common', model]; // 一个页面可能需要几个模块(引入了其他vendor/模块

  if (['404'].includes(model)) { // 暂不提供多语言的URL, 直接返回
    return res.status('200').send({});
  }

  // 特殊页面, 引入语言包
  const memberPages = ['profile', 'orders', 'address', 'rewards', 'review', 'shipping', 'password'];
  if (!['country', 'login', 'forget', 'activation', 'active_for_authentication'].concat(memberPages).includes(model)) { // 这些路径, 不需要popup
    models = models.concat('__popupsignup');
  }
  if (memberPages.includes(model)) { // Member
    models = models.concat('__member');
  }

  loadI18N(folder, models).then(function (result) {
    const json = Object.assign(...result);
    // console.log(111, json);
    if ('i18n' == debug) {
      console.log(`I18N:\n`, params, folder, models, JSON.stringify(json, null, 2));
    }
    res.status('200').send(json || {}); // res.json(json);
  }).catch(function(error) {
    // console.log(222, error);
    res.status('200').send({});
  });
  // let json = await loadJSON(folder, model);
  // res.status('200').send(json || {}); // res.json(json);
});

const formatJsonString = (str) => {
  str = str.replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, ''); // remove comments(/* ..comments */)
  str = str.replace(/(\r|\n)/g, ''); // remove multi lines
  str = str.replace(/,\s*\}/g, '}').replace(/,\s*\]/g, ']'); // remove last comma(,)
  str = str.replace(/\s+/g, ' '); // remove spaces
  // str = str.replace(/\\"/g, '\\\"').replace(/\\t/g, '\\t'); // \" -> \\"
  return str;
}

const loadI18N = (folder, models = []) => { // 加载多个语言包文件
  // models = ['country', 'index', 'poweruser'];
  return Promise.all(models.map(
    o => loadJSON(folder, o)
  ));
}
const loadJSON = (folder, model) => new Promise((resolve, reject) => { // 读取文本转JSON
  model = model.toLowerCase(); // 统一小写
  const targetPath = join(__dirname, basePath, folder, `${model}.json`);
  const originPath = join(__dirname, basePath, DefaultCountry, `${model}.json`);
  const filePath = fs.existsSync(targetPath) ? targetPath : originPath; // 如果目标语言包不存在, 使用默认语言包
  const key = model.replace(/^_*/, ''); // 移除首字母_线
  fs.readFile(filePath, 'utf8', (err, res) => {
    let obj = {};
    obj[key] = {};
    let str = '';
    if (err) {
      // console.log('loadJSON', err);
      // resolve('{}');
    } else {
      try {
        str = formatJsonString(res);
        // console.log(model, str);
        obj[key] = JSON.parse(str);
      } catch (e) {
        console.log(model, e, str);
        // resolve('{}');
      }
    }
    resolve(obj);
  });
});

export default router;
