const Users = require('../models/users.models');
const jwt = require('jsonwebtoken');
const config = process.env;

const verifyToken = async(req, res, next) => {
    try {
        const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null;
        if (!token) {
            return res.send({
                success: false,
                message: 'The token is required for authorization!',
            }, 401);
        }
        const user = jwt.verify(token, config.JWT_SECRET_KEY || 'bf5a14b224ff99991ed15223015970d5');
        const foundUser = await Users.findOne({ where: { id: user.id } });
        req.user = foundUser;
        return next();
    } catch (error) {
        return res.send({
            success: false,
            message: 'Invalid token!',
        }, 401);
    }
};

module.exports = verifyToken;