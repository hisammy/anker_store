/**
 * Created by shady on 15/11/12.
 */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Version.scss';

@withStyles(styles)
class Version extends Component {

  static PropTypes = {
    data: PropTypes.object.isRequired
  };

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  render() {
    let title = 'Version - Anker';
    this.context.onSetTitle(title);
    const file = this.props.data.file || '';
    return (
      <div className="Version">
        {file.split('\n')[file.split('\n').length - 2]}
      </div>
    );
  }

}

export default Version;
