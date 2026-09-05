/**
 * Stripe Integration - KEPT BUT VISUALLY HIDDEN/DISABLED
 * To activate:
 * 1. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local
 * 2. Set STRIPE_SECRET_KEY in .env.local
 * 3. Set STRIPE_WEBHOOK_SECRET in .env.local
 * 4. Uncomment the payment buttons in TrainingPrograms component
 */

export interface PaymentSession {
  sessionId: string;
  url: string;
}

export async function createCheckoutSession(programId: number, programTitle: string, price: number): Promise<PaymentSession | null> {
  console.log('Stripe payments are currently disabled. Program:', programTitle);
  return null;
}

export async function handleWebhook(payload: string, signature: string): Promise<boolean> {
  return false;
}
