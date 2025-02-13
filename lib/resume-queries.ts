export async function getFilteredResumes({
  userId,
  jobId,
  filters,
  lastDoc,
  limit = 20
}: FilterParams) {
  let query = collection(db, 'users', userId, 'jobs', jobId, 'resumes');

  // Apply most common filter first (using index)
  if (filters.skills.length > 0) {
    query = query.where('searchableSkills', 'array-contains-any', 
      filters.skills.map(s => s.toLowerCase())
    );
  }

  // Add range filter (using index)
  if (filters.experience !== 'any') {
    const range = EXPERIENCE_RANGES[filters.experience];
    query = query.where('experienceMonths', '>=', range[0]);
  }

  // Add ordering (using index)
  query = query.orderBy('matchScore', 'desc')
               .orderBy('createdAt', 'desc');

  // Add pagination
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  query = query.limit(limit);

  const snapshot = await getDocs(query);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
} 