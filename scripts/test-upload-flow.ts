import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
import * as path from 'path';

async function testUpload() {
    try {
        // 1. Login to get Token
        console.log('Authenticating...');
        const authResponse = await axios.post('http://0.0.0.0:3000/auth/login', {
            email: 'tononvalter@gmail.com',
            password: '12345678'
        });
        const token = authResponse.data.access_token;
        console.log('Authentication successful.');

        // 2. Upload Files
        // Paths inside the container (mapped to /usr/src/app)
        const files = [
            '/usr/src/app/MÓDULO 07.pdf',
            '/usr/src/app/Árvore do Cerrado a Ú_nica Verdade Possível (1).pdf'
        ];

        for (const filePath of files) {
            if (!fs.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                continue;
            }

            console.log(`\nUploading: ${path.basename(filePath)}...`);
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));
            formData.append('title', path.basename(filePath));
            formData.append('description', 'Test Description');

            try {
                const uploadResponse = await axios.post('http://0.0.0.0:3000/philosophies/upload', formData, {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Upload successful!');
                console.log('Extracted Rules Preview:');
                const rules = uploadResponse.data.extractedRules;

                if (rules && rules.length > 0) {
                    console.log(JSON.stringify(rules.slice(0, 3), null, 2)); // Show first 3 rules
                    console.log(`... and ${rules.length - 3} more rules.`);
                } else {
                    console.log('No rules extracted.');
                    console.log('Full Response:', JSON.stringify(uploadResponse.data, null, 2));
                }

            } catch (uploadError) {
                console.error(`Upload failed for ${path.basename(filePath)}:`, uploadError.response?.data || uploadError.message);
            }
        }

    } catch (error) {
        console.error('Test failed full error:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testUpload();
