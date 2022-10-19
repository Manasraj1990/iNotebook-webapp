const jwt = require('jsonwebtoken');
const jwtSecretHash = "myprojectisfortesting";

const authUserCheck = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ status: "error", message: 'Please authenticate with the valid token.' })
    }
    try {
        const data = jwt.verify(token, jwtSecretHash);
        req.user = data.user;
        next();

    } catch (error) {
        return res.status(401).send({ status: "error", message: 'Please authenticate with the valid token.' })
    }

}

module.exports = authUserCheck;