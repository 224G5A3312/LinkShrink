// --- Firebase Imports ---
import { auth, db } from './Firebase-config.js'; 
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// --- HTML Element Selection ---
const shortenBtn = document.getElementById('shortenBtn');
const urlInput = document.getElementById('urlInput');
const resultSection = document.getElementById('result');
const shortenedUrlInput = document.getElementById('shortenedUrl');
const copyBtn = document.getElementById('copyBtn');

// Navbar Auth Container
const authContainer = document.getElementById('auth-container'); 

// Modals
const loginModalEl = document.getElementById('loginModal');
const loginModal = new bootstrap.Modal(loginModalEl);
const signupModalEl = document.getElementById('signupModal');
const signupModal = new bootstrap.Modal(signupModalEl);
const notificationModalEl = document.getElementById('notificationModal');
const notificationModal = new bootstrap.Modal(notificationModalEl);
const notificationModalBody = document.getElementById('notificationModalBody');
const notificationModalLabel = document.getElementById('notificationModalLabel');
const confirmModalEl = document.getElementById('confirmModal');
const confirmModal = new bootstrap.Modal(confirmModalEl);
const confirmModalBody = document.getElementById('confirmModalBody');
const confirmModalLabel = document.getElementById('confirmModalLabel');
const confirmModalOkBtn = document.getElementById('confirmModalOkBtn');

// Forms
const loginForm = document.getElementById('loginForm');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const signupForm = document.getElementById('signupForm');

// --- Custom Notification & Confirmation Functions ---

/**
 * Shows a modal in the center of the page. This is now the only notification function.
 * @param {string} message The message to display.
 * @param {string} title The title for the modal.
 */
function showNotification(message, title = 'Notification') {
    notificationModalLabel.textContent = title;
    notificationModalBody.textContent = message;
    notificationModal.show();
}

function showCustomConfirm(message, title = 'Confirmation') {
    return new Promise((resolve) => {
        confirmModalLabel.textContent = title;
        confirmModalBody.textContent = message;
        confirmModal.show();

        const onOkClick = () => {
            confirmModal.hide();
            resolve(true);
            confirmModalOkBtn.removeEventListener('click', onOkClick);
        };
        
        const onModalHide = () => {
            resolve(false);
            confirmModalEl.removeEventListener('hidden.bs.modal', onModalHide);
            confirmModalOkBtn.removeEventListener('click', onOkClick);
        };

        confirmModalOkBtn.addEventListener('click', onOkClick);
        confirmModalEl.addEventListener('hidden.bs.modal', onModalHide);
    });
}


// --- Authentication Logic ---

googleLoginBtn.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then(() => loginModal.hide())
        .catch(error => {
            console.error("Google Sign-In Error:", error);
            showNotification("Could not sign in with Google. Please try again.", "LinkShrink");
        });
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.loginEmail.value;
    const password = loginForm.loginPassword.value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => loginModal.hide())
        .catch(error => {
            console.error("Login Error:", error.message);
            showNotification("Failed to login. Please check your email and password.", "LinkShrink");
        });
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signupForm.signupEmail.value;
    const password = signupForm.signupPassword.value;
    const confirmPassword = signupForm.confirmPassword.value;

    if (password !== confirmPassword) {
        showNotification("Passwords do not match.", "LinkShrink");
        return;
    }
    if (password.length < 6) {
        showNotification("Password must be at least 6 characters long.", "LinkShrink");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("Account created for:", userCredential.user.email);
            signupModal.hide();
        })
        .catch(error => {
            console.error("Signup Error:", error.message);
            if (error.code === 'auth/email-already-in-use') {
                showNotification("This email is already registered. Please login.", "LinkShrink");
            } else {
                showNotification("Failed to create an account. Please try again.", "LinkShrink");
            }
        });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const initials = getInitials(user.displayName || user.email);
        authContainer.innerHTML = `<div class="user-avatar" id="logoutBtn">${initials}</div>`;
        
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', handleLogout);

    } else {
        // User is signed out
        authContainer.innerHTML = `<button class="btn btn-primary btn-lg" id="loginNavBtn" data-bs-toggle="modal" data-bs-target="#loginModal">Login</button>`;
    }
});

async function handleLogout() {
    const result = await showCustomConfirm("Are you sure you want to logout?", "Logout Confirmation");
    if (result) {
        signOut(auth).catch(error => console.error("Logout Error:", error));
    }
}


// --- URL Shortening Logic ---
shortenBtn.addEventListener('click', async () => {
    const longUrl = urlInput.value.trim();
    const user = auth.currentUser;

    if (!user) {
        showNotification("Hold up! Let's login first..", "Login Required");
        return;
    }
    if (!isValidUrl(longUrl)) {
        showNotification("Please enter a valid URL.", "LinkShrink");
        return;
    }

    shortenBtn.disabled = true;
    shortenBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Shortening...';

    try {
        const shortCode = generateShortCode(7);
        await addDoc(collection(db, "urls"), {
            longUrl: longUrl,
            shortCode: shortCode,
            createdAt: serverTimestamp(),
            userId: user.uid,
            clicks: 0
        });
        const shortUrl = `${window.location.origin}/${shortCode}`;
        shortenedUrlInput.value = shortUrl;
        resultSection.style.display = 'block';
    } catch (e) {
        console.error("Error adding document: ", e);
        showNotification("Could not shorten the URL. Please try again.", "LinkShrink");
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.textContent = 'Shorten!';
    }
});


// --- Helper Functions ---
function getInitials(name) {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
}

function generateShortCode(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function isValidUrl(urlString) {
    try {
        new URL(urlString);
        return true;
    } catch (e) { return false; }
}

copyBtn.addEventListener('click', () => {
    shortenedUrlInput.select();
    try {
        navigator.clipboard.writeText(shortenedUrlInput.value);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        showNotification("URL copied to clipboard!", "LinkShrink");

        // Hide the result box and clear the input after 2 seconds
        setTimeout(() => {
            resultSection.style.display = 'none';
            urlInput.value = ''; // Clear the original input field
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);

    } catch (err) { 
        console.error('Failed to copy: ', err); 
        showNotification("Failed to copy URL.", "LinkShrink");
    }
});
