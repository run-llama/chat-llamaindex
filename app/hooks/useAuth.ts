import { gql } from "@apollo/client";
import { useCallback, useState } from "react";
import { useQuery } from "@apollo/client";
import axios from "axios";
import { useEffect } from "react";
import { apiUrl, webappUrl } from "../utils/urls";

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

export const refreshToken = async () => {
  const refreshUrl = `${
    process.env.NEXT_PUBLIC_AUTH_SERVER_DOMAIN ||
    "https://app.localtest.local:3000"
  }/api/auth/token-refresh/`;
  const res = await client.post<void>(refreshUrl);
  return res.data;
};

export const useAuth = () => {
  const { data, loading, error, refetch } = useQuery(CURRENT_USER_QUERY, {
    onError: (apolloError) => {
      refreshToken();
    },
  });

  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const isLoggedIn = Boolean(data?.currentUser);
  const currentUser = data?.currentUser || null;

  const logout = useCallback(() => {
    // Use utility functions to construct URLs
    const logoutUrl = apiUrl("/api/auth/logout/");
    const loginUrl = webappUrl("/en/auth/login");

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
