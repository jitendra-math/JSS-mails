import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request) {
  try {
    // 1. Security Check: Sirf authenticated user (tum) hi upload kar sake
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Frontend se aayi hui file ko extract karna
    const form = await request.formData();
    const file = form.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Vercel Blob mein upload karna
    // 'public' access ka matlab hai email receiver is file ko direct URL se dekh payega
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // 4. File upload hone ke baad uski details (aur URL) frontend ko wapas bhejna
    return NextResponse.json({ 
      success: true,
      url: blob.url, 
      name: file.name, 
      size: file.size 
    });

  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
