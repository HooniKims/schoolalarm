import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

const NOTES_COLLECTION = 'notes';

// Save or Update a note
export const saveNote = async (dateStr, originalContent, summary) => {
    try {
        const noteRef = doc(db, NOTES_COLLECTION, dateStr);
        await setDoc(noteRef, {
            date: dateStr,
            originalContent,
            summary,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving note:", error);
        throw error;
    }
};

// Get a single note by date (YYYY-MM-DD)
export const getNoteByDate = async (dateStr) => {
    try {
        const noteRef = doc(db, NOTES_COLLECTION, dateStr);
        const docSnap = await getDoc(noteRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting note:", error);
        throw error;
    }
};

// Get all notes (optional: filter by range)
export const getAllNotes = async () => {
    try {
        const notesRef = collection(db, NOTES_COLLECTION);
        const q = query(notesRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);

        const notes = [];
        querySnapshot.forEach((doc) => {
            notes.push(doc.data());
        });
        return notes;
    } catch (error) {
        console.error("Error getting all notes:", error);
        throw error;
    }
};

// Delete a note
export const deleteNote = async (dateStr) => {
    try {
        await deleteDoc(doc(db, NOTES_COLLECTION, dateStr));
        return true;
    } catch (error) {
        console.error("Error deleting note:", error);
        throw error;
    }
};
