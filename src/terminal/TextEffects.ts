import { ansi as thalia_terminal_ansi } from './Ansi';

export class TextEffect {
  constructor(public readonly on: () => string, public readonly off: () => string) {}

  public wrap(text: string): string {
    return `${this.on()}${text}${this.off()}`;
  }
}

export class SgrTextEffect extends TextEffect {
  constructor(on: string, off: string) {
    super(
      () => thalia_terminal_ansi.sgr(on),
      () => thalia_terminal_ansi.sgr(off),
    );
  }
}

export class ColourTextEffect extends SgrTextEffect {
  constructor(onGroup: number, colour: number, offGroup: number) {
    super(`${onGroup + colour}`, `${offGroup + 9}`);
  }
}

export class ColourTextEffects {
  public readonly black: TextEffect;
  public readonly blue: TextEffect;
  public readonly cyan: TextEffect;
  public readonly default: TextEffect;
  public readonly green: TextEffect;
  public readonly magenta: TextEffect;
  public readonly red: TextEffect;
  public readonly white: TextEffect;
  public readonly yellow: TextEffect;

  constructor(onGroup: number, offGroup: number) {
    this.black = new ColourTextEffect(onGroup, 0, offGroup);
    this.blue = new ColourTextEffect(onGroup, 4, offGroup);
    this.cyan = new ColourTextEffect(onGroup, 6, offGroup);
    this.default = new ColourTextEffect(onGroup, 9, offGroup);
    this.green = new ColourTextEffect(onGroup, 2, offGroup);
    this.magenta = new ColourTextEffect(onGroup, 5, offGroup);
    this.red = new ColourTextEffect(onGroup, 1, offGroup);
    this.white = new ColourTextEffect(onGroup, 7, offGroup);
    this.yellow = new ColourTextEffect(onGroup, 3, offGroup);
  }
}

export class DualColourTextEffects extends ColourTextEffects {
  public readonly bright: ColourTextEffects;

  constructor(normalGroup: number, brightGroup: number) {
    super(normalGroup, normalGroup);
    this.bright = new ColourTextEffects(brightGroup, normalGroup);
  }
}

export class TextEffects {
  public readonly bg = new DualColourTextEffects(40, 100);
  public readonly bold: TextEffect = new SgrTextEffect('1', '22');
  public readonly faint: TextEffect = new SgrTextEffect('2', '22');
  public readonly fg = new DualColourTextEffects(30, 90);
  public readonly italic: TextEffect = new SgrTextEffect('3', '23');
  public readonly reverse: TextEffect = new SgrTextEffect('7', '27');
  public readonly strikethru: TextEffect = new SgrTextEffect('9', '29');
  public readonly underline: TextEffect = new SgrTextEffect('4', '24');

  public disable(): void {
    this.setEnabled(false);
  }

  public enable(): void {
    this.setEnabled(true);
  }

  public reset(): string {
    return thalia_terminal_ansi.sgr('0');
  }

  public setEnabled(enabled: boolean): void {
    thalia_terminal_ansi.enabled = enabled;
  }
}

export const textEffects = new TextEffects();
