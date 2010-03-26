#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

int main(int argc, char *argv[], char *envp[])
{
  enum { PROG, UID, GID, ROOT, EXEC, ARGC };
  uid_t	*uid = malloc(sizeof(uid));
  gid_t	*gid = malloc(sizeof(gid));
  char *p, *e;

  if (argc < ARGC) {
    fprintf(stderr, "USAGE: %s UID GID ROOT EXEC [ARGS]\n", argv[0]);
  } else {
    sscanf(argv[UID], "%d", uid);
    sscanf(argv[GID], "%d", gid);
    p = argv[ROOT];
    e = argv[EXEC];

    if (chdir(p)) {
      printf("chdir to %s failed: %s", p, strerror(errno));
    } else if (chroot(p)) {
      printf("chroot to %s failed: %s", p, strerror(errno));
    } else if (setgid(*gid) != 0) {
      printf("setgid failed: %s", strerror(errno));
    } else if (setuid(*uid) != 0) {
      printf("setuid failed: %s", strerror(errno));
    } else {
      free(uid);
      free(gid);
      execve(e, argv + EXEC, envp);
      printf("execve failed: %s", strerror(errno));
    }
  }
  exit(1);
}

