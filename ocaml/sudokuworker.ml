(* Uno schema è codificato attraverso un insieme di terne ((i,j),n) il
   cui significato è: "si può considerare di marcare n nel posto (i,j)" *)

include Set.Make(struct type t = (int * int) * int let compare = compare end);;

(* Composizione di due funzioni. *)

let (@) g f x = g (f x) and id x = x and zip x y = (x, y);;

(* Fold su sull'insieme {0,...,8}. *)

let fold9 (f : int -> 'a -> 'a) : 'a -> 'a =
  let rec loop i = if i>8 then id else loop (i+1) @ f i in loop 0;;

(* Fold sull'insieme di tutte le posizioni, {(0,0),...,(8,8)}. *)

let fold81 (f : int * int -> 'a -> 'a) : 'a -> 'a =
  fold9 (fold9 @ (@) f @ zip);;

(* Marca sullo schema la posizione (i,j) con x.  Rimuove dallo schema
   tutte le altre possibili terne ((i',j'),k') in conflitto. *)

let mark ((i,j),x as e) : t -> t =
  add e @ fold9 (fun k -> remove ((i/3*3 + k/3, j/3*3 + k mod 3), x) @
    remove ((i,j),k) @ remove ((i,k),x) @ remove ((k,j),x));;

(* Data una funzione h che accumulatrice, (search h s) accumula su tutti
   gli schemi validi sviluppabili dallo schema s. *)
  let g (p:int*int) (f:t -> 'a -> 'a) s =
    let l = filter (fun ((i,j),_) -> (i,j) = p) s in
    fold (fun e -> f (mark e s)) l;;

let search : (t -> 'a -> 'a) -> t -> 'a -> 'a =
  fold81 g;;

let read (b : string) : t =
  let ic = Scanf.Scanning.from_string b in
  let f p = Scanf.bscanf ic "%d " (fun x -> if x>0 then mark (p,x-1) else id) in
  fold81 f (fold81 (fold9 @ ((@) add @ zip)) empty);;

let buf = Buffer.create 200;;

let print (s : t) : string =
  Buffer.clear buf;
  let pr ((i,j),x) = Printf.bprintf buf "%d " (x+1) in
  iter pr s;
  Buffer.contents buf;;

let solve (b : string) : string =
  match search (fun s l -> print s :: l) (read b) [] with
  | s :: _ -> s
  | [] -> "";;

let count (b:string) : string =
  string_of_int (fold81 g (fun _ acc -> acc+1) (read b) 0);;

(* *)
let schema:string =
  "0 6 0 1 0 0 0 5 0\n0 0 8 3 0 5 6 0 0\n2 0 0 0 0 0 0 0 1\n8 0 0 4 0 7 0 0 6\n0 0 6 0 0 0 3 0 0\n7 0 0 9 0 1 0 0 4\n5 0 0 0 0 0 0 0 2\n0 0 7 0 0 6 9 0 0\n0 4 0 0 0 8 0 0 0\n";;

(*
print_endline (solve schema);;

let schema' =
  "0 6 0 1 0 0 0 0 0\n0 0 8 3 0 5 6 0 0\n2 0 0 0 0 0 0 0 1\n0 0 0 4 0 7 0 0 6\n0 0 6 0 0 0 3 0 0\n7 0 0 9 0 1 0 0 4\n5 0 0 0 0 0 0 0 2\n0 0 7 0 0 6 9 0 0\n0 4 0 0 0 8 0 7 0\n";;

print_endline (count schema');;
*)

let add_event_listner =
  let addEventListner = Js.Unsafe.variable "self.addEventListener" in
  fun etype listner ->
    Js.Unsafe.fun_call addEventListner
      [|Js.Unsafe.inject (Js.string etype);
	Js.Unsafe.inject listner|];;

let post_message =
  let postMessage = Js.Unsafe.variable "self.postMessage" in
  fun (msg:string) ->
    Js.Unsafe.fun_call (postMessage) [| Js.Unsafe.inject (Js.string msg) |];;

let eventListner (e : Js.Unsafe.any ) : unit =
  let msg = Js.to_string (Js.Unsafe.get e "data") in
  post_message (solve msg);;

add_event_listner "message" eventListner;;

