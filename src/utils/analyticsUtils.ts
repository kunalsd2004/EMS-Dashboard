import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const saveToAnalytics = async (data: any, type: 'sos' | 'report') => {
  try {
    const analyticsData = {
      ...data,
      originalId: data.id,
      type,
      archivedAt: new Date(),
      isArchived: false
    };
    
    await addDoc(collection(db, 'analytics_archive'), analyticsData);
  } catch (error) {
    console.error('Error saving to analytics:', error);
  }
};