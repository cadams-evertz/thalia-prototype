#include <iostream>

#include "c/c.h"

namespace c {

  int func() {
    std::cout << "c::func()" << std::endl;
    return 303;
  }

}
