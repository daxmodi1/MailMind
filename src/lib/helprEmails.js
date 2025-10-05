export const decodeHtmlEntities = (text) => {
  if (!text) return text;
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  return doc.documentElement.textContent;
};

export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0)
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    else if (days < 7)
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    else if (date.getFullYear() === now.getFullYear())
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    else
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
};


export const extractSenderName = (from) => {
    const match = from?.match(/^([^<]+)</);
    return match ? match[1].trim() : from?.replace(/.*<(.*)>.*/, '$1') || from;
};