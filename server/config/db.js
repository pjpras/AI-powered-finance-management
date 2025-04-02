const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        // Use environment variable instead of hardcoded connection string
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/financeDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    }
    catch(err){
        console.log('Database connection error:',err);
        process.exit(1);
    }
};

module.exports = connectDB;
