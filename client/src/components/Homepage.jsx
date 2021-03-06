import PropTypes from "prop-types";
import React, { Component } from "react";

export default class HomePage extends Component {
  //propTypes is just a React built-in tool for validating the types of props.
  //An error is thrown if a prop comes in of an incorrect type.
  //More sophisticated validation can also be accomplished, e.g., ranges. See
  //https://blog.logrocket.com/validating-react-component-props-with-prop-types-ef14b29963fc/
  
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      usermame: PropTypes.string,
      provider: PropTypes.string,
      profileImageUrl: PropTypes.string
    })
  };

  //Here is an example of defining a component's state without the need for a
  //constructor. This is a relatively new "alternative class syntax" that uses a
  //so-called "class field declaration." For details, see 
  //https://www.robinwieruch.de/react-state-without-constructor.
  state = {
    user: {},
    error: null,
    authenticated: false
  };


  //New componentDidMount: We set component state based on results of fetch to auth/test route.
  componentDidMount() {
    fetch("/auth/test")
      // .then(res => res.text())
      // .then(text => console.log(text));
      .then((response) => response.json())
      .then((obj) => 
        {this.setState({
            authenticated: obj.isAuthenticated,
            user: obj.user
          });
        });
  }

  //Renamed original componentDidMount to effectively comment it out.
  //Saving it for posterity.
  componentDidMount_Original() {
    // Fetch does not send cookies, so we instead add credentials: 'include'
    // This fetch function is intended to ask the server whether the current
    // user has been authenticated. What's odd about this approach is that it is
    // calling a server in a domain (localhost:4000) that is different from the
    // domain of the React single-page app. I don't like this; it seems
    // contrived. Why wouldn't we want to keep the client and server code in the
    // same domain to avoid the need for CORS?
    fetch("/auth/login/success", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true
      }
    })
      .then(response => {
        if (response.status === 200) return response.json();
        throw new Error("failed to authenticate user");
      })
      .then(responseJson => { 
        //Here is where we push the results of the GET request into the component's state
        this.setState({
          authenticated: true,
          user: responseJson.user
        });
      })
      .catch(error => {
        this.setState({
          authenticated: false,
          error: "Failed to authenticate user"
        });
      });
  }

  handleLoginClick = () => {
    // Authenticate using via passport api
    // Open Oauth login page
    // Upon successful login, a cookie session will be stored in the client
    window.open("/auth/github", "_self");
  };

  handleLogoutClick = () => {
    // Logout using Oauth passport api
    // Set authenticated state to false in the HomePage
    window.open("/auth/logout", "_self");
    this.setState({authenticated: false, user: {}});
  };

  render() {
    return (
      <div>
          {!this.state.authenticated ? (
            <center>
            <h1>Welcome to the OAuth Demo App!<br/>Please Log in</h1>
            <button className="btn btn-block btn-xl btn-primary"
               onClick={this.handleLoginClick}>
              <span className="fa fa-github"></span> Sign in with GitHub
            </button>
            </center>
          ) : (
              <center>
              <h1>You have logged in succcessfully!</h1>
              <img src={this.state.user.profileImageUrl} alt="profile pic"/><br/>
              <p>Id: {this.state.user.id}<br/>
                 Username: {this.state.user.username}<br/>
                 Provider: {this.state.user.provider}<br/>
              </p>
              <button className="btn btn-block btn-xl btn-primary"
               onClick={this.handleLogoutClick}>
              <span className="fa fa-github"></span> Sign out from GitHub
            </button>
              
              </center>     
          )}
      </div>
    );
  }
}
