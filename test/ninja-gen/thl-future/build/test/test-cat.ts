import * as thl from 'thalia';
import * as thl_ninja from '../../ninja';

import { Node, NodeConfig } from '..';

export function testCat(config: TestCatConfig): TestCat {
  return new TestCat(config);
}

class TestCat extends Node {
  private readonly in?: thl.fs.Path[];
  private readonly out: string;

  constructor(config: TestCatConfig) {
    super(config);
    this.includes.push('test.rules.ninja');
    this.in = thl.fs.Path.ensureArray(config.in ?? []);
    this.out = config.out;
  }

  writeNinja(ninja: thl_ninja.File): void {
    super.writeNinja(ninja);

    const in_: string[] = [];

    in_.push(...(this.in?.map(in_ => in_.absolute()) ?? []));
    in_.push(...(this.deps?.map(dep => dep.scopedValue('out')) ?? []));

    this.defineScoped(ninja, 'out', `${this.scopedValue('buildOutDir')}/${this.out}`);

    ninja.build('test.cat', in_, [this.scopedValue('out')], {
      id: this.id,
      displayOut: `${this.scopedValue('relativeBuildOutDir')}/${this.out}`,
    });
  }
}

interface TestCatConfig extends NodeConfig {
  in?: thl.fs.Pathlike[];
  out: string;
}