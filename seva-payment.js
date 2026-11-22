(function () {
  const UPI_ID = '0798062a0170493.bqr@kotak';
  const PAYEE = 'ARVIND OASIS APARTMENTS OWNERS ASSOCIATION TEMPLE';
  const FIREBASE_CONFIG = { apiKey: 'AIzaSyBKtqm0KzMmX4cCqT3PhGI2aFcF3LSXnEk', authDomain: 'ao-temple.firebaseapp.com', projectId: 'ao-temple', storageBucket: 'ao-temple.appspot.com', messagingSenderId: '426167530682', appId: '1:426167530682:web:848a4cb0ceee2ce05cfe83' };
  window.startSevaRegistration = function (seva, amount, destination) {
    const url = new URL('seva-payment.html', window.location.href);
    url.searchParams.set('seva', seva); url.searchParams.set('amount', String(amount)); url.searchParams.set('destination', destination);
    window.location.href = url.href;
  };
  if (!location.pathname.endsWith('seva-payment.html')) return;
  import('https://www.gstatic.com/firebasejs/9.12.0/firebase-app.js').then(async ({ initializeApp }) => {
    const { getFirestore, doc, getDoc, setDoc, runTransaction, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/9.12.0/firebase-firestore.js');
    const app = initializeApp(FIREBASE_CONFIG); const db = getFirestore(app);
    const params = new URLSearchParams(location.search);
    const seva = params.get('seva') || ''; const amount = Number(params.get('amount')); const destination = params.get('destination') || 'form';
    const allowed = { 'Panchamrit Abhisheka':351, 'Nirantara Abhisheka':1501, 'Sankashtahara Chaturthi':101, 'Satyanarayana Puja Group Ceremony':201, 'Vehicle Puja Two Wheeler':101, 'Vehicle Puja Four Wheeler':201 };
    if (!Object.prototype.hasOwnProperty.call(allowed,seva) || allowed[seva] !== amount || !['form','sheet2','sheet3'].includes(destination)) { document.getElementById('paymentError').textContent='Invalid seva details. Please return to the Puja Events page and try again.'; document.getElementById('paymentForm').hidden=true; return; }
    document.getElementById('sevaName').textContent=seva; document.getElementById('sevaAmount').textContent='₹'+amount.toLocaleString('en-IN'); document.getElementById('upiId').textContent=UPI_ID;
    const payUrl='upi://pay?'+new URLSearchParams({pa:UPI_ID,pn:PAYEE,am:String(amount),cu:'INR',tn:seva}).toString();
    document.getElementById('payNow').href=payUrl;
    document.getElementById('copyUpi').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(UPI_ID);document.getElementById('paymentStatus').textContent='UPI ID copied.';}catch(e){document.getElementById('paymentStatus').textContent='Please copy the UPI ID manually.';}});
    document.getElementById('upiReference').addEventListener('input',e=>{e.target.value=e.target.value.replace(/[^a-zA-Z0-9]/g,'').slice(0,35);});
    document.getElementById('paymentForm').addEventListener('submit',async e=>{e.preventDefault();const ref=document.getElementById('upiReference').value.trim();const valid=/^(?:[0-9]{12}|[A-Za-z0-9]{12,35})$/.test(ref)&&! /^(.)\1+$/.test(ref);if(!valid){document.getElementById('paymentStatus').textContent='Enter the transaction ID / UTR exactly as shown in your UPI app. Use 12 digits or 12–35 letters/numbers; do not enter the UPI ID or a payment note.';return;}const button=document.getElementById('continueButton');button.disabled=true;document.getElementById('paymentStatus').textContent='Saving payment reference…';try{const recordRef=doc(db,'submissions','SEVA_UPI_'+ref.toUpperCase());const flatNumber=localStorage.getItem('flatNumber')||'';const residentName=localStorage.getItem('residentName')||'';const record={recordType:'sevaPaymentReference',seva,amount,upiId:UPI_ID,transactionReference:ref,flatNumber,residentName,paymentMethod:'UPI',verificationStatus:'Pending manual verification',createdAt:serverTimestamp()};await runTransaction(db,async transaction=>{const existing=await transaction.get(recordRef);if(existing.exists())throw new Error('DUPLICATE_UPI_REFERENCE');transaction.set(recordRef,record);});sessionStorage.setItem('templeSevaPayment',JSON.stringify(record));document.getElementById('paymentStatus').textContent='Reference saved. Opening the registration destination…';if(destination==='form'){const next=new URL('form.html',location.href);next.searchParams.set('upiTransactionId',ref);next.searchParams.set('seva',seva);location.href=next.href;}else{const target=destination==='sheet2'?'https://docs.google.com/spreadsheets/d/1CfJ0WdT2DBdFmr4u_Z6-xIhtt73yc_e48UgzFMnDHhk/edit?usp=sharing':'https://docs.google.com/spreadsheets/d/1uvOow48ouaK5p0HScEJHpUkuUVi_qhWx0-RYH-2K8SY/edit?gid=0#gid=0';window.location.href=target;}}catch(err){console.error(err);document.getElementById('paymentStatus').textContent='Could not save the transaction reference. Please check your connection and try again. No registration destination was opened.';button.disabled=false;}});
  }).catch(err=>{console.error(err);document.getElementById('paymentError').textContent='Payment step could not be initialized. Please refresh or contact the Temple Committee.';});
})();
