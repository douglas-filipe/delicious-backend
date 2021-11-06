const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWT_SEC;

const bcrypt = require("bcrypt");
const passwordReset = require("../utils/passwordReset");

//Register User

router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const savedUser = await newUser.save();
    const { password, ...others } = savedUser._doc;
    res.status(201).json({ others });
  } catch (e) {
    res.status(500).json({ message: "Error ao criar a conta" });
  }
});

//Login

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Email incorrect" });
    } else {
      user.isCorrectPassword(password, function (err, same) {
        if (!same) {
          res.status(401).json({ error: "Password incorrect" });
        } else {
          const token = jwt.sign({ email }, secret, {
            expiresIn: "10d",
          });
          const { password, ...others } = user._doc;
          res.json({ user: others, token: token });
        }
      });
    }
  } catch (e) {
    res.status(500).json({ message: "Error" });
  }
});

router.post("/reset_password", async (req, res) => {
  const { email } = req.body;
  const newPassword = Math.random().toString(36).slice(-10);
  try {
    user = await User.findOne({ email });
    if (user) {
      const generatePassword = await bcrypt.hash(newPassword, 10);
      await User.findOneAndUpdate(
        { email: email },
        { password: generatePassword }
      );
      await passwordReset(user.email, newPassword)
      return res.status(200).json({ message: "Sua senha foi alterada" });
    } else {
      return res.status(400).json({ Message: "Email não encontrado" });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json("Email não encontrado");
  }
});

module.exports = router;
