// Import the Express application from the index.js file
const app = require('./index.js');

// Get the port number from the environment variables or use 3000 as a default
const port = process.env.PORT || 3000;

// Start the server on port 3000 and log a message to the console when the server starts
const server = app.listen(port, () => console.log(`Server is running on port ${port}`));

// Export the server object so it can be used in other modules
module.exports = server;