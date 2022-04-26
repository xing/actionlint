build: main.wasm types/node.d.mts

main.wasm: tmp.wasm
	wasm-opt -c -O4 -o main.wasm tmp.wasm

tmp.wasm: main.go go.mod
	tinygo build -o tmp.wasm -target wasm -panic trap -opt z main.go

types/node.d.mts: *.cjs *.mjs *.d.ts *.json yarn.lock
	$$(yarn bin)/tsc -p .

clean:
	rm main.wasm
	rm tmp.wasm
	rm -rf types

.PHONY: build clean
