#include <iostream>

#include "a/a.h"
#include "a/generated.h"

int a_func() {
    std::cout << "a_func()" << std::endl;
#ifdef FOO
    return 202 + generated();
#else
    return 101 + generated();
#endif
}
