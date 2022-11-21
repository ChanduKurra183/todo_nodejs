const jwt = require('jsonwebtoken');
const Config = require('../config');


function generateJWT(user) {

    const signedToken = jwt.sign(user, Config.JWT_SECRET, { expiresIn: 60 * 60 });
    return signedToken;

}

function verifyJWT(req, res, next) {

    const isTokenPresent = req.headers.hasOwnProperty('x-access-token');

    if (isTokenPresent) {
        const token  = req.headers['x-access-token'];
        const options = { ignoreExpiration : false };
        jwt.verify(token, Config.JWT_SECRET, options, (err, decode) => {
            console.log("decode==>", decode);
            if(err) res.status(406).send({status: false, message: "JWT verification failed."});
            else next();
        })
    }
    else {
        res.status(406).send({status: false, message: "JWT token required."});
    }

}

module.exports = { generateJWT, verifyJWT }

