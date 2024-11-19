import * as thl from 'thalia';
import * as path from 'path';

export function build(dirName: thl.fs.Pathlike, commandLine: string = ''): void {
  thl.fs.dir.setCurrentWhile(dirName, () => {
    thl.process.execute(`ninja ${commandLine}`);
  });
}

export function clean(dirName: thl.fs.Pathlike): void {
  build(dirName, '-t clean');
}

export function explode(filename: thl.fs.Pathlike, explodedFilename: thl.fs.Pathlike): void {
  const filePath = thl.fs.Path.ensure(filename);
  const explodedFilePath = thl.fs.Path.ensure(explodedFilename);
  const codeLines: string[] = [];
  const defines: Record<string, string> = {};
  const included = new Set<string>();
  const definePattern = /^(.*) = (.*)$/;
  const includePattern = /^include (.*)$/;

  function resolveDefinitions(value: string): string {
    for (const [definitionName, definitionValue] of Object.entries(defines)) {
      const find = definitionName.match(/^[A-Za-z0-9]+$/) ? `\$${definitionName}` : `\${${definitionName}}`;
      value = value.replace(find, definitionValue);
    }

    return value;
  }

  function processFile(innerFilePath: thl.fs.Path): void {
    let innerCode;
    try {
      innerCode = thl.fs.file.readText(innerFilePath);
    } catch (e) {
      console.log(`No luck ${innerFilePath} ${e}`);
      return;
    }

    for (const codeLine of innerCode.split('\n')) {
      const defineMatch = codeLine.match(definePattern);
      let skip = false;

      if (defineMatch) {
        defines[defineMatch[1]] = resolveDefinitions(defineMatch[2]);
      } else {
        const includeMatch = codeLine.match(includePattern);

        if (includeMatch) {
          const includeFilename = resolveDefinitions(includeMatch[1]);
          const includePath = `${includeFilename}`.startsWith('/')
            ? new thl.fs.Path(includeFilename)
            : innerFilePath.dirPath().joinWith(includeFilename);
          codeLines.push(`# include ${path.resolve(includePath.absolute())} START`);

          if (included.has(path.resolve(includePath.absolute()))) {
            codeLines.push('# Already included');
          } else {
            processFile(includePath);
            included.add(path.resolve(includePath.absolute()));
          }

          codeLines.push(`# include ${path.resolve(includePath.absolute())} END`);
          skip = true;
        }
      }

      if (!skip) {
        codeLines.push(codeLine);
      }
    }
  }

  processFile(filePath);

  thl.fs.file.writeText(explodedFilePath, codeLines.join('\n') + '\n');
}
