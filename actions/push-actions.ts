'use server'
 
import webpush from 'web-push'
 
webpush.setVapidDetails(
  '<mailto:your-email@example.com>',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)
 
let subscription: PushSubscription | null = null
 
// Add type for the subscription keys
interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true }
}
 
export async function unsubscribeUser() {
  subscription = null
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}
 
// Transform the browser PushSubscription to web-push compatible format
const sendNotification = async (subscription: PushSubscription, message: string) => {
  try {
    // Convert browser PushSubscription to web-push format
    const webPushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth'))
      }
    };

    await webpush.sendNotification(
      webPushSubscription,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
      })
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
};

// Helper function to convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}