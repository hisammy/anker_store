/**
 * Created by Leon on 2015-11-23 11:04:40
 */

import React, { PropTypes, Component } from 'react';
import styles from './Download.scss';
import withStyles from '../../decorators/withStyles.js';
import classNames from 'classnames';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Link from '../../utils/Link';
import Http from '../../core/HttpClient';
import ServiceNav from './ServiceNav';
// import Dialog from '../../utils/Dialog';
// import Dialog from '../Dialog';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class Download extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
  };
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    var data = this.props.data || {};
    // console.log(data);
    const keyword = this.props.query.keyword;
    this.setState({
      'keyword': keyword && keyword.trim() || '',
      'products': data.products || [],
      'current_page': data.current_page || 0,
      'pages': data.pages || 0,
      'loadMore': false,
    });
  }
  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps);
    var data = nextProps.data || {};
    const keyword = nextProps.query.keyword;
    this.setState({
      'keyword': keyword && keyword.trim() || '',
      'products': data.products || [],
      'current_page': data.current_page || 0,
      'pages': data.pages || 0,
      'loadMore': false,
    });
  }

  componentDidMount() {
  }

  keywordChange(event) {
    this.setState({
      keyword: event.target.value,
    });
  }
  searchSubmit(event) {
    event.preventDefault();
    var keyword = this.refs.keyword && encodeURIComponent(this.refs.keyword.value.trim()) || '';
    if (!keyword) return;
    const param = keyword ? `?keyword=${keyword}` : '';
    Location.push( `/support/download${param}`);
    // const fbq = window.fbq || function() {};
    // fbq('track', 'Search');
  }
  LoadMore = async () => {
    if (this.state.loadMore) {
      return;
    }
    this.setState({
      'products': this.state.products ? this.state.products : 0,
      'loadMore': true,
    });
    const query = {
      'only_downloads': true,
      'per_page': 8,
      'page': this.state.current_page + 1,
      'keyword': this.state.keyword,
    };
    const json = await Http.post(`get`, `/api/content?path=/api/products/search`, query, null, true);
    this.state.products = this.state.products ? this.state.products : [];
    this.setState({
      'products': this.state.products.concat(json.products),
      'current_page': json.current_page,
      'pages': json.pages,
      'loadMore': false,
    })
  }

  showDown(item, i) {
    // console.log(item);
    this.setState({
      showDown: i,
      downContent: (<div className="down">
        <i className="bg"></i>
        <div className="cnt">
          <h4>Download List</h4>
          <ul>
            {item.accessories.map((access, k) => {
              return (
                <li key={k}>
                  <a target="_blank" href={access.url}>
                    {decodeURIComponent(access.title).replace(/\+/g, ' ')}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <i className="iconfont close" onClick={this.closeDown.bind(this)}>&#xe642;</i>
      </div>),
    });
  }
  closeDown(event){
    event.stopPropagation();
    this.setState({
      showDown: -1,
    });
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['support'];
    this.context.onSetTitle(compo.download_title);
    let productsCount = this.state.products && this.state.products.length || 0;
    return (
      <div className="Download">
        <PopupSignup i18n={i18n}/>
        <div className="Banner-container">
          <div className="module-container banner">
            <img className="img" src={require('../../public/support/banner.jpg')} />
            <div className="text">
              <h2>{compo.download_search_title}</h2>
              <div className="info">
                {compo.download_search_desc}
              </div>
              <form className="search" action="" onSubmit={this.searchSubmit.bind(this)}>
              <p className="tip txt"></p>
                <input className="txt" type="text" ref="keyword" maxLength="200" autoComplete="off" placeholder="" value={this.state.keyword} onChange={this.keywordChange.bind(this)}/>
                <button>
                  <i className="iconfont">&#xe618;</i>
                </button>
              </form>
            </div>
          </div>
          <div className="tiny-search">
            <form className="search" action="" onSubmit={this.searchSubmit.bind(this)}>
              <input className="txt" type="text" ref="keyword" maxLength="200" autoComplete="off" placeholder={compo.download_search_placeholder} value={this.state.keyword} onChange={this.keywordChange.bind(this)}/>
              <button>
                <i className="iconfont">&#xe618;</i>
              </button>
            </form>
          </div>
        </div>
        <ServiceNav {...{"support_nav": compo.support_nav}}/>
        <div className="module-container Download-container">
          <div className="module-items clearfix">
            {this.state.products && this.state.products.length ?
              <div className="module-wraper">
                {this.state.products.map((item, i) => {
                  let variants = item.variants && item.variants.filter(function(item){return !!item.image }) || [];
                  const variant = variants && variants[0] || {};
                  // console.log(i, variants, productsCount);
                  // if (!variants[0]) { --productsCount; return; } // 不显示: 没有图片的SKU
                  return (
                    <div key={i} className={'item ' + (this.state.showDown == i ? 'current' : '')} href="/products" onClick={this.showDown.bind(this, item, i)}>
                      <span className="border"></span>
                      <div className="image">
                        <span className="tag-amazon"></span>
                        <span className="tag-sellout"></span>
                        {variant.image && variant.image.mini_url ? <img src={variant.image.mini_url} /> : ''}
                      </div>
                      <div className="title">{item.name}</div>
                      <div className="description" dangerouslySetInnerHTML={{__html: (item.description ? item.description.replace(/\r\n/g, '<br>') : '')}} />
                      {this.state.showDown == i ? this.state.downContent : ''}
                    </div>
                  );
                })}
              </div>
            :
              <div className="product-empty">
                <i className="iconfont">&#xe63c;</i>
                <div dangerouslySetInnerHTML={{__html: compo.download_could_not_find_anything}}/>
              </div>
            }
          </div>
          {productsCount <= 0 ||this.state.current_page >= this.state.pages ? '' :
            <div className="module-more">
              <a className="load-btn" onClick={this.LoadMore.bind(this)}>
                {common.load_more} {this.state.loadMore ? <i className="iconfont load-icon">&#xe63a;</i> : ''}
              </a>
            </div>
          }
        </div>
        <div className="space-100"></div>
      </div>
    );
  }
}

export default Download;
