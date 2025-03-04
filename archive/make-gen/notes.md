# Notes

## Todo

- Replace `MakefileCode` with array
- Neutral subsitution system
  - eg. 'gcc {{inputs}} -o {{output}}' => 'gcc $^ -o $@'
- .inc file to share module definitions between files?
- Efficient C++ dependency generation
  - Secondary makefile to generate main one?
