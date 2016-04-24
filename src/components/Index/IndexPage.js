/**
 * Created by shady on 15/7/3.
 */

import React, { PropTypes, Component } from 'react';
import styles from './Index.scss';
import withStyles from '../../decorators/withStyles';
import ReactSwipe from '../../utils/react-swipe';
import AppActions from '../../core/AppActions';
import Link from '../../utils/Link';
import Http from '../../core/HttpClient';
import { md5 } from '../../utils/Helper';
import Track from '../../utils/Track';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class Index extends Component {

  static propTypes = {
    cur: PropTypes.number,
    data: PropTypes.object
  };

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      'cur': 0,
      'data': this.props.data
    };
  };

  componentDidMount() {
    this.getHots();
    this.fireTracking();
  };
  fireTracking() {
    const user = AppActions.getUser();
    const hashedMail = user.invitation_code || md5(user.email);
    Track.criteoOneTag(hashedMail, {event: 'viewHome'});
  }

  getHots = async() => {
    const json = await Http.post('get', '/api/content?path=/api/products/search?label=Hot&per_page=4', null, null, true);
    const hots = json.products || [];
    this.setState({
      'hots': hots
    });
    // console.log(hots);
    Track.ecAddImpression(hots, 'Home');
  };

  swipeSlide(i) {
    if(i === 'next') {
      this.refs.Carousel.swipe.next();
    } else if(i === 'prev') {
      this.refs.Carousel.swipe.prev();
    } else {
      this.refs.Carousel.swipe.slide(i);
    }
  };

  swipeCallback(i) {
    this.setState({
      cur: i
    });
  };

  activityClick(url, i, type, e) {
    if (!url) {
      Link.handleClick(e);
    }
  }
  prodClick(i, event) {
    Link.handleClick(event);
    Track.ecProdClick(this.state.hots[i], 'Home');
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['index'];
    this.context.onSetTitle(compo.index_title);
    return (
      <div className="Index">
        <PopupSignup i18n={i18n}/>
        {this.state.data.master_activities && this.state.data.master_activities.length ?
          <div className="Carousel">
            <ReactSwipe className="Carousel-img" ref="Carousel" auto={3000} disableScroll={false} callback={this.swipeCallback.bind(this)}>
              {this.state.data.master_activities.map((item, i) =>  {
                let href = item.url ? item.url : item.products.length === 1 ? '/products/' : '/activity/' + (item.group_code || item.id);
                return (
                  <a key={i} className="Carousel-item" href={href} onClick={this.activityClick.bind(this, item.url, i, 'master')}
                     target={item.url ? '_blank' : ''} style={{backgroundImage: 'url(' + item.image.large_url + ')'}} >
                  </a>
                );
              })}
            </ReactSwipe>
            <div className="Carousel-point">
              <ol>
                {this.state.data.master_activities.map((item, i) =>  {
                  return (
                    <li key={i} className={i === this.state.cur ? 'cur' : ''} onClick={this.swipeSlide.bind(this, i)}>
                      <a>{i}</a>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="Carousel-ctrl">
              <a href="javascript:void(0)" className="prev" onClick={this.swipeSlide.bind(this, 'prev')}><i className="iconfont">&#xe608;</i></a>
              <a href="javascript:void(0)" className="next" onClick={this.swipeSlide.bind(this, 'next')}><i className="iconfont">&#xe613;</i></a>
            </div>
          </div> : ''
        }
        {this.state.data.sub_activities && this.state.data.sub_activities.length ?
          <div className="sub-activity">
            <div className="module-container">
              <div className="items clearfix">
                {this.state.data.sub_activities.map((item, i) => {
                  let href = item.url ? item.url : item.products.length === 1 ? '/products/' : '/activity/' + (item.group_code || item.id);
                  return (
                    <a href={href} key={i} className="item" onClick={this.activityClick.bind(this, item.url, i, 'sub')} target={item.url ? '_blank' : ''} >
                      {(i % 4 === 0 || i % 4 === 1) ?
                        <div className="image">
                          {!item.image ? '' :
                          <img src={item.image.mini_url} />
                          }
                        </div>
                      : ''}
                      <div className="text">
                        <p className="title">{item.title}</p>
                        <p className="description">{item.detail}</p>
                        <span className="more">{compo.read_more}</span>
                      </div>
                      {(i % 4 === 2 || i % 4 === 3) ?
                        <div className="image">
                          <img src={item.image.large_url} />
                        </div>
                      : ''}
                    </a>
                  )
                })}
              </div>
            </div>
          </div> : ''
        }
        <div className="module best-sellers">
          {this.state.hots ?
            <div className="module-container">
              <div className="module-title">{compo.best_sellers}</div>
              <div className="module-description">{compo.best_sellers_desc}</div>
              <div className="module-items clearfix">
                {this.state.hots.length ?
                  <div className="module-wraper">
                    {this.state.hots.map((item, i) => {
                      return (
                        <a key={i} className="item" href={'/products/' + (item.variants.length ? item.variants[0].sku : '')} onClick={this.prodClick.bind(this, i)}>
                          <span className="border"></span>
                          <div className="image">
                            <span className="tag-amazon"></span>
                            <span className="tag-sellout"></span>
                            <img src={item.variants && item.variants.length && item.variants[0].image ? item.variants[0].image.mini_url : ''} />
                          </div>
                          {item.variants && item.variants.length ?
                            <div className="attr">
                              <ul className="color">
                                {item.variants.map((item, i) => {
                                  return (
                                    <li key={i}><img src={item.option_values && item.option_values.length ? item.option_values[0].image.mini_url : ''} /></li>
                                  )
                                })}
                              </ul>
                            </div>
                            : ''
                          }
                          <div className="title">{item.name}</div>
                          <div className="description" dangerouslySetInnerHTML={{__html: (item.description ? item.description.replace(/\r\n/g, '<br>') : '')}} />
                        </a>
                      )
                    })}
                  </div>
                  : ''}
              </div>
              {this.state.hots.length < 4 ? '' :
                <div className="module-more">
                  <a href="/search?label=Hot" className="load-btn" onCLick={Link.handleClick}>{common.load_more}</a>
                </div>
              }
            </div>
          : ''}
        </div>

        <div className="space-100"></div>

      </div>
    );
  }
}

export default Index;
