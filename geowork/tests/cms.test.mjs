import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,scryptSync} from 'node:crypto';
import {cleanBody,validateArticle} from '../src/server/cms-content.mts';
import {verifyLogin,issueCookie,isAuthenticated,sameOrigin,clearCookie} from '../src/server/cms-auth.mts';

test('content editor removes executable HTML and external images',()=>{
 const html=cleanBody('<h2>Safe content</h2><script>alert(1)</script><img src="https://evil.example/tracker.gif" onerror="alert(1)"><p onclick="alert(1)">Good text</p>');
 assert.match(html,/<h2>Safe content<\/h2>/);
 assert.doesNotMatch(html,/<script|onclick|onerror|evil\.example/i);
 assert.match(html,/Good text/);
});

test('article validation rejects published placeholders',()=>{
 assert.throws(()=>validateArticle({slug:'Hello There',title:'Title here',description:'A'.repeat(70),category:'AI Search',body_html:'<p>x</p>',status:'published'}));
 const article=validateArticle({
  slug:'real-article',title:'Useful new article',
  description:'A helpful and evidence-based introduction for readers.',
  category:'AI Search',body_html:'<p>'+('Important information. '.repeat(7))+'</p>',
  status:'published'
 });
 assert.equal(article.slug,'real-article');
 assert.equal(article.status,'published');
});

test('password and server-signed cookie require valid credentials',()=>{
 const salt=randomBytes(24).toString('hex'),pw='strong-example-not-real-password';
 process.env.CMS_ADMIN_EMAIL='editor@example.com';
 process.env.CMS_ADMIN_PASSWORD_HASH='scrypt:'+salt+':'+scryptSync(pw,salt,64).toString('hex');
 process.env.CMS_SESSION_SECRET=randomBytes(32).toString('hex');
 assert.equal(verifyLogin('editor@example.com',pw),true);
 assert.equal(verifyLogin('editor@example.com','wrong password'),false);
 assert.equal(verifyLogin('intruder@example.com',pw),false);
 const issued=issueCookie();
 assert.match(issued,/HttpOnly/);
 assert.match(issued,/Secure/);
 assert.match(issued,/SameSite=Strict/);
 const cookie=issued.split(';')[0];
 const req=new Request('https://geowork-preview.netlify.app/api/cms/posts',{
  headers:{cookie,origin:'https://geowork-preview.netlify.app'}
 });
 assert.equal(isAuthenticated(req),true);
 assert.equal(sameOrigin(req),true);
 const reqCross=new Request('https://geowork-preview.netlify.app/api/cms/posts',{
  headers:{cookie,origin:'https://attacker.example'}
 });
 assert.equal(sameOrigin(reqCross),false);
 assert.match(clearCookie(),/Max-Age=0/);
});
