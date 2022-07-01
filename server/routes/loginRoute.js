const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const hash = require('pbkdf2-password')();

router.post('/', async (req, res, next) => {
	console.log('body', req.body);
	const { username, password } = req.body;

	MongoClient.connect(process.env.MONGODB, { useUnifiedTopology: true }).then(
		async client => {
			const db = client.db('training');
			let user = await db
				.collection('users')
				.findOne({ username: username });
			if (user) {
				hash(
					{ password: password, salt: user.salt },
					function (err, pass, salt, hash) {
						if (err) return fn(err);
						if (hash === user.hash) {
							console.log('SUCCESS');
							var token = jwt.sign(
								{ id: user._id },
								process.env.JWT_SECRET,
								{
									expiresIn: 86400, // 24 hours
								}
							);
							res.send({
								success: 'Logged in successfully',
								user: user,
								accessToken: token,
							});
						} else {
							console.log('FAILED');
							res.send({ error: 'Invalid Username or Password' });
						}
					}
				);
			} else {
				console.log('NO USER');
				res.send({ error: 'User not found' });
			}
		}
	);
});

module.exports = router;
