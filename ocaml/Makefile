all: example worker.js

solver.cmi : solver.mli
	ocamlc -c solver.mli

solver.cmo : solver.ml solver.cmi
	ocamlc -c solver.ml

example.cmo : example.ml solver.cmi
	ocamlc -c example.ml

example : solver.cmo example.cmo
	ocamlc -o $@ $^

worker.cmi : worker.mli
	ocamlfind ocamlc -package js_of_ocaml -c worker.mli

worker.cmo : worker.ml solver.cmi worker.cmi
	ocamlfind ocamlc -package js_of_ocaml -package js_of_ocaml.syntax \
		-syntax camlp4o -c worker.ml

worker.byte : solver.cmo worker.cmo worker.cmi
	ocamlfind ocamlc -package js_of_ocaml -package js_of_ocaml.syntax \
		-syntax camlp4o -linkpkg -o worker.byte solver.cmo worker.cmo

worker.js : worker.byte
	js_of_ocaml -pretty -debuginfo worker.byte

clean:
	rm -f *.byte *.js *.cm[io] *~ worker example
