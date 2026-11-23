import test from 'node:test';
import assert from 'node:assert/strict';
import {initContactFormValidation} from '../public/scripts/features/contact-validation.js';

test('contact allows an omitted project URL while retaining required fields and validating supplied links', () => {
 const fields=Object.fromEntries(Object.entries({name:'Test visitor',email:'audit@example.com',vacancy:'',message:'A project enquiry.'}).map(([id,value])=>[id,{value,addEventListener(){}}]));
 const button={disabled:true,classList:{toggle(){}}};
 const oldDocument=globalThis.document;
 globalThis.document={getElementById:id=>fields[id]||null};
 try {
  const validation=initContactFormValidation({},button,null);
  for(const value of ['', '   ', 'https://example.com/project', 'example.com/project']) {
   fields.vacancy.value=value;assert.equal(validation.validateAll(),true);assert.equal(button.disabled,false);
  }
  for(const value of ['not-a-url','not a valid link','javascript:alert(1)']) {
   fields.vacancy.value=value;assert.equal(validation.validateAll(),false);assert.equal(button.disabled,true);
  }
  fields.vacancy.value='';
  for(const key of ['name','email','message']) {
   const before=fields[key].value;fields[key].value='';assert.equal(validation.validateAll(),false);fields[key].value=before;
  }
  fields.email.value='not-an-email';assert.equal(validation.validateAll(),false);
 } finally { globalThis.document=oldDocument; }
});
