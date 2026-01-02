import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'nm',
    api_key: process.env.CLOUDINARY_API_KEY || '0000',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
    secure: true,
});

export default cloudinary;
