package main

import (
	"io/ioutil"
	"reflect"
	"syscall/js"

	"github.com/rhysd/actionlint"
)

func toMap(input interface{}) map[string]interface{} {
  out := make(map[string]interface{})
  value := reflect.ValueOf(input)
  if value.Kind() == reflect.Ptr {
    value = value.Elem()
  }

  for i := 0; i < value.NumField(); i++ {
    out[value.Type().Field(i).Name] = value.Field(i).Interface()
  }

  return out
}

func runActionlint(source string, filePath string) (interface{}, error) {
	opts := actionlint.LinterOptions{}
	linter, err := actionlint.NewLinter(ioutil.Discard, &opts)
	if err != nil {
		return nil, err
	}

  errs, err := linter.Lint(filePath, []byte(source), nil)
	if err != nil {
		return nil, err
	}

	ret := make([]interface{}, 0, len(errs))
	for _, err := range errs {
		ret = append(ret, toMap(*err))
	}

	return ret, nil
}

func main() {
  js.Global().Set("runActionlint", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
    result, err := runActionlint(args[0].String(), args[1].String())
		return js.Global().Get("Array").New(result, err)
	}))

  js.Global().Call("actionlintInitialized")

	select {}
}
