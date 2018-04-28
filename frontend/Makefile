PATH := $(shell npm bin):$(PATH)

start:
	webpack-dev-server --mode development --config dev.config.js

modules:
	rm -rf node_modules
	npm install

lint:
	eslint . --ignore-pattern webpack/ --ignore-pattern node_modules/ --ignore-pattern *.config.js --ignore-pattern back-office/assets/

.PHONY: start-dev modules eslint
