import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {logger} from '../utils/logger.js';

dotenv.config();

export async function connectDB(){
    const MONGO_URI = process.env.MONGO_URI

    try{
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.debug("MongoDB Connected");

    } catch (error){
        logger.error("MongoDB connection error:", error);
        process.exit(1);
    }
}