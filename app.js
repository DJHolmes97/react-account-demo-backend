var express = require("express");
var bcrypt = require("bcrypt");
var bodyParser = require("body-parser");
const users = require("./data/data").userDB;
var logger = require("morgan");

var app = express();
const cors = require("cors");
app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

const jsonParser = bodyParser.json();
app.get("/", async (req, res) => {
  res.send("This should work maybe possibly!");
  console.log("IS this working at all?");
});

app.post("/register", jsonParser, async (req, res, next) => {
  console.log(req.body);
  try {
    let foundUser = users.find((data) => req.body.email === data.email);
    console.log("Checking for found user");

    if (!foundUser) {
      let hashPassword = await bcrypt.hash(req.body.password, 10);
      let newUser = {
        id: Date.now(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashPassword
      };
      users.push(newUser);
      console.log("User list", users);

      res.json({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      });
    } else {
      res.send(403, { error: "User already exists!" });
    }
  } catch (error) {
    next(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    let foundUser = users.find((data) => req.body.email === data.email);
    if (foundUser) {
      let submittedPass = req.body.password;
      let storedPass = foundUser.password;

      const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
      if (passwordMatch) {
        let usrname = foundUser.username;
        res.send(
          `<div align ='center'><h2>login successful</h2></div><br><br><br><div align ='center'><h3>Hello ${usrname}</h3></div><br><br><div align='center'><a href='./login.html'>logout</a></div>`
        );
      } else {
        res.send(
          "<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align ='center'><a href='./login.html'>login again</a></div>"
        );
      }
    } else {
      let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
      await bcrypt.compare(req.body.password, fakePass);

      res.send(
        "<div align ='center'><h2>Invalid email or password</h2></div><br><br><div align='center'><a href='./login.html'>login again<a><div>"
      );
    }
  } catch {
    res.send("Internal server error");
  }
});

var listener = app.listen(8080, function () {
  console.log("Listening on port " + listener.address().port);
});
