import jwt from "jsonwebtoken";

export function createToken(user) {
    return jwt.sign(
        { id: user.id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}