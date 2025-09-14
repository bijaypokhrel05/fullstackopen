const app = require("./app");
const config = require("./utils/config");
const logger = require("./utils/logger");
const mongoose = require('mongoose');

mongoose.connect(config.MONGODB_URL).then(() => {
    console.log("MongoDB is connected successfully!")
    app.listen(config.PORT, () => logger.info("Server running at port", config.PORT));
})
.catch(err => console.log("Error connecting to MongoDB:", err.message));

