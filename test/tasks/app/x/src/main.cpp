#include <iostream>

// #include "b/b.h"
#include "x/x.h"

int main() {
    std::cout << "main()" << std::endl;
    // std::cout << b::func() << std::endl;
    int xResult = x::func();
    std::cout << "x::func() = " << xResult << std::endl;
    return 0;
}
