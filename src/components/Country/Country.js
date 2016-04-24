/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { Component, PropTypes } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Country.scss';
import Link from '../../utils/Link';
import Cookie from '../../utils/Cookie';
import AppActions from '../../core/AppActions';
import { config } from '../../../build/config';

@withStyles(styles)
class Country extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    let country = global.server ? this.props.cookie.country ? this.props.cookie.country : 'us' : Cookie.load('country') ? Cookie.load('country') : 'us';
    this.state = {
      'country_list': config.country_list,
      'country': country
    }
  };

  setCountry(country, event) {
    AppActions.setCountry(country);
    Link.handleClick(event);
  };

  render() {
    const i18n = this.props.i18n;
    const compo = i18n['country'];
    this.context.onSetTitle(compo.country_title);
    return (
      <div className="Country">
        <div className="Country-wraper">
          <div className="form">
            <div className="logo">
              <img src={require('../../public/logo.png')} alt="Anker" />
            </div>
            <div className="title">{compo.choose_country}</div>
            <ul className="list clearfix">
              {this.state.country_list.map((item, i) => {
                return (
                  <li key={i} className={this.state.country === item.code ? 'cur' :  ''}>
                    <a href={item.link ? item.link : '/'} onClick={this.state.country_list[i].link ? '' : this.setCountry.bind(this, item.code)}>
                      <img src={require("../../public/country/country_" + item.code.toLowerCase() + ".png")}/>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  }

}

export default Country;
