import {createContext} from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

type FirebaseContextType = {
    firestore: Firestore;
}

const firebaseConfig = {
    apiKey: "AIzaSyA3WB-JnA8qMwHmIHpQNMkHLfSA7VKEFmg",
    authDomain: "auction-f7518.firebaseapp.com",
    projectId: "auction-f7518",
    storageBucket: "auction-f7518.appspot.com",
    messagingSenderId: "840112197610",
    appId: "1:840112197610:web:d9889518b121123cc4ec93"
};

export const FirebaseContext = createContext<FirebaseContextType>({
    firestore: getFirestore(initializeApp(firebaseConfig)),
})
FirebaseContext.displayName = "FirebaseContext";

const FirebaseContextProvider = ({ children }: any) => {
    const app = initializeApp(firebaseConfig);

    const firestore = getFirestore(app);

    const value: FirebaseContextType = {
        firestore,
    }

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    )
}

export default FirebaseContextProvider;
