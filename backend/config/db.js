const mongoose = require("mongoose");

exports.connectToDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("DB connected: " + connection.connection.host);
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit process with failure
    }
};
