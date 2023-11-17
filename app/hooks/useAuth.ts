import { gql } from "@apollo/client";
import { useCallback } from "react";
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

  const isLoggedIn = Boolean(data?.currentUser);
  const currentUser = data?.currentUser || null;

  // Logout logic
  const logout = useCallback(() => {
    // Perform logout operations
    client.post<void>(
      process.env.AUTH_SERVER_DOMAIN ||
        "https://app.localtest.local:3000/api/auth/logout/",
    );
    window.location.href =
      process.env.AUTH_SERVER_LOGIN_URL ||
      "https://app.localtest.local:3000/en/auth/login";
  }, []);

  // Effect for handling authentication status
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      logout();
    }
  }, [loading, isLoggedIn, logout]);

  return {
    loading,
    error,
    isLoggedIn,
    currentUser,
    logout,
    refetch,
  };
};
