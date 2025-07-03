import { db } from '../config/firestore';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getUserIP } from './ipService';

const uploadsCollection = collection(db, 'daily_uploads');

// Get today's date in YYYY-MM-DD format
function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Check if infinity mode is manually enabled
function isManualInfinityModeEnabled() {
    return sessionStorage.getItem('infinityMode') === 'true';
}

// Check if infinity uploads mode is enabled
function isInfinityModeEnabled() {
    const debugPassword = import.meta.env.VITE_DEBUG_PASSWORD;
    const infinityPassword = import.meta.env.VITE_INFINITY_PASSWORD;

    // Check if either password is set and matches, or if manually enabled
    return (debugPassword || infinityPassword) || isManualInfinityModeEnabled();
}

// Check if user can upload (less than 3 uploads today)
export async function canUserUpload() {
    try {
        // Check if infinity mode is enabled
        if (isInfinityModeEnabled()) {
            console.log('🔓 Infinity uploads mode enabled - bypassing daily limit');
            return {
                canUpload: true,
                uploadCount: 0,
                remaining: Infinity,
                infinityMode: true
            };
        }

        const userIP = await getUserIP();
        const today = getTodayString();

        // Query for today's uploads by this IP
        const q = query(
            uploadsCollection,
            where('ip', '==', userIP),
            where('date', '==', today)
        );

        const snapshot = await getDocs(q);
        const uploadCount = snapshot.docs.length;

        return {
            canUpload: uploadCount < 3,
            uploadCount,
            remaining: Math.max(0, 3 - uploadCount),
            infinityMode: false
        };
    } catch (error) {
        console.error('Error checking upload limit:', error);
        // If there's an error, allow upload as fallback
        return {
            canUpload: true,
            uploadCount: 0,
            remaining: 3,
            infinityMode: false
        };
    }
}

// Record an upload for the current user
export async function recordUpload() {
    try {
        // Don't record uploads in infinity mode
        if (isInfinityModeEnabled()) {
            console.log('🔓 Infinity mode: Skipping upload recording');
            return;
        }

        const userIP = await getUserIP();
        const today = getTodayString();

        await addDoc(uploadsCollection, {
            ip: userIP,
            date: today,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error recording upload:', error);
        // Don't throw error to prevent blocking upload
    }
}

// Get upload stats for the current user
export async function getUserUploadStats() {
    try {
        // Check if infinity mode is enabled
        if (isInfinityModeEnabled()) {
            return {
                uploadCount: 0,
                remaining: Infinity,
                canUpload: true,
                uploads: [],
                infinityMode: true
            };
        }

        const userIP = await getUserIP();
        const today = getTodayString();

        const q = query(
            uploadsCollection,
            where('ip', '==', userIP),
            where('date', '==', today),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        const uploads = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            uploadCount: uploads.length,
            remaining: Math.max(0, 3 - uploads.length),
            canUpload: uploads.length < 3,
            uploads,
            infinityMode: false
        };
    } catch (error) {
        console.error('Error getting upload stats:', error);
        return {
            uploadCount: 0,
            remaining: 3,
            canUpload: true,
            uploads: [],
            infinityMode: false
        };
    }
}

// Function to manually enable/disable infinity mode (for testing)
export function toggleInfinityMode(password) {
    const debugPassword = import.meta.env.VITE_DEBUG_PASSWORD;
    const infinityPassword = import.meta.env.VITE_INFINITY_PASSWORD;

    if (password === debugPassword || password === infinityPassword) {
        // Store in session storage for the current session
        sessionStorage.setItem('infinityMode', 'true');
        console.log('🔓 Infinity mode manually enabled');
        return true;
    } else {
        sessionStorage.removeItem('infinityMode');
        console.log('🔒 Infinity mode disabled');
        return false;
    }
} 