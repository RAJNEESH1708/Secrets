require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
const encrypt = require("mongoose-encryption")

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));


mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect(
  "mongodb://localhost:27017/userDB",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
    } else {
      console.log("Error in DB connection: " + err);
    }
  }
);


// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});


const User = new mongoose.model("User",userSchema)

app.get('/', (req, res) => {
  res.render('home')
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', function (req, res) {
    
    const newUser = new User({
        email : req.body.username,
        password:req.body.password
    }) 
    
    newUser.save(function (err) {
        if(err)
          {
              console.log(err);
          }
          else{
              res.render("secrets")
          }
    })
})

app.post("/login", function (req, res) {
  
     User.findOne({
         email: req.body.username,
     },function (err,foundUser) {
         if(err)
         {console.log(err);}
         else{
             if(foundUser){
                 if(foundUser.password === req.body.password)
                 {
                     res.render("secrets")
                 }
                }
         }

     })
  
});
















app.listen(3000, function () {
  console.log("Server started on port 3000");
});

