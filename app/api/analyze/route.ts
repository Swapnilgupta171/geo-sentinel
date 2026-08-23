import { NextResponse } from 'next/server';
import { createQuery } from '../../../db/client';

export async function POST(request: Request) {
  try {
    const { entity } = await request.json();
    
    if (!entity || typeof entity !== 'string') {
      return NextResponse.json({ error: 'Valid entity string is required' }, { status: 400 });
    }

    const token = process.env.BRIGHT_DATA_API_TOKEN;
    const collectorId = process.env.BRIGHT_DATA_COLLECTOR_ID;

    if (!token || !collectorId) {
      console.error('Missing Bright Data credentials in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Call Bright Data trigger API
    const triggerUrl = `https://api.brightdata.com/dca/trigger?collector=${collectorId}&queue_next=1`;
    
    const payload = [
      { entity, country: 'us' },
      { entity, country: 'de' }
    ];

    const bdResponse = await fetch(triggerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!bdResponse.ok) {
      const errorText = await bdResponse.text();
      console.error('Bright Data trigger failed:', errorText);
      return NextResponse.json({ error: 'Failed to trigger scraper' }, { status: 500 });
    }

    const data = await bdResponse.json();
    const snapshotId = data.collection_id;

    if (!snapshotId) {
      console.error('No collection_id returned from Bright Data:', data);
      return NextResponse.json({ error: 'Invalid response from scraper API' }, { status: 500 });
    }

    // Insert into SQLite
    const queryId = createQuery(entity, snapshotId);

    return NextResponse.json({ queryId });

  } catch (error) {
    console.error('Error in /api/analyze:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
