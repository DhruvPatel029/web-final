const Movie = require('../models/movie');

// Function to add a new movie to the database
const addNewMovie = async (movieData) => {
  try {
    const newMovie = new Movie(movieData);
    await newMovie.save();
    return newMovie;
  } catch (error) {
    console.error('Failed to create movie:', error);
    throw error;
  }
};

// Function to retrieve all movies with pagination and optional title filter
const getAllMovies = async (page, perPage, title) => {
  try {
    const query = title ? { title: { $regex: new RegExp(title, 'i') } } : {};
    const totalCount = await Movie.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);
    const skip = (page - 1) * perPage;
    const movies = await Movie.find(query).skip(skip).limit(perPage);
    return {
      movies,
      page,
      perPage,
      totalPages,
      totalCount
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

// Function to retrieve a movie by its ID
const getMovieById = async (id) => {
  try {
    return await Movie.findById(id);
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    throw error;
  }
};

// Function to update a movie by its ID
const updateMovieById = async (id, updateData) => {
  try {
    return await Movie.findByIdAndUpdate(id, updateData, { new: true });
  } catch (error) {
    console.error('Error updating movie by ID:', error);
    throw error;
  }
};

// Function to delete a movie by its ID
const deleteMovieById = async (id) => {
  try {
    return await Movie.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error deleting movie by ID:', error);
    throw error;
  }
};

module.exports = {
  addNewMovie,
  getAllMovies,
  getMovieById,
  updateMovieById,
  deleteMovieById
};
