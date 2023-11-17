import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const createApolloClient = () => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: new HttpLink({
      uri: `${process.env.NEXT_PUBLIC_AUTH_SERVER_DOMAIN}/api/graphql/`, // Replace with your GraphQL endpoint
      credentials: "include",
    }),
    cache: new InMemoryCache(),
  });
};

export const apolloClient = createApolloClient();
