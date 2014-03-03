export PATH := $(shell pwd)/node_modules/.bin/:$(PATH)

REPORTER = spec # list

all: test

test: test-server test-client

test-server:
	@mocha --reporter $(REPORTER) ./test/server/*


test-client:
	@node ./bin/planet & echo $$! > planet.pid
	@mocha --reporter $(REPORTER) --globals io ./test/io ./test/client/* || true
	@kill `cat planet.pid`
	@rm planet.pid


test-browser:
	@cp ./node_modules/mocha/mocha.js ./test/public/mocha.js
	@cp ./node_modules/mocha/mocha.css ./test/public/mocha.css
	@node ./node_modules/wrapup/bin/wrup.js --require public ./test/public.js --output ./test/public/tests.js
	@open -a Google\ Chrome ./test/public/index.html

.PHONY: test
