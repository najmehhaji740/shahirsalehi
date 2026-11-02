import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const routes=JSON.parse(await fs.readFile('docs/routes.json','utf8'));
await fs.mkdir('.test-results',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext();const page=await context.newPage();
const failures=[];const log=[];const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404 (Not Found)'))errors.push(m.text());});
let external=[];context.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
for(const width of [360,1440]){
 await page.setViewportSize({width,height:1000});
 for(const route of routes){
  const response=await page.goto(base+route.path);assert.equal(response.status(),200,route.path);
  await page.locator('body').waitFor();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  if(overflow)failures.push(`${route.path} overflows at ${width}`);
 }
 log.push(`All ${routes.length} direct routes rendered without horizontal overflow at ${width}px.`);
}
for(const width of [375,768,1024]){
 await page.setViewportSize({width,height:950});
 for(const route of ['/','/services/','/services/google-ads/','/contact/','/insights/technical-seo-checklist/']){
  await page.goto(base+route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${route} at ${width}`);
 }
}
log.push('Representative home, hub, service, contact, and article layouts passed at 375, 768, and 1024px.');
for(const route of ['/','/about/','/services/','/services/seo/','/contact/','/insights/technical-seo-checklist/','/privacy-policy/']){
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+route);
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 for(const violation of results.violations)failures.push(`${route}: ${violation.id} (${violation.nodes.map(n=>n.target.join(' ')).join('; ')})`);
}
log.push('Automated WCAG 2 / 2.1 / 2.2 A and AA checks ran on seven representative page types.');
assert.deepEqual(external,[],'Default build requested external services');
await page.goto(base+'/contact/');assert.equal(await page.getByRole('button',{name:'Send your inquiry'}).isDisabled(),true);
await page.getByRole('button',{name:'Privacy preferences'}).click();await page.getByRole('checkbox',{name:'Analytics'}).check();await page.getByRole('button',{name:'Save preferences'}).click();
assert.equal(await page.locator('#consent-dialog').evaluate(d=>d.open),false);await page.reload();
await page.getByRole('button',{name:'Privacy preferences'}).click();assert.equal(await page.getByRole('checkbox',{name:'Analytics'}).isChecked(),true);await page.getByRole('button',{name:'Reject optional'}).click();await page.waitForLoadState();
log.push('Default tags inactive; inquiry sending disabled; consent choices persist and can be revoked.');
await page.setViewportSize({width:375,height:850});await page.goto(base+'/');
await page.locator('.mobile-toggle').focus();await page.keyboard.press('Enter');await page.locator('.services-nav > summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.services-nav').evaluate(d=>d.open),true);
await page.keyboard.press('Escape');assert.equal(await page.locator('.services-nav').evaluate(d=>d.open),false);await page.keyboard.press('Escape');assert.equal(await page.locator('.mobile-nav').evaluate(d=>d.open),false);
await page.getByRole('button',{name:'Privacy preferences'}).click();await page.keyboard.press('Escape');assert.equal(await page.locator('#consent-dialog').evaluate(d=>d.open),false);
await page.locator('.mobile-toggle').click();const mobileResults=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();for(const v of mobileResults.violations)failures.push('Mobile menu: '+v.id);
log.push('Keyboard mobile menu, nested services menu, Escape handling, and privacy dialog checked.');
await page.goto(base+'/');await page.screenshot({path:'.test-results/home-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1100});await page.reload();await page.screenshot({path:'.test-results/home-desktop.png',fullPage:true});
const missing=await page.goto(base+'/this-page-does-not-exist/');assert.equal(missing.status(),404);await page.getByRole('heading',{name:'This page isn’t here.'}).waitFor();
assert.equal((await context.request.get(base+'/services/website-design/',{maxRedirects:0})).status(),301);
log.push('Unknown URL returns HTTP 404 with the custom page; legacy alias returns 301.');
const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});const nj=await nojs.newPage();await nj.goto(base+'/');assert.equal(await nj.getByRole('link',{name:'Home',exact:true}).first().isVisible(),true);await nj.locator('.services-nav > summary').click();assert.equal(await nj.getByRole('link',{name:'SEO',exact:true}).first().isVisible(),true);await nojs.close();
log.push('Core navigation and service links work with JavaScript disabled.');
// Test future provider integration with explicit fixtures. These are not live delivery tests.
const fixture=await browser.newContext();const fp=await fixture.newPage();let sent=0;let answer='error';
await fixture.route('**/contact/',async route=>{const response=await route.fetch();let html=await response.text();const match=html.match(/<script type="application\/json" id="site-config">([\s\S]*?)<\/script>/);const cfg=JSON.parse(match[1]);cfg.form={endpoint:'/test-contact',provider:'Test fixture'};html=html.replace(match[1],JSON.stringify(cfg)).replace('data-configured="false"','data-configured="true"').replace('type="submit" disabled','type="submit"');await route.fulfill({response,body:html});});
await fixture.route('**/test-contact',async route=>{sent++;await new Promise(resolve=>setTimeout(resolve,200));await route.fulfill({status:answer==='error'?503:200,contentType:'application/json',body:JSON.stringify({success:answer==='success'})});});
await fp.goto(base+'/contact/');await fp.getByRole('button',{name:'Send your inquiry'}).click();assert.equal(sent,0);assert.equal(await fp.locator('#name').getAttribute('aria-invalid'),'true');
await fp.locator('#name').fill('Test Person');await fp.locator('#email').fill('invalid');await fp.locator('#interest').selectOption('seo');await fp.locator('#message').fill('A test inquiry for a website review.');await fp.locator('#privacy').check();await fp.getByRole('button',{name:'Send your inquiry'}).click();assert.equal(sent,0);
await fp.locator('#email').fill('test@example.test');await fp.getByRole('button',{name:'Send your inquiry'}).click();await fp.getByRole('button',{name:'Try sending again'}).waitFor();assert.equal(sent,1);assert.match(await fp.locator('#form-status').textContent(),/could not confirm/);
answer='success';await fp.getByRole('button',{name:'Try sending again'}).click();assert.equal(await fp.getByRole('button',{name:'Sending…'}).isDisabled(),true);await fp.getByRole('button',{name:'Inquiry sent'}).waitFor();assert.equal(sent,2);assert.equal(await fp.getByRole('button',{name:'Inquiry sent'}).isDisabled(),true);assert.match(await fp.locator('#form-status').textContent(),/accepted/);
await fixture.close();log.push('Simulated provider only: invalid input sends nothing; error is truthful; acknowledged success and duplicate-submit prevention work.');
// A reviewed test GTM container, served locally by interception; no real vendor requests leave the browser.
const tracking=await browser.newContext();const tp=await tracking.newPage();let tags=0;
await tracking.route('**/about/',async route=>{const response=await route.fetch();let html=await response.text();const match=html.match(/<script type="application\/json" id="site-config">([\s\S]*?)<\/script>/);const cfg=JSON.parse(match[1]);cfg.analytics={mode:'gtm',gtmId:'GTM-TEST123',gtmContainerConsentReviewed:true};html=html.replace(match[1],JSON.stringify(cfg));const headers=response.headers();headers['content-security-policy']=headers['content-security-policy'].replace("script-src 'self'","script-src 'self' https://www.googletagmanager.com");await route.fulfill({response,headers,body:html});});
await tracking.route('https://www.googletagmanager.com/**',async route=>{tags++;await route.fulfill({status:200,contentType:'application/javascript',body:'window.__testContainerLoaded=true;'});});
await tp.goto(base+'/about/');assert.equal(tags,0);await tp.getByRole('checkbox',{name:'Analytics'}).check();await tp.getByRole('button',{name:'Save preferences'}).click();await tp.waitForFunction(()=>window.__testContainerLoaded);assert.equal(tags,1);
const consent=await tp.evaluate(()=>window.dataLayer.filter(x=>x[0]==='consent').map(x=>({...x[2]})));assert.equal(consent[0].analytics_storage,'denied');assert.equal(consent.at(-1).analytics_storage,'granted');assert.equal(consent.at(-1).ad_storage,'denied');
await tp.getByRole('button',{name:'Privacy preferences'}).click();await tp.getByRole('button',{name:'Reject optional'}).click();await tp.waitForLoadState();await tp.waitForTimeout(200);assert.equal(tags,1);assert.equal(await tp.evaluate(()=>window.__testContainerLoaded),undefined);await tracking.close();
log.push('Simulated GTM only: no tag before consent; analytics permission leaves ad consent denied; revocation reload prevents tag loading.');
assert.deepEqual(errors,[],'JavaScript or browser console errors');assert.deepEqual(failures,[],'Accessibility/layout failures');
await fs.writeFile('.test-results/browser.json',JSON.stringify({passed:true,checks:log,externalRequests:external,errors,failures},null,2));
console.log(log.map(x=>'PASS: '+x).join('\n'));await browser.close();
