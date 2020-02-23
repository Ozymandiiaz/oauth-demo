import Header from "./Header";
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

  //Method to set authenticated to false
  _handleNotAuthenticated = () => {
    this.setState({ authenticated: false });
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
    fetch("http://localhost:30000/auth/login/success", {
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

  render() {
    const { authenticated } = this.state; //Authenticated can now be used in render logic
    return (
      <div>
        <Header
          authenticated={authenticated}
          handleNotAuthenticated={this._handleNotAuthenticated}
        />
        <div>
          {!authenticated ? (
            <h1>Welcome!</h1>
          ) : (
            <div>
              <h1>User has logged in succcessfully!</h1>
              <h2>Welcome!</h2>
              <img src={this.state.user.profileImageUrl}/><br/>
              <p>Id: {this.state.user.id}<br/>
                 Username: {this.state.user.username}<br/>
                 Provider: {this.state.user.provider}<br/>
              </p>     
            </div>
          )}
        </div>
      </div>
    );
  }
}
