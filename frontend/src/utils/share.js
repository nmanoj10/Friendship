/**
 * Shares content using the Web Share API when available,
 * otherwise falls back to copying to the clipboard.
 * Returns 'shared' | 'copied' | 'cancelled' | 'failed'.
 */
export async function shareContent({ title, text, url }) {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
      // fall through to clipboard on other errors
    }
  }
  const ok = await copyText(text ? `${text} ${url}` : url);
  return ok ? 'copied' : 'failed';
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}
