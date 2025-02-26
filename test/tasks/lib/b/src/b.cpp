#include <iostream>

#include "a/a.h"
#include "b/b.h"

namespace b {

  int func() {
    std::cout << "b::func()" << std::endl;
    return a::func() + 202;
  }

}
