PATH := $(shell npm bin):$(PATH)

start:
	nodemon

modules:
	rm -rf node_modules
	npm install

lint:
	eslint . --ignore-pattern tests/

unit:
	mocha --recursive tests/unit --exit

integration:
	mocha --recursive tests/integration --exit

tests: unit integration

check: lint tests

.PHONY: start modules lint unit integration tests check
