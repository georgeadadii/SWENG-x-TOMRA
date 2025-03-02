// import { ApolloClient, InMemoryCache } from "@apollo/client";

// const mockClient = new ApolloClient({
//   uri: "http://mocked/graphql", // This will never actually be called
//   cache: new InMemoryCache(),
// });

// export default mockClient;


// // export const useQuery = jest.fn().mockReturnValue({
// //   data: { results: [] },
// //   loading: false,
// //   error: null,
// // });


// import { ApolloClient, InMemoryCache } from "@apollo/client";
// import fetch from 'cross-fetch'; // Polyfill fetch

// const mockClient = new ApolloClient({
//   uri: "http://mocked/graphql", // This will never actually be called
//   cache: new InMemoryCache(),
//   fetch, // Use the polyfilled fetch
// });

// export default mockClient;

// import { ApolloClient, InMemoryCache } from "@apollo/client";
// import fetch from 'cross-fetch'; // Import fetch

// const mockClient = new ApolloClient({
//   uri: "http://mocked/graphql", // This will never actually be called
//   cache: new InMemoryCache(),
//   fetch, // Use the polyfilled fetch
// });

// export default mockClient;

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import fetch from 'cross-fetch'; // Import fetch

const mockClient = new ApolloClient({
  link: new HttpLink({ uri: "http://mocked/graphql", fetch }), // Pass fetch to HttpLink
  cache: new InMemoryCache(),
});

export default mockClient;