/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Header.scss';
import Link from '../../utils/Link';
import AppActions from '../../core/AppActions';
import Cookie from '../../utils/Cookie';
import Location from '../../core/Location';

@withStyles(styles)
class Header extends Component {

  static propTypes = {
    data: PropTypes.object
  };

  componentWillMount() {
    this.state = {
      'nav': 0,
      'navShow': 0,
      'cartCount': global.server ? (this.props.cookie && this.props.cookie.cart_count ? this.props.cookie.cart_count : 0) : Cookie.load('cart_count') ? Cookie.load('cart_count') : 0,
      'nick_name':'',
      'is_power_user':false,
      'token':'',
      'close': 'close',
      'headerTips':'',
      'searchKey':''
    };
  }

  componentDidMount() {
    this.state.cartCount = Cookie.load('cart_count') ? Cookie.load('cart_count') : 0,
    this.state.nick_name = AppActions.getUser().nick_name;
    this.state.is_power_user = AppActions.getUser().is_power_user;
    this.state.token = AppActions.getUser().token;
    this.state.headerTips = localStorage.getItem('headerTips');
    if(this.state.token) {
      this.state.close = "close";
    }
    this.setState(this.state);
  }

  componentWillReceiveProps(nextProps) {
    this.state.cartCount = Cookie.load('cart_count') ? Cookie.load('cart_count') : 0,
    this.state.navShow = 0;
    this.state.is_power_user = AppActions.getUser().is_power_user;
    this.state.nick_name = nextProps.nick_name;
    this.state.token = AppActions.getUser().token;
    this.state.headerTips = localStorage.getItem('headerTips');
    if(this.state.token){
      this.state.close = "close";
    }
    this.setState(this.state);
  }

  slideNav() {
    this.setState({
      'navShow': this.state.navShow ? 0 : 1
    });
  }

  logout() {
    AppActions.signOut();
    Location.push( '/login/');
    // ga('send', 'event', 'Regsiter', 'Click', 'PW');
  }
  getSearchKey(event){
    var key = event.target.value;
    this.state.searchKey = key;
    this.setState(this.state);
  }
  search(type,event){
    if(typeof(type) === "string"){
      if(event.keyCode === 13){
        !this.state.searchKey ? Location.push( '/search') :Location.push( '/search?keyword=' + encodeURIComponent(this.state.searchKey));
      }
    }else{
      !this.state.searchKey ? Location.push( '/search') :Location.push( '/search?keyword=' + encodeURIComponent(this.state.searchKey));
    }
    
  }
  closeTips() {
    this.state.close = "close";
    this.setState(this.state);
    // ga('send', 'event', 'Regsiter', 'Close', 'PW');
  }
  render() {
    // console.log(this.props);
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    // const compo = i18n['header'];
    i18n.format = i18n.format || ()=>{};
    const cookie = global.server ?
      this.props.cookie ? this.props.cookie.country : ''
      : Cookie.load('country');
    return (
      <div className={"Header clearfix " + this.state.close }>
        <div className="Header-fixed">
        <div className="registerTips">
          {/*<div>
            <span onClick={this.goLogin.bind(this)}>Enjoy $5 OFF your first anker.com purchase!</span>
            <i className="iconfont" onClick={this.closeTips.bind(this)}>&#xe642;</i>
          </div>*/}
        </div>
          <div className="navigator">
            <div className={"module-container " + (this.state.navShow ? 'show' : '')}>
              <a href="/" className="logo" onClick={Link.handleClick}>
                <img src={require('../../public/logo.png')} alt="Anker" />
              </a>
              <a className="menu" onClick={this.slideNav.bind(this)}><i className="iconfont">&#xe61c;</i></a>
              <ul className="list">
                <li className={['/','/index'].indexOf(this.props.path) > -1 ? "cur" : ''}>
                  <a href="/" onClick={Link.handleClick}>{common.hd_home}</a>
                  <i className="iconfont">&#xe613;</i>
                  </li>
                <li className={['/products'].indexOf(this.props.path) > -1 ? "cur" : ''}>
                  <a href="/products" onClick={Link.handleClick}>{common.hd_products}</a>
                  <i className="iconfont">&#xe613;</i>
                </li>
                <li className={"search " + (['/search'].indexOf(this.props.path) > -1 ? "cur" : '')}>
                  <a href="/search" onClick={Link.handleClick}>{common.hd_search}</a>
                  <i className="iconfont">&#xe613;</i>
                </li>
                <li className={['/poweruser'].indexOf(this.props.path) > -1 ? "cur" : ''}>
                  <a href="/poweruser" onClick={Link.handleClick}>{common.hd_pu}</a>
                  <i className="iconfont">&#xe613;</i>
                </li>
                <li className={this.props.path.indexOf('/support') > -1 ? "cur" : ''}>
                  <a href="/support" onClick={Link.handleClick}>{common.hd_support}</a>
                  <i className="iconfont">&#xe613;</i>
                </li>
                <li className={"member" + (this.state.nav === 4 ? "cur" : '')}>
                  {this.state.token ?
                    <a href="/profile" onClick={Link.handleClick}>
                      {i18n.format(common.hd_my_account, this.state.nick_name)}
                    </a>
                    :
                    <a href="/login" onClick={Link.handleClick}>{common.hd_account}</a>
                  }
                  <i className="iconfont">&#xe613;</i>
                </li>
                {this.state.token ?
                  <li className="member">
                    <a onClick={this.logout.bind(this)}>{common.hd_logout}</a>
                    <i className="iconfont">&#xe613;</i>
                  </li>
                  : ''
                }
              </ul>
              <div className="mask" onClick={this.slideNav.bind(this)}></div>

              <div className="tools">
                <div className="tool search searchInput">
                  <input type="search" onKeyUp={this.search.bind(this,'enter')} onChange={this.getSearchKey.bind(this)} />
                   <i className="iconfont" onClick={this.search.bind(this)}>&#xe664;</i>
                </div>
                {this.state.token ?
                  <div className="users">
                      <a title="Profile" className="tool account" id="heard_nickName" href="/profile" onClick={Link.handleClick}>
                        {this.state.nick_name}
                      </a>
                      {
                        this.state.is_power_user ? <img title={common.hd_pu} className="poweruser" src={require('../../public/POWERUSERS-01.png')} /> : ''
                      }

                      <a title="Logout" className="tool logout" onClick={this.logout.bind(this)}>
                        <i className="iconfont">&#xe672;</i>
                      </a>
                  </div> :
                  <a title="Profile" className="tool member" href="/login" onClick={Link.handleClick}>
                    <i className="iconfont">&#xe607;</i>
                  </a>
                }
                <a href="/search" title="Search" className="tool search searchBtn" onClick={Link.handleClick}>
                  <i className="iconfont">&#xe664;</i>
                </a>
                {cookie === 'US' ?
                  <a className='tool cart' href="/cart" onClick={Link.handleClick}>
                    <i className="iconfont">&#xe65b;</i>
                    <i className={"cartCount " + (this.state.cartCount == 0 ? 'hide' : '')} id="cartCount">{this.state.cartCount}</i>
                  </a> : ''
                }
              </div>
            </div>
          </div>


        </div>

      </div>
    )
  }

}


export default Header;
