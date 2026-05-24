export function parseLocaleNumberInput(value: string): number | null {
  const raw = value.trim().replace(/\s+/g, '');
  if (!raw) {
    return null;
  }

  const hasComma = raw.includes(',');
  const hasDot = raw.includes('.');

  let normalized = raw;

  if (hasComma && hasDot) {
    const lastComma = raw.lastIndexOf(',');
    const lastDot = raw.lastIndexOf('.');
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const thousandSeparator = decimalSeparator === ',' ? '.' : ',';

    normalized = raw.split(thousandSeparator).join('');
    if (decimalSeparator === ',') {
      normalized = normalized.replace(',', '.');
    }
  } else if (hasComma || hasDot) {
    const separator = hasComma ? ',' : '.';
    const parts = raw.split(separator);

    if (parts.length > 2) {
      const last = parts.pop() ?? '';
      const integerPart = parts.join('');
      if (last.length === 0) {
        normalized = integerPart;
      } else if (last.length <= 2) {
        normalized = `${integerPart}.${last}`;
      } else {
        normalized = `${integerPart}${last}`;
      }
    } else {
      const [left, right] = parts;
      if (!right) {
        normalized = left;
      } else if (right.length === 3 && left.length >= 1) {
        normalized = `${left}${right}`;
      } else {
        normalized = `${left}.${right}`;
      }
    }
  }

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

export function formatLocaleNumberInput(value: number, decimals = 2): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}