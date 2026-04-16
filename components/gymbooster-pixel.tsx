"use client"

import { usePathname } from "next/navigation"
import Script from "next/script"
import { MetaPixelEvents } from "@/components/meta-pixel-events"

const PIXEL_ID = "796159073358189"

// Salon landing pages (/p/) and embed forms (/f/) use their own per-salon pixel.
// Do NOT load the global Gymbooster pixel on those routes.
const EXCLUDED_PREFIXES = ["/p/", "/f/"]

export function GymboosterPixel() {
  const pathname = usePathname()

  if (EXCLUDED_PREFIXES.some(prefix => pathname?.startsWith(prefix))) {
    return null
  }

  return (
    <>
      <MetaPixelEvents />
      <Script
        id="fb-pixel"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('set', 'autoConfig', false, '${PIXEL_ID}');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
