build: wasm_exec.js main.wasm types/node.d.mts

wasm_exec.js:
	cp $$(go env GOROOT)/misc/wasm/wasm_exec.js wasm_exec.tmp.js
	echo "// @ts-nocheck" > wasm_exec.js
	cat wasm_exec.tmp.js >> wasm_exec.js
	rm wasm_exec.tmp.js

main.wasm: main.go go.mod
	GOOS=js GOARCH=wasm go build -o main.wasm

types/node.d.mts: *.cjs *.mjs *.d.ts *.json yarn.lock
	$$(yarn bin)/tsc -p .

clean:
	rm main.wasm
	rm wasm_exec.js
	rm -rf types

.PHONY: build clean