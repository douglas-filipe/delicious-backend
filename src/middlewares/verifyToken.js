const jwt = require('jsonwebtoken')

const secret = process.env.JWT_SEC

const User = require("../models/User")

const verifyToken = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1]
        if(token){
            jwt.verify(token, secret, (err, decoded)=>{
                if(err){
                    return res.status(401).json({message: "Token não é válido!"})
                }
                req.email = decoded.email
                User.findOne({email: decoded.email})
                .then(user => {
                    req.user = user
                    next()
                }).catch(err=>{
                    res.status(401).json({error: err})
                })
            })
        }else{
            return res.status(400).json({message: "Você não está autenticado!"})
        }
    }catch(e){
        return res.status(404).json({message: "Token não encontrado"})
    }
    
}

module.exports = verifyToken