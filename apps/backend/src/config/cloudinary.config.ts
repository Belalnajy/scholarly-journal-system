import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryConfig = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  
  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL is not defined in environment variables');
  }

  // Cloudinary automatically configures itself from CLOUDINARY_URL
  cloudinary.config({
    secure: true, // Always use HTTPS
  });

  return cloudinary;
};

export default cloudinary;
