/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './InConstruction.scss';
// import withViewport from '../../decorators/withViewport';
// import Link from '../../utils/Link';
// import AppActions from '../../core/AppActions';
// import Cookie from '../../utils/Cookie';
// import Http from '../../core/HttpClient';

// usage:
// import InConstruction from '../InConstruction';
// <InConstruction {...this.state} />

@withStyles(styles)
// @withViewport
class InConstruction extends Component {

  componentWillMount() {
    this.state = {};
  }
  componentWillReceiveProps(nextProps) {
  }

  render() {
    return (
      <div className="InConstruction">
        <div className="module-container">
          <img src={require('./in_construction.png')} />
          <p>Page under construction.</p>
        </div>
      </div>
    );
  }
}

export default InConstruction;
