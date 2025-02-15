"use client";

import { gql, useQuery } from "@apollo/client";
import client from "@/lib/apolloClient";

const GET_RESULTS = gql`
  query GetResults {
    results {
      classLabel
      confidence
      imageUrl
    }
  }
`;

export default function ResultsPage() {
  const { data, loading, error } = useQuery(GET_RESULTS, { client });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
      <h1 style={{ width: "100%", textAlign: "center" }}>GraphQL Results from FastAPI</h1>
      {data.results.map((result: any, index: number) => (
        <div key={index} style={{ textAlign: "center", maxWidth: "300px" }}>
          <strong>{result.classLabel}</strong>
          <br />
          Confidence: {result.confidence.toFixed(2)}
          <br />
          <a href={result.imageUrl} target="_blank" rel="noopener noreferrer" style={{ wordBreak: "break-all", display: "block", marginTop: "5px" }}>
            {result.imageUrl}
          </a>
          <img 
            src={result.imageUrl} 
            alt={result.classLabel} 
            style={{ width: "100%", height: "auto", borderRadius: "10px", marginTop: "10px" }}
          />
        </div>
      ))}
    </div>
  );
}
