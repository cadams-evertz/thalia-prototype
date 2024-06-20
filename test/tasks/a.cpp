#include "a.h"

int generated();

int func() {
#ifdef FOO
    return 202 + generated();
#else
    return 101 + generated();
#endif
}
