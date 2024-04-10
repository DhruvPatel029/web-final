// database.js

const mongoose = require('mongoose');

// Define the MongoDB connection URL
const url = "mongodb+srv://bharajsimranjit:12345@cluster0.btdmkgh.mongodb.net/sample_mflix";

// Function to initialize the database connection
const initialize = async () => {
  try {
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = {
  initialize,
  url, // Export the URL variable
};
