const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyBv0bQWTC_h3wJm8egyVI8zyqBxceR7XMM",
  authDomain: "virtualherbalgarden-5ff83.firebaseapp.com",
  projectId: "virtualherbalgarden-5ff83",
  storageBucket: "virtualherbalgarden-5ff83.firebasestorage.app",
  messagingSenderId: "233495344918",
  appId: "1:233495344918:web:84a4c7de258a2907788237",
  measurementId: "G-TLF4KVKTJ2"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const app = express();
app.use(express.json());
app.use(cors());

// Middleware to verify Firebase Auth Token
const verifyToken = async (req, res, next) => {
  console.log('Incoming request:', req.method, req.url, req.headers, req.body);
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    console.error('Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = await admin.auth().verifyIdToken(token);
    console.log('Verified user:', req.user);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Register API
app.post('/register', async (req, res) => {
  console.log('Register request:', req.body);
  const { email, password } = req.body;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User registered:', userCredential.user);
    res.json({ user: userCredential.user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login API
app.post('/login', async (req, res) => {
  console.log('Login request:', req.body);
  const { email, password } = req.body;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    console.log('User logged in:', userCredential.user);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Protected API
app.get('/protected', verifyToken, (req, res) => {
  console.log('Sending response for protected route:', { message: 'This is a protected route', user: req.user });
  res.json({ message: 'This is a protected route', user: req.user });
});

app.listen(3000, () => console.log('Server running on port 3000'));
