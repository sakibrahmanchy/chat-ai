'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function useEarlyAccess() {
  const [hasSubmitted, setHasSubmitted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const checkSubmission = async () => {
      try {
        // Check localStorage first for quick response
        const localSubmission = localStorage.getItem('earlyAccessSubmitted');
        if (localSubmission) {
          setHasSubmitted(true);
          setLoading(false);
          return;
        }

        // Get user's IP and fingerprint
        const userEmail = localStorage.getItem('userEmail');
        const userIp = localStorage.getItem('userIp');

        if (userEmail || userIp) {
          const requestsRef = collection(db, 'earlyAccessRequests');
          const q = query(
            requestsRef,
            where('identifier', 'in', [userEmail, userIp].filter(Boolean))
          );
          
          const snapshot = await getDocs(q);
          const submitted = !snapshot.empty;
          
          setHasSubmitted(submitted);
          if (submitted) {
            localStorage.setItem('earlyAccessSubmitted', 'true');
          }
        }
      } catch (error) {
        console.error('Error checking submission:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubmission();
  }, [hasSubmitted]);

  return { hasSubmitted, loading, setHasSubmitted };
} 