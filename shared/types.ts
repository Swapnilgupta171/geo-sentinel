export interface CountryResult {
  country: "us" | "de";
  answerText: string;
  citations: string[];
  visibility: boolean;
  sentiment: number;        // -1.0 to 1.0
  narrativeSummary: string;
}

export interface QueryResult {
  queryId: number;
  entity: string;
  status: "pending" | "ready";
  results: CountryResult[];
}
