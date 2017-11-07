var express = require('express');
var router = express.Router();


var config = require('../config/config')
var request = require('request')
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');



var connection = mysql.createConnection({
	host: config.db.host,
	user: config.db.user,
	password: config.db.password,
	database: config.db.database
});
connection.connect((error)=>{
	if (error){
		throw error;
	}
	console.log(error);
})

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.name === undefined){
		res.redirect('/login?msg=YOO');
	}

	const getBands = new Promise((resolve,reject)=>{



	var selectQuery = `SELECT * FROM bands;`;
	connection.query(selectQuery,(error, results, fields)=>{
		if(error){
			reject(error)
		}else{
		var rand = Math.floor(Math.random() * results.length);
		resolve(results[rand]);
		}
	});
	
});
		getBands.then((bandObj)=>{
			console.log(bandObj);

			res.render('index', { 
  			name: req.session.name,
  			band: bandObj
  		});
  });

 
});


router.get('/register', function(req,res,next){
	res.render('register', {})
});

router.get('/login', function(req,res,next){
	res.render('login', {})
});



router.post('/registerProcess', (req,res, next)=>{
	// res.json(req.body);

	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;


	const selectQuery = "SELECT * FROM users WHERE email = ?;";
	connection.query(selectQuery,[email],(error,results)=>{
		if(results.length != 0){
			res.redirect('/login?msg=registered');
		}else{
			var hash = bcrypt.hashSync(password);

			var insertQuery = `INSERT INTO users (name, email, password) VALUES (?,?,?)`;
		}
			connection.query(insertQuery,[name,email,hash], (error)=>{
				if (error){
					throw error;

				}else{
					res.redirect("/?msg=registered");
				}
			});
	// 	}else{
	// 		res.redirect("/?msg=fail");
	// 	}
	});
});


router.post('/loginProcess', (req,res,next)=>{
	// res.json(req.body);

	var email = req.body.email;
	var password = req.body.password;

	var selectQuery = `SELECT * FROM users WHERE email = ?;`;
	console.log(email);
	connection.query(selectQuery,[email],(error,results)=>{
		if(error){
			throw error;
		}else {
			if(results.length == 0){
				res.redirect('/login?msg=badUser');
				console.log("NO SUCH USER")
			}else{
				// call compareSync
				var passwordMatch = bcrypt.compareSync(password,results[0].password);
				if(passwordMatch){
					req.session.name = results[0].name;
					req.session.uid = results[0].id;
					req.session.email = results[0].email;
					res.redirect('/');
					console.log(results[0]);

				}else{
					res.redirect('/login?msg=badPassword');
				}
			}
		}
	});



});


router.get('/vote/:direction/:bandId', (req,res)=>{
	// res.json(req.params);
	var bandId = req.params.bandId;
	var direction = req.params.direction;
	var insertVoteQuery = `INSERT INTO votes (imageId, voteDirection, userID) VALUES (?,?,?);`;
	connection.query(insertVoteQuery, [bandId, direction, req.session.uid],(error,results)=>{
		if (error){
			throw error;
		}else{
			res.redirect('/');
		}
	})
});



module.exports = router;
