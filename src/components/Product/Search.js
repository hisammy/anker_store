import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Search.scss';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Link from '../../utils/Link';
import Http from '../../core/HttpClient';
import { md5 } from '../../utils/Helper';
import Track from '../../utils/Track';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class Search extends Component {

  static propTypes = {
    show: PropTypes.string
  };

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      'label': ''
    };
  }

  componentDidMount() {
    this.loadLabel();
    this.productsClear(this.props);
    this.fireTracking();
  }

  componentWillReceiveProps(nextProps) {
    this.productsClear(nextProps);
    this.fireTracking();
  }

  fireTracking() {
    // console.log('Search');
    fbq('track', 'Search');
  }

  productsClear(props) {
    Object.assign(this.state, {
      'current_page': 0,
      'pages': 0,
      'per_page': 20,
      'products': 0,
      'loadMore': false,
      'label': props.query.label,
      'keyword': props.query.keyword
    });
    this.loadProducts(true);
    this.setState(this.state);
  };

  loadLabel = async () => {
    const tags = await Http.post(`get`, `/api/content?path=/api/products/tags`, null, null, true);
    this.setState({
      'tags': tags
    })
  };

  loadProducts = async (clear) => {
    this.setState({
      'loadMore': true
    });
    const body = {
      'per_page': this.state.per_page,
      'page': this.state.current_page + 1,
      'keyword': this.state.keyword,
      'label': this.state.label
    };
    const json = await Http.post(`get`, `/api/content?path=/api/products/search`, body, null, true);
    if(body.keyword !== this.state.keyword || body.label !== this.state.label) {
      return false;
    }
    this.setState({
      'current_page': json.current_page,
      'pages': json.pages,
      'products': clear ? json.products : this.state.products.concat(json.products),
      'loadMore': false
    });
    // Track
    const user = AppActions.getUser();
    const hashedMail = user.invitation_code || md5(user.email);
    let items = [];
    json.products.map(item => {
      items = items.concat(item.variants.map(o => o.sku));
    });
    // console.log(hashedMail, items);
    Track.criteoOneTag(hashedMail, {event: 'viewList', item: items});
    // console.log(json.products);
    Track.ecAddImpression(json.products, 'Search');
  };

  prodClick(item, event) {
    Link.handleClick(event);
    Track.ecProdClick(item, 'Search');
  }

  inputFocus(event) {
    this.refs.search.focus();
  }

  inputKey(event) {
    this.setState({
      'keyword': event.target.value
    });
  }

  swipeTag(label, event) {
    this.state.label = label;
    this.searchSubmit(event);
  }

  searchSubmit(event) {
    event.preventDefault();
    const keyword = this.state.keyword ? ('keyword=' + encodeURIComponent(this.state.keyword)) : '';
    const label =  this.state.label ? ('label=' + this.state.label) : '';
    const param = (keyword && label) ? ('?'+keyword+'&'+label) : keyword ? ('?' + keyword) : label ? ('?' + label) : '';
    const fbq = window.fbq || function() {};
    fbq('track', 'Search');
    Location.push( `/search${param}`);
  }

	render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['search'];
    const keyword = this.state.keyword || this.state.label;
    const title = i18n.format(compo.search_title, keyword);
    this.context.onSetTitle(title);
    return (
      <div className="search">
        <PopupSignup i18n={i18n}/>
        <div className="search-input" onClick={this.inputFocus.bind(this)}>
          <div className='module-container'>
            <form onSubmit={this.searchSubmit.bind(this)}>
              <span className="title">{compo.search_banner_tip}</span>
              <input ref="search" autoFocus="true" className="input" type="text" placeholder={compo.search_banner_placeholder} onChange={this.inputKey.bind(this)} value={this.state.keyword} />
              <i className="iconfont">&#xe618;</i>
            </form>
          </div>
        </div>

        <div className="module search-result">
          <div className="module-container">

            <div className="search-tags">
              {this.state.tags && this.state.tags.length ?
                <ul className="clearfix">
                  <li>
                    <a className={!this.state.label ? "cur" : ""} href="javascript:void(0)" onClick={this.swipeTag.bind(this, '')}>
                    <span>{compo.search_tag_all}</span>
                    <span className="border"></span></a>
                  </li>
                  {this.state.tags.map((item, i) => {
                    return (
                      <li key={i}>
                        <a className={this.state.label && item.tag && item.tag.toLowerCase() === this.state.label.toLowerCase() ? "cur" : ""} href="javascript:void(0)" onClick={this.swipeTag.bind(this, item.tag)}>
                        <span>{item.tag}</span>
                        <span className="border"></span></a>
                      </li>
                    );
                  })}
                </ul>
                : ''
              }
            </div>

            {this.state.products ?
              this.state.products.length ?
                <div className="module-items clearfix">
                  <div className="module-wraper">
                    {this.state.products.map((item, i) => {
                      return (
                        !item ? '' :
                        <a key={i} className="item" href={"/products/" + (item.variants.length ? item.variants[0].sku : '')} onClick={this.prodClick.bind(this, item)}>
                          <span className="border"></span>
                          <div className="image">
                            <span className="tag-amazon"></span>
                            <span className="tag-sellout"></span>
                            <img src={item.variants && item.variants.length && item.variants[0].image ? item.variants[0].image.mini_url : ''} />
                          </div>
                          {item.variants ?
                            <div className="attr">
                              <ul className="color">
                                {item.variants.map((item, j) => {
                                  return (
                                    <li key={j}><img src={item.option_values[0].image.mini_url} /></li>
                                  );
                                })}
                              </ul>
                            </div> : ''
                          }
                          <div className="title">{item.name}</div>
                          <div className="description" dangerouslySetInnerHTML={{__html: (item.description ? item.description.replace(/\r\n/g, '<br>') : '')}} />
                        </a>
                      );
                    })}
                  </div>
                </div>
                :
                <div className="product-empty">
                  <i className="iconfont">&#xe63c;</i>
                  <div>{common.could_not_find_anything}</div>
                  <div>{common.please_search_again}</div>
                </div>
              :
              <div className="loading-box">
                <div className="loading-cell">
                  <i className="iconfont">&#xe63a;</i>
                  <span>{common.loading}</span>
                </div>
              </div>
            }

            <div className="module-more">
              {!this.state.current_page || this.state.current_page >= this.state.pages ? '' :
                <a className="load-btn" onClick={this.loadProducts.bind(this, false)}>{common.load_more} {this.state.loadMore ? <i className="iconfont load-icon">&#xe63a;</i> : ''}</a>
              }
            </div>

          </div>

        </div>

      </div>
  	);
	}
}

export default Search;
