import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import fetch from 'cross-fetch'; 

const client = new ApolloClient({
  link: new HttpLink({ uri: "https://sixsense-backend.lemonhill-ac9dfb3e.germanywestcentral.azurecontainerapps.io/graphql", fetch }), 
  cache: new InMemoryCache(),
});

export default client;