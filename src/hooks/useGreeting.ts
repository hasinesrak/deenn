export function getGreeting(date = new Date()): { label: string; message: string } {
  const hour = date.getHours();

  if (hour < 12) {
    return {
      label: 'GOOD MORNING',
      message: 'May Allah accept\nyour efforts.',
    };
  }

  if (hour < 17) {
    return {
      label: 'GOOD AFTERNOON',
      message: 'May Allah accept\nyour efforts.',
    };
  }

  if (hour < 21) {
    return {
      label: 'GOOD EVENING',
      message: 'May Allah accept\nyour efforts.',
    };
  }

  return {
    label: 'GOOD NIGHT',
    message: 'May Allah grant you\npeaceful rest.',
  };
}
