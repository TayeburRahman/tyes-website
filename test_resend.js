const { Resend } = require('resend');
require('dotenv').config({ path: '.env' });
const resendApiKey = process.env.RESEND_API_KEY;
async function run() {
  const resend = new Resend(resendApiKey);
  const { data, error } = await resend.emails.send({
    from: 'Tyes <hello@tyes.com>',
    to: 'tayebur.rahman@example.com', // Fake to email for test
    subject: 'Test Email',
    html: '<p>Test</p>',
  });
  console.log('Result:', data, error);
}
run();
