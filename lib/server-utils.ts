import { Timestamp } from "firebase-admin/firestore";

// Helper function to convert Firestore data to plain objects
export function serializeData(data: any): any {
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }
  
  if (data && typeof data === 'object') {
    return Object.keys(data).reduce((result, key) => {
      result[key] = serializeData(data[key]);
      return result;
    }, {} as any);
  }
  
  return data;
} 