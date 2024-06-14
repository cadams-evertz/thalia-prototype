import * as thl_util from '../util';

export class Repr {
  private readonly json: Record<string, any>;

  constructor(name: string, values: Record<string, unknown>) {
    this.json = { [`!!${name}`]: JSON.parse(JSON.stringify(values)) };

    for (const entry of thl_util.walkObject(this.json)) {
      if (entry.value.repr) {
        entry.value = entry.value.repr().json;
      }
    }
  }

  public toString(): string {
    const jsonStr = JSON.stringify(this.json, undefined, '  ');
    const lines = jsonStr.split('\n');
    const skipTag = '!!skip';
    const skip = new Set<string>();

    for (let index = 0; index < lines.length; index++) {
      if (skip.has(lines[index])) {
        skip.delete(lines[index]);
        lines[index] = skipTag;
      } else {
        const match = lines[index].match(/^([ ]+)"!!(.*)":(.*)/);

        if (match) {
          const indent = match[1];
          const name = match[2];
          const rest = match[3];
          lines[index] = `${indent}${name}${rest}`;

          const bracketMatch = lines[index - 1].match(/^([ ]*)\{$/);

          if (bracketMatch) {
            const bracketIndent = bracketMatch[1];
            const spaces = bracketIndent.length + skip.size * 2;
            lines[index - 1] = skipTag;
            skip.add(`${' '.repeat(spaces)}}`);
          }
        }
      }

      if (lines[index] !== skipTag) {
        lines[index] = lines[index].slice(skip.size * 2);
      }
    }

    return lines.filter(line => line !== skipTag).join('\n');
  }
}
