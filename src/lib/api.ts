import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { Method } from '../app/data/methods';
import { SiteSettings } from '../app/components/SiteSettingsManager';

// --- Guides (Methods) API ---

export const getFirebaseGuides = async (): Promise<Method[]> => {
  try {
    const q = query(collection(db, 'guides'));
    const querySnapshot = await getDocs(q);
    const guides: Method[] = [];
    querySnapshot.forEach((doc) => {
      guides.push({ id: doc.id, ...doc.data() } as Method);
    });
    return guides;
  } catch (error) {
    console.error("Error fetching guides:", error);
    return [];
  }
};

export const createFirebaseGuide = async (guideData: Omit<Method, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'guides'), guideData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating guide:", error);
    throw error;
  }
};

export const updateFirebaseGuide = async (id: string, updateData: Partial<Method>): Promise<void> => {
  try {
    const docRef = doc(db, 'guides', id);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating guide:", error);
    throw error;
  }
};

export const deleteFirebaseGuide = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'guides', id));
  } catch (error) {
    console.error("Error deleting guide:", error);
    throw error;
  }
};

// --- Categories API ---

export const getFirebaseCategories = async (): Promise<any[]> => {
  try {
    const docRef = doc(db, 'config', 'categories');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().list;
    }
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const saveFirebaseCategories = async (categories: any[]): Promise<void> => {
  try {
    const docRef = doc(db, 'config', 'categories');
    await setDoc(docRef, { list: categories });
  } catch (error) {
    console.error("Error saving categories:", error);
    throw error;
  }
};

// --- Site Settings API ---

export const getFirebaseSiteSettings = async (): Promise<SiteSettings | null> => {
  try {
    const docRef = doc(db, 'config', 'siteSettings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    return null;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
};

export const saveFirebaseSiteSettings = async (settings: SiteSettings): Promise<void> => {
  try {
    const docRef = doc(db, 'config', 'siteSettings');
    await setDoc(docRef, settings);
  } catch (error) {
    console.error("Error saving site settings:", error);
    throw error;
  }
};
