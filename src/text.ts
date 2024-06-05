export const unicode = {
  BOX_DRAWINGS_LIGHT_HORIZONTAL: '\u2500',
  BOX_DRAWINGS_HEAVY_HORIZONTAL: '\u2501',
  BOX_DRAWINGS_DOUBLE_HORIZONTAL: '\u2550',
};

export function removePrefix(text: string, prefix: string): string {
  return text.startsWith(prefix) ? text.substring(prefix.length) : text;
}
