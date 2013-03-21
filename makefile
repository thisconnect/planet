REPORTER = spec # list

all: test

test: test-server test-client

test-server:
	@./node_modules/.bin/mocha --reporter $(REPORTER) ./test/server/*


test-client:
	@node ./bin/planet & echo $$! > planet.pid
	@./node_modules/.bin/mocha --reporter $(REPORTER) ./test/client/* || true
	@kill `cat planet.pid`
	@rm planet.pid
	@killall node


.PHONY: test
