/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './NotFound.scss';
import Location from '../../core/Location';

@withStyles(styles)
class NotFound extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
    onPageNotFound: PropTypes.func.isRequired,
  };

  render() {
    const title = 'Page Not Found';
    this.context.onSetTitle(title);
    this.context.onPageNotFound();
    setTimeout(function() {
      Location.push('/');
    }, 3000);
    return (
      <div className="page404">
      </div>
    );
  }

}

export default NotFound;
