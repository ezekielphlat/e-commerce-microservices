const express = require("express");
const { JsonWebTokenError } = require("jsonwebtoken");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./User");
const app = express();
const PORT = process.send.PORT_ONE || 7070;


app.use(express.json())
mongoose.connect("mongodb://localhost:27017/auth-service",{
    useNewUrlParser: true,
    useUnifiedTopology: true},
    console.log("Auth-Service DB Connected"));


// Register
app.post("/auth/register", async (req, res)=>{
    const {email, password, name} = req.body;

    const userExists = await User.findOne({email});
    if(userExists){
        return res.json({message:"User already exists"});
    }else{
        const newUser = new User({
            name,
            email,
            password
        });
        newUser.save();
        return res.status(200).json(newUser);
    }
})
// Login
app.post("/auth/login", async (req, res)=>{
    const {email, password} =  req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.json({message: "User doesn't exist"});

    }else{
        //check password
        if(password !== user.password){
            return res.json({message: "Password Incorrect"})
        }
        const payload = {
            email,
            name: user.name
        };
        jwt.sign(payload, "secret", (err, token)=>{
            if(err){
                console.log(err)
            }else{
                return res.json({token:token})
            }
        })
    }
})
 
app.listen(PORT, ()=>{
    console.log("Auth-Service at "+ PORT)
})