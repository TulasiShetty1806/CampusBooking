const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    let token = req.headers['authorization'];
    if (!token) return res.status(401).send({message:'Unauthorized'});
    
    // If token is "Bearer <token>", extract it
    if(token.startsWith('Bearer ')){
        token = token.slice(7, token.length);
    }

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if(err) return res.status(401).send({message:'Invalid token'});
        req.user = decoded;
        next();
    });
}

module.exports = { authenticate };
