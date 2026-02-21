import { NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const response = await sendAdminNotification({
      type: 'submission', // Default type for backward compatibility
      ...data
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Notification API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
