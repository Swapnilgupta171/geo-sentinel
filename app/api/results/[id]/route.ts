import { NextResponse } from 'next/server';
import { getQueryById, getResponsesByQueryId, insertRawResponses, updateResponseAnalysis } from '../../../../db/client';
import OpenAI from 'openai';
import { QueryResult, CountryResult } from '../../../../shared/types';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const queryId = parseInt(params.id, 10);
    if (isNaN(queryId)) {
      return NextResponse.json({ error: 'Invalid query ID' }, { status: 400 });
    }

    const queryRecord = getQueryById(queryId);
    if (!queryRecord) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 });
    }

    const existingResponses = getResponsesByQueryId(queryId);
    
    // Check if we already have fully analyzed responses
    if (existingResponses.length === 2 && existingResponses.every(r => r.sentiment !== null)) {
      const results: CountryResult[] = existingResponses.map(r => ({
        country: r.country as "us" | "de",
        answerText: r.answer_text || "",
        citations: JSON.parse(r.citations || "[]"),
        visibility: r.visibility === 1,
        sentiment: r.sentiment || 0,
        narrativeSummary: r.narrative_summary || ""
      }));
      
      const queryResult: QueryResult = {
        queryId,
        entity: queryRecord.entity,
        status: "ready",
        results
      };
      
      return NextResponse.json(queryResult);
    }

    // We don't have full results yet.
    let rawResponses = existingResponses;
    
    // Check if we need to fetch raw responses from Bright Data
    if (rawResponses.length === 0) {
      const token = process.env.BRIGHT_DATA_API_TOKEN;
      if (!token) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      // Add format=json to ensure we get a JSON array back
      const datasetUrl = `https://api.brightdata.com/dca/dataset?id=${queryRecord.snapshot_id}&format=json`;
      const bdResponse = await fetch(datasetUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!bdResponse.ok) {
        // Bright Data may return non-200 if still processing, just keep pending
        return NextResponse.json({ status: "pending", results: [] });
      }

      const datasetText = await bdResponse.text();
      let dataset = [];
      try {
          dataset = JSON.parse(datasetText);
      } catch (e) {
          // fallback if it returns ndjson
          dataset = datasetText.split('\\n').filter(line => line.trim().length > 0).map(line => JSON.parse(line));
      }

      // If dataset is empty or doesn't have both country records, it's still pending
      if (!dataset || !Array.isArray(dataset) || dataset.length < 2) {
        return NextResponse.json({ status: "pending", results: [] });
      }

      // Insert the raw responses
      const responsesToInsert = dataset.map((item: any) => ({
        country: item.country || (item.input && item.input.country),
        answerText: item.answer_text,
        citations: Array.isArray(item.citations) ? item.citations : []
      }));

      // Basic validation that we have the needed country info
      if (responsesToInsert.every(r => r.country)) {
        insertRawResponses(queryId, responsesToInsert);
        rawResponses = getResponsesByQueryId(queryId); // reload to get DB IDs
      } else {
        return NextResponse.json({ status: "pending", results: [] });
      }
    }

    // Now we have raw responses. Run LLM Analysis if it hasn't been run yet.
    if (rawResponses.length === 2 && rawResponses.some(r => r.sentiment === null)) {
      const prompt = `
      Analyze the following two AI search engine answers regarding the entity "${queryRecord.entity}".
      
      US Answer:
      ${rawResponses.find(r => r.country === 'us')?.answer_text}
      
      Germany (DE) Answer:
      ${rawResponses.find(r => r.country === 'de')?.answer_text}
      
      Provide a strict JSON response comparing the two, with the following structure:
      {
        "us": {
          "visibility": boolean (true if the entity is prominently discussed),
          "sentiment": number (-1.0 to 1.0, where -1 is very negative, 1 is very positive),
          "narrativeSummary": string (a 1-sentence summary of how this country's answer frames the entity)
        },
        "de": {
          "visibility": boolean,
          "sentiment": number,
          "narrativeSummary": string
        }
      }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a helpful data analyst. Output only valid JSON." },
          { role: "user", content: prompt }
        ]
      });

      const content = completion.choices[0].message.content;
      if (content) {
        const analysis = JSON.parse(content);
        
        // Update DB
        if (analysis.us) {
          updateResponseAnalysis(queryId, 'us', {
            visibility: analysis.us.visibility,
            sentiment: analysis.us.sentiment,
            narrativeSummary: analysis.us.narrativeSummary
          });
        }
        if (analysis.de) {
          updateResponseAnalysis(queryId, 'de', {
            visibility: analysis.de.visibility,
            sentiment: analysis.de.sentiment,
            narrativeSummary: analysis.de.narrativeSummary
          });
        }
        
        // Return ready
        const finalResponses = getResponsesByQueryId(queryId);
        const results: CountryResult[] = finalResponses.map(r => ({
          country: r.country as "us" | "de",
          answerText: r.answer_text || "",
          citations: JSON.parse(r.citations || "[]"),
          visibility: r.visibility === 1,
          sentiment: r.sentiment || 0,
          narrativeSummary: r.narrative_summary || ""
        }));
        
        return NextResponse.json({
          queryId,
          entity: queryRecord.entity,
          status: "ready",
          results
        });
      }
    }

    // If analysis fails or something is missing, just remain pending
    return NextResponse.json({ status: "pending", results: [] });

  } catch (error) {
    console.error('Error in /api/results/[id]:', error);
    return NextResponse.json({ status: "pending", results: [] });
  }
}
