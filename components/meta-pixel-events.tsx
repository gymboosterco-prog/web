"use client"

import { useEffect } from "react"

export function MetaPixelEvents() {
  useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Engaged User Tracking (30 seconds)
    const engagementTimer = setTimeout(() => {
      if ((window as any).fbq) {
        (window as any).fbq('trackCustom', 'EngagedUser', {
          time_on_page: '30s'
        });
        console.log("Meta Pixel: EngagedUser event tracked (30s)");
      }
    }, 30000);

    // 2. Scroll Depth Tracking
    let scroll50Tracked = false;
    let scroll90Tracked = false;

    const handleScroll = () => {
      if (!(window as any).fbq) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      if (scrollPercent >= 50 && !scroll50Tracked) {
        (window as any).fbq('trackCustom', 'ScrollDepth', {
          depth: '50%',
          content_name: document.title
        });
        scroll50Tracked = true;
        console.log("Meta Pixel: ScrollDepth 50% tracked");
      }

      if (scrollPercent >= 90 && !scroll90Tracked) {
        (window as any).fbq('trackCustom', 'ScrollDepth', {
          depth: '90%',
          content_name: document.title
        });
        scroll90Tracked = true;
        console.log("Meta Pixel: ScrollDepth 90% tracked");
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(engagementTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}
