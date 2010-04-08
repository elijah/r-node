#!/bin/sh
#
# For a Ubuntu setup. You may need to tweak this for other setups.
export R_HOME=/usr/lib/R
R_SHARE_DIR=/usr/share/R/share
export R_SHARE_DIR
R_INCLUDE_DIR=/usr/share/R/include
export R_INCLUDE_DIR
R_DOC_DIR=/usr/share/R/doc
export R_DOC_DIR

export TMPDIR=/tmp/R/
export LD_LIBRARY_PATH=/usr/lib:/usr/lib/R/lib:/usr/lib/R
exec /usr/lib/R/bin/Rserve
