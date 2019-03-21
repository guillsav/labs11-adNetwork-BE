const route = require("express").Router();
const bcrypt = require("bcryptjs");
const models = require("../../common/helpers");
const { genToken } = require("../../common/authentication");

const validateLogin = require("../../validation/loginValidation")
const validateRegister = require("../../validation/registerValidation")



// @route    GET api/users
// @desc     get all users for testing
// @Access   Public
route.get("/", async (req, res) => {
  const users = await models.get("users");
  res.status(200).json(users);
});


// @route    GET /api/users/register
// @desc     register user
// @Access   Public
route.post("/register", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    acct_type,
    image_url,
    oauth_token
  } = req.body;
  // const { errors, isValid } = validateRegister({ email, first_name, last_name, phone, acct_type });
  // if (!isValid) {
  //   return res.status(422).json(errors);
  // }
  try {
    if (!first_name || !last_name || !email || !phone || !acct_type)
      return res.status(422).json({ message: "All fields required" });

    if (!password && !oauth_token)
      return res
        .status(500)
        .json({
          message:
            "you must sign up using a password or some other social network"
        });
    const hash = password ? bcrypt.hashSync(password, 14) : null;

    const user = await models.findBy("users", { email });

    if (user) return res.status(409).json({ message: "User already exists" });

    const [id] = await models.add("users", {
      first_name,
      last_name,
      email,
      password: oauth_token ? null : hash,
      phone,
      acct_type,
      image_url,
      oauth_token
    });

    const newUser = await models.findBy("users", { id });
    delete newUser.password;

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// @route    GET /api/users/login
// @desc     login user
// @Access   Public
route.post("/login", async (req, res) => {
  const { email, password, oauth_token } = req.body;

  const { errors, isValid } = validateLogin({ email });
  if (!isValid) {
    return res.status(422).json(errors);
  }

  try {
    const user = await models.findBy("users", { email });

    if (oauth_token) {
      const oauth_user = await models.findBy("users", { oauth_token });
      if (oauth_user) return res.json(oauth_user);
    }

    if (!user) return res.status(404).json({ message: "User does not exist" });

    const correct = bcrypt.compareSync(password, user.password);

    if (!correct)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = await genToken(user);

    if (!token) return res.status(500).json({ message: "Server error" });

    delete user.password;

    res.json({ user, token });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = route;
