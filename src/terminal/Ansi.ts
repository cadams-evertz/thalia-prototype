import * as thalia_env from '../env';

class Ansi {
  public enabled: boolean;

  constructor() {
    if (thalia_env.jenkins()) {
      console.info('Jenkins detected. ANSI text effects disabled...');
      this.enabled = false;
    } else {
      this.enabled = true;
    }
  }

  public ansi(command: string): string {
    const ESC = '\x1b';
    return this.enabled ? `${ESC}${command}` : '';
  }

  public csi(command: string): string {
    return this.ansi(`[${command}`);
  }

  public disable(): void {
    this.enabled = false;
  }

  public enable(): void {
    this.enabled = true;
  }

  public sgr(command: string): string {
    return this.csi(`${command}m`);
  }
}

export const ansi = new Ansi();
