import {track} from './analytics.js';
export function initForm(config){
 const form=document.querySelector('#contact-form');if(!form)return;
 const status=form.querySelector('#form-status');const errors=form.querySelector('#form-errors');const submit=form.querySelector('[type="submit"]');
 form.noValidate=true;
 if(!config.endpoint){form.addEventListener('submit',e=>{e.preventDefault();status.textContent='Sending is unavailable. No form provider is configured and no message was sent.';});return;}
 let started=false,pending=false,completed=false;
 form.addEventListener('input',()=>{if(!started){started=true;track('contact_form_start');}});
 function validate(){
  errors.replaceChildren();errors.className='';
  const fields=[...form.querySelectorAll('input:not([type="hidden"]),select,textarea')].filter(f=>f.willValidate&&f.name!=='company_url');
  const invalid=[];
  for(const f of fields){
   document.querySelector('#'+f.id+'-error')?.remove();f.removeAttribute('aria-invalid');
   const helps=f.id==='message'?'message-help':'';if(helps)f.setAttribute('aria-describedby',helps);else f.removeAttribute('aria-describedby');
   if(f.type!=='checkbox'&&f.required&&!f.value.trim())f.setCustomValidity('Please complete this field.');else f.setCustomValidity('');
   if(!f.checkValidity()){
    invalid.push(f);f.setAttribute('aria-invalid','true');const note=document.createElement('p');note.className='field-error';note.id=f.id+'-error';note.textContent=f.type==='checkbox'?'Please confirm that you have read the privacy notice.':f.type==='email'?'Enter a valid email address.':f.type==='url'?'Enter a complete URL starting with https:// or http://.':f.id==='message'?'Please provide at least 20 characters of context.':'Please complete this field.';f.closest('.field').append(note);f.setAttribute('aria-describedby',[helps,note.id].filter(Boolean).join(' '));
   }
  }
  if(invalid.length){errors.className='error-summary';const p=document.createElement('p');p.textContent='Please check the highlighted fields before sending.';errors.append(p);const list=document.createElement('ul');for(const f of invalid){const li=document.createElement('li'),a=document.createElement('a');a.href='#'+f.id;a.textContent=form.querySelector('label[for="'+f.id+'"]')?.textContent||'Privacy notice';li.append(a);list.append(li);}errors.append(list);errors.focus();track('contact_form_submit_error');return false;}
  return true;
 }
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(pending||completed)return;
  if(!validate())return;
  if(form.elements.company_url.value){status.textContent='This submission could not be accepted. Please try again without automated form filling.';track('contact_form_submit_error');return;}
  pending=true;submit.disabled=true;submit.textContent='Sending…';status.textContent='Sending your inquiry. Please keep this page open.';
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
  try{
   const payload=Object.fromEntries(new FormData(form));
   const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal,credentials:'omit',referrerPolicy:'strict-origin-when-cross-origin'});
   const data=await response.json();
   if(!response.ok||data?.success!==true)throw new Error('Provider did not confirm delivery');
   completed=true;status.className='form-status form-success';status.textContent='Your inquiry was accepted by the contact provider. Thank you for sharing your project.';
   submit.textContent='Inquiry sent';form.reset();track('contact_form_submit_success');track('consultation_request');status.setAttribute('tabindex','-1');status.focus();
  }catch{
   status.textContent='We could not confirm your inquiry. It may not have been delivered. Check your connection or use a configured direct contact method before retrying.';track('contact_form_submit_error');submit.disabled=false;submit.textContent='Try sending again';
  }finally{clearTimeout(timeout);pending=false;}
 });
}
