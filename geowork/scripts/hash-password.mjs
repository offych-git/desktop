import { randomBytes, scryptSync } from 'node:crypto';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
const rl = readline.createInterface({input,output});
try {
  const password = await rl.question('Choose a unique CMS password (at least 12 characters): ');
  if (password.length < 12) { console.error('Password must be at least 12 characters.'); process.exitCode=1; }
  else {
    const salt = randomBytes(24).toString('hex');
    const hash = scryptSync(password,salt,64).toString('hex');
    console.log('\nSet CMS_ADMIN_PASSWORD_HASH in Netlify environment variables to:');
    console.log('scrypt:'+salt+':'+hash);
    console.log('\nAlso set CMS_ADMIN_EMAIL and random CMS_SESSION_SECRET.');
  }
} finally { rl.close(); }
