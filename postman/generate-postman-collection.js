/**
 * Generate Postman Collection for My Journal API
 * Run: node generate-postman-collection.js
 */

const fs = require('fs');

const collection = {
  info: {
    name: 'My Journal API',
    description: 'Complete API collection for My Journal - Scientific Journal Management System\n\nDemo Accounts:\n- Admin: admin@demo.com / Demo@123\n- Editor: editor@demo.com / Demo@123\n- Reviewer: reviewer@demo.com / Demo@123\n- Researcher: researcher@demo.com / Demo@123',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  auth: {
    type: 'bearer',
    bearer: [
      {
        key: 'token',
        value: '{{token}}',
        type: 'string'
      }
    ]
  },
  item: [
    // Authentication
    {
      name: '🔐 Authentication',
      item: [
        {
          name: 'Login',
          event: [
            {
              listen: 'test',
              script: {
                exec: [
                  'if (pm.response.code === 200 || pm.response.code === 201) {',
                  '    const response = pm.response.json();',
                  '    pm.environment.set("token", response.access_token);',
                  '    pm.environment.set("user_id", response.user.id);',
                  '    console.log("✅ Token saved:", response.access_token.substring(0, 20) + "...");',
                  '    console.log("✅ User ID saved:", response.user.id);',
                  '    console.log("👤 User:", response.user.name, "-", response.user.role);',
                  '}'
                ],
                type: 'text/javascript'
              }
            }
          ],
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                email: 'admin@demo.com',
                password: 'Demo@123'
              }, null, 2)
            },
            url: {
              raw: '{{base_url}}/auth/login',
              host: ['{{base_url}}'],
              path: ['auth', 'login']
            },
            description: '🔑 Login with email and password. Returns JWT token and user info.\n\n**Demo Accounts:**\n- admin@demo.com / Demo@123\n- editor@demo.com / Demo@123\n- reviewer@demo.com / Demo@123\n- researcher@demo.com / Demo@123'
          }
        }
      ]
    },
    
    // Users
    {
      name: '👥 Users',
      item: [
        {
          name: 'Register User (Public)',
          request: {
            auth: { type: 'noauth' },
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                email: 'newuser@example.com',
                password: 'Password@123',
                name: 'New User',
                role: 'researcher',
                phone: '0123456789',
                affiliation: 'University Name',
                specialization: 'Computer Science'
              }, null, 2)
            },
            url: { raw: '{{base_url}}/users', host: ['{{base_url}}'], path: ['users'] },
            description: '📝 Public endpoint to register a new user'
          }
        },
        {
          name: 'Get All Users',
          request: {
            method: 'GET',
            url: { raw: '{{base_url}}/users', host: ['{{base_url}}'], path: ['users'] },
            description: '📋 Get all users (Admin/Editor only)'
          }
        },
        {
          name: 'Get User by ID',
          request: {
            method: 'GET',
            url: { raw: '{{base_url}}/users/{{user_id}}', host: ['{{base_url}}'], path: ['users', '{{user_id}}'] },
            description: '👤 Get user by ID'
          }
        },
        {
          name: 'Update User',
          request: {
            method: 'PATCH',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ name: 'Updated Name', status: 'active' }, null, 2)
            },
            url: { raw: '{{base_url}}/users/{{user_id}}', host: ['{{base_url}}'], path: ['users', '{{user_id}}'] },
            description: '✏️ Update user (Admin/Editor only)'
          }
        }
      ]
    },
    
    // Research
    {
      name: '📚 Research',
      item: [
        {
          name: 'Create Research',
          event: [
            {
              listen: 'test',
              script: {
                exec: [
                  'if (pm.response.code === 201) {',
                  '    const response = pm.response.json();',
                  '    pm.environment.set("research_id", response.id);',
                  '    console.log("✅ Research ID saved:", response.id);',
                  '}'
                ],
                type: 'text/javascript'
              }
            }
          ],
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                user_id: '{{user_id}}',
                title: 'Test Research Title',
                abstract: 'This is a test research abstract...',
                keywords: 'AI, Machine Learning, Deep Learning',
                specialization: 'Computer Science',
                authors: 'Dr. John Doe, Dr. Jane Smith',
                status: 'under-review'
              }, null, 2)
            },
            url: { raw: '{{base_url}}/research', host: ['{{base_url}}'], path: ['research'] },
            description: '📝 Create new research (Researcher/Admin/Editor)'
          }
        },
        {
          name: 'Get All Research',
          request: {
            method: 'GET',
            url: {
              raw: '{{base_url}}/research?status=under-review',
              host: ['{{base_url}}'],
              path: ['research'],
              query: [
                { key: 'user_id', value: '{{user_id}}', disabled: true },
                { key: 'status', value: 'under-review' },
                { key: 'specialization', value: 'Computer Science', disabled: true }
              ]
            },
            description: '📋 Get all research with optional filters'
          }
        },
        {
          name: 'Get Research by ID',
          request: {
            method: 'GET',
            url: { raw: '{{base_url}}/research/{{research_id}}', host: ['{{base_url}}'], path: ['research', '{{research_id}}'] },
            description: '📄 Get research by ID'
          }
        },
        {
          name: 'Upload Research PDF',
          request: {
            method: 'POST',
            body: {
              mode: 'formdata',
              formdata: [
                { key: 'file', type: 'file', src: [] }
              ]
            },
            url: { raw: '{{base_url}}/research/{{research_id}}/upload-pdf', host: ['{{base_url}}'], path: ['research', '{{research_id}}', 'upload-pdf'] },
            description: '📤 Upload research PDF file to Cloudinary'
          }
        },
        {
          name: 'Get PDF View URL',
          request: {
            method: 'GET',
            url: { raw: '{{base_url}}/research/{{research_id}}/pdf-view-url', host: ['{{base_url}}'], path: ['research', '{{research_id}}', 'pdf-view-url'] },
            description: '🔗 Get signed URL to view PDF (valid for 1 hour)'
          }
        },
        {
          name: 'Update Research Status',
          request: {
            method: 'PATCH',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ status: 'approved' }, null, 2)
            },
            url: { raw: '{{base_url}}/research/{{research_id}}/status', host: ['{{base_url}}'], path: ['research', '{{research_id}}', 'status'] },
            description: '✅ Update research status (Admin/Editor only)'
          }
        }
      ]
    },
    
    // Reviews
    {
      name: '⭐ Reviews',
      item: [
        {
          name: 'Create Review',
          event: [
            {
              listen: 'test',
              script: {
                exec: [
                  'if (pm.response.code === 201) {',
                  '    const response = pm.response.json();',
                  '    pm.environment.set("review_id", response.id);',
                  '    console.log("✅ Review ID saved:", response.id);',
                  '}'
                ],
                type: 'text/javascript'
              }
            }
          ],
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                research_id: '{{research_id}}',
                reviewer_id: '{{user_id}}',
                comments: 'This is a comprehensive review...',
                rating: 4,
                recommendation: 'accept'
              }, null, 2)
            },
            url: { raw: '{{base_url}}/reviews', host: ['{{base_url}}'], path: ['reviews'] },
            description: '📝 Create new review (Reviewer only)'
          }
        },
        {
          name: 'Get Research Reviews',
          request: {
            method: 'GET',
            url: {
              raw: '{{base_url}}/reviews?research_id={{research_id}}',
              host: ['{{base_url}}'],
              path: ['reviews'],
              query: [{ key: 'research_id', value: '{{research_id}}' }]
            },
            description: '📋 Get all reviews for a research'
          }
        }
      ]
    },
    
    // Notifications
    {
      name: '🔔 Notifications',
      item: [
        {
          name: 'Get User Notifications',
          request: {
            method: 'GET',
            url: { raw: '{{base_url}}/notifications/user/{{user_id}}', host: ['{{base_url}}'], path: ['notifications', 'user', '{{user_id}}'] },
            description: '📬 Get all notifications for current user'
          }
        },
        {
          name: 'Get Unread Count',
          request: {
            method: 'GET',
            url: { raw: '{{base_url}}/notifications/user/{{user_id}}/unread-count', host: ['{{base_url}}'], path: ['notifications', 'user', '{{user_id}}', 'unread-count'] },
            description: '🔢 Get unread notifications count'
          }
        },
        {
          name: 'Mark as Read',
          request: {
            method: 'PATCH',
            url: { raw: '{{base_url}}/notifications/{{notification_id}}/read', host: ['{{base_url}}'], path: ['notifications', '{{notification_id}}', 'read'] },
            description: '✅ Mark notification as read'
          }
        },
        {
          name: 'Mark All as Read',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ user_id: '{{user_id}}' }, null, 2)
            },
            url: { raw: '{{base_url}}/notifications/mark-all-read', host: ['{{base_url}}'], path: ['notifications', 'mark-all-read'] },
            description: '✅ Mark all notifications as read'
          }
        }
      ]
    },
    
    // Site Settings
    {
      name: '⚙️ Site Settings',
      item: [
        {
          name: 'Get Public Settings',
          request: {
            auth: { type: 'noauth' },
            method: 'GET',
            url: { raw: '{{base_url}}/site-settings/public', host: ['{{base_url}}'], path: ['site-settings', 'public'] },
            description: '🌐 Get public site settings (no auth required)'
          }
        },
        {
          name: 'Get All Settings',
          request: {
            method: 'GET',
            url: { raw: '{{base_url}}/site-settings', host: ['{{base_url}}'], path: ['site-settings'] },
            description: '⚙️ Get all site settings (Admin/Editor only)'
          }
        },
        {
          name: 'Update Settings',
          request: {
            method: 'PATCH',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({
                site_name: 'My Journal',
                contact_email: 'contact@myjournal.com',
                maintenance_mode: false
              }, null, 2)
            },
            url: { raw: '{{base_url}}/site-settings', host: ['{{base_url}}'], path: ['site-settings'] },
            description: '✏️ Update site settings (Admin only)'
          }
        }
      ]
    }
  ]
};

// Write collection to file
fs.writeFileSync(
  'My-Journal-API.postman_collection.json',
  JSON.stringify(collection, null, 2)
);

console.log('✅ Postman collection generated successfully!');
console.log('📁 File: My-Journal-API.postman_collection.json');
console.log('\n📖 Import Instructions:');
console.log('1. Open Postman');
console.log('2. Click Import button');
console.log('3. Select My-Journal-API.postman_collection.json');
console.log('4. Select My-Journal-API.postman_environment.json');
console.log('5. Run "🔐 Authentication > Login" to get started!');
