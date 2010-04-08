.PHONY: all

JS_FILES =  \
	./js/R/r-object.js \
	./js/R/r-workspace.js \
	./js/R/r-parser-internal.js \
	./js/R/r-parser.js \
	./js/R/graphs/r-graph.js \
	./js/R/graphs/r-hist.js \
	./js/R/graphs/r-lines.js \
	./js/R/graphs/r-plot.js \
	./js/R/display/r-display.js \
	./js/R/display/r-display-array.js \
	./js/R/display/r-display-pager.js \
	./js/R/display/r-display-table.js \
	./js/R/display/r-display-list.js \
	./js/R/display/r-display-try-error.js \
	./js/R/commands/command-handler.js \
	./js/R/commands/abline.js \
	./js/R/commands/help.js \
	./js/R/commands/histogram.js \
	./js/R/commands/lines.js \
	./js/R/commands/unsupported-commands.js \
	./js/R/commands/plot.js \
	./js/R/commands/summary-general.js \
	./js/tokens.js \
	./js/r-api.js


# TODO use compiled version eventually.
JS_COMPILER = \
	java -jar ../3rdparty/google-compiler/compiler-20100201.jar \
	--charset UTF-8 \
	--warning_level=QUIET

all: clean r-node-shared.js
	mkdir -p ../deploy/htdocs/js/
	cd ../deploy/htdocs/js && ln -s ../../../shared/r-node-shared.js . && cd -

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

