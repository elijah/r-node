.PHONY: all

#
# All files copied to ensure we can keep requests inside this htdocs directory.
# (via path checks
#
#   - i.e. we essentially don't allow 'follow symlinks'.
#
all:
	mkdir -p ../deploy/htdocs/js
	mkdir -p ../deploy/htdocs/css
	mkdir -p ../deploy/htdocs/assets
	mkdir -p ../deploy/htdocs/doc
	cd ../deploy/htdocs/js/ && cp -r ../../../client/htdocs/js/* . && \
	cp -r ../../../3rdparty/extjs . && \
	cp -r ../../../3rdparty/protovis . && \
	cp -r ../../../3rdparty/shjs . && \
	cd ../css/ && cp -r ../../../client/htdocs/css/* . && \
	cd ../doc/ && cp -r ../../../client/htdocs/doc/* . && \
	cd ../assets/ && cp -r ../../../client/htdocs/assets/* . && \
	cd .. && cp -r ../../client/htdocs/index.* . && \
	cp -r ../../client/htdocs/R.css . && \
	cd ../../client
