#include <iostream>

#include "a/a.h"

int b_func() {
    std::cout << "b_func()" << std::endl;
    return a_func();
}
