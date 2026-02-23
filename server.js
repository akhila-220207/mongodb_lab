import express from "express";
import mongoose from "mongoose";
import path from "path";
import bcrypt from "bcrypt";

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/ProjectDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.log("❌ MongoDB Connection Failed");
    console.log(err);
  });
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true   // 🔥 prevents duplicate
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", userSchema);

// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send("❌ All fields are required");
    }

    if (password.length < 6) {
      return res.status(400).send("❌ Password must be at least 6 characters");
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("❌ Email already registered");
    }

    // 🔐 Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user
    await User.create({ name, email, password: hashedPassword });

    res.send("✅ User Registered Successfully");

  } catch (error) {
    console.log("Signup Error:", error);
    res.status(500).send("Server Error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("❌ Email and Password required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("❌ Invalid email");
    }

    // 🔐 Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("❌ Invalid password");
    }

    res.json({ message: "Login Successful", name: user.name });

  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).send("Server Error");
  }
});



    


    
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});