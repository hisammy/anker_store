/**
 * Created by shady on 15/7/7.
 * Modified by leon
 */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Warranty.scss';
import ServiceNav from './ServiceNav';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class Warranty extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['support'];
    this.context.onSetTitle(compo.warranty_title);
    return (
      <div className="Warranty">
        <PopupSignup i18n={i18n}/>
        <ServiceNav {...{"support_nav": compo.support_nav}}/>
        <div className="module-container">
          <div className="title">
            <h2>{compo.warranty_sub_title}</h2>
            {/*<p>Learn about our hassle-free 18-month warranty.</p>*/}
          </div>
          <div className="content">
            {compo.warranty_contents && compo.warranty_contents.map((item, i) => {
              return (
                <dl key={i}>
                  <dt>{item.title}</dt>
                  <dd dangerouslySetInnerHTML={{__html: item.text}} />
                </dl>
              );
            })}

            <div className="title">
              <h2>{compo.warranty_faqs}</h2>
            </div>
            {compo.warranty_faqs_list && compo.warranty_faqs_list.map((item, i) => {
              return (
                <dl key={i}>
                  <dt>{item.title}</dt>
                  <dd dangerouslySetInnerHTML={{__html: item.text}} />
                </dl>
              );
            })}
          </div>
        </div>
        <div className="space-100"></div>
      </div>
    );
  }

}

export default Warranty;
