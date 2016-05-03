import React from 'react';
import ReactDOM from 'react-dom';
import Home from './Home'

class App extends React.Component {

  render(){
    return <Home lock={this.lock} />
  }
    
   componentWillMount(){
        this.lock = new Auth0Lock('QoWeXMrN4OBFVFXyM9WwabCBjp1rg38m', 'plutoprep.auth0.com');
        this.setState({idToken: this.getIdToken()});
    }

    getIdToken(){
      var idToken = localStorage.getItem('userToken');
      var authHash = this.lock.parseHash(window.location.hash);
      if (!idToken && authHash) {
        if (authHash.id_token) {
          idToken = authHash.id_token;
          localStorage.setItem('userToken', authHash.id_token);
        }
        if (authHash.error) {
          console.log("Error signing in", authHash);
          return null;
        }
      }
      return idToken;
    }

}

export default App;
