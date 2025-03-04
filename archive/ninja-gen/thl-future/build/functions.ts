import * as thl from 'thalia';
import * as thl_ninja from '../ninja';

import { Node } from './node';

export function writeNinjaFile(nodes: Node[], ninjaFilename: thl.fs.Pathlike = 'build.ninja'): void {
  const ninjaFile = new thl_ninja.File(ninjaFilename);
  const orderedNodes = Node.getRecursiveDeps(nodes);
  const includes = thl.util.unique(orderedNodes.map(node => node.includes).flat());

  for (const include of includes) {
    ninjaFile.include(include);
  }

  for (const node of orderedNodes) {
    node.writeNinja(ninjaFile);
  }

  ninjaFile.write();
}
