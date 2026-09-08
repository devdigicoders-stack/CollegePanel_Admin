import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported as isMessagingSupported } from "firebase/messaging";

// Firebase web configuration (read from env with fallback to project config)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCGlmY-ior7xqv_-4PiQcs1CoePb7IDM90",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "collegepanel-1027b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "collegepanel-1027b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "collegepanel-1027b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "335340683871",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:335340683871:web:7437cb6a10addb315bd1ea",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TR9VSERZ70"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Analytics safely
let analytics = null;
isAnalyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Analytics not supported in current environment:", err.message);
});

// Initialize Cloud Messaging safely
let messaging = null;
export const getFirebaseMessaging = async () => {
  if (messaging) return messaging;
  try {
    const supported = await isMessagingSupported();
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    } else {
      console.warn("Firebase Messaging is not supported in this browser environment.");
      return null;
    }
  } catch (error) {
    console.error("Error initializing Firebase Messaging:", error);
    return null;
  }
};

/**
 * Request user permission and generate FCM token
 * @param {string} [vapidKey] Optional VAPID key
 * @returns {Promise<string|null>} FCM Registration Token or null
 */
export const requestNotificationPermission = async (vapidKey) => {
  try {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission was denied or dismissed.");
      return null;
    }

    const msgInstance = await getFirebaseMessaging();
    if (!msgInstance) return null;

    // Register service worker if available
    let swRegistration;
    if ("serviceWorker" in navigator) {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    }

    const tokenOptions = {
      ...(swRegistration ? { serviceWorkerRegistration: swRegistration } : {}),
      ...(vapidKey ? { vapidKey } : {})
    };

    const currentToken = await getToken(msgInstance, tokenOptions);
    if (currentToken) {
      console.log("✅ FCM Device Registration Token:", currentToken);
      localStorage.setItem("fcm_token", currentToken);
      return currentToken;
    } else {
      console.warn("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving FCM token:", err);
    return null;
  }
};

/**
 * Listen for messages received while the app is in the foreground
 * @param {Function} callback - Function called with payload
 * @returns {Promise<Function|null>} Unsubscribe function
 */
export const onForegroundMessage = async (callback) => {
  const msgInstance = await getFirebaseMessaging();
  if (!msgInstance) return null;

  return onMessage(msgInstance, (payload) => {
    console.log("🔔 Foreground notification received:", payload);
    if (callback) callback(payload);
  });
};

export { analytics };
export default app;
