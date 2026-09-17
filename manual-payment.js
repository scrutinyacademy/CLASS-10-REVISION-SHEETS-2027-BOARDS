const UPI_ID='iampramodsharma02-1@oksbi';
const PAYEE='Pramod Sharma';
const AMOUNT='11.00';
const WHATSAPP='919052389200';
const upiUri=`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE)}&am=${AMOUNT}&cu=INR&tn=${encodeURIComponent('Scrutiny Academy Class 10 Biology Board Booster 2027')}`;

window.openPaymentModal=function(){
  const d=document.getElementById('upi-payment');
  d.showModal();
  const qr=document.getElementById('upi-qr');
  if(qr && !qr.dataset.ready){
    qr.innerHTML='';
    new QRCode(qr,{text:upiUri,width:220,height:220,correctLevel:QRCode.CorrectLevel.H});
    qr.dataset.ready='1';
  }
};
window.payWithUPI=function(){ window.location.href=upiUri; };
window.sendPaymentProof=function(){
  const msg=`Hi Scrutiny Academy! I have paid ₹11 for the Class 10 Biology Board Booster 2027. I am attaching my payment screenshot here for verification. Please verify it and share the Biology revision sheets.`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
};
window.copyUpi=async function(){
  try{await navigator.clipboard.writeText(UPI_ID);alert('UPI ID copied: '+UPI_ID)}catch(e){alert('UPI ID: '+UPI_ID)}
};
