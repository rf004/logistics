/**
 * Format weight in kilograms or metric tons
 */
export function formatWeight(kg, precision = 1) {
  if (kg === undefined || kg === null || isNaN(kg)) return '0 kg';
  const num = Number(kg);
  if (num >= 1000) {
    return `${(num / 1000).toFixed(precision)} t (${num.toLocaleString()} kg)`;
  }
  return `${num.toLocaleString()} kg`;
}

/**
 * Format distance in kilometers
 */
export function formatDistance(km, precision = 1) {
  if (km === undefined || km === null || isNaN(km)) return '0 km';
  return `${Number(km).toFixed(precision)} km`;
}

/**
 * Format date & time cleanly
 */
export function formatDate(dateString, format = 'relative') {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  if (format === 'relative') {
    const diffMs = Date.now() - date.getTime();
    const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      const futureHrs = Math.abs(diffHrs);
      if (futureHrs < 24) return `in ${futureHrs}h`;
      return `in ${Math.abs(diffDays)}d`;
    }

    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format hours of shelf life into readable string
 */
export function formatShelfLife(hours) {
  if (hours === undefined || hours === null || isNaN(hours)) return '0 hrs';
  const num = Number(hours);
  if (num <= 0) return 'Expired';
  if (num < 24) return `${num.toFixed(1)} hrs`;
  const days = (num / 24).toFixed(1);
  return `${days} days (${num.toFixed(0)} hrs)`;
}

/**
 * Format percentage
 */
export function formatPercent(value, precision = 1) {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${Number(value).toFixed(precision)}%`;
}

/**
 * Shorten Mongo ObjectId for minimal display
 */
export function truncateId(id, prefix = '') {
  if (!id) return '';
  const str = String(id);
  if (str.length <= 8) return prefix ? `${prefix}-${str}` : str;
  const short = str.slice(-6).toUpperCase();
  return prefix ? `${prefix}-${short}` : short;
}
