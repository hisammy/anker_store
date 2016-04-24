/**
 * Created by shady on 15/7/7.
 */

import React, { PropTypes } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Faq.scss';
import ServiceNav from './ServiceNav';
import InConstruction from '../InConstruction';

@withStyles(styles)
class Faq {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['support'];
    this.context.onSetTitle(compo.faqs_title);
    return (
      <div className="Faq">
        <ServiceNav {...{"support_nav": compo.support_nav}}/>
        <div className="module-container">
          <div className="title">
            <h2>FAQs</h2>
          </div>
          <InConstruction {...this.state} />
          {/*<div className="content">
            <p className="q"> Can you charge th battery and a phone simultaneously by connecting them in series?</p>
            <p className="a"> A:No,Our Astro 2nd Gen batteries cannot be charged and disCharged at the same time
              protection of the bat-tery.</p>
            <p className="q"> Can you charge th battery and a phone simultaneously by connecting them in series?</p>
            <p className="a"> A:No,Our Astro 2nd Gen batteries cannot be charged and disCharged at the same time
              protection of the bat-tery.</p>
            <p className="q"> Can you charge th battery and a phone simultaneously by connecting them in series?</p>
            <p className="a"> A:No,Our Astro 2nd Gen batteries cannot be charged and disCharged at the same time
              protection of the bat-tery.</p>
            <p className="q"> Can you charge th battery and a phone simultaneously by connecting them in series?</p>
            <p className="a"> A:No,Our Astro 2nd Gen batteries cannot be charged and disCharged at the same time
              protection of the bat-tery.</p>
            <p className="q"> Can you charge th battery and a phone simultaneously by connecting them in series?</p>
            <p className="a"> A:No,Our Astro 2nd Gen batteries cannot be charged and disCharged at the same time
              protection of the bat-tery.</p>
          </div>*/}
        </div>
        <div className="space-100"></div>
      </div>
    );
  }

}

export default Faq;
