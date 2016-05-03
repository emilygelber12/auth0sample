//need to pass the profile state

import React from 'react';
import ReactDOM from 'react-dom';

class LoggedIn extends React.Component {

  render(){
    if (this.state.profile) {
      // state should be changed to props and passed down from parent component
      return <h2>Welcome {this.state.profile.nickname}</h2>
    } 
    else {
      return <div className="loader"></div>
    }
  }

  componentDidMount(){
    // In this case, the lock and token are retrieved from the parent component
    // If these are available locally, use `this.lock` and `this.idToken`
    this.props.lock.getProfile(this.props.idToken, function (err, profile) {
      if (err) {
        console.log("Error loading the Profile", err);
        return;
      }
      this.setState({profile: profile});
    }.bind(this));
  }

}

export default LoggedIn