import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyB6bcF1pR1E8kmjPQNqQ-k4sZUGFdBy2NY",
    authDomain: "fir-eed33.firebaseapp.com",
    databaseURL: "https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fir-eed33",
    storageBucket: "fir-eed33.appspot.com",
    messagingSenderId: "792719128416",
    appId: "1:792719128416:web:f55dea7ca01cc4670c1005",
    measurementId: "G-9DVZ7MBS8N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app); // Firebase Storage

export { storage, ref, uploadBytesResumable, getDownloadURL };
