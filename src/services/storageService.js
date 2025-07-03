import { db } from '../config/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';

const imagesCollection = collection(db, 'images');

// Real-time subscription to images
export function subscribeToPictures(callback) {
    return onSnapshot(imagesCollection, (snapshot) => {
        const pictures = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        callback(pictures);
    });
}

// Add a new picture
export async function addPicture(picture) {
    const docRef = await addDoc(imagesCollection, picture);
    return docRef.id;
}

// Update picture position
export async function updatePicturePosition(pictureId, position) {
    const pictureDoc = doc(db, 'images', pictureId);
    await updateDoc(pictureDoc, { position });
}

// Delete a picture
export async function deletePicture(pictureId) {
    await deleteDoc(doc(db, 'images', pictureId));
}

// Delete all images and clear the collection
export async function deleteAllImagesAndClear() {
    const snapshot = await getDocs(imagesCollection);
    const batch = writeBatch(db);
    snapshot.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
    });
    await batch.commit();
    return { deletedCount: snapshot.docs.length };
}

// Load all pictures from Firestore
export async function loadPictures() {
    const snapshot = await getDocs(imagesCollection);
    return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));
} 