#include <iostream>

#include "a/a.h"

namespace b {

  int func() {
    std::cout << "b::func()" << std::endl;
    return a::func();
  }

}
