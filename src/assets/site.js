import {initAnalytics} from './analytics.js';
import {initForm} from './forms.js';
const config=JSON.parse(document.querySelector('#site-config').textContent);
const mobile=document.querySelector('.mobile-nav');
const media=matchMedia('(min-width:901px)');
function syncMenu(){mobile.open=media.matches;mobile.querySelector('.mobile-toggle').setAttribute('aria-expanded',String(mobile.open));}
syncMenu();media.addEventListener('change',syncMenu);
mobile.addEventListener('toggle',()=>mobile.querySelector('.mobile-toggle').setAttribute('aria-expanded',String(mobile.open)));
document.querySelectorAll('.services-nav').forEach(menu=>{
 menu.addEventListener('toggle',()=>menu.querySelector('summary').setAttribute('aria-expanded',String(menu.open)));
});
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 const services=document.querySelector('.services-nav');
 if(services.open){services.open=false;services.querySelector('summary').focus();}
 else if(!media.matches&&mobile.open){mobile.open=false;mobile.querySelector('summary').focus();}
});
document.addEventListener('click',e=>{
 const menu=document.querySelector('.services-nav');
 if(menu.open&&!menu.contains(e.target)){menu.open=false;}
 if(!media.matches&&mobile.open&&!e.target.closest('.main-nav'))mobile.open=false;
});
initAnalytics(config.analytics);initForm(config.form);
