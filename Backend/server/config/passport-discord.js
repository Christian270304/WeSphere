import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { User, AuthProvider } from "../models/models.js";
import { PostController } from "../controllers/PostController.js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

passport.use('discord',new DiscordStrategy({
  clientID: process.env.DISCORD_ID,
  clientSecret: process.env.DISCORD_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK,
  scope: ['identify', 'email']  
}, async (accessToken, refreshToken, profile, done) => {
  const { id: discordId, email, username, avatar } = profile;

  try {
    // Verificar si ya existe un registro con el provider_id (Discord ID)
    const authProvider = await AuthProvider.findOne({
      where: { provider_id: discordId, provider: "discord" },
    });

    // Si existe un registro de AuthProvider, ya existe el usuario
    if (authProvider) {
      const user = await User.findByPk(authProvider.user_id);
      return done(null, user);
    }

    // Verificar si ya existe un usuario con ese email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return done(null, false, { message: "Ya existe un usuario con ese correo" });
    }

    const pictureUrl = `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`;
    const response = await fetch(pictureUrl);
    const imageBuffer = await response.buffer();
    const imageId = await PostController.uploadImage(imageBuffer, 'profile');

    // Crear un nuevo usuario si no se encuentra uno existente
    const user = await User.create({
      username,
      email,
      profile_picture: imageId,
      banner: 2,
    });

    // Crear la relación en la tabla AuthProvider
    await AuthProvider.create({
      user_id: user.id,
      provider: "discord",
      provider_id: discordId,
    });

    // Devuelvo el usuario autenticado
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

// Serializar el usuario para almacenarlo en la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar el usuario usando el ID guardado en la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user); 
  } catch (err) {
    done(err, false);
  }
});

export default passport;
