// NOTE: import only the Firebase modules that you need in your app... except
// for the second line, which makes both the linter and react-firebase happy
import firebase from 'firebase/app';
import 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: `{REACT_APP_FIREBASE_KEY}`,
  authDomain: 'honey-do-d3592.firebaseapp.com',
  projectId: 'honey-do-d3592',
  storageBucket: 'honey-do-d3592.appspot.com',
  messagingSenderId: '118743555342',
  appId: '1:118743555342:web:c90ccee22cc84a2064cb5f',
  measurementId: 'G-NF5SZ88B3G',
};

// Firebase configuration for the App
const firebaseInstance = firebase.initializeApp(firebaseConfig);

let db = firebaseInstance.firestore();

export { db };
