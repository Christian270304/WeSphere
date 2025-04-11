import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import { User, AuthProvider } from "../models/models.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    "reddit",
    new OAuth2Strategy({
        authorizationURL: process.env.REDDIT_AUTH,
        tokenURL: process.env.REDDIT_ACCESS_TOKEN,
        clientID: process.env.REDDIT_ID,
        clientSecret: process.env.REDDIT_SECRET,
        callbackURL: process.env.REDDIT_CALLBACK,
        scope: 'identity', 
        state: true
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          const { id: redditId, name, email } = profile; 
          
          const authProvider = await AuthProvider.findOne({
            where: { provider_id: redditId, provider: "reddit" },
          });
  
          if (authProvider) {
            const existingUser = await User.findByPk(authProvider.user_id);
            return done(null, existingUser); 
          }
  
          const existingUserByEmail = await User.findOne({ where: { email } });
          if (existingUserByEmail) {
            return done(null, false, { message: "Ya existe un cuenta con este correo" });
          }
  
          let username = name;
          const existingUserByUsername = await User.findOne({ where: { username } });
          if (existingUserByUsername) {
            username += Math.floor(Math.random() * 1000); 
          }

          const user = await User.create({
            username,
            email,
            profile_picture: 1,
            banner: 2,
          });
  
          await AuthProvider.create({
            user_id: user.id,
            provider: "reddit",
            provider_id: redditId,
          });
  
          return done(null, user); 
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
  

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
  