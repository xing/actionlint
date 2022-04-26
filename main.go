package main

import (
	"container/list"
	"io/ioutil"
	"strconv"
	"strings"

	"github.com/rhysd/actionlint"
)

var Memory = list.New()
var OutputString = []byte{}

type block struct {
	ptr	*[]byte
	value []byte
}

//export WasmAlloc
func WasmAlloc(size int) *[]byte {
	slice := make([]byte, size)
	block := block{
		ptr: &slice,
		value: slice,
	}
	Memory.PushBack(block)

	return block.ptr
}

//export WasmFree
func WasmFree(ptr *[]byte) {
	for e := Memory.Front(); e != nil; e = e.Next() {
		block := e.Value.(block)
		if block.ptr == ptr {
			Memory.Remove(e)
			return
		}
	}
}

func serialize(errors []*actionlint.Error, target *[]byte) {
	*target = []byte("[")

	for i, err := range errors {
		*target = append(*target, `{
	"file":"`+err.Filepath+`",
	"line":`+strconv.FormatInt(int64(err.Line), 10)+`,
	"column":`+strconv.FormatInt(int64(err.Column), 10)+`,
	"message":"`+strings.ReplaceAll(err.Message, `"`, `\"`)+`",
	"kind":"`+strings.ReplaceAll(err.Kind, `"`, `\"`)+`"
}`...)

		if i < len(errors)-1 {
			*target = append(*target, ',')
		}
	}

	*target = append(*target, ']', 0)
}

//export RunActionlint
func RunActionlint(input []byte, path []byte) *byte {
	opts := actionlint.LinterOptions{}

	linter, err := actionlint.NewLinter(ioutil.Discard, &opts)
	if err != nil {
		OutputString = []byte(err.Error())
		return &OutputString[0]
	}

	errs, err := linter.Lint(string(path), input, nil)
	if err != nil {
		OutputString = []byte(err.Error())
		return &OutputString[0]
	}

	serialize(errs, &OutputString)

	return &OutputString[0]
}

func main() {}
