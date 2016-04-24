/**
 *
 * @authors Leon.Xu
 * @date    2015-10-16 13:52:32
 */
// usage:
// import Track from '../../utils/Track';
// import Track from '../utils/Track';

const PURCHASE_CACHE = 'purchase';
let Track = {
  log(...args) {},
    // 获取页面的pageName
    getPageName() {
      return location.pathname.replace(/^\//, '');
    },
    // 格式化产品的属性(颜色)
    formatVariantOption(text = '') {
      return text.replace(/Color Group:\s+/i, ''); // Color Group: Black -> Black
    },
    // 根据classifications, 返回符合GA标准的产品类别信息
    formatCategory(classifications = []) {
      const taxon = classifications.length && classifications[0].taxon || {};
      let category = taxon.pretty_name || taxon.name || '';
      // Track.log('category', category);
      category = category.replace(/\s?->\s?/g, '/').replace(/.*?\//, '');
      return category;
    },
    // 格式化产品列表的product展示信息. Track.formatProdInfo(item, pageName)
    formatProdInfo(item, pageName = Track.getPageName()) {
      const p = item.variants && item.variants[item.variant || 0] || item.variant || {};
      const classifications = item.classifications || p.classifications || p.product && p.product.classifications;
      // Track.log('variant', p, item)
      const id = p.sku || item.sku;
      const name = p.name || item.name;
      return {
        'id': id, // ID/SKU
        'name': `[${id}] ${name}`, // 产品名称
        'category': Track.formatCategory(classifications) || item.taxon_name || item.category || '', // 所属的类别
        'brand': item.brand || 'Anker', // 品牌
        'price': item.price || p.price || '', // 价格（例如29.20）
        'position': 0, // 在列表或集合中的位置
        'list': pageName, // 所在的列表或集合
      };
    },
    // 格式化产品(列表/详情)的product信息. Track.formatProdItem(item, index, quantity)
    formatProdItem(item, index, quantity) {
      // Track.log(item, index, quantity);
      if (!item) {
        return {};
      }
      const p = item.variants && item.variants[index || 0] || item.variant || {};
      const classifications = item.classifications || p.classifications || p.product && p.product.classifications;
      const option = p.options_text || p.option_values && p.option_values[0] && p.option_values[0].name;
      const id = p.sku || item.sku;
      const name = p.name || item.name;
      return {
        'id': id, // ID/SKU
        'name': `[${id}] ${name}`, // 产品名称
        'category': Track.formatCategory(classifications) || item.taxon_name || item.category || '', // 所属的类别
        'brand': item.brand || 'Anker', // 品牌
        'variant': Track.formatVariantOption(option), // Color
        'price': item.price || p.price || '', // 价格（例如29.20）
        'quantity': quantity || 1,
      };
    },
};

// 统一打印, Track.log()
// Track.log = console.warn.bind(console); // 生产环境可注释本行 // log = function(...args) {console.warn.apply(console, args);};

// ec:衡量展示, Track.ecAddImpression(this.state.data.products, 'Product');
Track.ecAddImpression = function(products = [], pageName = Track.getPageName()) {
  // Track.log(pageName, products);
  // window.gaplugins.EC
  products.map((item, i) => {
    // console.warn(category, list);
    const prod = Track.formatProdInfo(item, pageName);
    Track.log(pageName, prod);
    ga('ec:addImpression', prod);
  });
  // ga('send', 'pageview');
};

// ec:衡量 列表中的产品链接的点击. Track.ecProdClick({}, 'Product')
Track.ecProdClick = function(item, pageName = Track.getPageName()) {
  const prod = Track.formatProdInfo(item, pageName);
  Track.log('ecClick', pageName, prod);
  ga('ec:addProduct', prod);
  ga('ec:setAction', 'click', {
    'list': pageName,
  });
  ga('send', 'event', pageName, 'click', '');
};

// ec: 促销信息点击
/*Track.ecPromoClick = function(data, pageName) {
  ga('ec:addPromo', {
    'id': 'PROMO_1234',
    'name': 'Summer Sale',
    'creative': 'summer_banner2',
    'position': 'banner_slot1'
  });
  // Send the promo_click action with an event.
  ga('ec:setAction', 'promo_click');
  ga('send', 'event', 'Internal Promotions', 'click', 'Summer Sale');
};*/

// ec: 产品详情查看
Track.ecViewDetail = function(prod) {
  prod.position = 0;
  delete prod.quantity;
  Track.log('detail', prod);
  ga('ec:addProduct', prod);
  ga('ec:setAction', 'detail');
};

// ec:添加到购物车, Track.ecAddToCart(object, 1, 'Product');
Track.ecAddToCart = function(prod, quantity, pageName = Track.getPageName()) {
  if (!prod.brand) prod.brand = 'Anker';
  prod.quantity = quantity || prod.quantity;
  Track.log('ecAddCart', pageName, prod);
  ga('ec:addProduct', prod);
  ga('ec:setAction', 'add');
  ga('send', 'event', pageName, 'click', 'add to cart');
};

// ec:移除购物车, Track.ecRemoveFromCart(object, 1, 'Product');
Track.ecRemoveFromCart = function(prod, quantity, pageName = Track.getPageName()) {
  if (!prod.brand) prod.brand = 'Anker';
  prod.quantity = quantity || prod.quantity;
  Track.log('ecRemove', prod);
  ga('ec:addProduct', prod);
  ga('ec:setAction', 'remove');
  ga('send', 'event', pageName, 'click', 'remove from cart');
};

// ec:衡量结帐流程, Track.ecCheckout(json.line_items, 1);
Track.ecCheckout = function(products, step = 1) {
  Track.log('ecCheckout', step);
  products.map((item, i) => {
    // console.warn(item);
    const prod = Track.formatProdItem(item);
    ga('ec:addProduct', prod);
    Track.log(prod);
  });
  ga('ec:setAction', 'checkout', {
    'step': step,
  });
};

// user has completed shipping options, Track.ecShippingComplete(3);
Track.ecShippingComplete = function(step = 3) {
  // Track.log('ecCheckout', step);
  ga('ec:setAction', 'checkout_option', {
    'step': step,
    // "option": "Visa"
  });
  ga('send', 'event', 'Checkout', 'Option');
};

// ec:衡量交易, Track.ecPurchase();
Track.ecPurchase = function() {
  // Track.log('ecPurchase');
  let purchase = Track.getEcPurchase();
  Track.log(purchase.field);
  if (!purchase.field.id) return;
  purchase.prods.map((item, i) => {
    ga('ec:addProduct', item);
    Track.log(item);
  });
  ga('ec:setAction', 'purchase', purchase.field);
  localStorage.removeItem(PURCHASE_CACHE);
};
Track.saveEcPurchase = function(products, field) { // 付款前缓存购买信息, 给交易完成后的, ga使用. Track.saveEcPurchase(products, field)
  let purchase = {};
  purchase.prods = [];
  products.map((item, i) => {
    purchase.prods.push(Track.formatProdItem(item));
  });
  purchase.field = {
    'id': field.id, //交易 ID
    'affiliation': 'Anker Store', // 商店或关联公司
    'revenue': field.revenue, // 总收入或总计金额
    'tax': field.tax, // 总税费
    'shipping': field.shipping, //运费
  };
  localStorage.setItem(PURCHASE_CACHE, JSON.stringify(purchase));
};
Track.getEcPurchase = function() { // 获取缓存的购买信息. Track.getEcPurchase();
  const p = localStorage.getItem(PURCHASE_CACHE);
  return p ? JSON.parse(p) : {
    prods: [],
    field: {}
  };
};

// criteo
Track.criteoOneTag = function(hashedMail, action) {
  if (!hashedMail) return;
  action = action || {};
  window.criteo_q = window.criteo_q || [];
  window.criteo_q.push(
    {event: 'setAccount', account: 22904},
    {event: 'setHashedEmail', email: hashedMail},
    {event: 'setSiteType', type: 'tablet'},
    action // { event: "viewHome" }
  );
};

Track.appendScript = function(s) {
  if (!s) {
    return;
  }
  Track.log(s);
  const script = document.createElement('script');
  if (s.url) { // insert script url
    script.src = s.url;
  } else { // insert script code
    script.textContent = s;
      // script.appendChild(s);
  }
  document.body.appendChild(script);
};

// SteelHouse Conversion Pixel
Track.steelHouseConversion = function(opts) {
  const str = `
  (function(){var x=null,p,q,m,
  o="12306",
  l="${opts.order_id}",
  i="${opts.total_amount}",
  c="",
  k="${opts.ids}",
  g="${opts.quantities}",
  j="${opts.unit_prices}",
  u="",
  shadditional="";
  try{p=top.document.referer!==""?encodeURIComponent(top.document.referrer.substring(0,512)):""}catch(n){p=document.referrer!==null?document.referrer.toString().substring(0,512):""}try{q=window&&window.top&&document.location&&window.top.location===document.location?document.location:window&&window.top&&window.top.location&&""!==window.top.location?window.top.location:document.location}catch(b){q=document.location}try{m=parent.location.href!==""?encodeURIComponent(parent.location.href.toString().substring(0,512)):""}catch(z){try{m=q!==null?encodeURIComponent(q.toString().substring(0,512)):""}catch(h){m=""}}var A,y=document.createElement("script"),w=null,v=document.getElementsByTagName("script"),t=Number(v.length)-1,r=document.getElementsByTagName("script")[t];if(typeof A==="undefined"){A=Math.floor(Math.random()*100000000000000000)}w="dx.steelhousemedia.com/spx?conv=1&shaid="+o+"&tdr="+p+"&plh="+m+"&cb="+A+"&shoid="+l+"&shoamt="+i+"&shocur="+c+"&shopid="+k+"&shoq="+g+"&shoup="+j+"&shpil="+u+shadditional;y.type="text/javascript";y.src=("https:"===document.location.protocol?"https://":"http://")+w;r.parentNode.insertBefore(y,r)}());
  `;
  Track.appendScript(str);
};
// SteelHouse Tracking Pixel(INSTALL ON ALL PAGES OF SITE)
Track.steelHouseTracking = function() {
  const str = `
  (function(){"use strict";var e=null,b="4.0.0",
  n="12306",
  additional="",
  t,r,i;try{t=top.document.referer!==""?encodeURIComponent(top.document.referrer.substring(0,2048)):""}catch(o){t=document.referrer!==null?document.referrer.toString().substring(0,2048):""}try{r=window&&window.top&&document.location&&window.top.location===document.location?document.location:window&&window.top&&window.top.location&&""!==window.top.location?window.top.location:document.location}catch(u){r=document.location}try{i=parent.location.href!==""?encodeURIComponent(parent.location.href.toString().substring(0,2048)):""}catch(a){try{i=r!==null?encodeURIComponent(r.toString().substring(0,2048)):""}catch(f){i=""}}var l,c=document.createElement("script"),h=null,p=document.getElementsByTagName("script"),d=Number(p.length)-1,v=document.getElementsByTagName("script")[d];if(typeof l==="undefined"){l=Math.floor(Math.random()*1e17)}h="dx.steelhousemedia.com/spx?"+"dxver="+b+"&shaid="+n+"&tdr="+t+"&plh="+i+"&cb="+l+additional;c.type="text/javascript";c.src=("https:"===document.location.protocol?"https://":"http://")+h;v.parentNode.insertBefore(c,v)})()
  `;
  Track.appendScript(str);
};

export default Track;
