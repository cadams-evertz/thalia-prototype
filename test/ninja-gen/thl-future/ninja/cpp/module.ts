import * as thl from 'thalia';

import { explode, File, ModuleInfo } from '..';

export function module(dirName: thl.fs.Pathlike, config: ModuleConfig): ModuleInfo {
  const id = config.moduleName.replace(/[^A-Za-z0-9]/g, '_');
  const dirPath = thl.fs.Path.ensure(dirName);
  const ninjaFilename = dirPath.joinWith('build.compact.ninja');
  const targetsNinja = new File(ninjaFilename);
  targetsNinja.define(`${id}.dir`, '$ninjaFileDir');

  targetsNinja.include(`\${${id}.dir}/../../thl-future/ninja/files/cpp.rules.ninja`);

  if (config.includes) {
    for (const include of config.includes) {
      targetsNinja.include(include);
    }
  }

  if (config.deps) {
    for (const dep of config.deps) {
      const depPath = dep.dirPath.joinWith('build.compact.ninja').relativeTo(dirPath);
      targetsNinja.include(`\${${id}.dir}/${depPath}`);
    }
  }

  let cflags = [...(config.cflags ?? []), `-I\${${id}.dir}/include`];
  let lflags = [...(config.lflags ?? [])];

  if (config.deps) {
    cflags.push(...config.deps.map(dep => dep.cflags).flat());
    lflags.push(...config.deps.map(dep => dep.lflags).flat());
  }

  cflags = thl.util.unique(cflags);
  lflags = thl.util.unique(lflags);

  targetsNinja.define(`${id}.name`, config.moduleName);
  targetsNinja.define(`${id}.out`, `\${${id}.dir}/build-out/${config.out}`);
  targetsNinja.define(`${id}.cflags`, cflags.join(' '));

  if (lflags.length > 0) {
    targetsNinja.define(`${id}.lflags`, lflags.join(' '));
  }

  const srcs = thl.fs.file.find(`${dirPath}/src`).map(src => {
    const srcPath = thl.fs.Path.ensure(src);
    const relative = srcPath.relativeTo(dirPath);
    const filename = `\${${id}.dir}/${relative}`;
    const intermediate = `\${${id}.dir}/build-out/intermediates/${relative}.o`;
    return { filename, intermediate, relative };
  });
  const objs = srcs.map(src => src.intermediate);

  targetsNinja.build(
    config.rule,
    [...objs, ...(config.deps ? config.deps.map(dep => `\${${dep.id}.out}`) : [])],
    [`\${${id}.out}`],
    {
      moduleName: `\${${id}.name}`,
      objs: objs.join(' '),
      lflags: `\${${id}.lflags}`,
      displayOut: `build-out/${config.out}`,
    },
  );

  for (const src of srcs) {
    targetsNinja.build('cpp.compile', [src.filename], [src.intermediate], {
      cflags: `\${${id}.cflags}`,
      moduleName: `\${${id}.name}`,
      displayIn: src.relative,
    });
  }

  targetsNinja.write();
  explode(ninjaFilename, dirPath.joinWith('build.ninja'));

  return new ModuleInfo(id, dirPath, cflags, lflags);
}

export interface ModuleConfig {
  cflags?: string[];
  deps?: ModuleInfo[];
  includes?: string[];
  lflags?: string[];
  moduleName: string;
  out: string;
  rule: string;
}
