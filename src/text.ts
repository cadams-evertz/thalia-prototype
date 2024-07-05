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
