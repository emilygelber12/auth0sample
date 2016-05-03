import React from 'react';
import ReactDOM from 'react-dom';

class Quiz extends React.Component {

	render(){
		return <div> Quiz Page 
			<div className='right-side-container'>
				<div>
					<button onClick={this.logout.bind(this)}>Sign Out</button>
				</div>
			</div>
		</div>
	};

	logout(){
		localStorage.removeItem('userToken');
		this.lock.logout({ ref: window.location.href });
	}

	componentWillMount(){
      	this.lock = new Auth0Lock('QoWeXMrN4OBFVFXyM9WwabCBjp1rg38m', 'plutoprep.auth0.com');
    }

}

export default Quiz;