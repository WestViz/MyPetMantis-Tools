import { useEffect } from 'react';

/**
 * IframeHeightReporter - Sends iframe height to parent window via PostMessage
 *
 * This component enables dynamic iframe resizing when embedded in WordPress.
 * The parent window (WordPress) listens for height messages and adjusts iframe height.
 *
 * Usage: Add this component to any page/tool that will be embedded in an iframe.
 *
 * @returns null (invisible component, no UI)
 */
export function IframeHeightReporter() {
  useEffect(() => {
    // Function to calculate and send height to parent
    function sendHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ height }, '*');
    }

    // Send initial height immediately
    sendHeight();

    // Set up ResizeObserver to watch for content changes
    let observer: ResizeObserver | null = null;

    try {
      observer = new ResizeObserver(() => {
        sendHeight();
      });
      observer.observe(document.documentElement);
    } catch (error) {
      console.warn('ResizeObserver not available, falling back to interval:', error);
      // Fallback: Poll every 1 second if ResizeObserver not available
      const interval = setInterval(sendHeight, 1000);
      return () => {
        clearInterval(interval);
      };
    }

    // Send height periodically as fallback (catches any missed events)
    const interval = setInterval(sendHeight, 2000);

    // Cleanup on unmount
    return () => {
      if (observer) {
        observer.disconnect();
      }
      clearInterval(interval);
    };
  }, []);

  // This component renders nothing - it's just for side effects
  return null;
}
