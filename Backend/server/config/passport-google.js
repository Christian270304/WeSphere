import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { PostController } from "../controllers/PostController.js";
import { User, AuthProvider } from "../models/models.js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const { id: googleId, emails, displayName, photos } = profile;
      const email = emails[0].value;
  
      const authProvider = await AuthProvider.findOne({
        where: { provider_id: googleId, provider: "google" },
      });
  
      if (authProvider) {
        const existingUser = await User.findByPk(authProvider.user_id);
        return done(null, existingUser);
      }
  
      const existingUserByEmail = await User.findOne({ where: { email } });
      if (existingUserByEmail) {
        return done(null, false, { message: "Ja existeix un compte amb aquest correu" });
      }
  
      let username = displayName.split(' ')[0];
      const existingUserByUsername = await User.findOne({ where: { username } });
      if (existingUserByUsername) {
        username += Math.floor(Math.random() * 1000);
      }
  
      const pictureUrl = photos[0].value;
      const response = await fetch(pictureUrl);
      const imageBuffer = await response.buffer();
      const imageId = await PostController.uploadImage(imageBuffer, 'profile');
  
      const user = await User.create({
        username,
        email,
        profile_picture: imageId,
        banner: 2,
      });
  
      await AuthProvider.create({
        user_id: user.id,
        provider: "google",
        provider_id: googleId,
      });
  
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id); 
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  export default passport; 