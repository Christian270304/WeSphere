import { Strategy as TwitterStrategy } from 'passport-twitter';
import passport from 'passport';
import User from '../models/model.js';

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL,
    includeEmail: true,
}))