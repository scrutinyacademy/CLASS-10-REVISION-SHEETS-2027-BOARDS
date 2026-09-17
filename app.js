import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const PRODUCT = {
  id: 'biology_2027',
  name: 'Class 10 Biology Board Booster 2027',
  price: 11,
  amountPaise: 1100,
  currency: 'INR'
};

const BACKEND_BASE = window.BOARD_BOOSTER_API_BASE || 'https://YOUR_FIREBASE_FUNCTION_REGION-YOUR_PROJECT_ID.cloudfunctions.net';
let currentUser = null;
let purchased = false;

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setDisplay(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? '' : 'none';
}

function setPurchaseUI(isPurchased) {
  purchased = isPurchased;
  document.querySelectorAll('[data-purchase-cta]').forEach(btn => {
    btn.textContent = isPurchased ? 'OPEN BIOLOGY REVISION SHEETS' : 'UNLOCK COMPLETE BIOLOGY — ₹11';
    btn.onclick = isPurchased ? () => openBiologyLibrary() : () => startBiologyPurchase();
  });
  document.querySelectorAll('.chapter').forEach((el) => {
    if (isPurchased) {
      el.classList.remove('locked');
      el.textContent = el.textContent.replace('🔒', '✓');
    }
  });
  setText('auth-status', currentUser ? (isPurchased ? 'Biology Purchased ✓' : 'Signed in') : 'Login');
}

async function checkPurchase(uid) {
  const purchaseRef = doc(db, 'users', uid, 'purchases', PRODUCT.id);
  const snap = await getDoc(purchaseRef);
  setPurchaseUI(snap.exists() && snap.data()?.status === 'paid');
}

async function signIn() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (e) {
    alert('Login failed. Please try again.');
    console.error(e);
  }
}

async function logout() {
  await signOut(auth);
}

async function ensureBackendConfigured() {
  if (BACKEND_BASE.includes('YOUR_FIREBASE_FUNCTION')) {
    alert('Secure payment backend still needs deployment. Razorpay is connected, but this public site will not accept money until server-side verification is live.');
    return false;
  }
  return true;
}

async function startBiologyPurchase() {
  if (!currentUser) {
    await signIn();
    if (!auth.currentUser) return;
    currentUser = auth.currentUser;
  }
  if (purchased) return openBiologyLibrary();
  if (!(await ensureBackendConfigured())) return;

  const token = await currentUser.getIdToken();
  const response = await fetch(`${BACKEND_BASE}/createBoardBoosterOrder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productId: PRODUCT.id })
  });
  const order = await response.json();
  if (!response.ok) {
    alert(order?.error || 'Could not create payment order.');
    return;
  }

  const options = {
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    name: 'Scrutiny Academy',
    description: PRODUCT.name,
    order_id: order.orderId,
    prefill: { email: currentUser.email || '' },
    theme: { color: '#52e5a5' },
    handler: async function (paymentResponse) {
      const verify = await fetch(`${BACKEND_BASE}/verifyBoardBoosterPayment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: PRODUCT.id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature
        })
      });
      const result = await verify.json();
      if (verify.ok && result.verified) {
        await checkPurchase(currentUser.uid);
        document.getElementById('payment-success')?.showModal();
      } else {
        alert('Payment received but verification is still pending. Use Check Payment Status or WhatsApp support.');
      }
    },
    modal: { ondismiss: () => console.log('Checkout closed') }
  };
  const rzp = new Razorpay(options);
  rzp.open();
}

async function openBiologyLibrary() {
  if (!currentUser) return signIn();
  await checkPurchase(currentUser.uid);
  if (!purchased) return startBiologyPurchase();
  document.getElementById('biology')?.scrollIntoView({ behavior: 'smooth' });
  alert('Biology is unlocked for this account. Add the 10 PDFs to private Firebase Storage and the viewer links can be activated automatically.');
}

async function checkPaymentStatus() {
  if (!currentUser) return signIn();
  await checkPurchase(currentUser.uid);
  alert(purchased ? 'Biology access is active on your account.' : 'No verified Biology purchase found yet.');
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) {
    authBtn.textContent = user ? 'LOG OUT' : 'LOGIN';
    authBtn.onclick = user ? logout : signIn;
  }
  if (user) await checkPurchase(user.uid); else setPurchaseUI(false);
});

window.startBiologyPurchase = startBiologyPurchase;
window.openBiologyLibrary = openBiologyLibrary;
window.checkPaymentStatus = checkPaymentStatus;
