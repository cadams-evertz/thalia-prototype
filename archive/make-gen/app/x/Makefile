# TODO - Header comment...
appx.DIR := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))

.PHONEY: all
all: appx.all
include ../../lib/a/liba.mk
appx.CFLAGS = $(liba.CFLAGS)
appx.LFLAGS = $(liba.LFLAGS)

.PHONEY: clean
clean: appx.clean

.PHONEY: appx.all
appx.all: $(appx.DIR)/x.out

.PHONEY: appx.clean
appx.clean: liba.clean
	@echo '[app/x] Cleaning...'
	@rm -rf $(appx.DIR)/x.out $(appx.DIR)/intermediates

$(appx.DIR)/x.out: $(appx.DIR)/intermediates/src/main.o | $(liba.LIB_FILENAME)
	@echo '[app/x] Linking $(subst $(appx.DIR)/,,$@)...'
	g++ $^ -o $@ $(appx.LFLAGS)

$(appx.DIR)/intermediates/src/main.o: $(appx.DIR)/src/main.cpp $(liba.DIR)/include/a/a.h
	@mkdir -p $$(dirname $@)
	@echo '[app/x] Compiling $(subst $(appx.DIR)/,,$<)...'
	@g++ $(appx.CFLAGS) -c $< -o $@
