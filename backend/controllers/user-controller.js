const User = require("../model/User.js")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const crypto = require('crypto');


const getAllUsers = async (req, res) => {
  let users;
  try {
    users = await User.find({});

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  if (!users) {
    return res.status(404).json({ message: 'No users found' });
  }
  res.status(200).json({ users });
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Prepare user object to send in response
    const userToSend = {
      _id: user._id,
      name: user.name,
      email: user.email
    };

    return res.status(201).json({ user: userToSend, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while saving user' });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

    let existingUser;
    try {
      existingUser = await User.findOne({ email });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error while logging in' });
    }

    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Prepare user object to send in response
    const userToSend = {
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email
    };

    return res.status(200).json({ message: 'Logged in successfully', user: userToSend, token });

}


// const signup = async (req, res) => {
//   const { name, email, hashedPassword, salt } = req.body;

//   try {
//     let existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(422).json({ message: 'User already exists' });
//     }

//     const user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       salt: salt
//     });
    

//     await user.save();
//     const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     const userToSend = {
//       _id: user._id,
//       name: user.name,
//       email: user.email
//     };

//     return res.status(201).json({ user: userToSend, token });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Server error while saving user' });
//   }
// };



// const login = async (req, res) => {
//   const { email, hashedPassword } = req.body;

//   try {
//       const existingUser = await User.findOne({ email });
//       if (!existingUser) {
//           return res.status(401).json({ message: 'Invalid credentials' });
//       }

//       // Log the salt and password details
//       console.log('Stored salt:', existingUser.salt);
//       console.log('Received hashed password:', hashedPassword);

//       // Recreate the hash using the provided hashed password and stored salt
//       const recreatedHash = crypto.pbkdf2Sync(hashedPassword, existingUser.salt, 1000, 64, 'sha512').toString('hex');

//       console.log('Recreated hash:', recreatedHash);
//       console.log('Stored hashed password:', existingUser.password);

//       if (recreatedHash !== existingUser.password) {
//           return res.status(401).json({ message: 'Invalid credentials' });
//       }

//       const token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

//       const userToSend = {
//           _id: existingUser._id,
//           name: existingUser.name,
//           email: existingUser.email
//       };

//       return res.status(200).json({ message: 'Logged in successfully', user: userToSend, token });
//   } catch (err) {
//       console.error(err);
//       return res.status(500).json({ message: 'Server error during login' });
//   }
// };

module.exports = { getAllUsers, signup, login };