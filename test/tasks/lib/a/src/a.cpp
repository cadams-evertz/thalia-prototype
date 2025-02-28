#include <iostream>

#include "a/a.h"
#include "a/generated.h"

namespace a {

  int func() {
    std::cout << "a::func()" << std::endl;
    return 101 + generated();
  }

}