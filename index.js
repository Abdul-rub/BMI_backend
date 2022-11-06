const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { connection } = require("./config/db");
const { UserModel } = require("./model/userModel");
const { authentication } = require("./middlewares/authentication");
const { BmiModel } = require("./model/bmiModel");
require("dotenv").config()

const PORT = process.env.PORT || 8000

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Home");
});

//SIGNUP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const isUser = await UserModel.findOne({ email });
  if (isUser) {
    res.send({"msg":"Users already exists"});
  }
  else{
  bcrypt.hash(password, 4, async function (err, hash) {
    if (err) {
      res.send("Soething went wrong please try again ");
    }
    const new_user = new UserModel({
      name,
      email,
      password: hash,
    });
    try {
      await new_user.save();
      res.send({"msg":"Signup Successfull"});
    } catch (error) {
      res.send({"msg":"Something went wrong"});
    }
  
  });
}
});


//LOGIN;
app.post("/login",async(req,res)=>{
  const {email,password}= req.body
  const user = await UserModel.findOne({email})  //getting user
  const hashed_pass = user.password;
  const user_id= user._id;
  console.log(user)
  console.log(user_id)
  bcrypt.compare(password,hashed_pass, function(err, result) {
    if(err){
      res.send({"msg":"Something went wrong"})
    }
    if(result){
      const token = jwt.sign({ user_id }, process.env.SECRET_KEY);
      res.send({message:"login successfull", token})
    }else{
      res.send({"msg":"login failed,try again"})
    }
});
})


//GET_PROFILE

app.get("/getProfile", authentication,async(req,res)=>{
  const {user_id} = req.body
  const user =await UserModel.findOne({_id: user_id})
  //console.log(user)
  const {name,email} = user
  res.send({name,email})
})

// CALCULATE BMI

app.post("/calculateBMI", authentication, async(req,res)=>{
  const {height, weight, user_id} = req.body;
  const height_in_mtr = Number(height)*0.3048
  const BMI = Number(weight)/(height_in_mtr)**2
  const new_bmi = new BmiModel({
    BMI,
    height: height_in_mtr,
    weight,
    user_id 
  })
  await new_bmi.save()
  res.send({BMI})
})

// GET BMI
app.get("/getcalculation" , authentication,async (req,res)=>{
  const {user_id} = req.body
  //to get user bmi details
  const all_bmi = await BmiModel.find({user_id : user_id})

  res.send({history : all_bmi})
})


//SERVER RUNNING
app.listen(PORT, async () => {
  try {
    await connection;
    console.log("Connection to DB success");
  } catch (error) {
    console.log("Connection to DB failed");
    console.log(error);
  }
  console.log("listening on PORT 8000");
});
