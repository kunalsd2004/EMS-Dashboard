import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const archiveData = async (data: any, type: 'report' | 'sos') => {
  try {
    const archiveData = {
      ...data,
      originalId: data.id,
      type,
      archivedAt: new Date(),
      source: type === 'report' ? 'reports' : 'sos_alerts'
    };
    
    await addDoc(collection(db, 'analytics_archive'), archiveData);
  } catch (error) {
    console.error('Error archiving data:', error);
  }
};