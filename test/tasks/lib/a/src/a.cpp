#include <iostream>

#include "a/a.h"
// #include "a/generated.h"

namespace a {

  int func() {
    std::cout << "a::func()" << std::endl;
// #ifdef FOO
//     return 202 + generated();
// #else
//     return 101 + generated();
// #endif
    return 101;
  }

}