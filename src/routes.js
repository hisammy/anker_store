/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

/*功能组件引入*/
import React from 'react';
import Router from 'react-routing/src/Router';
import Http from './core/HttpClient';
import AppActions from './core/AppActions';
import { isSpider, format } from './utils/Helper';

/* 多国语言设置 */
/*import i18n from "i18n";
i18n.configure({
    locales:['en', 'de'],
    directory: __dirname + '/locales'
});*/

/* react模版引入 */
import App from './components/App';

/* 通用模版 */
import NotFound from './components/NotFound';
import Country from './components/Country';
import Version from './components/Version';

/* 产品浏览类模版 */
import Index from './components/Index';
import Search from './components/Product/Search';
import Products from './components/Product/Products';
import Variant from './components/Product/Variant';
import Activity from './components/Activity';

/* 个人信息类模版 */
import Profile from './components/Member/Profile';
import Address from './components/Address/Address';
import Coupon from './components/Coupon';

/* 注册登陆类模版 */
import Login from './components/Authorize/Login';
import Forget from './components/Authorize/Forget';
import Register from './components/Authorize/Register';
import Password from './components/Authorize/Password';
import Activation from './components/Authorize/Activation';
import Active_for_authentication from './components/Authorize/Active_for_authentication';

/* 订单类模版 */
import Orders from './components/Orders/Orders';
import OrderDetail from './components/Orders/OrderDetail';
import Review from './components/Orders/Review';
import Shipping from './components/Orders/Shipping';

/* 购物车类模版 */
import Cart from './components/Cart/Cart';
import Process from './components/Cart/Process';
import Place from './components/Cart/Place';
import Complete from './components/Cart/Complete';

// 服务
import PowerUser from './components/PowerUser/PowerUser';
import PowerUserApply from './components/PowerUser/PowerUserApply';
import Download from './components/Support/Download';
import ReturnExchange from './components/Support/ReturnExchange';
import PrivacyPolicy from './components/Support/PrivacyPolicy';
import TermOfService from './components/Support/TermOfService';
import Warranty from './components/Support/Warranty';
import Faq from './components/Support/Faq';
import PETScreenProtectors from './components/Support/PETScreenProtectors';
import GlassScreenProtectors from './components/Support/GlassScreenProtectors';

// About
import About from './components/About/About';
import Contact from './components/About/Contact';
import PressCenter from './components/About/PressCenter';
import PressDetail from './components/About/PressDetail';
import Business from './components/About/Business';
import BusinessApply from './components/About/BusinessApply';
import PowerIQ from './components/About/PowerIQ';
import WEEE from './components/About/Weee';

import USBC from './components/Activity/USBC';
// import TenThousandHours from './components/Activity/10000Hours';

import Redirect from './components/Redirect';

let i18n = {};
/* 路由配置 */
const router = new Router(on => {

  on('*', async (state, next) => {
    const cookie = state.cookie || {};
    const locale = await Http.post(`post`, `/locales`, {
      path: state.path,
      query: state.query,
      country: cookie['country'],
    });
    i18n = locale || {};
    i18n.format = format;
    const content = {
      'context': state.context,
      'path': state.path,
      'params': state.params,
      'query': state.query,
      'cookie': cookie,
    };
    const component = await next();
    return component && content && <App {...content}>{component}</App>;
  });

  // 首页
  on(['/', '/index'], async (state) => {
    // 搜索引擎判断
    const seo = global.server ? (isSpider(state.agent) ? true : false) : true;
    let content = {
      'i18n': i18n,
      'data': seo ? await Http.post(`get`, `/api/content?path=/api/activities`, state.query, state.cookie) : {},
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Index {...content} />
  });

  // 静态模版
  on('/country', async (state) => {
    const content = {
      'i18n': i18n,
      'single_page': true,
      'params': state.params,
      'query': state.query,
      'cookie': state.cookie
    }
    return content &&  <Country {...content} />
  });
  on('/ocean/ost/version', async (state) => {
    const content = {
      'i18n': i18n,
      'single_page': true,
      'data': await Http.post(`get`, `/api/content?path=../../../revisions.log`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    }
    return content && <Version {...content} />
  });

  // 个人信息类模版
  on('/profile', async (state) => {
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=/api/users/profile`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Profile {...content} />
  });
  on('/shipping', async (state) => <Shipping {...{'i18n': i18n}}/>);
  on('/rewards', async (state) => {
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=/api/promotions/coupons`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Coupon {...content} />
  });
  on('/address', async (state) => {
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=/api/extend_addresses`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Address {...content} />
  });
  // on('/addressEdit', async (state) => {
  //   const content = {
  //     'i18n': i18n,
  //     'data': await Http.post(`get`, `/api/content?path=/api/extend_addresses/${state.query.id}`, state.query, state.cookie),
  //     'path': state.path,
  //     'params': state.params,
  //     'query': state.query,
  //   }
  //   return content && <AddressAdd {...content} />
  // });

  // 注册登陆类模版
  on('/login', async (state) => <Login {...{'i18n': i18n}}/>);
  on('/register', async (state) => {
    const content = {
      'i18n': i18n,
      'register_source': state.query.back
    };
    return content && <Register {...content} />
  });
  on('/forget', async (state) => <Forget {...{'i18n': i18n}}/>);
  on('/password', async (state) => <Password {...{'i18n': i18n}}/>);
  on('/activation', async (state) => {
    const content = {
      'i18n': i18n,
      'email': state.query.email
    };
    return content && <Activation {...content} />
  })
  on('/active_for_authentication', async (state) => {
    const content = {
      'i18n': i18n,
      'token': state.query.token
    };
    return content && <Active_for_authentication {...content} />
  })

  // 订单类模版
  on('/orders', async (state) => {
    state.query.page = state.query.page || "1";
    state.query.per_page = state.query.per_page || "20";
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=/api/orders/history_order`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Orders {...content} />
  });
  on('/orders/:number', async (state) => {
    state.query.order_id = state.params.number;
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=/api/orders/${state.params.number}`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <OrderDetail {...content} />
  });
  on('/review', async (state) => {
    state.query.order_id = state.params.number;
    // console.log(state.query, state.params.number);
    if (!state.query.number) {
      return <NotFound />
    }
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=/api/orders/${state.query.number}/reviews`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Review {...content} />
  });

  // 购物车类模版
  on('/cart', async (state) => {
    state.query['state'] = 'cart';
    state.query['order_id'] = state.cookie ? state.cookie.order_id ? state.cookie.order_id : '' : AppActions.getUser().order_id;
    const token = state.cookie ? state.cookie.token ? state.cookie.token : '' : AppActions.getUser().token;
    const content = {
      'i18n': i18n,
      'data': state.query['order_id'] || token ? await Http.post(`get`, `/api/content?path=/api/orders/current/`, state.query, state.cookie) : {},
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Cart {...content} />
  });
  on('/process', async (state) => {
    state.query['order_id'] = state.cookie ? state.cookie.order_id ? state.cookie.order_id : '' : AppActions.getUser().order_id;
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=/api/orders/current/`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Process {...content} />
  });
  on('/place/:number', async (state) => {
    state.query.order_id = state.params.number;
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=/api/orders/${state.params.number}`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    }
    return content && <Place {...content} />
  });
  on('/complete',  async (state) => {
    const content = {
      'i18n': i18n,
      'query': state.query
    }
    return content && <Complete {...content} />
  });

  // 商品浏览类模版
  on('/search', async (state) => {
    const content = {
      'i18n': i18n,
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Search {...content} />
  });
  on('/products', async (state) => {
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=/api/taxonomies/`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Products {...content} />
  });
  on('/products/taxons/:id/:name', async (state) => {
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=/api/taxonomies/`, state.params, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Products {...content} />
  });
  on('/products/:slug/:sku', async (state) => {
    const data = await Http.post(`get`, `/api/content?path=/api/products/${state.params.sku}`, state.query, state.cookie);
    const content = {
      'i18n': i18n,
      'data': data,
      'origin': state.origin,
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    if (data.status == 404) {
      return <NotFound />
    } else {
      return content && <Variant {...content} />
    }
  });
  on('/products/:sku', async (state) => {
    const sku = state.params.sku;
    const data = await Http.post(`get`, `/api/content?path=/api/products/${sku}`, state.query, state.cookie);
    const content = {
      'i18n': i18n,
      'data': data,
      'origin': state.origin,
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    if ('tags' == sku || data.status == 404) {
      return <NotFound />
    } else {
      return content && <Variant {...content} />
    }
  });
  on('/activity/:id', async (state) => {
    const data = await Http.post(`get`, `/api/content?path=/api/activities/${state.params.id}`, state.query, state.cookie);
    const content = {
      'i18n': i18n,
      'data': data,
      'origin': state.origin,
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    if (-1 !== [404, 422].indexOf(data.status)) {
      console.log(data);
      return <NotFound />
    } else {
      return <Activity {...content} />
    }
  });

  // PowerUser
  on('/poweruser', async (state) => {
    let url = '/api/power_user_gifts';
    state.query.per_page = 100;
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=${url}`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <PowerUser {...content} />
  });
  on('/poweruser/apply', async (state) => {
    const content = {
      'i18n': i18n,
      'data': {},
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <PowerUserApply {...content} />
  });

  // support
  on(['/support', '/support/download'], async (state) => {
    let url = state.query.taxon_id ? '/api/products/search_by_taxon' : '/api/products/search';
    state.query.only_downloads = true;
    state.query.per_page = 8;
    const content = {
      'i18n': i18n,
      'data': await Http.post(`get`, `/api/content?path=${url}`, state.query, state.cookie),
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <Download {...content} />
  });
  on('/support/refund-exchange', async (state) => {
    state.query.unauth_redirect = state.path;
    let data = await Http.post(`get`, `/api/content?path=/api/rma/user_orders`, state.query, state.cookie);
    const content = {
      'i18n': i18n,
      'data': data,
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return content && <ReturnExchange {...content} />
  });
  on('/support/privacy-policy', async () => <PrivacyPolicy {...{'i18n': i18n}}/>);
  on('/support/terms', async () => <TermOfService {...{'i18n': i18n}}/>);
  on('/support/warranty', async () => <Warranty {...{'i18n': i18n}}/>);
  on('/support/faq', async () => <Faq {...{'i18n': i18n}}/>);
  on('/support/pet', async () => <PETScreenProtectors {...{'i18n': i18n}}/>);
  on('/support/glass', async () => <GlassScreenProtectors {...{'i18n': i18n}}/>);

  // About
  on('/about', async () => <About {...{'i18n': i18n}}/>);
  on('/contact', async () => <Contact {...{'i18n': i18n}}/>);
  on('/press', async (state) => {
    state.query.page = state.query.page || "1";
    state.query.per_page = state.query.per_page || "20";
    let data = await Http.post(`get`, `/api/content?path=/api/press_centers/`, state.query, state.cookie);
    const content = {
      'i18n': i18n,
      'data': data,
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return <PressCenter {...content} />
  });
  on('/press/:id', async (state) => {
    let data = await Http.post(`get`, `/api/content?path=/api/press_centers/${state.params.id}`, state.query, state.cookie);
    const content = {
      'i18n': i18n,
      'data': data,
      'path': state.path,
      'params': state.params,
      'query': state.query
    };
    return <PressDetail {...content} />
  });
  on('/business', async () => <Business {...{'i18n': i18n}}/>);
  on('/business/apply', async () => <BusinessApply {...{'i18n': i18n}}/>);
  on('/poweriq', async () => <PowerIQ {...{'i18n': i18n}}/>);
  on('/weee', async () => <WEEE {...{'i18n': i18n}}/>);

  on('/usb-c', async (state) => {
    const content = {
      'i18n': i18n,
      // 'single_page': true,
    };
    return <USBC {...content} />
  });

  on('/redirect/:type?', async (state) => {
    const content = {
      'single_page': true,
      'disable_fb_pixel': true,
      'origin': state.origin,
      'params': state.params,
      'query': state.query
    };
    return <Redirect {...content} />
  });

  //404错误页面
  on('*', async (state, error) => {
    error.i18n = i18n;
    return error && <NotFound {...error} />
  });

});

export default router;
