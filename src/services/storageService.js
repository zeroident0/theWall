const STORAGE_KEY = 'thewall_pictures';

// Save pictures to localStorage
export const savePictures = (pictures) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pictures));
        return true;
    } catch (error) {
        console.error('Failed to save pictures to localStorage:', error);
        return false;
    }
};

// Load pictures from localStorage
export const loadPictures = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load pictures from localStorage:', error);
        return [];
    }
};

// Add a new picture
export const addPicture = (picture) => {
    const pictures = loadPictures();
    pictures.push(picture);
    savePictures(pictures);
    return pictures;
};

// Update picture position
export const updatePicturePosition = (pictureId, position) => {
    const pictures = loadPictures();
    const pictureIndex = pictures.findIndex(p => p.id === pictureId);

    if (pictureIndex !== -1) {
        pictures[pictureIndex].position = position;
        savePictures(pictures);
    }

    return pictures;
};

// Delete a picture
export const deletePicture = (pictureId) => {
    const pictures = loadPictures();
    const filteredPictures = pictures.filter(p => p.id !== pictureId);
    savePictures(filteredPictures);
    return filteredPictures;
};

// Clear all pictures
export const clearAllPictures = () => {
    localStorage.removeItem(STORAGE_KEY);
    return [];
}; 