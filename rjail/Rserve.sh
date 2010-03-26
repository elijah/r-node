#!/bin/sh
export R_HOME=/usr/lib/R
export TMPDIR=/tmp/R/
export LD_LIBRARY_PATH=/usr/lib:/usr/lib/R/lib:/usr/lib/R
exec /usr/lib/R/bin/Rserve
