import { NextResponse } from 'next/server';

export async function testProcess(text: string) {
  return { processed: text };
} 