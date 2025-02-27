#!/bin/bash
g++ -c -Iinclude -o c.o src/c.cpp
ar rs liblibc.a c.o
