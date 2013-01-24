all: sudoku sudoku_js sample_js sudokuworker_js
#sample2_js

sudoku : sudoku.ml
	ocamlc -o $@ $<

sudoku_js:sudoku.ml
	ocamlfind ocamlc -package js_of_ocaml -package js_of_ocaml.syntax \
		-syntax camlp4o -linkpkg -o sudoku.byte sudoku.ml
	js_of_ocaml sudoku.byte


sample_js:sample.ml
	ocamlfind ocamlc -package js_of_ocaml -package js_of_ocaml.syntax \
		-syntax camlp4o -linkpkg -o sample.byte sample.ml
	js_of_ocaml sample.byte


sudokuworker_js:sudokuworker.ml
	ocamlfind ocamlc -package js_of_ocaml -package js_of_ocaml.syntax \
		-syntax camlp4o -linkpkg -o sudokuworker.byte sudokuworker.ml
	js_of_ocaml -pretty -debuginfo sudokuworker.byte

clean:
	rm -f *.byte *.js *.cm[io] *~ sudoku

reallyclean: clean
	rm -f webtest/*

webtestdir: all
	cp index.html index_sample.html index_sudokuworker.html sudokuworker.js sample.js sudoku.js webtest/