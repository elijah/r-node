.PHONY: all

all:
	mkdir -p ../deploy/htdocs/js
	mkdir -p ../deploy/htdocs/css
	mkdir -p ../deploy/htdocs/assets
	mkdir -p ../deploy/htdocs/doc
	cd ../deploy/htdocs/js/ && ln -s ../../../client/htdocs/js/* . && \
	ln -s ../../../3rdparty/jquery . && \
	ln -s ../../../3rdparty/extjs . && \
	ln -s ../../../3rdparty/protovis . && \
	ln -s ../../../3rdparty/shjs . && \
	cd ../css/ && ln -s ../../../client/htdocs/css/* . && \
	cd ../doc/ && ln -s ../../../client/htdocs/doc/* . && \
	cd ../assets/ && ln -s ../../../client/htdocs/assets/* . && \
	cd .. && ln -s ../../client/htdocs/index.* . && \
	ln -s ../../client/htdocs/R.css . && \
	cd ../../client
