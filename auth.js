import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.12.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.12.0/firebase-firestore.js';
const form=document.getElementById('residentAccessForm');
const status=document.getElementById('authStatus');
const mode=document.body.dataset.authMode;
const flatPattern=/^([A-F])?(00[1-4]|0?[1-9]0[1-4]|1[0-9]0[1-4])$/;
const show=(message,error=true)=>{status.textContent=message;status.dataset.tone=error?'error':'success';status.classList.add('is-visible');};
const setBusy=value=>form.querySelectorAll('input,button').forEach(el=>el.disabled=value);
function residentId(name,email){return `${name.replace(/\s+/g,'_')}_${email}`;}
function config(){const c=window.TEMPLE_FIREBASE_CONFIG;if(!c||c.projectId!=='ao-temple')throw new Error('The existing temple Firebase configuration is missing.');return c;}
form?.addEventListener('submit',async e=>{e.preventDefault();const flatNumber=form.elements.flatNumber.value.trim().toUpperCase(),residentName=form.elements.residentName.value.trim(),email=form.elements.email.value.trim();
 if(!flatNumber||!residentName||!email){show('Please complete all fields.');return;}if(!flatPattern.test(flatNumber)){show('Enter a valid flat number, for example A1404.');return;}if(!form.elements.email.validity.valid){show('Enter a valid email address.');return;}
 setBusy(true);show('Checking the existing resident records…',false);
 try{const db=getFirestore(initializeApp(config())),flatRef=doc(db,'users',flatNumber),flatSnap=await getDoc(flatRef);const id=residentId(residentName,email),residentRef=doc(db,'users',flatNumber,'residents',id),residentSnap=await getDoc(residentRef);
  if(mode==='register'){
   if(!flatSnap.exists())await setDoc(flatRef,{});
   if(residentSnap.exists()){show('This resident is already registered. Please sign in instead.');return;}
   await setDoc(residentRef,{name:residentName,email,signInTime:new Date().toISOString()});
   localStorage.setItem('flatNumber',flatNumber);localStorage.setItem('residentName',residentName);localStorage.setItem('email',email);localStorage.setItem('residentDocId',id);localStorage.setItem('input','true');location.href='terms.html';return;
  }
  if(!flatSnap.exists()){show('No flat record was found for this number.');return;}
  if(!residentSnap.exists()){show('No resident record matches this flat, name and email. Please check your details.');return;}
  localStorage.setItem('flatNumber',flatNumber);localStorage.setItem('residentName',residentName);localStorage.setItem('email',email);localStorage.setItem('residentDocId',id);localStorage.setItem('input','true');location.href='main.html';
 }catch(error){console.error('Resident access failed:',error);show('Could not connect to the temple resident database. Please try again.');}finally{setBusy(false);}
});
