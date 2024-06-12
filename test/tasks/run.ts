import * as thl from 'thalia';

async function main(): Promise<void> {
  thl.log.info('=== START ===');

  const tasks = new thl.task.Tasks();
  const a = new thl.task.ChildProcessTask('g++ -c a.cpp');
  const b = new thl.task.ChildProcessTask('g++ -c b.cpp');
  const exe = new thl.task.ChildProcessTask('g++ a.o b.o', [a, b]);
  tasks.add(exe);
  console.debug(`Running ${tasks.jobs} concurrent task(s)`);
  await tasks.run();

  thl.log.info('=== END ===');
}

main();
