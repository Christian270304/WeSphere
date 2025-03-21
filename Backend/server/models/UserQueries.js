import { User, Image } from '../models/models.js';


export const getUser = async (id) => {
    try {
      const user = await User.findOne({
        where: { id },
        include: [
          { model: Image, as: 'profileImage', attributes: ['url'], required: false },
          { model: Image, as: 'bannerImage', attributes: ['url'], required: false }
        ]
      });
      return user;
    } catch (err) {
      throw new Error(err);
    }
  }
  
  export const getUsers = async () => {
    try {
      return await User.findAll();
    } catch (err) {
      throw new Error(err);
    }
  }