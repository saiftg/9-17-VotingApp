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
	console.log(error);
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/registerProcess', (req,res, next)=>{
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;

	var hash = bcrypt.hashSync(password);

	const selectQuery = "SELECT * FROM users WHERE email = ?;";
	connection.query(selectQuery,[email],(error,results)=>{
		if(results.length == 0){
			var insertQuery = "INSERT INTO users (name, email, password) VALUES (?,?,?);";
			connection.query(insertQuery,[name,email,hash], (error, results)=>{
				if (error){
					throw error;
				}else{
					res.redirect("/?msg=registered");
				}
			});
		}else{
			res.redirect("/?msg=fail");
		}
	});
});

module.exports = router;
