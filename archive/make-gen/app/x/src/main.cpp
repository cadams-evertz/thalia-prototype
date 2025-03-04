#include <iostream>

#include "a/a.h"

int main() {
    std::cout << "main()" << std::endl;
    std::cout << a::func() << std::endl;
    return 0;
}
