import * as thl from 'thalia';

import { File, FilePair, sanitiseId } from '..';
import { CppModuleInfo } from './cpp-module-info';

export function module(dirName: thl.fs.Pathlike, config: ModuleConfig): CppModuleInfo {
  const id = sanitiseId(config.moduleName);
  const dirPath = thl.fs.Path.ensure(dirName);
  const ninja = new FilePair(dirPath);

  ninja.define(`${id}.dir`, '${ninjaFileDir}');
  // TODO - Real path once integrated into lib?
  ninja.include(`\${${id}.dir}/../../thl-future/ninja/cpp/cpp.rules.ninja`);
  ninja.include(config.includes);
  ninja.include(
    config.deps
      ?.map(dep => dep.dirPath.joinWith('include.ninja').relativeTo(dirPath))
      .map(depPath => `\${${id}.dir}/${depPath}`),
  );

  const cflags = thl.util.combineArrays(
    [config.cflags, [`-I\${${id}.dir}/include`], config.deps?.map(dep => dep.cflags).flat()],
    { unique: true },
  );
  const lflags = thl.util.combineArrays([config.lflags, config.deps?.map(dep => dep.lflags).flat()], { unique: true });
  // const outPath = ;

  ninja.define(`${id}.name`, config.moduleName);
  ninja.define(`${id}.out`, `\${${id}.dir}/build-out/${config.out}`);
  ninja.define(`${id}.cflags`, cflags.join(' '));
  ninja.define(`${id}.lflags`, lflags.join(' '));

  const srcs = thl.fs.file.find(`${dirPath}/src`).map(src => {
    const srcPath = thl.fs.Path.ensure(src);
    const relative = srcPath.relativeTo(dirPath);
    const filename = `\${${id}.dir}/${relative}`;
    const intermediate = `\${${id}.dir}/build-out/intermediates/${relative}.o`;
    return { filename, intermediate, relative };
  });
  const objs = srcs.map(src => src.intermediate);

  ninja.build(
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
    ninja.build('cpp.compile', [src.filename], [src.intermediate], {
      cflags: `\${${id}.cflags}`,
      moduleName: `\${${id}.name}`,
      displayIn: src.relative,
    });
  }

  ninja.write();

  return { id, dirPath, cflags, lflags, outs: [] };
}

export function module2(ninjaFile: File, dirName: thl.fs.Pathlike, config: ModuleConfig): CppModuleInfo {
  const id = sanitiseId(config.moduleName);
  const dirPath = thl.fs.Path.ensure(dirName);

  ninjaFile.define(`${id}.dir`, dirPath.absolute());
  // TODO - Real path once integrated into lib?
  // ninja.include(`\${${id}.dir}/../../thl-future/ninja/cpp/cpp.rules.ninja`);
  // ninja.include(config.includes);
  // ninja.include(
  //   config.deps
  //     ?.map(dep => dep.dirPath.joinWith('include.ninja').relativeTo(dirPath))
  //     .map(depPath => `\${${id}.dir}/${depPath}`),
  // );

  const cflags = thl.util.combineArrays(
    [config.cflags, [`-I\${${id}.dir}/include`], config.deps?.map(dep => dep.cflags).flat()],
    { unique: true },
  );
  const lflags = thl.util.combineArrays([config.lflags, config.deps?.map(dep => dep.lflags).flat()], { unique: true });
  // const outPath = ;

  ninjaFile.define(`${id}.name`, config.moduleName);
  ninjaFile.define(`${id}.out`, `\${${id}.dir}/build-out/${config.out}`);
  ninjaFile.define(`${id}.cflags`, cflags.join(' '));
  ninjaFile.define(`${id}.lflags`, lflags.join(' '));

  const srcs = thl.fs.file.find(`${dirPath}/src`).map(src => {
    const srcPath = thl.fs.Path.ensure(src);
    const relative = srcPath.relativeTo(dirPath);
    const filename = `\${${id}.dir}/${relative}`;
    const intermediate = `\${${id}.dir}/build-out/intermediates/${relative}.o`;
    return { filename, intermediate, relative };
  });
  const objs = srcs.map(src => src.intermediate);

  ninjaFile.build(
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
    ninjaFile.build('cpp.compile', [src.filename], [src.intermediate], {
      cflags: `\${${id}.cflags}`,
      moduleName: `\${${id}.name}`,
      displayIn: src.relative,
    });
  }

  return { id, dirPath, cflags, lflags, outs: [] };
}

export interface ModuleConfig {
  cflags?: string[];
  deps?: CppModuleInfo[];
  includes?: string[];
  lflags?: string[];
  moduleName: string;
  out: string;
  rule: string;
}
