import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import React, { Component } from "react";

export default class Header extends Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired
  };

  render() {
    const { authenticated } = this.props;
    return (
      <ul className="menu">
        <li>
          Welcome to SpeedScore!
        </li>
        {authenticated ? (
          <li onClick={this._handleLogoutClick}>Logout</li>
        ) : (
          <li onClick={this._handleLoginClick}>Login</li>
        )}
      </ul>
    );
  }

  _handleLoginClick = () => {
    // Authenticate using via passport api
    // Open Oauth login page
    // Upon successful login, a cookie session will be stored in the client
    window.open("http://localhost:30000/auth/github", "_self");
    
  };

  _handleLogoutClick = () => {
    // Logout using Oauth passport api
    // Set authenticated state to false in the HomePage
    window.open("http://localhost:30000/auth/logout", "_self");
    this.props.handleNotAuthenticated();
  };
}
