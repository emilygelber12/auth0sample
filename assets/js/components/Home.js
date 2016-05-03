import React from 'react';
import ReactDOM from 'react-dom';

class Home extends React.Component {

	render(){
		return <div> Home Page
                <button className='sign-in' onClick={this.props.lock.show.bind(this.props.lock, {
                    authparams: {
                        state: 'ru=' + location.href
                    }
                })}>Get started!</button>
        </div>
	};

}

export default Home;