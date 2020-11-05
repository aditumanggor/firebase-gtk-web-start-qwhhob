// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

async function main() {

  // Add Firebase project configuration object here
  var firebaseConfig = {
    apiKey: "AIzaSyDS3fvfK6i_zSEbymPOMoYe_5vzXy4EM-g",
    authDomain: "fir-web-codelab-b712a.firebaseapp.com",
    databaseURL: "https://fir-web-codelab-b712a.firebaseio.com",
    projectId: "fir-web-codelab-b712a",
    storageBucket: "fir-web-codelab-b712a.appspot.com",
    messagingSenderId: "681461295926",
    appId: "1:681461295926:web:8dba5f33d55e9407362197"
  };

  // firebase.initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig)
  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      }
    }
  };

  const ui = new firebaseui.auth.AuthUI(firebase.auth());
  startRsvpButton.addEventListener("click", () => {
    if(firebase.auth().currentUser) {
      // userr is signed in; allows user to sign out
      firebase.auth().signOut()
    } else {
      // No user is signed in; allows user to sign in
      ui.start("#firebaseui-auth-container", uiConfig)
    }
  })

  
  firebase.auth().onAuthStateChanged((user) => {
    if(user) {
      startRsvpButton.textContent = "LOGOUT";
      //show guestbook to logged-in users
      guestbookContainer.style.display = "block";
      // subscribe to the guestbook collection
      subscribeGuestbook();
    } else {
      startRsvpButton.textContent = "RSVP";
      // hide guestbook for non-logged-in users
      guestbookContainer.style.display = "none";
      // unsubscribe from the guestbook collection
      unsubcribeGuestbook();
    }
  })
  // listem to the form submission
  form.addEventListener("submit", (e) => {
    // prevent the default form redirect
    e.preventDefault();
    //write a new message to the database collection "guestbook"
    firebase.firestore().collection("guestbook").add({
      text: input.value,
      timestamp: Date.now(),
      name:firebase.auth().currentUser.displayName,
      userId:firebase.auth().currentUser.uid
    })
    // clear message input field
    input.value = "";
    // return false to avoid redirect
    return false;
  })
  function subscribeGuestbook() {
  // creat query for messages
  guestbookListener = firebase.firestore().collection("guestbook")
  .orderBy("timestamp","desc")
  .onSnapshot((snaps) => {
    // Reset page
    guestbook.innerHTML = "";
    // Loop through documents in database
    snaps.forEach((doc) => {
      // Create an HTML entry for each document and add it to the chat
      const entry = document.createElement("p");
      entry.textContent = doc.data().name + " :" + doc.data().text;
      guestbook.appendChild(entry);
    })
  })
}
function unsubcribeGuestbook() {
  if(guestbookListener != null)
  {
    guestbookListener();
    guestbookListener = null;
  }
}
}
main();

