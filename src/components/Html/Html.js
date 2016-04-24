/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { Component, PropTypes } from 'react';
import { config } from '../../../build/config';
class Html extends Component {

  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    css: PropTypes.string,
    body: PropTypes.string.isRequired,
    entry: PropTypes.string.isRequired,
  };

  static defaultProps = {
    title: '',
    description: '',
  };

  trackingCode() {
    return ({
      // Facebook Ads for Websites
      __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','//connect.facebook.net/en_US/fbevents.js');` +
      // Google Analytics
      `(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){` +
      `(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),` +
      `m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)` +
      `})(window,document,'script','//www.google-analytics.com/analytics.js','ga');` +

      `if(localStorage.getItem('user_id')) {
        ga('create', '${config.GOOGLE_TRACKING_ID}', {user_id: localStorage.getItem('user_id')});
        ga('set', 'userId', localStorage.getItem('user_id'));
        ga('set', 'dimension1', localStorage.getItem('user_id'));
      } else {
        ga('create', '${config.GOOGLE_TRACKING_ID}', 'auto');
      }` +
      `ga('require', 'displayfeatures');` +
      `ga('require', 'ec');ga('set', 'anonymizeIp', true);` +

      (this.props.track_google_pla ? '' :
        // Google Retargeting/Remarketing
        // var google_tag_params = {
        // ecomm_prodid: 'REPLACE_WITH_VALUE',
        // ecomm_pagetype: 'REPLACE_WITH_VALUE',
        // ecomm_totalvalue: 'REPLACE_WITH_VALUE',
        // };
        `var google_conversion_id = 921123694;
        var google_custom_params = window.google_tag_params;
        var google_remarketing_only = true;`)
    });
  }

  render() {
    return (
      <html className="no-js" lang="">
      <head>
        <meta charSet="utf-8"/>
        <meta name="google-site-verification" content="RauOhVjI8gpc2BbGogDVuQhviAMf1qU14jtmMUEuWjE" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
        <title>{this.props.title}</title>
        <meta name="description" content={this.props.description}/>
        <meta name="google-signin-client_id" content={config.GOOGLE_APP_ID}></meta>
        {/*facebook*/}
        <meta name="fb:app_id" content={config.FB_APP_ID}/>
        {!this.props['og:url'] ? null : <meta name="og:url" content={this.props['og:url']}/>}
        {!this.props['og:title'] ? null : <meta name="og:title" content={this.props['og:title']}/>}
        {!this.props['og:description'] ? null : <meta name="og:description" content={this.props['og:description']}/>}
        {!this.props['og:image'] ? null : <meta name="og:image" content={this.props['og:image']}/>}
        {/*twitter*/}
        {!this.props['og:title'] ? null : <meta name="twitter:card" content="summary_large_image"/>}
        {!this.props['og:title'] ? null : <meta name="twitter:site" content="@Ankerofficial"/>}
        {!this.props['og:title'] ? null : <meta name="twitter:title" content={this.props['og:title']}/>}
        {!this.props['og:description'] ? null : <meta name="twitter:description" content={this.props['og:description']}/>}
        {!this.props['twitter:image'] ? null : <meta name="twitter:image" content={this.props['og:image']}/>}
        <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"/>
        <link rel="apple-touch-icon" href="https://d30w2ife1a7e8h.cloudfront.net/apple-touch-icon.png"/>
        <style id="css" dangerouslySetInnerHTML={{__html: this.props.css}}/>
      </head>
      <body>
      <div id="app" dangerouslySetInnerHTML={{__html: this.props.body}}/>
      <div id="loading"><div className="loading-cell"><i className="iconfont">&#xe67b;</i><b><em><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></em></b><span>Loading...</span></div></div>
      <script src={this.props.entry}></script>
      <script src="//static.criteo.net/js/ld/ld.js" async="true"></script>
      <script src="//platform.twitter.com/oct.js"></script>
      <script dangerouslySetInnerHTML={this.trackingCode()}/>
      <script src="//www.googleadservices.com/pagead/conversion.js"></script>
      <noscript>
      <div style={{display:'inline'}}>
      <img height="1" width="1" style={{borderStyle:'none'}} alt="" src="//googleads.g.doubleclick.net/pagead/viewthroughconversion/921123694/?value=0&amp;guid=ON&amp;script=0"/>
      </div>
      </noscript>
      </body>
      </html>
    );
  }

}

export default Html;
