#include <iostream>

#include "a/a.h"

namespace a {

  int func() {
    std::cout << "a::func()" << std::endl;
    return 105;
  }

}