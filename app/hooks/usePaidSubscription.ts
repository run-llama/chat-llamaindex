import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../utils/urls";

interface PaidSubscriptionResponse {
  hasPaidSubscription: boolean;
}

interface UsePaidSubscriptionHook {
  hasPaidSubscription: boolean | null;
  loading: boolean;
  error: AxiosError | null;
  refetch: () => Promise<void>;
}

export const usePaidSubscription = (): UsePaidSubscriptionHook => {
  const [hasPaidSubscription, setHasPaidSubscription] = useState<
    boolean | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AxiosError | null>(null);
  const paidSubscriptionUrl = apiUrl("/api/finances/stripe/paid-subscription/");

  const fetchPaidSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<PaidSubscriptionResponse>(
        paidSubscriptionUrl,
        {
          withCredentials: true,
        },
      );
      setHasPaidSubscription(response.data.hasPaidSubscription);
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
