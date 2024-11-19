#include <iostream>

#include "a/a.h"

#include "b/b.h"

namespace a {

  int func() {
    std::cout << "a::func()" << std::endl;
    std::cout << "a::func() calling b::func() got " << b::func() << std::endl;
    return 105;
  }

}