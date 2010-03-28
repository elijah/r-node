#
# Build R-Node server, client and shared code
#
# Creates a 'deploy' directory, within which all
# the code is nicely deployed.
#


SUBDIRS = shared client server
     
.PHONY: all clean subdirs $(SUBDIRS)

all: clean setup subdirs

clean: 
	rm -rf deploy

setup:
	mkdir deploy
     
subdirs: $(SUBDIRS)
     
$(SUBDIRS):
	$(MAKE) -C $@
     
