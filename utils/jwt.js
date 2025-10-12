const jwt = require("jsonwebtoken");

const createToken = (user) => {
    return jwt.sign(
        { id: user.id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

module.exports = { createToken };