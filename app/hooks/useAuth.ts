import { gql } from "@apollo/client";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import axios from "axios";

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
  const logout = useCallback(() => {
    // Perform logout operations, such as clearing tokens
    const res = client.post<void>(
      process.env.AUTH_SERVER_DOMAIN ||
        "http://localhost:3000/api/auth/logout/",
    );

    const authServerUrl = process.env.AUTH_SERVER_LOGIN_URL;
    window.location.href =
      authServerUrl || "http://localhost:3000/en/auth/login";
  }, []);

  const { data, loading, error, refetch } = useQuery(CURRENT_USER_QUERY, {
    onError: (apolloError) => {
      logout();
    },
  });

  // Simplified check to determine the logged-in status
  const isLoggedIn = Boolean(data?.currentUser) && !loading && !error;
  console.log();
  if (!isLoggedIn) {
    logout();
  }
  const currentUser = data?.currentUser || null;

  return {
    loading,
    error,
    isLoggedIn,
    currentUser,
    logout,
    refetch,
  };
};
