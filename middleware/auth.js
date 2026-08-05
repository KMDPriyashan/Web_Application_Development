const  jwt = require('jsonwebtoken');

const security_key = 'hict3202-super-script';

function verifytoken (req, res, next){
    const authheader = req.headers['authorization'];

    if(!authheader){
        return res.status(401).json({
            message: 'no token provided , please login in first'
        });
    }

    const token = authheader.split(' ')[1];

    try{
        const decode = jwt.verify(token, security_key);
        req.user = decode;
        next();
    } catch (error){
        return res.status(403).json({
            message: 'invalid or expired token..!'
        })
    }
}

module.exports = {verifytoken , security_key};