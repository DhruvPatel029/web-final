const mongoose = require('mongoose');

// Define the schema for the movie
const movieSchema = new mongoose.Schema({
    plot: String,
    genres: [String],
    runtime: Number,
    cast: [String],
    num_mflix_comments: Number,
    poster: String,
    title: String,
    lastupdated: Date,
    languages: [String],
    released: Date,
    directors: [String],
    rated: String,
    awards: {
        wins: Number,
        nominations: Number,
        text: String
    },
    imdb: {
        rating: Number,
        votes: Number,
        id: Number
    },
    countries: [String],
    type: String,
    tomatoes: {
        viewer: {
            meter: Number,
            numReviews: Number,
            meterClass: String,
            meterScore: Number
        },
        dvd: Date,
        critic: {
            meter: Number,
            numReviews: Number,
            meterClass: String,
            meterScore: Number
        },
        lastUpdated: Date,
        rotten: Number,
        production: String,
        fresh: Number
    }
});

// Create the movie model
const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
