const app = require("./app");
const config = require("./utils/config");
const logger = require("./utils/logger");
const mongoose = require('mongoose');

mongoose.connect(config.MONGODB_URL).then(() => {
    console.log("MongoDB is connected successfully!")
    app.listen(config.PORT, () => logger.info("Server running at port", config.PORT));
})
.catch(err => console.log("Error connecting to MongoDB:", err.message));

// const startServer = async () => {
//   try {
//     await mongoose.connect(config.MONGODB_URL);
//     console.log("MongoDB is connected successfully!");

//     app.listen(config.PORT, () => {
//       logger.info("Server running at port", config.PORT);
//     });
//   } catch (err) {
//     console.error("Error connecting to MongoDB:", err.message);
//     process.exit(1); // optional: exit if DB connection fails
//   }
// };

// startServer();