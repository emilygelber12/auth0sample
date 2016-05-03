import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import Quiz from './components/Quiz'
import { createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import { Provider } from 'react-redux'
import { question, getIdToken, redirect} from './reducers/quiz-reducer'
import thunk from 'redux-thunk'
import { Router, Route, browserHistory } from 'react-router'

var logger = createLogger();
var store = applyMiddleware(thunk, logger)(createStore)(question);

function AppWrapper(props){
	return (
		<Provider store={store} >
			<App {...props} />
		</Provider>
	);
}

function QuizWrapper(props){
	return (
		<Provider store={store} >
			<Quiz {...props} />
		</Provider>
	);
}

ReactDOM.render(
	<Router history={browserHistory}>
		<Route path='/' component={AppWrapper} onEnter={(nextState, replaceState, callback) => {
			if(getIdToken()){
				window.location.href = '/quiz';
			}
			else {
				callback();
			}
		}} />
		<Route path='/quiz' component={QuizWrapper} onEnter={(nextState, replaceState, callback) => {
			store.dispatch(redirect(callback));
		}}/>
	</Router>,
	document.getElementById('application')
)
