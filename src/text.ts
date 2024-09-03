export const unicode = {
  BOX_DRAWINGS_LIGHT_HORIZONTAL: '\u2500',
  BOX_DRAWINGS_HEAVY_HORIZONTAL: '\u2501',
  BOX_DRAWINGS_DOUBLE_HORIZONTAL: '\u2550',
};

export function expandTemplate(template: string, substitutions: Record<string, unknown>): string {
  let result = template;

  for (const [key, value] of Object.entries(substitutions)) {
    const strValue = Array.isArray(value) ? value.map(item => `${item}`).join(' ') : value ? `${value}` : '';
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), strValue);
  }

  return result;
}

export function reformat(
  value: string,
  options: { case?: 'all-lower' | 'all-upper' | 'camel' | 'title'; separator?: string },
): string {
  const case_ = options.case ?? 'original';
  const separator = options.separator ?? '';
  let mapper: (value: string, index: number) => string;

  switch (case_) {
    case 'all-lower':
      mapper = value => value.toLowerCase();
      break;
    case 'all-upper':
      mapper = value => value.toUpperCase();
      break;
    case 'camel':
      mapper = (value, index) =>
        index === 0 || value.length < 1
          ? value.toLowerCase()
          : value.slice(0, 1).toUpperCase() + value.slice(1).toLowerCase();
      break;
    case 'title':
      mapper = value => value.slice(0, 1).toUpperCase() + value.slice(1).toLowerCase();
      break;
    case 'original':
      mapper = value => value;
      break;
  }

  const bits = value.split(/[^A-Za-z0-9]/);
  const reformattedBits = bits.map(mapper);

  return reformattedBits.join(separator);
}

export function removePrefix(text: string, prefix: string): string {
  return text.startsWith(prefix) ? text.substring(prefix.length) : text;
}

export function tabulate(rows: Record<any, any>[], columnPadding = 2): string[] {
  const keyValueRows = rows.map(row => Object.entries(row).map(([key, value]) => [key, `${value}`]));
  const columnWidths: Record<string, number> = {};

  for (const keyValueRow of keyValueRows) {
    for (const [key, value] of keyValueRow) {
      const thisColumnWidth = value.length;
      const maxColumnWidth = columnWidths[key];
      if (!maxColumnWidth || thisColumnWidth > maxColumnWidth) {
        columnWidths[key] = thisColumnWidth;
      }
    }
  }

  return keyValueRows.map(keyValueRow =>
    keyValueRow.map(([key, value]) => value.padEnd(columnWidths[key] + columnPadding)).join(''),
  );
}
