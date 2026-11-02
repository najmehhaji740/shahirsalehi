/* Consent is denied before any optional tag. Public IDs are validated, never secrets. */
const allowedEvents=new Set(['contact_form_start','contact_form_submit_success','contact_form_submit_error','contact_cta_click','email_link_click','phone_link_click','service_page_cta_click','consultation_request','download_click']);
const empty={analytics:false,marketing:false};
const key='ss-consent-v1';
let choices={...empty};
let settings={};
let memory=[];
let gtagLoaded=false;
let metaLoaded=false;
let gtmLoaded=false;
const id=(value,regex)=>typeof value==='string'&&regex.test(value)?value:'';
function currentStored(){try{const stored=JSON.parse(localStorage.getItem(key));if(stored?.version===1&&Number.isFinite(stored.timestamp)&&Date.now()-stored.timestamp<183*864e5&&stored.timestamp<=Date.now())return {analytics:stored.analytics===true,marketing:stored.marketing===true};}catch{}return null;}
function persist(next){try{localStorage.setItem(key,JSON.stringify({...next,version:1,timestamp:Date.now()}));return true;}catch{return false;}}
function script(src){const s=document.createElement('script');s.src=src;s.async=true;s.referrerPolicy='strict-origin-when-cross-origin';s.addEventListener('error',()=>{console.warn('An optional measurement service could not load.');});document.head.append(s);}
function gtag(){window.dataLayer=window.dataLayer||[];window.dataLayer.push(arguments);}
function consentState(){return {analytics_storage:choices.analytics?'granted':'denied',ad_storage:choices.marketing?'granted':'denied',ad_user_data:choices.marketing?'granted':'denied',ad_personalization:choices.marketing?'granted':'denied'};}
function initializeDefaults(){window.dataLayer=window.dataLayer||[];gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',false);}
function safeReferrer(){try{const u=new URL(document.referrer);return u.origin+u.pathname;}catch{return '';}}
function activate(){
 gtag('consent','update',consentState());
 const gtm=id(settings.gtmId,/^GTM-[A-Z0-9]+$/);
 if(settings.mode==='gtm'){
  if(gtm&&settings.gtmContainerConsentReviewed&&(choices.analytics||choices.marketing)&&!gtmLoaded){gtmLoaded=true;window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});script('https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(gtm));}
  return;
 }
 if(settings.mode!=='direct')return;
 const ga=choices.analytics?id(settings.ga4Id,/^G-[A-Z0-9]+$/):'';
 const ads=choices.marketing?id(settings.googleAdsId,/^AW-[0-9]+$/):'';
 if((ga||ads)&&!gtagLoaded){gtagLoaded=true;gtag('js',new Date());script('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ga||ads));}
 if(ga&&!memory.includes(ga)){memory.push(ga);gtag('config',ga,{send_page_view:false,page_location:location.origin+location.pathname,page_referrer:safeReferrer()});gtag('event','page_view',{page_location:location.origin+location.pathname,page_referrer:safeReferrer(),page_title:document.title,send_to:ga});}
 if(ads&&!memory.includes(ads)){memory.push(ads);gtag('config',ads,{send_page_view:false});}
 const pixel=choices.marketing?id(settings.metaPixelId,/^[0-9]+$/):'';
 if(pixel&&!metaLoaded){metaLoaded=true;const f=function(){f.callMethod?f.callMethod.apply(f,arguments):f.queue.push(arguments);};f.queue=[];f.loaded=true;f.version='2.0';f.push=f;window.fbq=f;window._fbq=f;script('https://connect.facebook.net/en_US/fbevents.js');f('consent','grant');f('init',pixel);f('track','PageView');}
}
export function track(name){
 if(!allowedEvents.has(name))return;
 const payload={event:name,page_path:location.pathname,page_type:document.body.dataset.pageType||'WebPage'};
 if(settings.mode==='gtm'&&gtmLoaded&&(choices.analytics||choices.marketing))window.dataLayer.push(payload);
 if(settings.mode==='direct'){
  const ga=choices.analytics?id(settings.ga4Id,/^G-[A-Z0-9]+$/):'';
  if(ga)gtag('event',name,{page_path:payload.page_path,page_type:payload.page_type,send_to:ga});
  const label=settings.googleAdsLabels?.[name];
  const ads=choices.marketing?id(settings.googleAdsId,/^AW-[0-9]+$/):'';
  if(ads&&typeof label==='string'&&/^[A-Za-z0-9_-]+$/.test(label))gtag('event','conversion',{send_to:ads+'/'+label});
  if(choices.marketing&&metaLoaded&&name==='contact_form_submit_success')window.fbq('track','Lead');
 }
}
export function initAnalytics(config){
 settings=config||{};
 initializeDefaults();
 const stored=currentStored();choices=stored||{...empty};activate();
 const dialog=document.querySelector('#consent-dialog');
 const analytics=dialog.querySelector('[name="analytics"]');
 const marketing=dialog.querySelector('[name="marketing"]');
 const hasTags=settings.mode==='gtm'?Boolean(id(settings.gtmId,/^GTM-[A-Z0-9]+$/)&&settings.gtmContainerConsentReviewed):settings.mode==='direct'&&Boolean(settings.ga4Id||settings.googleAdsId||settings.metaPixelId);
 if(hasTags)dialog.querySelector('.consent-note').textContent='Optional services are configured. Choose which categories you allow.';
 function open(){analytics.checked=choices.analytics;marketing.checked=choices.marketing;if(!dialog.open)dialog.showModal();}
 function save(next){
  const withdrawing=(choices.analytics&&!next.analytics)||(choices.marketing&&!next.marketing);
  if(!persist(next)){dialog.querySelector('.consent-note').textContent='This browser could not save your preferences. Optional tracking remains off.';choices={...empty};gtag('consent','update',consentState());if(withdrawing)location.reload();return;}
  choices=next;gtag('consent','update',consentState());dialog.close();
  if(withdrawing){if(window.fbq)window.fbq('consent','revoke');location.reload();return;}
  activate();
 }
 document.querySelectorAll('[data-consent-open]').forEach(b=>b.addEventListener('click',open));
 dialog.querySelector('[data-consent-reject]').addEventListener('click',()=>save({...empty}));
 dialog.querySelector('[data-consent-save]').addEventListener('click',()=>save({analytics:analytics.checked,marketing:marketing.checked}));
 if(!stored&&hasTags)open();
 document.addEventListener('click',event=>{
  const target=event.target.closest('[data-event]');if(!target)return;
  if(target.dataset.event==='contact_cta_click'&&document.body.dataset.pageType==='Service')track('service_page_cta_click');
  track(target.dataset.event);
 });
}
