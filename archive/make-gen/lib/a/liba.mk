# TODO - Header comment...
liba.DIR := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
liba.CFLAGS = -I$(liba.DIR)/include
liba.LFLAGS = -L$(liba.DIR) -la
liba.LIB_FILENAME = $(liba.DIR)/liba.a

.PHONEY: liba.all
liba.all: $(liba.DIR)/liba.a

.PHONEY: liba.clean
liba.clean:
	@echo '[lib/a] Cleaning...'
	@rm -rf $(liba.DIR)/liba.a $(liba.DIR)/intermediates

$(liba.DIR)/liba.a: $(liba.DIR)/intermediates/src/a.o
	@echo '[lib/a] Building library $(subst $(liba.DIR)/,,$@)...'
	@ar r $@ $^

$(liba.DIR)/intermediates/src/a.o: $(liba.DIR)/src/a.cpp $(liba.DIR)/include/a/a.h
	@mkdir -p $$(dirname $@)
	@echo '[lib/a] Compiling $(subst $(liba.DIR)/,,$<)...'
	@g++ $(liba.CFLAGS) -c $< -o $@
