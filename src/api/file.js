/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import { join } from 'path';
import { Router } from 'express';
import bodyParser from 'body-parser';
import queryString from 'query-string';
import formidable from 'formidable';
import fs from 'fs';
import request from 'superagent';
import { config } from '../../build/config';

const router = new Router();
router.use(bodyParser.json());

router.use('*', async (req, res, next) => {
  const path = req.query.path;
  delete req.query.path;
  const cookies = req.headers;
  let json = {};
  var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
      json =  await postFile(files.fileName.path, path, fields, req.cookies); // req.body || fields
      fs.unlinkSync(files.fileName.path);
      res.status(json.status).send(json.body);
    });
})
const postFile = (filePath, path, params, cookies) => new Promise(resolve => {
  let headers = {'platform': 'tablet_web'};
    if(cookies['token']) {
      headers['X-Spree-Token'] = cookies['token'];
    }
    // console.log(filePath, params);
    const attach_key = params['attach_key'] || 'user[avatar_image]';
    request('post', config.api + path)
    .set(headers)
    .attach(attach_key, filePath)
    .end(function(err, res) {
      try {
          resolve(res);
        } catch(e) {
          resolve({
            'body': {
              'title': 'Error',
              'content': 'Same Wrong',
            },
            'status': 404
          });
        }
    });
})
export default router;
