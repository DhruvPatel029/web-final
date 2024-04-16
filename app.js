// Load necessary modules
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const exphbs = require('express-handlebars');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const session = require('express-session'); // Add this line
const { initialize, url } = require('./config/database');
const { getAllMovies, addNewMovie, getMovieById, updateMovieById, deleteMovieById } = require('./models/movieService');
const User = require('./models/user');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false })); // Initialize session middleware

// MongoDB connection
mongoose.connect(url)
  .then(() => {
    console.log('MongoDB connected');
    // Start the server once MongoDB is connected
    startServer();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Function to start the server
function startServer() {
  app.use(express.static(path.join(__dirname, "public")));

  // Set Handlebars as the view engine
  app.engine(".hbs", exphbs.engine({
    extname: ".hbs",

  }));
  app.set('view engine', '.hbs');
  app.set('views', path.join(__dirname, 'views'));

  // Middleware function to verify JWT token
  function verifyToken(req, res, next) {
    // Get token from session
    const token = req.session.token;

    // Check if token is present
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded; // Attach user information to request object
      next(); // Move to the next middleware
    } catch (error) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
  }

  // Authentication routes
  app.get('/api/register', async (req, res) => {
    res.render('register'); // Render the register.hbs template
  });

  app.post('/api/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if the username or email already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });

      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/login', async (req, res) => {
    res.render('login'); // Render the login.hbs template
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check if the user exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

      // Set the token in the session
      req.session.token = token;

      // Redirect to the search page after successful login
      res.redirect('/api/search');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Search route
  app.get('/api/search', verifyToken, async (req, res) => {
    try {
      // Example search functionality
      const { page = 1, perPage = 10, title } = req.query;
      const { movies } = await getAllMovies(parseInt(page), parseInt(perPage), title);
      res.render('search', { movies }); // Render the search.hbs template with movie data
    } catch (error) {
      console.error('Error in search route:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // API Endpoints

  // Home route
  app.get('/', async (req, res) => {
    console.log("Welcome");
    res.render('index'); // Render the index.hbs template
  });

  // Get all movies
  app.get('/api/movies', verifyToken, async (req, res) => {
    try {
      const { page = 1, perPage = 10, title } = req.query;
      const { movies } = await getAllMovies(parseInt(page), parseInt(perPage), title);
      res.render('movie', { movies }); // Render the movie.hbs template with movie data
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  // Add a new movie
  app.post('/api/movies', verifyToken, async (req, res) => {
    try {
      const movieData = req.body;
      const newMovie = await addNewMovie(movieData);
      res.status(201).send(newMovie);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to create movie' });
    }
  });

  // Get a movie by ID
  app.get('/api/movies/:id', verifyToken, async (req, res) => {
    try {
      const movie = await getMovieById(req.params.id);
      if (!movie) {
        return res.status(404).send({ error: 'Movie not found' });
      }
      res.send(movie);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  // Update a movie by ID
  app.put('/api/movies/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { ...updateData } = req.body;
      const updatedMovie = await updateMovieById(id, updateData);
      if (!updatedMovie) {
        return res.status(404).send({ error: 'Movie not found' });
      }
      res.send(updatedMovie);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  // Delete a movie by ID
  app.delete('/api/movies/:id', verifyToken, async (req, res) => {
    try {
      const deletedMovie = await deleteMovieById(req.params.id);
      if (!deletedMovie) {
        return res.status(404).send({ error: 'Movie not found' });
      }
      res.send(deletedMovie);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  // Start listening on port
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
