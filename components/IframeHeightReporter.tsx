import { useEffect, useRef } from 'react';

/**
 * IframeHeightReporter - Sends iframe height to parent window via PostMessage
 *
 * This component enables dynamic iframe resizing when embedded in WordPress.
 * The parent window (WordPress) listens for height messages and adjusts iframe height.
 *
 * Features:
 * - Debouncing to prevent excessive updates
 * - Minimum height change threshold (10px) to avoid noise
 * - Throttled updates (max once per 500ms)
 *
 * Usage: Add this component to any page/tool that will be embedded in an iframe.
 *
 * @returns null (invisible component, no UI)
 */
export function IframeHeightReporter() {
  const lastHeightRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Function to calculate and send height to parent
    function sendHeight() {
      const height = document.documentElement.scrollHeight;
      const heightChange = Math.abs(height - lastHeightRef.current);

      // Only send if height changed by at least 10px (prevents infinite loops)
      if (heightChange >= 10 || height === 0) {
        lastHeightRef.current = height;
        window.parent.postMessage({ height }, '*');
      }
    }

    // Debounced send function (prevents rapid-fire updates)
    function debouncedSendHeight() {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        sendHeight();
      }, 300); // Wait 300ms after last resize before sending
    }

    // Send initial height immediately
    sendHeight();

    // Set up ResizeObserver to watch for content changes
    let observer: ResizeObserver | null = null;

    try {
      observer = new ResizeObserver(() => {
        debouncedSendHeight();
      });
      observer.observe(document.documentElement);
    } catch (error) {
      console.warn('ResizeObserver not available, falling back to interval:', error);
      // Fallback: Poll every 2 seconds if ResizeObserver not available
      const interval = setInterval(() => {
        sendHeight();
      }, 2000);
      return () => {
        clearInterval(interval);
      };
    }

    // Also send periodically as fallback (catches any missed events)
    // But use longer interval since we have ResizeObserver
    const interval = setInterval(() => {
      sendHeight();
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      clearInterval(interval);
    };
  }, []);

  // This component renders nothing - it's just for side effects
  return null;
}
