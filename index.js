var monk = require('monkii');
var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
var path = require('path');

var MONGO_URI = process.env.MONGOLAB_URI || 'localhost:27017/pluto_data';
var PORT = process.env.PORT || 3001;
var db = monk(MONGO_URI);
var app = express();

app.use(function(req, res, next){
	req.db = db;
	next();
});

var authenticate = jwt({
  secret: new Buffer('lmv7yeiQSEzhwsjoNcauzoa6aKY4xk-lQ2rVSn_bfK19WfsY_McO-4mozajI1xBc', 'base64'),
  aud: "2vASXVx8AWj72nor8xFs8yrlhLi456A5"
});

var userId;

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/secured', authenticate);

app.get('/secured/ping', function(req, res) {
	userId = req.user.sub;
	res.status(200).send("All good. You only get this message if you're authenticated");
	db.get('user_data').findOne({auth_id: userId}, function(err, user) {
		if(user) {
			db.get('user_data').findAndModify({ _id: user._id }, { $set: {last_login: new Date()}}, function(err) {
				if(err) {
					console.log(err);
				}
			});
		}
		else {
			db.get('user_data').insert({ auth_id: req.user.sub, last_login: new Date(), results: [] }, function (err) {
				if (err) {
					console.log(err);
				};
			});
		}
	})
});

app.post('/userdata', function(req, res){
	var date = new Date();
	var newObject = {
		question_id: req.body.question_id,
		date: date,
		user_choice: req.body.user_choice,
		correct_answer: req.body.correct_answer,
		user_correct: req.body.user_correct
	};
	if(req.body.pid) {
		newObject.pid = req.body.pid
	}
	db.get('user_data').findAndModify({ query: {auth_id: userId}, update: { $push: {results: newObject}} }, function(err) {
		if(err) {
			console.log(err);
		}
	});
	res.send('Question submitted');
});

app.post('/quizresults', function(req, res) {
	var quizResults = {
		user_id: userId,
		date: new Date(),
		quiz_results: req.body
	};
	db.get('results').insert(quizResults, function(err) {
		if(err) {
			console.log(err);
		}
		res.send({quiz_results: quizResults});
	});
});

app.get('/passages/:section', function(req, res){
	var categories;
	switch (req.params.section){
		case 'psych':
			categories = { "section": 'psf' };
			break;
		case 'bio':
			categories = { "section": 'bbf' };
			break;
		case 'chem':
			categories = { "section": 'cpf' };
			break;
		default:
			categories = {};
	}
	db.get('passages').find({ 
		$and: [
			categories,
			{'completed': true}
		]
		}, function(err, questions){
		if (err) {
			throw err;
		};
		var quiz = _.sampleSize(questions, 1);
		var renderedQuiz = function (quiz) {
			var questionsArray = [];
			quiz[0].questions.forEach(function(question){
				questionsArray.push(Object.assign({}, question, {
					question: question.question,
					a: question.a,
					b: question.b,
					c: question.c,
					d: question.d,
					short_explanation: question.short_explanation,
					long_explanation: question.long_explanation,
					subject: question.subject,
					completed: question.completed,
					pid: question.pid,
					answer: question.answer
				}));
				return questionsArray;
			});
			return questionsArray;
		}
		res.send({
			passage: quiz[0].passage,
			questions: renderedQuiz(quiz)
		});
	});
});

app.get('/questions/:section', function(req, res){
	var categories = [];
	switch (req.params.section){
		case 'psych':
			categories = [ { "subject": 'fc6' }, { "subject": 'fc7'}, { "subject": 'fc8'}, { "subject": 'fc9'}, { "subject": 'fc10'} ];
			break;
		case 'bio':
			categories = [ { "subject": 'fc1' }, { "subject": 'fc2'}, { "subject": 'fc3'} ];
			break;
		case 'chem':
			categories = [ { "subject": 'fc4' }, { "subject": 'fc5'} ];
			break;
		default:
			categories = [];
	}
	db.get('questions').find({ 
		$and: [
			{ $or: categories },
			{'completed': true},
			{'pid': {$exists: false}}
		]
		}, function(err, questions){
			if (err) {
				return console.log(err);
			}
			db.get('user_data').findOne({auth_id: userId}, function(err, user) {
				if (err) {
					return console.log(err);
				}
				var answeredIndex = _.keyBy(user.results, 'question_id');
				var quiz = {questions: _(questions).filter(function(question, i) {
					return !(question._id in answeredIndex) || !answeredIndex[question._id].user_correct; 
				}).sampleSize(6)};
				res.send(quiz);
			});
		}
	);
});

app.get('*', function (request, response){
	response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
});

console.log('app is listening');

app.listen(PORT);
