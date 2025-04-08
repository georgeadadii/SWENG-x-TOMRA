import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import fetch from 'cross-fetch'; 

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || "http://localhost:8000/graphql";

const client = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_ENDPOINT, fetch }), 
  cache: new InMemoryCache(),
});

export default client;
