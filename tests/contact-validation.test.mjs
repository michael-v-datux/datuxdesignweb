import test from 'node:test';
import assert from 'node:assert/strict';
import {initContactFormValidation} from '../public/scripts/features/contact-validation.js';

test('contact allows an omitted project URL while retaining required fields and validating supplied links', () => {
 const fields=Object.fromEntries(Object.entries({name:'Test visitor',email:'audit@example.com',vacancy:'',message:'A project enquiry.'}).map(([id,value])=>[id,{value,addEventListener(){},setAttribute(){}}]));
 const button={attributes:{},setAttribute(key,value){this.attributes[key]=value;},classList:{toggle(){}}};
 const oldDocument=globalThis.document;
 globalThis.document={getElementById:id=>fields[id]||null};
 try {
  const validation=initContactFormValidation({},button,null);
  for(const value of ['', '   ', 'https://example.com/project', 'example.com/project']) {
   fields.vacancy.value=value;assert.equal(validation.validateAll(),true);assert.equal(button.attributes['aria-disabled'],'false');
  }
  for(const value of ['not-a-url','not a valid link','javascript:alert(1)']) {
   fields.vacancy.value=value;assert.equal(validation.validateAll(),false);assert.equal(button.attributes['aria-disabled'],'true');
  }
  fields.vacancy.value='';
  for(const key of ['name','email','message']) {
   const before=fields[key].value;fields[key].value='';assert.equal(validation.validateAll(),false);fields[key].value=before;
  }
  fields.email.value='not-an-email';assert.equal(validation.validateAll(),false);
 } finally { globalThis.document=oldDocument; }
});

test('contact exposes errors after an empty-field blur or submit attempt and clears them after correction/reset', () => {
 const element=(value='')=>({
  value,attributes:{},listeners:{},hidden:true,focused:false,
  classList:{values:new Set(['hidden']),toggle(key,on){on?this.values.add(key):this.values.delete(key);},add(key){this.values.add(key);}},
  addEventListener(key,handler){this.listeners[key]=handler;},
  setAttribute(key,value){this.attributes[key]=value;},focus(){this.focused=true;},scrollIntoView(){}
 });
 const elements={};
 for(const key of ['name','email','vacancy','message']){elements[key]=element();elements[key+'-error']=element();}
 const summary=elements['contact-validation-summary']=element(),button=element();
 const oldDocument=globalThis.document;
 globalThis.document={getElementById:id=>elements[id]||null};
 try {
  const validation=initContactFormValidation({},button,null);
  assert.equal(button.attributes['aria-disabled'],'true');
  assert.equal(button.disabled,undefined,'Native disabled must not swallow requests for validation help');
  assert.equal(summary.hidden,true);
  assert.equal(elements.name.attributes['aria-invalid'],'false');
  elements.name.listeners.blur();
  assert.equal(elements.name.attributes['aria-invalid'],'true','An untouched blank field validates on blur');
  assert.equal(elements['name-error'].classList.values.has('hidden'),false);
  assert.equal(elements.email.attributes['aria-invalid'],'false');
  validation.markSubmitAttempt();assert.equal(validation.validateAll(),false);validation.focusFirstInvalid();
  assert.equal(elements.name.focused,true);assert.equal(summary.hidden,false);
  for(const key of ['name','email','message']){
   assert.equal(elements[key].attributes['aria-invalid'],'true');
   assert.equal(elements[key].attributes['aria-describedby'],`${key}-hint ${key}-error`);
  }
  assert.equal(elements.vacancy.attributes['aria-invalid'],'false','Omitted optional URL must not be highlighted');
  Object.assign(elements.name,{value:'Visitor'});Object.assign(elements.email,{value:'visitor@example.com'});Object.assign(elements.message,{value:'A project enquiry.'});
  assert.equal(validation.validateAll(),true);assert.equal(button.attributes['aria-disabled'],'false');assert.equal(summary.hidden,true);
  for(const key of ['name','email','message']){assert.equal(elements[key].attributes['aria-invalid'],'false');assert.equal(elements['name-error'].classList.values.has('hidden'),true);elements[key].value='';}
  validation.resetValidationState();assert.equal(summary.hidden,true);assert.equal(elements.name.attributes['aria-invalid'],'false');assert.equal(button.attributes['aria-disabled'],'true');
 } finally {globalThis.document=oldDocument;}
});
