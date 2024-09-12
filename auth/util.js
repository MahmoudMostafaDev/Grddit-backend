const { json } = require("express");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
async function getUserPassword(username) {
  const user = await User.findOne({ username: username }, "password");

  if (!user) return null;

  return user.password;
}

async function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.STK, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

exports.getUserPassword = getUserPassword;
exports.verifyToken = verifyToken;
