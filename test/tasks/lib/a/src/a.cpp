#include <iostream>

#include "a/a.h"

int generated();

int a_func() {
    std::cout << "a_func()" << std::endl;
#ifdef FOO
    return 202 + generated();
#else
    return 101 + generated();
#endif
}
