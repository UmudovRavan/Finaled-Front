export const getStoredTimezone = () => localStorage.getItem('crmTimezone') || 'Asia/Baku';

export const formatAppDate = (dateValue, options = {}) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return String(dateValue);

  const timezone = getStoredTimezone();
  const defaultOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };

  try {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch (err) {
    return date.toLocaleString();
  }
};
