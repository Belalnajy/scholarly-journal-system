const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dxcgmdbbs',
  api_key: '239981419569485',
  api_secret: 'SAI_t-S1JekbLOOtOcuoVdUnXrI'
});

// Generate signed URL
const publicId = 'research/pdfs/RES-2025-0881/RES-2025-0881';
const timestamp = Math.round(Date.now() / 1000) + 3600; // 1 hour from now

const signedUrl = cloudinary.url(publicId, {
  resource_type: 'raw',
  type: 'authenticated',
  secure: true,
  sign_url: true,
  expires_at: timestamp,
});

console.log('\n=== Cloudinary Signed URL Test ===\n');
console.log('Public ID:', publicId);
console.log('Expires at:', new Date(timestamp * 1000).toLocaleString());
console.log('\nSigned URL:');
console.log(signedUrl);
console.log('\n=== Test Complete ===\n');
