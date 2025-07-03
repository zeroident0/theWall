import { db } from '../config/firestore';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { getUserIP } from './ipService';

const likesCollection = collection(db, 'likes');

// Get likes for a specific image
export async function getImageLikes(imageId) {
    try {
        const q = query(likesCollection, where('imageId', '==', imageId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting image likes:', error);
        return [];
    }
}

// Check if current user has liked an image
export async function hasUserLikedImage(imageId) {
    try {
        const userIP = await getUserIP();
        const q = query(
            likesCollection,
            where('imageId', '==', imageId),
            where('ip', '==', userIP)
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking if user liked image:', error);
        return false;
    }
}

// Like an image
export async function likeImage(imageId) {
    try {
        const userIP = await getUserIP();

        // Check if already liked
        const alreadyLiked = await hasUserLikedImage(imageId);
        if (alreadyLiked) {
            throw new Error('Image already liked by this user');
        }

        // Add like
        await addDoc(likesCollection, {
            imageId,
            ip: userIP,
            timestamp: new Date().toISOString()
        });

        console.log('✅ Image liked successfully');
        return true;
    } catch (error) {
        console.error('Error liking image:', error);
        throw error;
    }
}

// Unlike an image
export async function unlikeImage(imageId) {
    try {
        const userIP = await getUserIP();

        // Find the like document
        const q = query(
            likesCollection,
            where('imageId', '==', imageId),
            where('ip', '==', userIP)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            throw new Error('No like found for this image and user');
        }

        // Delete the like
        const likeDoc = snapshot.docs[0];
        await deleteDoc(likeDoc.ref);

        console.log('✅ Image unliked successfully');
        return true;
    } catch (error) {
        console.error('Error unliking image:', error);
        throw error;
    }
}

// Toggle like status
export async function toggleLike(imageId) {
    try {
        const hasLiked = await hasUserLikedImage(imageId);

        if (hasLiked) {
            await unlikeImage(imageId);
            return { liked: false, action: 'unliked' };
        } else {
            await likeImage(imageId);
            return { liked: true, action: 'liked' };
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
}

// Subscribe to likes for real-time updates
export function subscribeToImageLikes(imageId, callback) {
    const q = query(likesCollection, where('imageId', '==', imageId));
    return onSnapshot(q, (snapshot) => {
        const likes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(likes);
    });
} 