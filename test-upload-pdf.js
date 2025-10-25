const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dxcgmdbbs',
  api_key: '239981419569485',
  api_secret: 'SAI_t-S1JekbLOOtOcuoVdUnXrI'
});

// Create a dummy PDF file for testing
const createDummyPDF = () => {
  const pdfPath = path.join(__dirname, 'test-dummy.pdf');
  // Simple PDF header
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
306
%%EOF`;
  
  fs.writeFileSync(pdfPath, pdfContent);
  return pdfPath;
};

async function testUpload() {
  console.log('\n=== Cloudinary PDF Upload Test ===\n');
  
  try {
    // Create dummy PDF
    const pdfPath = createDummyPDF();
    console.log('✅ Created dummy PDF:', pdfPath);
    
    const researchNumber = 'RES-TEST-' + Date.now();
    
    // Test 1: Upload with type: 'upload' (public)
    console.log('\n--- Test 1: Upload with type: "upload" (public) ---');
    const result1 = await cloudinary.uploader.upload(pdfPath, {
      folder: `research/pdfs/${researchNumber}`,
      resource_type: 'raw',
      public_id: researchNumber,
      type: 'upload',
      format: 'pdf'
    });
    
    console.log('Upload Result:');
    console.log('- Public ID:', result1.public_id);
    console.log('- Secure URL:', result1.secure_url);
    console.log('- Type:', result1.type);
    console.log('- Resource Type:', result1.resource_type);
    console.log('- Format:', result1.format);
    
    // Test accessing the URL
    console.log('\n--- Testing URL Access ---');
    console.log('URL:', result1.secure_url);
    
    const https = require('https');
    const testUrl = result1.secure_url;
    
    https.get(testUrl, (res) => {
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS! File is publicly accessible!');
      } else {
        console.log('❌ FAILED! Status:', res.statusCode);
      }
      
      // Cleanup
      fs.unlinkSync(pdfPath);
      console.log('\n✅ Test completed and cleaned up');
    }).on('error', (err) => {
      console.error('❌ Error accessing URL:', err.message);
      fs.unlinkSync(pdfPath);
    });
    
  } catch (error) {
    console.error('❌ Upload Error:', error.message);
    console.error('Full Error:', error);
  }
}

testUpload();
