import { NextResponse } from 'next/server';
import { createImageStorageTable } from '@/lib/neon-storage';

export async function POST() {
  try {
    await createImageStorageTable();
    
    return NextResponse.json({
      message: 'Image storage table created successfully'
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup image storage' },
      { status: 500 }
    );
  }
} 