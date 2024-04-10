const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const database = require('./config/database');
const Movie = require('./models/movie');
const path = require('path');
const exphbs = require('express-handlebars');
//const { initialize, getAllMovies, addNewMovie, getMovieById, updateMovieById, deleteMovieById } = require('./config/database'); // Import all required functions
// Import functions from the appropriate file
const { getAllMovies, addNewMovie, getMovieById, updateMovieById, deleteMovieById } = require('./models/movieService');

// Import the URL variable from database.js
const { initialize, url } = require('./config/database');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: 'true' }));
app.use(bodyParser.json());



// MongoDB connection
mongoose.connect(database.url) // Use the imported URL variable
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
    helpers: {
      replaceZeroWithNA: function (value) {
        return value === 0 ? "N/A" : value;
      },
      eq: function (a, b) {
        return a === b;
      }
    }
  }));

  app.set('view engine', '.hbs');
  app.set('views', path.join(__dirname, 'views'));

  // All the API Endpoints below

  app.get('/', async (req, res) => {
    console.log("Welcome");
    res.render('index'); // 'index.hbs' from the views directory
  });

  app.get('/api/movies', async (req, res) => {
    try {
        const { page = 1, perPage = 10, title } = req.query;
        const movies = await getAllMovies(parseInt(page), parseInt(perPage), title);
        res.render('movie', { movies }); // Render the 'movie.hbs' template with movie data
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error' });
    }
});

//



  app.post('/api/movies', async (req, res) => {
    try {
      const movieData = req.body;
      const newMovie = await addNewMovie(movieData);
      res.status(201).send(newMovie);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to create movie' });
    }
  });

  app.get('/api/movies/:id', async (req, res) => {
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

  app.put('/api/movies/:id', async (req, res) => {
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

  app.delete('/api/movies/:id', async (req, res) => {
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
