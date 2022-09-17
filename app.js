var express = require("express");
var bcrypt = require("bcrypt");
var bodyParser = require("body-parser");
const users = require("./data/data").userDB;
var logger = require("morgan");

var app = express();
const cors = require("cors");
const { log } = require("debug/src/browser");
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
        password: hashPassword,
      };
      users.push(newUser);
      console.log("User list", users);

      res.send("Registered successfully!");
    } else {
      res.send(403, { error: "User already exists!" });
    }
  } catch (error) {
    next(error);
  }
});

app.post("/login", jsonParser, async (req, res) => {
  console.log(req);
  try {
    console.log("Step 1");
    let foundUser = users.find((data) => req.body.email === data.email);
    console.log("Step 2");
    if (foundUser) {
      console.log("Step 3");
      let submittedPass = req.body.password;
      let storedPass = foundUser.password;
      console.log("Step 4");

      const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
      console.log("Step 5");
      if (passwordMatch) {
        console.log(foundUser);
        res.json({
          id: foundUser.id,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          email: foundUser.email,
        });
      } else {
        console.log("Invalid login");
        res.send(403, { error: "Invalid email or password" });
      }
    } else {
      console.log("Step 10");
      let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
      console.log("Step 11");
      console.log(req.body);
      await bcrypt.compare(req.body.password, fakePass);
      console.log("Step 12");
      res.send(403, { error: "Invalid email or password!" });
      console.log("Step 13");
    }
  } catch {
    res.send("Internal server error");
  }
});

var listener = app.listen(8080, function () {
  console.log("Listening on port " + listener.address().port);
});
