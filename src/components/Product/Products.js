/**
 * Created by shady on 15/6/29.
 */

import React, { PropTypes, Component } from 'react';
import styles from './Products.scss';
import withStyles from '../../decorators/withStyles';
import Link from '../../utils/Link';
import Location from '../../core/Location';
import AppActions from '../../core/AppActions';
import Http from '../../core/HttpClient';
import Track from '../../utils/Track';
import { md5 } from '../../utils/Helper';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class products extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired
  };

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      'taxons': [],
      'cur': 0
    };
  }

  componentDidMount() {
    this.getTaxons(parseInt(this.props.params.id));
    this.fireTracking();
  }

  componentWillReceiveProps(nextProps) {
    this.getTaxons(parseInt(nextProps.params.id));
    this.fireTracking();
  }

  fireTracking() {
    fbq('track', 'ViewContent');
  }

  getTaxons(id) {
    const taxons = this.props.data.taxonomies ? this.props.data.taxonomies[0].root.taxons : [];
    let cur = 0;
    taxons.map((item, i) => {
      if(item.id === id) {
        cur = i;
      }
    })
    taxons[cur].taxons.map((item, i) => {
      this.getProduct(item);
    });
    this.setState({
      'cur': cur,
      'taxons': taxons
    })
  }

  tabTaxon(cur) {
    if(cur >= 0 && cur < this.state.taxons.length) {
      Location.push('/products/taxons/' + this.state.taxons[cur].id + '/' + this.state.taxons[cur].name)
    }
  }

  getProduct = async (item) => {
    const body = {
      'taxon_id': item.id
    };
    const json = await Http.post(`get`, `/api/content?path=/api/products/search_by_taxon`, body, null ,true);
    item.products = json.products;
    this.setState(this.state);
    // Track
    const user = AppActions.getUser();
    const hashedMail = user.invitation_code || md5(user.email);
    let items = [];
    json.products.map(item => {
      items = items.concat(item.variants.map(o => o.sku));
    });
    Track.criteoOneTag(hashedMail, {event: 'viewList', item: items});
    // console.log(json.products);
    Track.ecAddImpression(json.products, 'Products');
  }
  prodClick(item, event) {
    Link.handleClick(event);
    Track.ecProdClick(item, 'Products');
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['products'];
    this.context.onSetTitle(compo.products_title);
    return (
      <div className="Products">
        <PopupSignup i18n={i18n}/>
        <div className="banner">
          <div className="banner-img">
            {this.state.taxons.map((item, i) => {
              if(i === this.state.cur) {
                return (
                  <img key={i} src={this.state.taxons && (this.state.taxons.length) && this.state.taxons[this.state.cur].image ? this.state.taxons[this.state.cur].image.normal_url : ''} />
                )
              }
            })}
            <div className="ctrl">
              <i className="iconfont" onClick={this.tabTaxon.bind(this, this.state.cur - 1)}>&#xe608;</i>
              <i className="iconfont" onClick={this.tabTaxon.bind(this, this.state.cur + 1)}>&#xe613;</i>
            </div>
          </div>
          <div className="banner-tabs" ref="bannerTabs">
            <div className="module-container">
              {this.state.taxons.map((item, i) => {
                return (
                  <a key={i} href={"/products/taxons/" + item.id + '/' + item.name} className={this.state.cur === i ? 'cur' : ''} onClick={Link.handleClick}>
                    <span className="border"></span>
                    <span className="image"><img src={item.icon.normal_url} /></span>
                    <span className="name">{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {this.state.taxons[this.state.cur] ? this.state.taxons[this.state.cur].taxons.map((item, i) => {
          return(
            <div key={i}>
              {item.products ?
                item.products.length ?
                  <div key={i} className="module module-category">
                    <div className="module-container">
                      <div className="module-title">
                        <i><img src={item.icon.normal_url} /></i>
                        <span className="bold">{item.name}</span>
                      </div>
                      <div className="module-description">{item.description}</div>
                      <div className="module-items clearfix">
                        <div className="module-wraper">
                          {item.products.map((item, j) => {
                            return (
                              <a key={j} className="item" href={"/products/" + (item.variants.length ? item.variants[0].sku : '')} onClick={this.prodClick.bind(this, item)}>
                                <span className="border"></span>
                                <div className="image">
                                  <span className="tag-amazon"></span>
                                  <span className="tag-sellout"></span>
                                  <img src={item.variants && item.variants.length && item.variants[0].image ? item.variants[0].image.mini_url : ''} />
                                </div>
                                <div className="attr">
                                  <ul className="color">
                                    {item.variants.map((item, k) => {
                                      return (
                                        <li key={k}><img src={item.option_values[0].image.mini_url} /></li>
                                      );
                                    })}
                                  </ul>
                                </div>
                                <div className="title">{item.name}</div>
                                <div className="description" dangerouslySetInnerHTML={{__html: (item.description ? item.description.replace(/\r\n/g, '<br>') : '')}} />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  : ''
                :
                <div className="loading-box">
                  <div className="loading-cell">
                    <i className="iconfont">&#xe63a;</i>
                    <span>{common.loading}</span>
                  </div>
                </div>
              }
            </div>
          );

        }) : ''}

        <div className="space-100"></div>

      </div>
    );
  }
}

export default products;
