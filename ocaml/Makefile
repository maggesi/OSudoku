all: sudoku sudoku_js sample_js 
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


sample2_js:sample2.ml
	ocamlfind ocamlc -package js_of_ocaml -package js_of_ocaml.syntax \
		-syntax camlp4o -linkpkg -o sample2.byte sample2.ml
	js_of_ocaml sample2.byte

clean:
	rm -f *.byte *.js *.cm[io] *~ sudoku

reallyclean: clean
	rm -f webtest/*

webtestdir: all
	cp index.html index_sample.html sample.js sudoku.js webtest/