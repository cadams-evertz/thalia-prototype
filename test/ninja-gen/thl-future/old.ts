import * as thl from 'thalia';

export type MakefileCode = Array<MakefileCodeItem>;
export type MakefileCodeItem = Define | Include | Rule;

export interface Define {
  define: {
    name: string;
    value: string;
  };
}
function isDefine(item: MakefileCodeItem): item is Define {
  return (item as any).define;
}

export interface Include {
  include: string;
}
function isInclude(item: MakefileCodeItem): item is Include {
  return (item as any).include;
}

export interface Rule {
  rule: {
    commands?: Command[];
    default?: boolean;
    inputs?: string[];
    outputs: string[];
    phoney?: boolean;
  };
}
function isRule(item: MakefileCodeItem): item is Rule {
  return (item as any).rule;
}

export interface Command {
  command: string;
  description?: string;
  echo?: boolean;
}

export function createMakefile(makefilename: thl.fs.Pathlike, makefileCode: MakefileCode): void {
  const makeCodeLines: string[] = ['# TODO - Header comment...'];

  for (const item of makefileCode) {
    if (isDefine(item)) {
      const define = item.define;
      makeCodeLines.push(`${define.name} ${define.immediate ? ':=' : '='} ${define.value}`);
    } else if (isInclude(item)) {
      const include = item.include;
      makeCodeLines.push(`include ${include}`);
    } else if (isRule(item)) {
      const rule = item.rule;
      makeCodeLines.push('');

      if (item.rule.phoney) {
        makeCodeLines.push(`.PHONEY: ${rule.outputs.join(' ')}`);
      }

      makeCodeLines.push(`${rule.outputs.join(' ')}: ${rule.inputs ? rule.inputs.join(' ') : ''}`.trimEnd());

      if (rule.commands) {
        for (const command of rule.commands) {
          const echo = command.echo !== undefined ? command.echo : !command.description;

          if (command.description) {
            makeCodeLines.push(`\t@echo '${command.description}'`);
          }

          makeCodeLines.push(`\t${echo ? '' : '@'}${command.command}`);
        }
      }
    } else {
      throw new Error(`Unknown item: ${item}`);
    }
  }

  thl.fs.file.writeText(makefilename, makeCodeLines.join('\n') + '\n');
}
