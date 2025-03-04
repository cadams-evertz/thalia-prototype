import * as thl from 'thalia';
import * as thl_ninja from '../ninja';

export class Node {
  public readonly id: string;
  public readonly includes: string[] = [];

  protected readonly deps?: Node[];

  private readonly dirPath: thl.fs.Path;
  private readonly sanitisedId: string;

  constructor(config: NodeConfig) {
    this.deps = config.deps;
    this.dirPath = thl.fs.Path.ensure(config.dirPath);
    this.id = config.id;
    this.sanitisedId = thl_ninja.sanitiseId(this.id);
  }

  public defineScoped(file: thl_ninja.File, name: string, value: string): void {
    file.define(this.scopedName(name), value);
  }

  public static getRecursiveDeps(nodes: Node[]): Node[] {
    const result: Node[] = [];

    function walk(nodes: Node[] | undefined): void {
      if (!nodes) {
        return;
      }

      for (const node of nodes) {
        if (!result.includes(node)) {
          walk(node.deps);
          result.push(node);
        }
      }
    }

    walk(nodes);

    return result;
  }

  public scopedName(name: string): string {
    return `${this.sanitisedId}.${name}`;
  }

  public scopedValue(name: string): string {
    return `\${${this.scopedName(name)}}`;
  }

  public writeNinja(file: thl_ninja.File): void {
    let relativeDir = this.dirPath.relativeTo(file.filePath.dirPath());

    if (!relativeDir) {
      relativeDir = '.';
    }

    file.comment(['', `=== ${this.id} ===`]);
    this.defineScoped(file, 'relativeDir', relativeDir);
    this.defineScoped(file, 'relativeBuildOutDir', `build-out/${this.scopedValue('relativeDir')}`);
    this.defineScoped(file, 'dir', `\${ninjaFileDir}/${this.scopedValue('relativeDir')}`);
    this.defineScoped(file, 'buildOutDir', `\${ninjaFileDir}/${this.scopedValue('relativeBuildOutDir')}`);
  }
}

export interface NodeConfig {
  deps?: Node[];
  dirPath: thl.fs.Pathlike;
  id: string;
}
