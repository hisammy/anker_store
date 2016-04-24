/**
 * Created by shady on 15/7/7.
 */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './About.scss';
// import Link from '../../utils/Link';
import PopupSignup from '../Authorize/PopupSignup';
import { autoLink } from '../../utils/Helper';

@withStyles(styles)
class About extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['about'];
    this.context.onSetTitle(compo.about_title);
    return (
      <div className="About">
        <PopupSignup i18n={i18n}/>
        <div className="banner">
          <img src={require('../../public/about/banner.jpg')} />
        </div>
        <div className="module-container">
          <div className="title">
            <h2>{compo.about_sub_title}</h2>
          </div>
          <div className="content" onClick={ autoLink }>
            {compo.about_contents && compo.about_contents.map((item, i) => {
              return (
                <div key={i}>
                  <h3>{item.title}</h3>
                  <div dangerouslySetInnerHTML={{__html: item.terms}} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-100"></div>
      </div>
      );
  }

}

export default About;
