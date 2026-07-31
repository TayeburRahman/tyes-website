const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tyes <hello@tyes.app>',
      to: 'tayebur.rahman@gmail.com', // Let's just use a dummy or standard email to see if it triggers a generic error like Unverified Sender
      subject: 'Test Email',
      html: '<p>Test email</p>',
    });
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testResend();
