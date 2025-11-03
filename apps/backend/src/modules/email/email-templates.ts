export const getEmailTemplate = (
  title: string,
  content: string,
  headerColor: string = '#093059'
) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
      direction: rtl;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      color: #333333;
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 15px;
    }
    .info-box {
      background-color: #f8f9fa;
      border-right: 4px solid ${headerColor};
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 8px 0;
      font-size: 15px;
    }
    .info-box strong {
      color: ${headerColor};
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: ${headerColor};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>مجلة البحوث والدراسات</strong></p>
      <p>نظام إدارة الأبحاث العلمية</p>
      <p style="margin-top: 15px; color: #999;">
        هذه رسالة تلقائية، يرجى عدم الرد عليها
      </p>
    </div>
  </div>
</body>
</html>
`;
