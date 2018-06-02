PACKAGE = md380-webtools
BASEREPO = yeyus
ENTRYPOINT = main.go

PACKAGEVERSION = v$(shell cat package.json | grep version | head -1 | awk -F: '{ print $$2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

version:
	@echo "Package version is:" $(PACKAGEVERSION)

.DEFAULT_GOAL := help

all: clean build ## clean and build for local environment

dep: ## install dependencies
	npm install
	go get

build-js: ## build and bundle the javascript assets
	./node_modules/.bin/webpack --config webpack.config.js

build: build-js ## build the go binary for the current environment
	@mkdir -p ./bin
	go build -i -o ./bin/$(PACKAGE)

build-linux-amd64: build-js ## build the go binary for linux-amd64 systems
	@mkdir -p ./bin
	GOOS=linux GOARCH=amd64 go build -i -o ./bin/$(PACKAGE)-linux-amd64

container: build-linux-amd64 ## build the container for linux-amd64
	docker build -t $(BASEREPO)/$(PACKAGE):$(PACKAGEVERSION) .

publish: container ## publish to docker hub
	docker push $(BASEREPO)/$(PACKAGE):$(PACKAGEVERSION)

clean: ## clean all files created by this makefile
	@rm -rf ./bin
	@rm -rf ./dist

run: ## run locally
	go run main.go
