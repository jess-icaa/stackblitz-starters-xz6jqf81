const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 3010;

app.use(express.json());
app.use(express.static('static'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB', error));

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.post('/api-register', async(req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password ) {
    return res.status(400).json({ message: 'All fields are required. '})
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const creatingHash = 10;
    const hashPassword = await bcrypt.hash(password, creatingHash);

    const newUser = new User({
      username,
      email,
      password: hashPassword
    });

    await newUser.save();

    return res.status(201).json({ message: 'User successfully created. '});
  } catch (error) {
    console.error('Error registering user: ', error);
    return res.status(500).json({ message: 'Internal server error.'});
  }
});

app.get('/api-users', async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users: ', error);
    return res.status(500).json({ message: 'Internal server error. '});
  }
});

// app.get('/', (req, res) => {
//   res.sendFile(resolve(__dirname, 'pages/index.html'));
// });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
