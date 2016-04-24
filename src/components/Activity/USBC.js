/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './USBC.scss';
import Link from '../../utils/Link';
import Http from '../../core/HttpClient';

@withStyles(styles)
class USBC extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };
  componentWillMount() {
    let products = [
      {
        title: '<b>PowerLine</b> USB-C Series',
        desc: 'Multi-purpose cables for charging, data, display and more',
        type: 'cable',
        list: [
          {
            sku: 'A7132011',
            img: require('../../public/usbc/prods/cable/A7132011.png'),
            price: '9.99',//
            name: 'USB-C to USB 2.0 Cable',
          },
          {
            sku: 'A7131011',
            img: require('../../public/usbc/prods/cable/A7131011.png'),
            price: '12.99',
            name: 'USB-C to USB 3.0 Cable',
          },
          {
            sku: 'A8180011',
            img: require('../../public/usbc/prods/cable/A8180011.png'),
            price: '9.99',
            name: 'USB-C to USB-C Cable',
          },
          // {
          //   sku: '',
          //   img: require('../../public/usbc/prods/cable/USB-C_to_ligtning.png'),
          //   price: '',
          //   name: 'USB-C to Lightning Cable'
          // },
          {
            sku: 'A8160011',
            img: require('../../public/usbc/prods/cable/A8160011.png'),
            price: '9.99',
            name: 'USB-C to <i class="word">Micro USB</i> Cable',
          },
          {
            sku: 'A8162011',
            img: require('../../public/usbc/prods/cable/A8162011.png'),
            price: '9.99',
            name: 'USB-C to USB 2.0 (3ft / 0.9m)',
          },
          {
            sku: 'A8163011',
            img: require('../../public/usbc/prods/cable/A8163011.png'),
            price: '10.99',
            name: 'USB-C to USB 3.0 (3ft / 0.9m)',
          },
          {
            sku: 'A8181011',
            img: require('../../public/usbc/prods/cable/A8181011.png'),
            price: '10.99',
            name: 'USB-C to USB-C 2.0 (3ft / 0.9m)',
          },
          {
            sku: 'B8174011',
            img: require('../../public/usbc/prods/cable/B8174.png'),
            price: '7.99',
            name: 'USB-C to <i class="word">Micro USB</i> Female Adapter [2-pack]',
          },
          {
            sku: 'A8161011',
            img: require('../../public/usbc/prods/cable/A8161011.png'),
            price: '12.99',
            name: 'USB-C to USB 3.0 Adapter',
          },
          // {
          // sku: '',
          //   img: require('../../public/usbc/prods/cable/USB-C_to_Micro_USB_Adapter.png'),
          //   price: '',
          //   name: '<b>PowerLine</b> USB-C to Micro USB Adapter'
          // },
        ],
      },
      {
        title: '<b>USB-C Hubs &amp; Adapters</b>',
        desc: 'Turn one port into many',
        type: 'hub',
        list: [
          {
            sku: 'A8342041',
            img: require('../../public/usbc/prods/hub/A8342_1.png'),
            price: '59.99',
            name: '<b>USB-C to 2-Port USB 3.0 and 1-Port USB-C Hub with HDMI Port</b>',
            // link: 'http://www.amazon.com/dp/B018XF4KRC'
          },
          {
            sku: '',
            img: require('../../public/usbc/prods/hub/A8301_1.png'),
            price: '',
            name: '<b>USB-C to 3-Port USB 3.0 and 1-Port USB-C Hub</b>'
          },
          {
            sku: '',
            img: require('../../public/usbc/prods/hub/A8302_1.png'),
            price: '',
            name: '<b>USB-C to 2-Port USB 3.0 and 1-Port USB-C Hub <i class="word">with Ethernet Adapter</i></b>'
          },
          {
            sku: '',
            img: require('../../public/usbc/prods/hub/A8361.png'),
            price: '',
            name: '<b>USB-C Docking Station</b>'
          },
          {
            sku: 'A8305041',
            img: require('../../public/usbc/prods/hub/4-port_USB_3.0.png'),
            price: '17.99',
            name: '<b>USB-C to 4-Port USB 3.0 Hub</b>',
          },
          {
            sku: 'A8303041',
            img: require('../../public/usbc/prods/hub/3-port_USB_3.0_and_Ethernet.png'),
            price: '27.99',
            name: '<b>USB-C to 3-Port USB 3.0 Hub <i class="word">with Ethernet Adapter</i></b>',
          },
          {
            sku: 'A8341041',
            img: require('../../public/usbc/prods/hub/USB-C_to_Ethernet_adapter.jpg'),
            price: '22.99 ',
            name: '<b>USB-C to Ethernet Adapter</b>',
          },
        ],
      },
      {
        title: '<b>PowerCore</b> USB-C Series',
        desc: 'Fast charging, high capacity <i class="word">portable chargers</i> for USB-C devices',
        type: 'battery',
        list: [
          // {
          // sku: '',
          //  img: require('../../public/usbc/prods/battery/10050.jpg'),
          //  price: '',
          //  name: '<b>PowerCore+</b> 10050 USB-C'
          // },
          {
            sku: 'A1371011',
            img: require('../../public/usbc/prods/battery/A1371011_TD_01.png'),
            price: '59.99',
            name: '<b>PowerCore+</b> 20100 USB-C',
          },
          // {
          // sku: '',
          //  img: require('../../public/usbc/prods/battery/26800.jpg'),
          //  price: '',
          //  name: '<b>PowerCore+</b> 26800 USB-C'
          // }
        ],
      },
      {
        title: '<b>PowerPort</b> USB-C Series',
        desc: 'High speed USB chargers <i class="word">for USB-C devices</i>',
        type: 'charger',
        list: [
          // {
          //  img: require('../../public/usbc/prods/charger/40W.png'),
          //  price: '',
          //  name: '<b>PowerPort+</b> 1 USB-C <i class="word">and 3 USB<i>'
          // },
          {
            sku: 'A2052111',
            img: require('../../public/usbc/prods/charger/A2052.png'),
            price: '',
            name: '<b>PowerPort</b> 5 USB-C'
          },
          {
            sku: '',
            img: require('../../public/usbc/prods/charger/A2053-01.png'),
            price: '',
            name: '<b>PowerPort+</b> 5 USB-C <br>with USB Power Delivery'
          },
        ],
      },
    ];
    this.getPrice(products);
    this.setState({
      hash_type: 'cable', // default focus
      products: products,
      caches: {},
    });
  }
  componentDidMount() {
    this.hashChange();
    window.addEventListener('hashchange', (e) => this.hashChange(e));
  }

  componentDidUpdate() {
    // const self = this;
    // const hashID = self.state.hashID;
    const type = location.hash ? location.hash.slice(1) : null;
    const target = document.getElementById(type);
    setTimeout(function () {
      // console.log('DidUpdate', hashID, type, target);
      target && target.scrollIntoView();
      // self.state.hashID = type;
      // self.setState({hashID: type});
    }, 5);
  }

  getPrice = async (products) => {
    var skus = [];
    products.map((t) => {
      skus = skus.concat(t.list.map((o) => o.sku ? `amazon:${o.sku}` : '')); // amazon:A3102
    });
    // console.log(skus);
    const json = await Http.post(`get`, `/api/content?path=/api/variants/market_prices`, {market_skus: skus}, null, true);
    // console.log(json);
    var caches = {};
    if (Array.isArray(json)) {
      json.map((item, i) => {
        caches[item.sku] = item || {};
      });
    }
    this.setState({caches: caches});
  }

  hashChange(event) {
    // event.preventDefault();
    const type = location.hash ? location.hash.slice(1) : null;
    // console.log('hashChange', type);
    const match = -1 !== ['cable', 'hub', 'battery', 'charger'].indexOf(type);
    if (!type || !match) return;
    this.state.hash_type = type;
    this.setState(this.state);
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['usb-c'] || {};
    this.context.onSetTitle(compo.usbc_title);
    return (
      <div className="USBC">
        {/*<header className="header">
          <a href="/" onClick={Link.handleClick}>Go to Anker.com</a>
        </header>*/}
        <section className="banner">
          <img className="img" src={require('../../public/usbc/banner.jpg')}/>
          <h2>{compo.usbc_main_title}</h2>
          <h3>{compo.usbc_sub_title}</h3>
          <p className="anchors">
            <a href="#usbc">{compo.usbc_what_is_usbc}</a>
            <br/>
            <a href="#upd">{compo.usbc_what_is_usb_power_delivery}</a>
          </p>
        </section>
        <nav className="nav">
          <div className="wrap">
            {this.state.products.map((cate, index) => {
              return (
                <a className={cate.type +' '+ (cate.type == this.state.hash_type ? 'active' : '')} href={'#' + cate.type} key={index}>
                  <i className="icon"></i>
                  <h5 dangerouslySetInnerHTML={{__html: cate.title}} />
                  <p dangerouslySetInnerHTML={{__html:cate.desc}} />
                </a>
              );
            })}
          </div>
        </nav>

        <div className="products">
          <div className="wrap">
          {this.state.products.map((cate, index) => {
            if (cate.type !== this.state.hash_type) {
              return;
            }
            return(
              <div id={cate.type} key={index}>
                {/*<h4 dangerouslySetInnerHTML={{__html: cate.title}} />*/}
                <ul className="clearfix">
                  {cate.list.map((item, i) => {
                    const inAmazonStore = item.link && -1 !== item.link.indexOf('amazon');
                    const inAnkerStore = item.sku && !inAmazonStore;
                    const cache = this.state.caches[item.sku];
                    item.price = cache && cache.price || item.price;
                    item.link = item.link || item.sku && `/products/${item.sku}` || 'javascript:;';
                    let btn = compo.usbc_pre_order;
                    if (inAnkerStore) {
                      btn = compo.usbc_buy_now;
                    } else if (inAmazonStore) {
                      btn = compo.usbc_buy_at_amazon;
                    }
                    return(
                    <li key={i}>
                      <div className="img">
                        <img src={item.img}/>
                        <p className="btns">
                          <a className={'btn ' + (inAmazonStore && 'amazon' || '')} href={item.link} onClick={inAnkerStore && Link.handleClick.bind(this)} target="_blank">
                            {btn}
                          </a>
                        </p>
                      </div>
                      <div className="name" dangerouslySetInnerHTML={{__html: item.name}} />
                      <p className="price">{item.price ? '$' + item.price : ''}</p>
                    </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          </div>
        </div>

        <section className="more">
          <h4 id="usbc">{compo.usbc_what_is_usbc}</h4>
          <div className="wrap">
            <div className="desc" dangerouslySetInnerHTML={{__html: compo.usbc_usbc_desc}}/>
            <p className="tc">
              <img src={require('../../public/usbc/usbc.png')} />
            </p>
            <ul className="features">
            <li>
            <img src={require('../../public/usbc/icon1.png')} />
            <div>
            <h6>{compo.usbc_usbc_list[0].title}</h6>
            <p dangerouslySetInnerHTML={{__html: compo.usbc_usbc_list[0].text}}/>
            </div>
            </li>
            <li>
            <img src={require('../../public/usbc/icon3.png')} />
            <div>
            <h6>{compo.usbc_usbc_list[1].title}</h6>
            <p dangerouslySetInnerHTML={{__html: compo.usbc_usbc_list[1].text}}/>
            </div>
            </li>
            <li>
            <img src={require('../../public/usbc/icon2.png')} />
            <div>
            <h6>{compo.usbc_usbc_list[2].title}</h6>
            <p dangerouslySetInnerHTML={{__html: compo.usbc_usbc_list[2].text}}/>
            </div>
            </li>
            </ul>
          </div>

          <h4 id="upd">{compo.usbc_what_is_usb_power_delivery}</h4>
          <div className="wrap">
            <div className="desc" dangerouslySetInnerHTML={{__html: compo.usbc_usb_power_delivery_desc}}/>
            <ul className="features">
              <li>
                <img src={require('../../public/usbc/icon4.png')} />
                <div>
                <h6>{compo.usbc_usb_power_delivery_list[0].title}</h6>
                <p dangerouslySetInnerHTML={{__html: compo.usbc_usb_power_delivery_list[0].text}}/>
                </div>
              </li>
              <li>
                <img src={require('../../public/usbc/icon5.png')} />
                <div>
                <h6>{compo.usbc_usb_power_delivery_list[1].title}</h6>
                <p dangerouslySetInnerHTML={{__html: compo.usbc_usb_power_delivery_list[1].text}}/>
                </div>
              </li>
              <li>
                <img src={require('../../public/usbc/icon6.png')} />
                <div>
                <h6>{compo.usbc_usb_power_delivery_list[2].title}</h6>
                <p dangerouslySetInnerHTML={{__html: compo.usbc_usb_power_delivery_list[2].text}}/>
                </div>
              </li>
            </ul>
          </div>

          <div className="devices">
            <h4 className="title tac">{compo.usbc_what_devices_support_usbc}</h4>
            <div className="wrap">
              <p className="tac">{compo.usbc_what_devices_support_usbc_desc}</p>
              <ul className="clearfix">
                <li>
                  <img src={require('../../public/usbc/device/mbp.png')} />
                  {compo.usbc_what_devices_support_usbc_macbook}
                </li>
                <li>
                  <img src={require('../../public/usbc/device/chromebook.png')} />
                  {compo.usbc_what_devices_support_usbc_chromebook}
                </li>
                <li>
                  <img src={require('../../public/usbc/device/tablet.png')} />
                  {compo.usbc_what_devices_support_usbc_nokia_n1}
                </li>
                <li>
                  <img src={require('../../public/usbc/device/mobile.png')} />
                  {compo.usbc_what_devices_support_usbc_oneplus2}
                </li>
                <li>
                  <img src={require('../../public/usbc/device/mobile.png')} />
                  {compo.usbc_what_devices_support_usbc_nexus_5x}
                </li>
                <li>
                  <img src={require('../../public/usbc/device/mobile.png')} />
                  {compo.usbc_what_devices_support_usbc_nexus_6p}
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    );
  }

}

export default USBC;
