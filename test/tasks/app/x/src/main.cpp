#include <iostream>

#include "a/a.h"
#include "b/b.h"
#include "c/c.h"
#include "x/x.h"

int main() {
    std::cout << "main()" << std::endl;
    std::cout << a::func() << std::endl;
    std::cout << b::func() << std::endl;
    std::cout << c::func() << std::endl;
    int xResult = x::func();
    std::cout << "x::func() = " << xResult << std::endl;
    return 0;
}
