import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { apiUrl } from "../utils/urls";

interface UsePaidSubscriptionHook {
  hasPaidSubscription: boolean | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const usePaidSubscription = (): UsePaidSubscriptionHook => {
  const [hasPaidSubscription, setHasPaidSubscription] = useState<
    boolean | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const paidSubscriptionUrl = apiUrl("/api/finances/stripe/paid-subscription/");

  const fetchPaidSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<boolean>(paidSubscriptionUrl, {
        withCredentials: true,
      });
      setHasPaidSubscription(response.data);
    } catch (err) {
      setError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  }, [paidSubscriptionUrl]);

  useEffect(() => {
    fetchPaidSubscription();
  }, [fetchPaidSubscription]);

  return {
    hasPaidSubscription,
    loading,
    error,
    refetch: fetchPaidSubscription,
  };
};
