import request from 'superagent';
import nocache from 'superagent-no-cache';

var quizResults = [];

//intial state
var initialState = {
	startQuiz: false,
	idx: 0,
	questions: [],
	longExplanation: false,
	longExplanationText: null,
	profile: null,
	loggedIn: false,
	completedQuiz: false
}

export function question(state = initialState, action){
	switch (action.type){
		case RESET:
			return initialState;
		case NEW_QUIZ:
			return Object.assign({}, state, {
				startQuiz: action.startQuiz
			})
		case CHOOSE_SECTION:
			return Object.assign({}, state, {
				startQuiz: action.value
			})
		case LOAD_DATA:
			return {
				idx: 0,
				startQuiz: state.startQuiz,
				questions: action.questions.slice(),
				passage: action.passage 
			}
		case CHANGE_QUESTION:
			return {
				questions: state.questions,
				startQuiz: state.startQuiz,
				idx: state.idx + action.change,
				passage: state.passage				
			}
		case CHECK_ANSWER: 
			var currentQuestion = state.questions[state.idx];
			return Object.assign({}, state, {
					questions: [
						...state.questions.slice(0, state.idx),
						Object.assign({}, currentQuestion, {
							user_choice: action.userChoice,
							user_correct: action.userChoice === currentQuestion.correct_answer
						}),
						...state.questions.slice(state.idx + 1)
					]
				})
		case LONG_EXPLANATION:
			return Object.assign({}, state, {
				longExplanation: action.value,
				longExplanationInfo: action.longExplanationInfo
			})
		case PROFILE:
			return Object.assign({}, state, {
				profile: action.profile
			})
		case LOGGED_IN:
			return Object.assign({}, state, {
				loggedIn: action.loggedIn
			})
		case COMPLETED_QUIZ:
			return Object.assign({}, state, {
				completedQuiz: action.completed
			})
		default:
			return state
	}
}

//reset state
export var RESET = 'RESET';

//actions for quiz
export var CHOOSE_SECTION = 'CHOOSE_SECTION';
export var LOAD_DATA = 'LOAD_DATA';
export var CHANGE_QUESTION = 'CHANGE_QUESTION';
export var CHECK_ANSWER = 'CHECK_ANSWER';
export var LONG_EXPLANATION = 'LONG_EXPLANATION';
export var NEW_QUIZ = 'NEW_QUIZ';
export var COMPLETED_QUIZ = 'COMPLETED_QUIZ';


//actions for login
export var PROFILE = 'PROFILE';
export var LOGGED_IN = 'LOGGED_IN';

export function resetState(){
	return {
		type: RESET
	}
}

export function completedQuiz() {
	request.post('/quizresults')
		.send(quizResults)
		.end(function(err, res){
			quizResults = [];
			if (err || !res.ok) {
				console.log('Oh no! error');
			} 
		});
	return {
		type: COMPLETED_QUIZ,
		completed: true
	}
}


export function newQuiz(){
	return {
		type: NEW_QUIZ,
		startQuiz: false
	}	
}

export function chooseSection(value){
	return {
		type: CHOOSE_SECTION,
		value: value
	}
}

export function loadData(section, questionType, type){
	return function(dispatch) {
		request.get(questionType + section)
			.end(function(err, res){
			if (err) {
				console.log(err);
			}
			else {
				dispatch({
					type: LOAD_DATA,
					passage: res.body.passage,
					questions: res.body.questions.map(convertQuestion.bind(this, type))
				})			
			}
		})
	}
}


export function changeQuestion(change, userChoice, newUserData, correctAnswer, pid){
	if (change == 'next') {
		var userCorrect = (userChoice === correctAnswer);
		var userData = {
			question_id: newUserData,
			user_choice: userChoice,
			correct_answer: correctAnswer,
			user_correct: userCorrect
		};
		if(pid) {
			userData.pid = pid;
		}
		quizResults.push(userData);
		request.post('/userdata')
			.send(userData)
			.end(function(err, res){
				if (err || !res.ok) {
					console.log('Oh no! error');
				} 
			});
		return {
			type: CHANGE_QUESTION,
			change: + 1
		}
	}
	else if (change == 'back') {
		return {
			type: CHANGE_QUESTION,
			change: - 1
		}
	}
}

export function checkAnswer(userChoice){
	return {
		type: CHECK_ANSWER,
		userChoice: userChoice
	};
}

export function longExplanation(value, longExplanationInfo){
	return {
		type: LONG_EXPLANATION,
		value: value,
		longExplanationInfo: longExplanationInfo
	}
}

export function getProfile(profile) {
	return {
		type: PROFILE,
		profile: profile
	}
}

export function loggedIn(){
	return {
		type: LOGGED_IN,
		loggedIn: true
	}
}

export function redirect(callback) {
	return function(dispatch) {
		getIdToken();
		request.get('/secured/ping')
			.set('Authorization', 'Bearer ' + localStorage.getItem('userToken'))
			.use(nocache)
			.end(function(err, res) {
				if(err) {
					localStorage.removeItem('userToken');
					window.location.hash = '/';
				}
				else {
					dispatch(loggedIn());
					callback();
				}
			});
	}
}

export function getIdToken(){
	var lock = new Auth0Lock('QoWeXMrN4OBFVFXyM9WwabCBjp1rg38m', 'plutoprep.auth0.com');
	var idToken = localStorage.getItem('userToken');
	var authHash = lock.parseHash(window.location.hash);
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




