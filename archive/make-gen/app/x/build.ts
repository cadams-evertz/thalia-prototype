// import * as thl from 'thalia';

import { createMakefile } from '../../test';

export function appX(): void {
  createMakefile(`${__dirname}/Makefile`, [
    {
      define: {
        name: 'appx.DIR',
        value: '$(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))',
        immediate: true,
      },
    },
    {
      rule: {
        outputs: ['all'],
        inputs: ['appx.all'],
        default: true,
        phoney: true,
      },
    },
    { include: '../../lib/a/liba.mk' },
    { define: { name: 'appx.CFLAGS', value: '$(liba.CFLAGS)' } },
    { define: { name: 'appx.LFLAGS', value: '$(liba.LFLAGS)' } },
    {
      rule: {
        outputs: ['clean'],
        inputs: ['appx.clean'],
        default: true,
        phoney: true,
      },
    },
    {
      rule: {
        outputs: ['appx.all'],
        inputs: ['$(appx.DIR)/x.out'],
        phoney: true,
      },
    },
    {
      rule: {
        inputs: ['liba.clean'],
        outputs: ['appx.clean'],
        commands: [
          {
            description: '[app/x] Cleaning...',
            command: 'rm -rf $(appx.DIR)/x.out $(appx.DIR)/intermediates',
          },
        ],
        phoney: true,
      },
    },
    {
      rule: {
        outputs: ['$(appx.DIR)/x.out'],
        inputs: ['$(appx.DIR)/intermediates/src/main.o', '|', '$(liba.LIB_FILENAME)'],
        commands: [
          {
            description: '[app/x] Linking $(subst $(appx.DIR)/,,$@)...',
            command: 'g++ $^ -o $@ $(appx.LFLAGS)',
            echo: true,
          },
        ],
      },
    },
    {
      rule: {
        outputs: ['$(appx.DIR)/intermediates/src/main.o'],
        inputs: ['$(appx.DIR)/src/main.cpp', '$(liba.DIR)/include/a/a.h'],
        commands: [
          { command: 'mkdir -p $$(dirname $@)', echo: false },
          {
            description: '[app/x] Compiling $(subst $(appx.DIR)/,,$<)...',
            command: 'g++ $(appx.CFLAGS) -c $< -o $@',
          },
        ],
      },
    },
  ]);
}
