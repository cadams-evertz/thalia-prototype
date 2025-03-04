// import * as thl from 'thalia';

import { createMakefile } from '../../test';

export function libA(): void {
  createMakefile(`${__dirname}/Makefile`, [
    { include: 'liba.mk' },
    {
      rule: {
        outputs: ['all'],
        inputs: ['liba.all'],
        default: true,
        phoney: true,
      },
    },
    {
      rule: {
        outputs: ['clean'],
        inputs: ['liba.clean'],
        default: true,
        phoney: true,
      },
    },
  ]);

  createMakefile(`${__dirname}/liba.mk`, [
    {
      define: {
        name: 'liba.DIR',
        value: '$(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))',
        immediate: true,
      },
    },
    { define: { name: 'liba.CFLAGS', value: '-I$(liba.DIR)/include' } },
    { define: { name: 'liba.LFLAGS', value: '-L$(liba.DIR) -la' } },
    { define: { name: 'liba.LIB_FILENAME', value: '$(liba.DIR)/liba.a' } },
    {
      rule: {
        outputs: ['liba.all'],
        inputs: ['$(liba.DIR)/liba.a'],
        phoney: true,
      },
    },
    {
      rule: {
        outputs: ['liba.clean'],
        commands: [
          {
            description: '[lib/a] Cleaning...',
            command: 'rm -rf $(liba.DIR)/liba.a $(liba.DIR)/intermediates',
          },
        ],
        phoney: true,
      },
    },
    {
      rule: {
        outputs: ['$(liba.DIR)/liba.a'],
        inputs: ['$(liba.DIR)/intermediates/src/a.o'],
        commands: [
          {
            description: '[lib/a] Building library $(subst $(liba.DIR)/,,$@)...',
            command: 'ar r $@ $^',
          },
        ],
      },
    },
    {
      rule: {
        outputs: ['$(liba.DIR)/intermediates/src/a.o'],
        inputs: ['$(liba.DIR)/src/a.cpp', '$(liba.DIR)/include/a/a.h'],
        commands: [
          { command: 'mkdir -p $$(dirname $@)', echo: false },
          {
            description: '[lib/a] Compiling $(subst $(liba.DIR)/,,$<)...',
            command: 'g++ $(liba.CFLAGS) -c $< -o $@',
          },
        ],
      },
    },
  ]);
}
