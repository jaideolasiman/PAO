// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");
// const { getAnalytics } = require("firebase/analytics");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAboMziRu5l7MtN3i1ezsGF59VRe3iSZMQ",
  authDomain: "pao1-2fdfc.firebaseapp.com",
  projectId: "pao1-2fdfc",
  storageBucket: "pao1-2fdfc.firebasestorage.app",
  messagingSenderId: "876332840626",
  appId: "1:876332840626:web:10d57b394324c610be7bab",
  measurementId: "G-QDSPJF5WWV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage()
// const analytics = getAnalytics(app);

module.exports = storage;