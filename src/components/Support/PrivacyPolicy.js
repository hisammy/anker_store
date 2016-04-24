/**
 * Created by shady on 15/7/7.
 * Modified by leon
 */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './PrivacyPolicy.scss';
import ServiceNav from './ServiceNav';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class PrivacyPolicy extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['support'];
    this.context.onSetTitle(compo.privacy_title);
    return (
      <div className="PrivacyPolicy">
        <PopupSignup i18n={i18n}/>
        <ServiceNav {...{"support_nav": compo.support_nav}}/>
        <div className="module-container">
          <div className="title">
            <h2>{compo.privacy_sub_title}</h2>
            {/*<p>Learn about how we value your privacy.</p>*/}
          </div>
          <div className="content">
            {compo.privacy_contents && compo.privacy_contents.map((item, i) => {
              return (
                <dl key={i}>
                  <dt>{item.title}</dt>
                  <dd dangerouslySetInnerHTML={{__html: item.text}} />
                </dl>
              );
            })}
            <div className="contact">
              <h3>{compo.support_contact_us}</h3>
              <p dangerouslySetInnerHTML={{__html: compo.support_contact_us_desc}} />
            </div>
          </div>
        </div>
        <div className="space-100"></div>
      </div>
    );
  }
}

export default PrivacyPolicy;
