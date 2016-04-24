/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import Verify from '../../utils/Verify';
import styles from './Press.scss';
import Location from '../../core/Location';
import Http from '../../core/HttpClient';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class PressCenter extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      'current_page': this.props.data.current_page,
      'pages': this.props.data.pages,
      'per_page': 20,
      'presses': this.props.data.presses,
      'loadMore': false
    }
  }

  pressDetail(id) {
    Location.push('/press/' + id);
  }

  loadMore = async () => {
    this.setState({
      'loadMore': true
    });
    const body = {
      'per_page': this.state.per_page,
      'page': this.state.current_page + 1
    };
    const json = await Http.post(`get`, `/api/content?path=/api/press_centers/`, body, null, true);
    this.setState({
      'current_page': json.current_page,
      'pages': json.pages,
      'presses': this.state.presses.concat(json.presses),
      'loadMore': false
    });
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['press'];
    this.context.onSetTitle(compo.press_title);
    return (
      <div className="PressCenter">
        <PopupSignup i18n={i18n}/>
        <div className="module-container">
          <div className="title">{compo.press_sub_title}</div>
          <div className="content">
          {this.state.presses ?
              this.state.presses.length ?
                <ul className="press">
                  {this.state.presses.map((item, i) => {
                    return (
                      <li key={i} onClick={this.pressDetail.bind(this, item.id)}>
                        <div className="press-title">{item.title}</div>
                        <div className="press-info">
                          <span className="press-author">
                            {i18n.format(compo.press_author, item.author)}
                          </span>
                          <span className="press-date">
                            {i18n.format(compo.press_date_time, Verify.dateFormat(item.pub_time, 'MM/dd/yyyy hh:mm'))}
                          </span>
                        </div>
                        <div className="press-content">{item.description}</div>
                      </li>
                    )
                  })}
                </ul>
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
          </div>

          <div className="module-more">
            {!this.state.current_page || this.state.current_page >= this.state.pages ? '' :
              <a className="load-btn" onClick={this.LoadMore.bind(this, false)}>{common.load_more} {this.state.loadMore ? <i className="iconfont load-icon">&#xe63a;</i> : ''}</a>
            }
          </div>
        </div>
      </div>
    );
  }

}

export default PressCenter;
