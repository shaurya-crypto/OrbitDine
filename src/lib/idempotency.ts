import { NextRequest, NextResponse } from 'next/server';
import IdempotencyRecord from '@/models/IdempotencyRecord';
import connectToDatabase from '@/lib/mongodb/db';

/**
 * Wraps an API handler with exactly-once processing guarantees.
 * If X-Idempotency-Key is provided, it checks if the action was already completed.
 */
export async function withIdempotency(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const idempotencyKey = req.headers.get('x-idempotency-key');

  if (!idempotencyKey) {
    // If no key provided, proceed normally (for standard online requests or legacy clients)
    return handler();
  }

  await connectToDatabase();

  const endpoint = req.nextUrl.pathname;
  const method = req.method;

  // 1. Check if record already exists
  let record;
  try {
    record = await IdempotencyRecord.findOne({ key: idempotencyKey });
  } catch (e) {
    console.error("Idempotency lookup failed", e);
    // Safe fallback: proceed with request if DB lookup fails, though risky for duplicates
    return handler();
  }

  if (record) {
    if (record.status === 'COMPLETED') {
      return NextResponse.json(record.responseBody, { status: record.statusCode || 200 });
    }
    
    if (record.status === 'PROCESSING') {
      return NextResponse.json({ error: "Conflict: Request already processing" }, { status: 409 });
    }

    // If FAILED, we will retry it now
  } else {
    // Create new PROCESSING record
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour TTL

    try {
      record = await IdempotencyRecord.create({
        key: idempotencyKey,
        endpoint,
        method,
        status: 'PROCESSING',
        expiresAt
      });
    } catch (e: any) {
      // Handle MongoDB unique constraint error if multiple requests hit exactly at the same time
      if (e.code === 11000) {
        return NextResponse.json({ error: "Conflict: Concurrent request detected" }, { status: 409 });
      }
      return handler(); // Fallback if creation fails for other reasons
    }
  }

  // 2. Execute the actual handler
  try {
    const response = await handler();
    
    // We need to clone the response to read the body without consuming it
    const clonedResponse = response.clone();
    let body;
    try {
      body = await clonedResponse.json();
    } catch {
      body = { message: "Success without JSON body" };
    }

    // Update record to COMPLETED
    if (record) {
      record.status = response.ok ? 'COMPLETED' : 'FAILED';
      record.responseBody = body;
      record.statusCode = response.status;
      await record.save().catch(e => console.error("Failed to save idempotency result", e));
    }

    return response;
  } catch (error) {
    // Update record to FAILED on server crash
    if (record) {
      record.status = 'FAILED';
      record.statusCode = 500;
      record.responseBody = { error: "Internal Server Error during execution" };
      await record.save().catch(e => console.error("Failed to save idempotency failure", e));
    }
    throw error;
  }
}
