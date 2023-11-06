import { gql } from "@apollo/client";
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";

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

// Use this custom hook to access auth-related information in your React app
export const useAuth = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(CURRENT_USER_QUERY);

  // Simplified check to determine the logged-in status
  const isLoggedIn = Boolean(data?.currentUser) && !loading && !error;

  const logout = useCallback(() => {
    // wrap navigation logic or API call to perform logout here
    // make sure to update the client state to reflect the logout
    navigate("/logout"); // update the path according to your routing setup
    // Depending on your auth strategy, you might also want to perform additional
    // actions during logout, like clearing tokens, triggering a logout mutation, etc.
  }, [navigate]);

  const currentUser: CurrentUserType | null = data?.currentUser || null;

  return {
    loading,
    error,
    isLoggedIn,
    currentUser,
    logout,
    refetch,
  };
};
