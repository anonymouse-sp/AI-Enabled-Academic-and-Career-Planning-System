import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProfileCompletion = () => {
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCompletion = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.profileCompletion !== undefined) {
        setCompletionPercentage(response.data.profileCompletion);
      }
    } catch (error) {
      console.error('Error fetching profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletion();
  }, []);

  return { completionPercentage, loading, refetch: fetchCompletion };
};