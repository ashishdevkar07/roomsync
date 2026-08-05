import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCMubnfBGGYuKIqFQ1p79n8rFFhap60k8",
  authDomain: "roomsync-f94af.firebaseapp.com",
  projectId: "roomsync-f94af",
  storageBucket: "roomsync-f94af.firebasestorage.app",
  messagingSenderId: "247308469991",
  appId: "1:247308469991:web:567f841a914634cab60442"
};

// Intialize firebase 
const app = initializeApp(firebaseConfig)

// Intialize firestore database
const db = getFirestore(app)

export {db}