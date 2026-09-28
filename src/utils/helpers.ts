interface ApiError {
  response?: {
    data?: string;
    status?: number;
  };
  message?: string;
}

const errorMap: { match: string; message: string }[] = [
  { match: 'Student not found', message: 'Student not found.' },
  { match: 'Quiz not found', message: 'Quiz not found.' },
  { match: 'Question not found', message: 'Question not found.' },
  { match: 'Attempt not found', message: 'Attempt not found.' },
  { match: 'already attempted this quiz', message: 'You have already attempted this quiz.' },
  { match: 'Selected answer must be', message: 'Please select one of the four available options.' },
  { match: 'does not belong to this quiz', message: 'This question cannot be answered in this quiz.' },
  { match: 'already been submitted', message: 'This quiz has already been submitted.' },
  { match: 'Quiz time has expired', message: 'Time expired. Your quiz has been submitted.' },
  { match: 'already an active attempt', message: 'You already have an active attempt for this quiz.' },
];

export function getErrorMessage(err: unknown): string {
  const e = err as ApiError;
  const raw = e?.response?.data || e?.message || 'Something went wrong.';

  if (typeof raw === 'string') {
    for (const m of errorMap) {
      if (raw.includes(m.match)) return m.message;
    }
    return raw;
  }

  return 'Something went wrong. Please try again.';
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
