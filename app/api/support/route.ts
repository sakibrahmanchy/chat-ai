import { storage } from '@/firebase';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const image = formData.get('image') as File | null;


    // If there's an image, upload it first
    let screenshot_url = null;
    if (image) {
      const buffer = await image.arrayBuffer();
      const storageRef = ref(storage, `support-screenshots/${userId}/${Date.now()}-${image.name}`);
      const uploadResult = await uploadBytes(storageRef, buffer, {
        contentType: image.type
      });
      screenshot_url = await getDownloadURL(uploadResult.ref);
    }

    // Create the support ticket
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject,
        message,
        screenshot_url,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
} 