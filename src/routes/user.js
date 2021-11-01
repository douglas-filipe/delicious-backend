const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWT_SEC;
const nodemailer = require("nodemailer")

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

router.post("/send-email", (req, res) => {
  const remetente = nodemailer.createTransport({
    host:"smtp.gmail.com",
    service: "gmail",
    port: 587,
    secure: true,
    auth: {
      user: process.env.email,
      pass: process.env.password
    }
  })

  const emailASerEnviado = {
    from: "felipecolares333@gmail.com",
    to: "douglasfelipe.net77@gmail.com",
    subject: "Enviado email com Node.js",
    text: "Ola"
  }
  remetente.sendMail(emailASerEnviado, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      return res.json("Enviado")
    }
  });  

})



module.exports = router;
