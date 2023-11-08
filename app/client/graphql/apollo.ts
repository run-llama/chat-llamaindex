import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const createApolloClient = () => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, // Replace with your GraphQL endpoint
    }),
    cache: new InMemoryCache(),
    credentials: "include",
  });
};

export const apolloClient = createApolloClient();
