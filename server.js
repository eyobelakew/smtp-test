const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send-test', async (req, res) => {
  const {
    host,
    port,
    secure,
    user,
    pass,
    from,
    to,
    subject,
    message
  } = req.body || {};

  if (!host || !port || !to) {
    return res.status(400).json({
      error: 'Host, port, and receiver email are required.'
    });
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Boolean(secure),
    auth: user && pass ? { user, pass } : undefined
  });

  const mailOptions = {
    from: from || user || 'smtp-tester@example.com',
    to,
    subject: subject || 'SMTP Test Message',
    text:
      message ||
      `SMTP test message sent at ${new Date().toISOString()} from smtp-test tool.`
  };

  try {
    await transporter.verify();
  } catch (err) {
    return res.status(400).json({
      error: `Unable to connect to SMTP server: ${err.message}`
    });
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    return res.json({
      message: 'Test email sent successfully.',
      messageId: info.messageId
    });
  } catch (err) {
    return res.status(500).json({
      error: `Failed to send email: ${err.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`SMTP tester available at http://localhost:${PORT}`);
});
