import mongoose from "mongoose";

function dbConnection() {
    mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log("Database Connected Sccessfully");
    }).catch((error) => {
        console.log(error);
    })
};

export default dbConnection;