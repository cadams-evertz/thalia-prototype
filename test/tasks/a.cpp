#include "a.h"

int func() {
#ifdef FOO
    return 202;
#else
    return 101;
#endif
}
