import { loadStripe } from '@stripe/stripe-js';

// Certifique-se de que esta variável está definida no .env.local
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
    console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}

export const stripePromise = loadStripe(stripePublishableKey || '');
