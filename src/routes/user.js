const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWT_SEC;
const verifyToken = require("../middlewares/verifyToken");

const bcrypt = require("bcrypt");
const passwordReset = require("../utils/passwordReset");

//Register User

//router.put("/")

router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const savedUser = await newUser.save();
    const { password, ...others } = savedUser._doc;
    const { email, username, _id } = others;
    res.status(201).json({ email, username, _id });
  } catch (e) {
    res.status(500).json({ message: "Erro ao cria a conta" });
  }
});

//Login

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Email incorreto" });
    } else {
      user.isCorrectPassword(password, function (err, same) {
        if (!same) {
          res.status(401).json({ error: "Senha incorreta" });
        } else {
          const token = jwt.sign({ email }, secret, {
            expiresIn: "10d",
          });
          const { password, ...others } = user._doc;
          const { _id, username, email: _email } = others;
          res.json({ _id, username, _email, token: token });
        }
      });
    }
  } catch (e) {
    res.status(500).json({ message: "Error ao criar a conta" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  const id = req.params.id
  try {
    const user = await User.findById({ _id: id })
    const { _id, username, email, createdAt } = user
    res.status(200).json({ _id, username, email, createdAt })
  } catch {
    res.status(404).json({ "message": "Usuário não encontrado" })
  }
})

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
      await passwordReset(user.email, newPassword);
      return res.status(200).json({ message: "Sua senha foi alterada" });
    } else {
      return res.status(404).json({ Message: "Email não encontrado" });
    }
  } catch (e) {
    console.log(e);
    res.status(404).json("Email não encontrado");
  }
});


router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { password } = req.body
    const generatePassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(
      req.params.id,
      { email: req.body.email, username: req.body.username, password: generatePassword },
      { new: true }
    )
    return res.status(200).json({ "message": "Seus dados foram alterados" })
  } catch {
    return res.status(404).json({ "message": "Usuário inválido" })
  }
})

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ "message": "Usuário não existe" })
    return res.status(200).json({ "message": "Sua conta foi apagada" })
  } catch {
    return res.status(500).json({ "message": "Erro ao apagar conta" })
  }
})

module.exports = router;
