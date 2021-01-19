require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

// const encrypt = require("mongoose-encryption")

//const md5 = require("md5");

// const bcrypt = require("bcrypt");
// const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

app.use(
  session({
    secret: "This is secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());



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
        unique:true
    },
    password:{
        type:String,
    },
});

// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });

userSchema.plugin(passportLocalMongoose);



const User = new mongoose.model("User",userSchema)


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res) => {
  res.render('home')
})
app.get('/login', (req, res) => {
  res.render('login')
})
app.get('/register', (req, res) => {
  res.render('register')
})
app.get('/secrets', (req, res) => {
  if(req.isAuthenticated())
  {
      res.render('secrets')
  }
  else{
      res.redirect('/login')
  }
})

app.get('/logout', function (req, res) {
    req.logout()
    res.redirect('/')
})


app.post('/register', function (req, res) {

 User.register({username:req.body.username}, req.body.password, function(err, user) {
  if (err) { 
      console.log(err);
      res.redirect('/register')
   }
   else{
    passport.authenticate('local')(req,res, function () {
        res.redirect('/secrets')
    });
   }

 
});
    
//    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
//         const newUser = new User({
//           email: req.body.username,
//           password: hash,
//         }); 
//          newUser.save(function (err) {
//            if (err) {
//              console.log(err);
//            } else {
//              res.render("secrets");
//            }
//          });
//       });
  
   
})

app.post("/login", function (req, res) {

      const user = new User({
        username: req.body.username,
        password: req.body.password,
      });


    req.login(user, function (err) {
      if (err) {
        console.log(err);
      }
      else{
         passport.authenticate("local")(req, res, function () {
           res.redirect("/secrets");
           });
      }
    });
  
    //  User.findOne({
    //      email: req.body.username,
    //  },function (err,foundUser) {
    //      if(err)
    //      {console.log(err);}
    //      else{
    //          if(foundUser){
    //                  bcrypt.compare(
    //                    req.body.password,
    //                    foundUser.password,
    //                    function (err, result) {
    //                        if(result===true)
    //                      res.render("secrets");
    //                    }
    //                  );
    //             }
    //      }

    //  })
  
});







app.listen(3000, function () {
  console.log("Server started on port 3000");
});

