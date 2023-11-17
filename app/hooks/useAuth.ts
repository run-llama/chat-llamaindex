import { gql } from "@apollo/client";
import { useCallback, useState } from "react";
import { useQuery } from "@apollo/client";
import axios from "axios";
import { useEffect } from "react";

export const CURRENT_USER_QUERY = gql`
  query CommonQueryCurrentUser {
    currentUser {
      id
      email
      firstName
      lastName
      roles
      avatar
      otpVerified
      otpEnabled
    }
  }
`;

export type CurrentUserType = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roles?: Array<string | null> | null;
  avatar?: string | null;
  otpVerified: boolean;
  otpEnabled: boolean;
};

export const validateStatus = (status: number) => status >= 200 && status < 300;

export const client = axios.create({
  withCredentials: true,
  validateStatus,
});

export const useAuth = () => {
  const { data, loading, error, refetch } = useQuery(CURRENT_USER_QUERY, {
    onError: (apolloError) => {
      // Handle error
    },
  });

  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const isLoggedIn = Boolean(data?.currentUser);
  const currentUser = data?.currentUser || null;

  // Logout logic
  const logout = useCallback(() => {
    // Common paths
    const logoutPath = "/api/auth/logout/";
    const loginPath = "/en/auth/login";

    // Construct URLs using the root URL from the environment variable
    const logoutUrl = `${
      process.env.AUTH_SERVER_DOMAIN || "https://app.localtest.local:3000"
    }${logoutPath}`;
    const loginUrl = `${
      process.env.DJANGO_WEBAPP_URL || "https://app.localtest.local:3000"
    }${loginPath}`;

    // Perform logout operations
    client.post<void>(logoutUrl);
    window.location.href = loginUrl;
  }, []);

  useEffect(() => {
    if (!loading) {
      setHasCheckedUser(true);
    }
  }, [loading]);

  useEffect(() => {
    if (hasCheckedUser && !isLoggedIn) {
      logout();
    }
  }, [hasCheckedUser, isLoggedIn, logout]);

  return {
    loading,
    error,
    isLoggedIn,
    currentUser,
    logout,
    refetch,
  };
};
