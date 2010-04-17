.PHONY: all

JS_FILES =  \
	../3rdparty/to-function.js \
	../3rdparty/functional.js

JS_FILES += $(wildcard js/*.js)
JS_FILES += $(wildcard js/R/*.js)
JS_FILES += $(wildcard js/R/graphs/*.js)
JS_FILES += $(wildcard js/R/display/*.js)
JS_FILES += $(wildcard js/R/commands/*.js)

# TODO use compiled version eventually.
JS_COMPILER = \
	java -jar ../3rdparty/google-compiler/compiler-20100201.jar \
	--charset UTF-8 \
	--warning_level=QUIET

all: clean r-node-shared.js
	mkdir -p ../deploy/htdocs/js/
	cd ../deploy/htdocs/js && cp -r ../../../shared/r-node-shared.js . && cd -

r-node-shared.js: $(JS_FILES) Makefile
	grep '	' -Hn $(JS_FILES) && echo "ERROR: tab" && exit 1 || true
	grep '' -Hn $(JS_FILES) && echo "ERROR: dos newline" && exit 1 || true
	grep ' $$' -Hn $(JS_FILES) && echo "ERROR: trailing space" && exit 1 || true
	rm -f $@
	echo "// $(shell git rev-parse HEAD)" >> $@
	cat $(JS_FILES) >> $@

clean:
	rm -f r-node-shared.js
	rm -f ../deploy/htdocs/js/r-node-shared.js

