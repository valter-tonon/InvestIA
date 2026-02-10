"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

export function GoogleAnalytics() {
    // Only load in production or if explicitly enabled
    const isEnabled = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_GA_ENABLED === "true";

    if (!isEnabled) {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}', {
                        page_path: window.location.pathname,
                    });
                `}
            </Script>
        </>
    );
}

declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

// Helper function to track custom events
export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", eventName, eventParams);
    }
};
