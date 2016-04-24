var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var moment = require('moment-timezone');
var config = require('../build/config').config;

var deals = express();
const DEBUG = !process.argv.includes('--release');

// deals.use(require("connect-assets")());

// uncomment after placing your favicon in /public
deals.use(bodyParser.json());
deals.use(bodyParser.urlencoded({
  extended: true
}));
deals.use(cookieParser());
// view engine setup
deals.use(sassMiddleware({
  /* Options */
  src: path.join(__dirname, '../deals/public'),
  dest: path.join(__dirname, '../deals/public'),
  debug: false,
  outputStyle: 'compressed'
}));
//console.info(process.env.NODE_ENV);
deals.use(express.static(path.join(__dirname,'../deals/public')));

//deals.use(express.static(path.join(__dirname, '../build/deals')));
deals.set('views', path.join(__dirname, '../deals/views'));
deals.set('view engine', 'jade');
// deals.set('view options', { debug: false });


//模版和路由内config带入
var config = require('../build/config').config;
deals.use(function(req, res, next) {
  res.locals.config = config; // *.jade: #{config.xxx}; ./routes/*.js: config = res.locals.config;
  next();
})

// deals.get('/music_for_you', require('../deals/routes/audio'));

// 10000hours
deals.get(['/10000hours', '/10000hours/m'], require('../deals/routes/10000hours'));

//powerline 专题
deals.get('/powerline_lightning', require('../deals/routes/powerline'));

//qc
deals.all(['/anker_qc', '/anker_qc/*'], require('../deals/routes/qc'));

//deals.get('/ingress_giveaway', require('../deals/routes/ingress'));


//deals.all(['/powerline_swap', '/powerline_swap/admin'], require('../deals/routes/powerline_swap'));

//deals.get('/slimshell_galaxy_s7', require('../deals/routes/protection'));

var nTime = (new Date(moment.tz(new Date(), "America/Los_Angeles").format()).getTime()),
		eTime = (new Date(moment.tz(new Date("2016-04-19T23:59:59-07:00"), "America/Los_Angeles").format()).getTime());
deals.get('/home_vacduo', require('../deals/routes/homeVacDuo'));

deals.all(['/powerhouse','/ph','/powerhousedetail'], require('../deals/routes/powerHouse'));

deals.get('/pu_flash_deal', require('../deals/routes/puFlashDeal'));


module.exports = deals;
