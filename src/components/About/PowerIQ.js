/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './PowerIQ.scss';
import Link from '../../utils/Link';
import Http from '../../core/HttpClient';
import Helper from '../../utils/Helper';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class PowerIQ extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };
  componentWillMount() {
    this.setState({
      active_video: 0,
      video_source: '',
      videos: [
        {
          title: 'Watch "The Hotel"',
          img: require('../../public/poweriq/video3.png'),
          src: '//www.youtube.com/embed/WkYL6bq8zik',
        },
        {
          title: 'Playing "The Carpool"',
          img: require('../../public/poweriq/video2.png'),
          src: '//www.youtube.com/embed/hLrtedVnpIM',
        },
        {
          title: 'Watch "The Coffee shop"',
          img: require('../../public/poweriq/video1.png'),
          src: '//www.youtube.com/embed/0GRbnJLJqXs',
        },
      ],
      products: [
        {
          title: 'Featured PowerIQ™ Chargers',
          list: [
            {
              name: 'Anker 40W 5-Port Family-Sized Desktop USB Charger with PowerIQ™ Technology',
              tag: 'hot',
              tag_text: '500,000 sold',
              variants: [
                {
                  asin: 'B00GTGETFG',
                  price: '25.99',
                  rating: 4.6,
                  color: '#000',
                  img: require('../../public/poweriq/prods/hot1b.jpg'),
                },
                {
                  asin: 'B00IBDOB5I',
                  price: '21.99',
                  rating: 4.6,
                  color: '#fff',
                  img: require('../../public/poweriq/prods/hot1a.jpg'),
                },
              ],
            },
            {
              name: 'Anker 24W Dual-Port USB Car Charger with PowerIQ™ Technology',
              tag: 'hot',
              tag_text: '200,000 sold',
              variants: [
                {
                  asin: 'B00D82O68Y',
                  price: '9.99',
                  rating: 4.4,
                  color: '#000',
                  img: require('../../public/poweriq/prods/hot2a.jpg'),
                },
                {
                  asin: 'B00B8M4IMK',
                  price: '11.99',
                  rating: 4.4,
                  color: '#fff',
                  img: require('../../public/poweriq/prods/hot2b.jpg'),
                },
              ]
            },
            {
              name: 'Anker 2nd Gen Astro3 12000mAh External Battery Charger with PowerIQ™ Technology',
              tag: '',
              variants: [
                {
                  asin: 'B00CEZBKTO',
                  price: '45.99',
                  rating: 4.6,
                  color: '#000',
                  img: require('../../public/poweriq/prods/hot3a.jpg'),
                },
                {
                  asin: 'B00HIZYCM2',
                  price: '45.99',
                  rating: 4.6,
                  color: '#fff',
                  img: require('../../public/poweriq/prods/hot3b.jpg'),
                },
              ]
            },
          ],
        },
        {
          title: 'Mobile Chargers with PowerIQ™',
          list: [
            {
              name: 'Anker 2nd Gen Astro E5 16000mAh External Battery with PowerIQ™ Technology',
              tag: 'new',
              variants: [
                {
                  asin: 'B00N2T7U90',
                  price: '41.99',
                  rating: 4.6,
                  color: '#000',
                  img: require('../../public/poweriq/prods/mobile1.jpg'),
                },
              ],
            },
            {
              name: 'Anker 2nd Gen Astro2 9000mAh External Battery Charger with PowerIQ™ Technology',
              variants: [
                {
                  asin: 'B00DMWV3EU',
                  price: '36.99',
                  rating: 4.6,
                  color: '#000',
                  img: require('../../public/poweriq/prods/mobile2a.jpg'),
                },
                {
                  asin: 'B00HD9PF6A',
                  price: '36.99',
                  rating: 4.6,
                  color: '#fff',
                  img: require('../../public/poweriq/prods/hot1a.jpg'),
                },
              ],
            },
            {
              name: 'Anker 2nd Gen Astro 6400mAh External Battery Pack with PowerIQ™ Technology',
              variants: [
                {
                  asin: 'B00EF1OGOG',
                  price: '25.99',
                  rating: 4.3,
                  color: '#000',
                  img: require('../../public/poweriq/prods/mobile3a.jpg'),
                },
                {
                  asin: 'B00HA5RXYY',
                  price: '25.99',
                  rating: 4.3,
                  color: '#fff',
                  img: require('../../public/poweriq/prods/mobile3b.jpg'),
                },
                {
                  asin: 'B00KL4PREO',
                  price: '25.99',
                  rating: 4.3,
                  color: '#8FEBFF',
                  img: require('../../public/poweriq/prods/mobile3c.jpg'),
                },
              ],
            },
            {
              name: 'Anker 2nd Gen Astro E4 13000mAh External Battery with PowerIQ™ Technology',
              tag: 'new',
              variants: [
                {
                  asin: 'B00BQ5KHJW',
                  price: '29.99',
                  rating: 4.6,
                  color: '#000',
                  img: require('../../public/poweriq/prods/mobile4.jpg'),
                },
              ],
            },
            {
              name: 'Anker 2nd Gen Astro E3 10000mAh External Battery with PowerIQ™ Technology',
              tag: 'best',
              variants: [
                {
                  asin: 'B009USAJCC',
                  price: '25.99',
                  rating: 4.6,
                  color: '#000',
                  img: require('../../public/poweriq/prods/mobile5a.jpg'),
                },
                {
                  asin: 'B00C63PL62',
                  price: '27.99',
                  rating: 4.6,
                  color: '#fff',
                  img: require('../../public/poweriq/prods/mobile5b.jpg'),
                },
              ],
            },
            {
              name: 'Anker Astro Mini 3200mAh External Battery with PowerIQ™ Technology',
              variants: [
                {
                  asin: 'B005X1Y7I2',
                  price: '19.99',
                  rating: 4.5,
                  color: '#000',
                  img: require('../../public/poweriq/prods/mobile6a.jpg'),
                },
                {
                  asin: 'B00EET7UHE',
                  price: '19.99',
                  rating: 4.5,
                  color: '#EFB9D0',
                  img: require('../../public/poweriq/prods/mobile6b.jpg'),
                },
                {
                  asin: 'B005NF5NTK',
                  price: '19.99',
                  rating: 4.5,
                  color: '#C2C2C4',
                  img: require('../../public/poweriq/prods/mobile6c.jpg'),
                },
                {
                  asin: 'B00M0OTTG0',
                  price: '19.99',
                  rating: 4.5,
                  color: '#F6EBC2',
                  img: require('../../public/poweriq/prods/mobile6d.jpg'),
                },
              ],
            },
            {
              name: 'Anker 2nd Gen Astro Pro2 20000mAh Quad-Port External Battery with PowerIQ™ Technology',
              variants: [
                {
                  asin: 'B005NGLTZQ',
                  price: '79.99',
                  rating: 4.6,
                  color: '#000',
                  img: require('../../public/poweriq/prods/mobile7.jpg'),
                },
              ],
            },
            {
              name: 'Anker 2nd Gen Astro Pro 15000mAh Triple-Port External Battery with PowerIQ™ Technology',
              variants: [
                {
                  asin: 'B005NGKR54',
                  price: '69.99',
                  rating: 4.6,
                  color: '#000',
                  img: require('../../public/poweriq/prods/mobile8.jpg'),
                },
              ],
            },
            {
              name: 'Anker 14W Portable Foldable Outdoor Solar Charger with PowerIQ™ Technology',
              variants: [
                {
                  asin: 'B00E3OL5U8',
                  price: '59.99',
                  rating: 4.6,
                  color: '#000',
                  img: require('../../public/poweriq/prods/mobile9.jpg'),
                },
              ],
            },
            {
              name: 'Anker 8W Portable Foldable Outdoor Solar Charger with PowerIQ™ Technology',
              variants: [
                {
                  asin: 'B00J3N7FRQ',
                  price: '45.99',
                  rating: 4.4,
                  color: '#000',
                  img: require('../../public/poweriq/prods/mobile10.jpg'),
                },
              ],
            },
          ],
        },
        {
          title: 'Wall Chargers with PowerIQ™',
          list: [
            {
              name: 'Anker 36W Quad-Port USB Wall Charger with PowerIQ™ Technology',
              variants: [
                {
                  asin: 'B00L40YJ8O',
                  price: '19.99',
                  rating: 4.6,
                  color: '#000',
                  img: require('../../public/poweriq/prods/wall1.jpg'),
                },
              ],
            },
            {
              name: 'Anker 25W 5-Port Family-Sized Desktop USB Charger with PowerIQ™ Technology',
              tag: 'best',
              variants: [
                {
                  asin: 'B00KBMRNQG',
                  price: '15.99',
                  rating: 4.7,
                  color: '#000',
                  img: require('../../public/poweriq/prods/wall2a.jpg'),
                },
                {
                  asin: 'B00DVH62J2',
                  price: '15.99',
                  rating: 4.7,
                  color: '#fff',
                  img: require('../../public/poweriq/prods/wall2b.jpg'),
                },
              ],
            },
          ],
        },
      ],
    });
  }
  componentDidMount() {
  }

  changeVideo(index, event) {
    this.state.active_video = index;
    this.setState(this.state);
    this.playVideo(index);
  }
  playVideo(index, event) {
    const v = this.state.videos[index];
    this.state.video_source = v.src + '?autoplay=1&rel=0';
    this.setState(this.state);
  }
  // prods
  formatLink(asin) {
    // console.log(asin);
    return `http://www.amazon.com/dp/${asin}/?_encoding=UTF8&camp=1789&creative=9325&linkCode=ur2&tag=ianker_piq-20&linkId=${asin}`;
  }
  changeVariant(item, i, evnet) {
    item.active_index = i;
    this.setState(this.state);
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['poweriq'];
    this.context.onSetTitle(compo.poweriq_title);
    return (
      <div className="PowerIQ">
        <PopupSignup i18n={i18n}/>
        <div className="module-container">
          <div className="title">
            <h1>{compo.poweriq_sub_title}</h1>
          </div>
        </div>
        <div className="content">
          <div className="module-container intro">
            <div className="cell text">
              <div className="logo">
                <img src={require('../../public/poweriq/logo.png')} />
                <p dangerouslySetInnerHTML={{__html: compo.poweriq_sub_desc}}/>
              </div>
              <div className="txt">
                {compo.poweriq_desc_list && compo.poweriq_desc_list.map((item, i) => {
                  return (
                    <div key={i}>
                      <h5>{item.title}</h5>
                      <div className="info" dangerouslySetInnerHTML={{__html: item.text}} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="cell video">
              <div className={'cover ' + (this.state.video_source ? 'playing' : '')}>
                <iframe width="100%" src={this.state.video_source} frameBorder="0"></iframe>
                <img src={this.state.videos[this.state.active_video].img} />
                <i className="play" onClick={this.playVideo.bind(this, 0)}></i>
                <i className="mask"></i>
              </div>
              <ul className="ctrl">
                {this.state.videos.map((item, i) => {
                  return(
                    <li key={i} className={this.state.active_video == i ? 'active' : ''} onClick={this.changeVideo.bind(this, i)}>
                      <img src={item.img} />
                      <b>{item.title}</b>
                      <i className="play"></i>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="devices">
          <h4>{compo.poweriq_devices_title}</h4>
          <div className="content">
            <div className="module-container">
              {/*TODO: 这里手机下, 根本看不到字, 后期改成: 单独把icon切出来 + 文字方式*/}
              <p>
                <img src={require('../../public/poweriq/intro.png')} />
              </p>
            </div>
          </div>
        </div>

        <div className="products">
          <div className="content">
            <div className="module-container">
              {this.state.products.map((cate, index) => {
                return(
                  <div key={index}>
                    <h4>{cate.title}</h4>
                    <ul className="clearfix">
                      {cate.list.map((item, i) => {
                        item.active_index = item.active_index || 0;
                        const active = item.variants[item.active_index];
                        return(
                        <li key={i}>
                          <p className="img">
                            <img src={active.img}/>
                          </p>
                          <div className="name">
                            {item.name}
                          </div>
                          <div className="rating">
                            {compo.poweriq_review_rating}
                            {Helper.displayStars(active.rating)}
                          </div>
                          <p className="color">
                            {item.variants.map((v, k) => {
                              return(
                                <i key={k} style={{background: v.color}} onClick={this.changeVariant.bind(this, item, k)} className={item.active_index == k ? 'active' : ''}></i>
                              );
                            })}
                          </p>
                          <p className="price">${active.price}</p>
                          <p className="btns">
                            <a target="_blank" className="btn" href={this.formatLink(active.asin)}>{compo.poweriq_by_at_amazon}</a>
                          </p>
                          <i className={'tag ' + (item.tag || '')}>
                            <span>{item.tag_text}</span>
                          </i>
                          <i className="poweriq"></i>
                        </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-100"></div>
        </div>

      </div>
    );
  }

}

export default PowerIQ;
