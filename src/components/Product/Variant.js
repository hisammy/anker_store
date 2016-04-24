/**
 * Created by shady on 15/6/29.
 */

import React, { PropTypes, Component } from 'react';
import styles from './Variant.scss';
import withStyles from '../../decorators/withStyles';
import withViewport from '../../decorators/withViewport';
import ReactSwipe from '../../utils/react-swipe';
import classnames from 'classnames';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Dialog from '../Dialog';
import Verify from '../../utils/Verify';
import Track from '../../utils/Track';
import Http from '../../core/HttpClient';
import Link from '../../utils/Link';
import Cookie from '../../utils/Cookie';
import { FBShare, stripTags, md5, pageNav } from '../../utils/Helper';
import PopupSignup from '../Authorize/PopupSignup';

@withViewport
@withStyles(styles)
class Variant extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired
  };

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
    onSetMeta: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      'query': this.props.query || {},
      'quantity': 1,
      'carousel': 0,
      'cur': 0,
      'fixed': '',
      'dialogOption': {
        'content': ''
      },
      'productUrl': [0]
    };
    this.variantIndex(this.props.data.variants, this.props.params.sku);
  };

  componentWillReceiveProps(nextProps) {
    this.variantIndex(nextProps.data.variants, nextProps.params.sku);
    if (this.props.data.id != nextProps.data.id) { // 切换了Product ID(PN)
      this.loadReview(nextProps.data.id, 1);
      this.loadRelate(nextProps.data.id);
    }
    if (this.props.params.sku != nextProps.params.sku) { // 同个Product, 切换了SKU
      this.fireTracking(nextProps.data);
    }
  };

  componentDidMount() {
    let plaTag = this.state.query.tag;
    if (plaTag) {
      Cookie.save('pla_tag', plaTag, {path: '/', 'maxAge': 3600 * 24 * 14}); // N days
    } else {
      plaTag = Cookie.load('pla_tag');
    }
    this.setState({
      'plaTag': plaTag,
      'dialogOption': {
        'close': this.closeDialog.bind(this)
      }
    });
    this.loadReview(this.props.data.id, 1);
    this.loadRelate(this.props.data.id);
    this.fireTracking(this.props.data);
    this.tabSwitch();
  };

  componentWillUnmount() {
    var header = document.getElementsByClassName('Header-fixed')[0];
    header.className =  header.className.replace(' none', '');
    window.onscroll = "";
  };

  variantIndex(vars, sku) {
    if(vars && vars.length) {
      vars.map((item, i) => {
        if (item.sku === sku) {
          this.state.cur = i;
          this.state.variant_id = vars[i].id;
          this.state.carousel = 0;
        }
      })
    }
  };

  tabSwitch() {
    var header = document.getElementsByClassName('Header-fixed')[0],
      tabs = document.getElementById('detail');
    window.onscroll = () => {
      var scrollTop = document.body.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop;
      var faqs = document.getElementById('faqs'),
        review = document.getElementById('review'),
        relate = document.getElementById('relate');
      if(relate && scrollTop >= (relate.offsetTop - 40)) {
        this.setState({
          'tab_cur': 'relate',
        })
      } else if(review && scrollTop >= (review.offsetTop - 40)) {
        this.setState({
          'tab_cur': 'review',
        })
      } else if(faqs && scrollTop >= (faqs.offsetTop - 40)) {
        this.setState({
          'tab_cur': 'faqs',
        })
      } else if(scrollTop >= (tabs.offsetTop - 40)) {
        this.setState({
          'tab_cur': 'detail',
        })
      } else {
        this.setState({
          'tab_cur': '',
        })
      }
      if(scrollTop >= (tabs.offsetTop - tabs.offsetHeight)) {
        if(header.className.indexOf(' none') === -1) {
          header.className += ' none';
        }
        this.setState({
          'fixed': 'fixed'
        })
      } else {
        if(header.className.indexOf(' none') >= -1) {
          header.className =  header.className.replace(' none', '');
        }
        this.setState({
          'fixed': ''
        })
      };
    }
  };

  fireTracking(data) {
    fbq('track', 'ViewContent');
    Track.ecAddImpression([data], 'Product');
    const trackProd = Track.formatProdItem(data, this.state.cur, this.state.quantity);
    Track.ecViewDetail(trackProd);
    // Track
    const user = AppActions.getUser();
    const hashedMail = user.invitation_code || md5(user.email);
    const hasVariants = data && data.variants && data.variants.length;
    if (hasVariants) {
      const variant = data.variants[this.state.cur];
      const itemID = variant.sku || variant.id;
      // console.log(hashedMail, itemID);
      Track.criteoOneTag(hashedMail, {event: 'viewItem', item: itemID});
    }
  };

  imagesCtrl(i) {
    if (i === -1) {
      this.refs.Images.swipe.prev();
    } else {
      this.refs.Images.swipe.next();
    }
  };

  relatesCtrl(i) {
    if (i === -1) {
      this.refs.relates.swipe.prev();
    } else {
      this.refs.relates.swipe.next();
    }
  };

  // Split an array into chunks
  arrayChunk(arr, chunkSize) {
    const ret = arr.map( function(e, i){
        return i%chunkSize===0 ? arr.slice(i,i+chunkSize) : null;
    }).filter(function(e){ return e; });
    return ret;
  };

  variantSet(sku) {
    Location.push( '/products/' + sku);
  };

  closeDialog(event) {
    this.setState({
      'dialogOption': {
        'content': ''
      }
    });
  };

  goCart() {
    Location.push( '/cart');
  };

  quantitySet(type) {
    let quant = this.state.quantity;
    if ((type === 'reduce' && quant <= 1) || (type === 'add' && quant >= 999)) {
      return;
    }
    quant = (type === 'reduce') ? --quant :
      (type === 'add') ? ++quant :
        parseInt(event.target.value) ? event.target.value : 1;
    this.setState({
      quantity: quant
    });
  };

  quantityInput(event) {
    this.state.quantity = /^[0-9]{0,3}$/.test(event.target.value) ? event.target.value : this.state.quantity;
    this.setState(this.state);
  };


  addCart = async (event) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['products'];
    event.preventDefault();
    let body = {
      line_item: {
        variant_id: this.state.variant_id,
        quantity: this.state.quantity
      }
    };
    if (AppActions.getUser().order_id) {
      body['order_id'] = AppActions.getUser().order_id;
    }
    const json = await Http.post('post', '/api/content?path=/api/orders/populate', body);
    if (!!json.token && !!json.number) {
      AppActions.visitor(json);
      AppActions.setCart(json.total_quantity);
      this.setState({
        'dialogOption': {
          'title': compo.success,
          'dialogType': 'confirm',
          'content': compo.added_to_cart,
          'buttons': <div>
            <a className="button normalBtn" onClick={this.closeDialog.bind(this)}>{compo.continue_shopping}</a>
            <a className="button deepButton" onClick={this.goCart.bind(this)}>{compo.go_to_cart}</a>
          </div>
        }
      });
      const prod = Track.formatProdItem(this.props.data, this.state.cur);
      Track.ecAddToCart(prod, 1, 'Product');
    } else {
      this.setState({
        'dialogOption': {
          'content': json
        }
      });
    }
    fbq('track', 'AddToCart');
  };

  share() {
    FBShare(location.href);
  };

  stars(star) {
    if (star) {
      var stars = [];
      for (var i = 1; i <= 5; i++) {
        stars.push(i <= star ? 100 : parseInt((star - i + 1) * 100));
      }
    } else {
      stars = [0, 0, 0, 0, 0];
    }
    return stars;
  };

  loadReview = async (id, page) => {
    if(this.state.review) {
      this.state.review.loadMore = true;
      this.setState(this.state);
    }
    let json = await Http.post('get', '/api/content?path=/api/products/' + id + '/reviews&page=' + page + '&per_page=8', null, null, true);
    if (json.star) {
      json.stars = [];
      for (var i = 1; i <= 5; i++) {
        json.stars.push(i <= json.star ? 100 : parseInt((json.star - i + 1) * 100));
      }
    } else {
      json.stars = [0, 0, 0, 0, 0];
    }
    this.goScroll('review');
    this.setState({
      'review': {
        'reviews': json.reviews,
        'count': json.total_count,
        'current_page': json.current_page,
        'pages': json.pages,
        'star': json.star,
        'stars': json.stars,
        'loadMore': false
      }
    });
  };

  loadRelate = async(id) => {
    // console.log('id', id); // slug or PN(prod_id) or sku
    this.setState({
      'relates': [],
    });
    const json = await Http.post('get', `/api/content?path=/api/products/${id}/relations?per_page=12`, null, null, false);
    const data = json.products || [];
    const chunkSize = this.props.viewport.width < 768 ? 2 : 4;
    this.setState({
      'relates_chunksize': chunkSize,
      'relates': data,
      'relateChunks': this.arrayChunk(data, chunkSize),
    });
    Track.ecAddImpression(data, 'Relates');
    // console.log(id, data, this.state.relateChunks);
  };

  relateClick(i, event) {
    Link.handleClick(event);
    Track.ecProdClick(this.state.relates[i], 'Relates');
  }

  carouselCur(i) {
    if(this.state.productUrl.indexOf(i) < 0) {
      this.state.productUrl.push(i)
    }
    this.refs.Carousel.swipe.slide(i);
  };

  carouselCallback(i) {
    if(this.refs.Images.swipe.getPos() !== parseInt(i / 5)) {
      this.refs.Images.swipe.slide(parseInt(i / 5));
    }
    this.setState({
      'carousel': i
    })
  };

  carouselUpdate(i, j, k) {
    return 1;
  }

  toggleFaq(i, event) {
    const prevIndex = this.state.faqIndex;
    this.state.faqIndex = i == prevIndex ? null : i;
    this.setState(this.state);
  };

  goScroll(id) {
    const target = document.getElementById(id);
    target && target.scrollIntoView();
  };

  amazon_link(event) {
    function fn(str,pro,value) {
      data[decodeURIComponent(pro)] = decodeURIComponent(value);
    }
    var url = event.currentTarget.href;
    var path = url.split('?')[0];
    var reg = /(?:[?&]+)([^&]+)=([^&]+)/g;
    var data = {};
    url.replace(reg,fn);
    if(data.kwr_id) {
      Http.post('post','/markets/click', {"kwr_id": data.kwr_id})
    }
    if(data.qid) {
      data.qid = Math.round(new Date().getTime() / 1000) - 60;
    }
    var count = 0;
    for(var i in data) {
      count++;
      path += ((count === 1 ? '?' : '&') + i + '=' + data[i]);
    }
    event.currentTarget.href = path;
  };

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['products'];
    let title = 'Anker | ' + (this.props.data && this.props.data.variants && this.props.data.variants[this.state.cur] ?
      (this.props.data.name + ' | ' + this.props.data.variants[this.state.cur].option_values[0].name) : '');
    this.context.onSetTitle(title);

    const fullUrl = this.props.origin + this.props.path;
    const data = this.props.data;
    this.context.onSetMeta("og:url", fullUrl);
    this.context.onSetMeta("twitter:card", "summary_large_image");
    this.context.onSetMeta("twitter:site", compo.twitter_site);
    this.context.onSetMeta("twitter:url", fullUrl);
    const hasVariants = data && data.variants && data.variants.length;
    if (data) {
      this.context.onSetMeta("og:title", data.name);
      this.context.onSetMeta("og:description", stripTags(data.description));
      this.context.onSetMeta("twitter:title", data.name);
      this.context.onSetMeta("twitter:description", stripTags(data.description));
      if (hasVariants && data.variants[this.state.cur]) {
        this.context.onSetMeta("og:image", data.variants[this.state.cur].images && data.variants[this.state.cur].images.length ? data.variants[this.state.cur].images[0].mini_url : '');
        this.context.onSetMeta("twitter:image", data.variants[this.state.cur].images && data.variants[this.state.cur].images.length ? data.variants[this.state.cur].images[0].mini_url : '');
      }

    }
    if (hasVariants && data.variants[this.state.cur]) {
      const prod = data.variants[this.state.cur];
      //将产品下所有图片拼接成5*5的二维数组
      let images = [];
      if (prod.images) {
        prod.images.map((item, i) => {
          if (i % 5 === 0) {
            images.push([]);
          };
          images[images.length - 1].push(item);
        })
      }
      return (
        <div className="Product">
          <PopupSignup i18n={i18n}/>
          <Dialog {...this.state.dialogOption} />

          <div className="module-container">

            <div className="page-crumbs">
              <div className="wrapper">
                <a href="/" onClick={this.handleClick}>{compo.crumb_home}</a>
                <span className="split">/</span>
                <a href="/Products" onClick={this.handleClick}>{compo.crumb_products}</a>
                <span className="split">/</span>
                <a href={"/Products/taxons/" + this.props.data.top_category_id + '/' + this.props.data.top_category} onClick={this.handleClick}>{this.props.data.top_category}</a>
                <span className="split">/</span>
                <span className="cur">{this.props.data.name}</span>
              </div>
            </div>

            <ul className="prod-viewport">

              <li className="prod-overview clearfix" itemScope itemType="http://schema.org/Product">
                <div className="Carousel">
                  <div className="title" itemProp="name">{this.props.data.name}</div>
                  {data.variants.map((item, i) => {
                    if(i === this.state.cur) {
                      return (
                        <div key={i}>
                          <div className="Carousel-image">
                            <ReactSwipe key={`Carousel_${data.id}`} ref="Carousel" shouldUpdate={ this.carouselUpdate.bind(this)} callback={this.carouselCallback.bind(this)}>
                              {prod.images.map((item, i) => {
                                return (
                                  <img key={i} src={this.state.productUrl.indexOf(i) < 0 ? item.xmini_url : item.product_url} itemProp="image" />
                                );
                              })}
                            </ReactSwipe>
                          </div>
                          <div className="Carousel-images">
                            <a className="ctrl prev" onClick={this.imagesCtrl.bind(this, -1)}>
                              <i className="iconfont">&#xe608;</i>
                            </a>
                            <a className="ctrl next" onClick={this.imagesCtrl.bind(this, 1)}>
                              <i className="iconfont">&#xe613;</i>
                            </a>
                            <ReactSwipe key={`Images_${data.id}`} className="carouselWrap" ref="Images" shouldUpdate={ function(nextProps) { return 1; } } continuous={false}>
                              {images.map((item, i) => {
                                return (
                                  <div key={i} className="carouselPage">
                                    {item.map((item, j) => {
                                      return (
                                        <a key={j} className={(i * 5 + j) === this.state.carousel ? 'cur' : ''} onClick={this.carouselCur.bind(this, (i * 5 + j))}>
                                          <span><img src={item.xmini_url}/></span>
                                        </a>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </ReactSwipe>
                          </div>
                        </div>
                      )
                    }
                  })}
                </div>
                <div className="Information">
                  <div className="brand" itemProp="brand">Anker</div>
                  <div className="title" itemProp="name">{this.props.data.name}</div>
                  {this.state.review ?
                    <div className="review" itemProp="aggregateRating" itemScope itemType="http://schema.org/AggregateRating">
                      <div className="items">
                        {this.state.review.stars.map((item, i) => {
                          return (
                            <span key={i}>
                              <i className='iconfont'>&#xe630;</i>
                              <i className='iconfont' style={{width: (item > 0 ? item : 0) + '%'}}>&#xe631;</i>
                            </span>
                          )
                        })}
                      </div>
                      <span className='average' itemProp="ratingValue">{this.state.review.star ? new Number(this.state.review.star).toFixed(1) : '0.0'}</span>
                      <a className="size" onClick={this.goScroll.bind(this, 'review')}>
                        <span dangerouslySetInnerHTML={{
                          __html: i18n.format(compo.reviews_stat, `<span itemProp="reviewCount">${this.state.review.count ? this.state.review.count : 0}</span>`)
                        }} />
                      </a>
                    </div> : ''
                  }
                  <div className="description" itemProp="description">{this.props.data.description}</div>
                  <div className="price">
                    {prod.status === 'on_sale' ?
                      <span className="price">
                        <span className="newPrice">
                          <span itemProp="priceCurrency" content={compo.price_currency} dangerouslySetInnerHTML={{ __html: compo.currency_sign}}/>
                          <span itemProp="price">{prod.price}</span>
                        </span>
                        <span className="oldPrice">{prod.display_standard_price != prod.display_price ? prod.display_standard_price : ''}</span>
                      </span>
                    : ''}
                  </div>

                  <dl className="color">
                    <dt>{compo.products_color}:</dt>
                    {this.props.data.variants.map((item, i) => {
                      return (
                        <dd key={i} className={i === this.state.cur ? 'cur' : ''}>
                          <img onClick={this.variantSet.bind(this, item.sku)}
                               title={item.option_values.length> 0 ? item.option_values[0].name : ''}
                               src={item.option_values.length ? item.option_values[0].image.mini_url : ''}
                          />
                        </dd>
                      );
                    })}
                  </dl>

                  {prod.status === 'on_sale' ?
                    <div className="quantity">
                      <div className="quantity-name">{compo.products_quantity}:</div>
                      <div className="quantity-number">
                        <a className={'reduce_' + this.state.quantity}
                           onClick={this.quantitySet.bind(this, 'reduce')}>
                          <i className="iconfont">&#xe619;</i>
                        </a>
                        <input type="text" value={this.state.quantity} onChange={this.quantityInput.bind(this)}/>
                        <a className={"add_" + this.state.quantity} onClick={this.quantitySet.bind(this, 'add')}>
                          <i className="iconfont">&#xe616;</i>
                        </a>
                      </div>
                    </div> : '' }

                  <ul className={'action ' + (prod.is_active ? '' : 'disable')}>
                    {prod.status === 'on_sale' ?
                      <li className="store">
                        <a onClick={this.addCart.bind(this)}>
                          <span className="cart">{common.add_to_cart}</span>
                        </a>
                      </li>
                      : ''
                    }

                    {prod.markets_info.map((item, i) => {
                      let market_url = item.market_url;
                      if (this.state.plaTag) {
                        market_url = market_url.replace(/&tag=[^&]+/, '&tag=' + this.state.plaTag);
                      }
                      return (
                        <li key={i} className="amazon">
                          <a href={market_url} target="_blank" onClick={this.amazon_link.bind(this)}>{compo.buy_at_amazon} {item.country_code}</a>
                        </li>
                      );
                    })}
                  </ul>

                  {/*<div className="download">
                    {data.accessories && data.accessories.length ?
                      <a href={"/support/download?keyword=" + encodeURIComponent(data.name)} onClick={Link.handleClick}><i className="iconfont">&#xe671;</i>Download Drivers or Manual</a>
                      : ''
                    }
                  </div>*/}

                  {this.props.data.product_properties && this.props.data.product_properties.length ?
                    <dl className="properties">
                      <dt>{compo.product_specs}:</dt>
                      {this.props.data.product_properties.map((item, i) => {
                        return (
                          <dd key={i}>
                            <span className="key">{item.property_name + ' :'}</span>
                            <span className="value">{item.value}</span>
                          </dd>
                        );
                      })}
                    </dl>
                    : ''
                  }

                  <div className="share">
                    <a onClick={this.share.bind(this)} ><i className="iconfont">&#xe657;</i></a>
                    <a href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(compo.twitter_site + " " + this.props.data.name + " Click here: https://www.anker.com" + this.props.path)} target="_blank"><i className="iconfont">&#xe615;</i></a>
                  </div>
                </div>
              </li>

              <li className="prod-tabs" id='detail'>
                <div className={"cur_" + this.state.tab_cur + " wrapper " + this.state.fixed}>
                  <div className="module-container">
                    <a className="detail" onClick={this.goScroll.bind(this, 'detail')}>{compo.tab_highlights}</a>
                    {this.props.data.faqs && this.props.data.faqs.length ? <a className="faqs" onClick={this.goScroll.bind(this, 'faqs')}>{compo.tab_faq}</a> : ''}
                    {this.state.review && this.state.review.count ? <a className="review" onClick={this.goScroll.bind(this, 'review')}>{compo.tab_reviews}</a> : ''}
                    {this.state.relates && this.state.relates.length ? <a className="relate" onClick={this.goScroll.bind(this, 'relate')}>{compo.tab_related}</a>
                      : ''}
                  </div>
                </div>
              </li>

              {(this.props.data.pd_elem_images && this.props.data.pd_elem_images.width) ?
                <li className={"prod-description " + (this.props.viewport.width > 767 ? 'viewPC' : 'viewPhone')}>
                  <div className="pd-elem-images">
                    {this.props.data.pd_elem_images.map((item, i) => {
                      return (
                        <img key={i} src={ item.product_url}/>
                      )
                    })}
                  </div>
                </li>
                : this.props.data.content ?
                <li className={"prod-description " + (this.props.viewport.width > 767 ? 'viewPC' : 'viewPhone')}>
                  <div className="pd-content" dangerouslySetInnerHTML={{__html: '<div>' + this.props.data.content + '</div>'}}/>
                </li>
              : '' }

              {this.props.data.faqs && this.props.data.faqs.length ?
                <li className="prod-faq" id='faqs'>
                  <div className="prod-title"><span>{compo.tab_faq}</span></div>
                  <div className="list">
                    {this.props.data.faqs.map((item, i) => {
                      return (
                        <dl key={i} className={this.state.faqIndex == i ? 'cur' : ''}>
                          <dt onClick={this.toggleFaq.bind(this, i)}>
                            <i className="iconfont"><span className="faq-open">&#xe616;</span><span className="faq-close">&#xe619;</span></i>
                            <span className="text">{item.question}</span>
                          </dt>
                          <dd dangerouslySetInnerHTML={{__html: item.answer}} />
                        </dl>
                      )
                    })}
                  </div>
                </li>
              : '' }

              {this.state.review && this.state.review.reviews && this.state.review.reviews.length ?
                <li className="prod-review" id='review'>
                  <div className="prod-title"><span>{compo.tab_reviews}</span></div>
                  <div className="prod-stars">
                    {
                      this.state.review.stars.map((item, i) => {
                        return (
                          <span key={i}>
                            <i className='iconfont'>&#xe630;</i>
                            <i className='iconfont' style={{width: (item > 0 ? item : 0) + '%'}}>&#xe631;</i>
                          </span>
                        )
                      })
                    }
                  </div>

                  <div className="prod-score">
                    <span className='current'>{this.state.review.star ? new Number(this.state.review.star).toFixed(1) : '0.0'}</span>
                    <i>/</i>
                    <span className='full'>{this.state.review.star ? 5 : 0}</span>
                  </div>

                  {this.state.review.reviews.length ?
                    <div>
                      <ul className="Review-list">
                        {this.state.review.reviews.map((item, i) => {
                          let star = [];
                          for (var n = 1; n <= 5; n++) {
                            star.push(n <= item.star ? 1 : 0);
                          }
                          if (!item.user) {
                            item.user = {nick_name: item.amazon_user_name}
                          }
                          return (
                            <li key={i}>
                              <div className="info">
                                <div className="title">{item.title}</div>
                                <div className="star">
                                  {star.map((item, j) => {
                                    return (
                                      item ? <i key={j} className='iconfont'>&#xe631;</i> : <i key={j} className='iconfont'>&#xe630;</i>
                                    )
                                  })}
                                  <span className="count">{item.star.toFixed(1)}</span>
                                </div>
                                <div className="base">
                                  <span className="name">{item.user.nick_name ? item.user.nick_name : item.user.email ? item.user.email : 'Anker Customer'}</span>
                                  <span className="date">{Verify.dateFormat(item.created_at, 'MM/dd/yyyy')}</span>
                                </div>
                              </div>
                              <div className="text">
                                <div className="content">{item.content}</div>
                              </div>
                              <ul className="reply">
                                {item.replies.map((item, i) => {
                                  <li key={i}>
                                    <div className="icon">
                                      <div className="img">
                                        <img src={item.user.avatar_image ? item.user.avatar_image.mini_url : require('../../public/user.jpg')}/>}
                                      </div>
                                      <div
                                        className="name">{item.user.nick_name ? item.user.nick_name : item.user.email}</div>
                                      <div className="date">{Verify.dateFormat(item.created_at)}</div>
                                    </div>
                                    <div className="text">
                                      <div className="title">{item.title}</div>
                                      <div className="content">{item.content}</div>
                                    </div>
                                  </li>
                                })}
                              </ul>
                            </li>
                          )
                        })}
                      </ul>
                      {!this.state.review.loadMore ?
                        pageNav(this.state.review.count, this.state.review.current_page, 8, this.loadReview.bind(this, this.props.data.id))
                        :
                        <div className="loading-box">
                          <div className="loading-cell">
                            <i className="iconfont">&#xe63a;</i>
                            <span>{common.loading}</span>
                          </div>
                        </div>
                      }
                    </div>
                    :
                    <div className="empty"></div>
                  }
                </li>
              : ''}

              {this.state.relates && this.state.relates.length ?
                <li className="prod-relate" id='relate'>
                  <div className="prod-title"><span>{compo.tab_related}</span></div>
                  <div className="prod-subtitle">{compo.related_desc}</div>
                  <div>
                    <div className="Carousel-relate">
                      <a className="ctrl prev" onClick={this.relatesCtrl.bind(this, -1)}><i className="iconfont">&#xe608;</i></a>
                      <a className="ctrl next" onClick={this.relatesCtrl.bind(this, 1)}><i className="iconfont">&#xe613;</i></a>
                      <ReactSwipe key={`relates_${data.id}`} className="carouselWrap" ref="relates" shouldUpdate={ function(nextProps) { return 1; } } continuous={false}>
                      {this.state.relateChunks.map((item, i) => {
                        return (
                          <div key={i} className={'carouselPage ' + `chunk${this.state.relates_chunksize}`}>
                            {item.map((item, j) => {
                              const sku = item.variants.length ? item.variants[0].sku : '';
                              return (
                                <div key={j} className="item">
                                  <a href={`/products/${sku}`} onClick={this.relateClick.bind(this, i)}>
                                    <span className="border"></span>
                                    <div className="image">
                                      <img src={item.variants && item.variants.length && item.variants[0].image ? item.variants[0].image.mini_url : ''} />
                                    </div>
                                    <div className="title">{item.name}</div>
                                    <div className="description" dangerouslySetInnerHTML={{__html: (item.description ? item.description.replace(/\r\n/g, '<br>') : '')}} />
                                    <div className="price">{item.variants && item.variants.length && item.variants[0].display_price ? item.variants[0].display_price : ''}</div>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                      </ReactSwipe>
                    </div>
                  </div>
                </li>
              : ''}

            </ul>
          </div>
        </div>
      );
    } else {
      return (
        <div className="product-empty">
          <i className="iconfont">&#xe63c;</i>
          <div>{common.empty}</div>
        </div>
      );
    }
  }

}

export default Variant;
