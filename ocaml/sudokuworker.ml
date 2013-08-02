(* Global constants *)


(* ------------------------------------------------------------------------- *)
(* ------------------------------------------------------------------------- *)

let post_message =
  let postMessage = Js.Unsafe.variable "self.postMessage" in
  fun (msg : Js.Unsafe.any ) ->
    Js.Unsafe.fun_call (postMessage) [| msg |]

let post_solution sol =
  post_message (Js.Unsafe.obj [| "data", (Js.Unsafe.inject ( Js.string sol)) |])

(* ------------------------------------------------------------------------- *)
(* ------------------------------------------------------------------------- *)

let chars = "123456789"

(* Matrix.

   A grid is represented as a one dimensional integer array of size 81+1.
   The cell 0..81-1 are bit fields which indicate the possible
   digits for the corresponding cell. The last cell of the grid
   store the number of resolved cells. *)

let coord x y = x + 9 * y

let blocks = Array.concat [
  Array.init 9
    (fun y -> Array.init 9 (fun x -> coord x y)); (* lines *)
  Array.init 9
    (fun x -> Array.init 9 (fun y -> coord x y)); (* columns *)
  Array.init 9
    (fun i ->
       let x0 = (i mod 3) * 3
       and y0 = (i / 3) * 3 in
       Array.init 9 (fun j -> coord (x0 + (j mod 3)) (y0 + (j / 3)))
    )  (* boxes *)
]

let regions =
  let r = Array.create 81 [] in
  for i = 0 to Array.length blocks - 1 do
    for j = 0 to Array.length blocks.(i) - 1 do
      r.(blocks.(i).(j)) <- i :: r.(blocks.(i).(j))
    done;
  done;
  Array.map Array.of_list r

let compute_neighbours i =
  let res = ref [] in
  for j = 0 to Array.length regions.(i) - 1 do
    for k = 0 to Array.length blocks.(regions.(i).(j)) -1 do
      let z = blocks.(regions.(i).(j)).(k) in
      if (z <> i) && (not (List.mem z !res)) then res := z :: !res
    done;
  done;
  Array.of_list !res

let neighbours = Array.init 81 compute_neighbours

(* Bit-field manipulation *)

(* rank of the least significant 1 bit *)
let bit_rank k =
  let rec aux i k = if k = 1 then i else aux (succ i) (k lsr 1) in
  aux 0 k

(* keeps only the least significant 1 bit *)
let least_bit n = n land (lnot (n - 1))

(* is 0 or 1 bit set to 1 ? *)
let only_one_1 n = (n == least_bit n)

(* number of 1 bits *)

let count_bits n =
  let rec l i n =if n = 0 then i else l (succ i) (n land lnot (least_bit n)) in
  l 0 n

let nb_bits_byte = Array.init 256 count_bits

let nb_bits n =
  nb_bits_byte.(n land 0xff) +
  nb_bits_byte.((n lsr 8) land 0xff) +
  nb_bits_byte.((n lsr 16) land 0xff) +
  nb_bits_byte.((n lsr 24) land 0xff)

let buf = Buffer.create 200;;

let print a =
  Buffer.clear buf;
  for y = 0 to 9 - 1 do
    for x = 0 to 9 - 1 do
      let i = coord x y in
      let c =
        if a.(i) != 0 && only_one_1 a.(i)
        then chars.[bit_rank a.(i)]
        else '.' in
      Buffer.add_char buf c; Buffer.add_char buf ' '
    done;
  done;
  post_solution (Buffer.contents buf)

let real_blocks = ref blocks
let real_neighbours = ref neighbours

let filter_block a block =
  let res = ref [] in
  let f = ref false in
  for i = 0 to Array.length block - 1 do
    if not (only_one_1 (a.(block.(i)))) then res := block.(i) :: !res
    else f := true;
  done;
  if !f then Array.of_list !res else block

exception Impossible

let changes = Array.make (Array.length blocks) false

let rec propagate a i =
  a.(81) <- a.(81) + 1;
  let n = (!real_neighbours).(i) in
  let m = lnot a.(i) in
  for k = 0 to Array.length n - 1 do
    let i' = n.(k) in
    let old = a.(i') in
    let n = old land m in
    if n != old then restrict a i' n
  done

and restrict a i n =
  if n = 0 then raise Impossible;
  a.(i) <- n;
  let c = regions.(i) in
  for j = 0 to Array.length c - 1 do changes.(c.(j)) <- true done;
  if only_one_1 n then propagate a i;

(* A block is a group of 9 cells (a lines, a column, a box) such
   that each digit must appear exactly once in this group of
   cells. The function sets digits according to this rule and returns
   the coordinates of the modified cells. *)

and find_in_block a block =
  let gte1 = ref 0    (* unresolved digits that appears at least once *)
  and gte2 = ref 0 in (* unresolved digits that appears at least twice *)
  let l = Array.length block in
  for i = 0 to l - 1 do
    let n = a.(block.(i)) in
    (
      gte2:= !gte2 lor (!gte1 land n);
      gte1:= !gte1 lor n
    )
  done;
  gte1 := !gte1 land lnot !gte2; (* exactly once *)
  if !gte1 !=0 then (
    let i = ref 0 in
    while (!i < l) do
      let j = block.(!i) in
      let n = a.(j) land !gte1 in
      if n != 0 then (
        if not (only_one_1 n) then raise Impossible;
        if a.(j) != n then restrict a j n;
        gte1 := !gte1 land lnot n;
        if (!gte1 == 0) then i := l else incr i;
      ) else incr i;
    done;
    true
  ) else false

let saturate a =
  let b = !real_blocks in
  let f = ref true in
  while !f do
    f := false;
    for i = 0 to Array.length changes - 1 do
      if changes.(i) then (
        changes.(i) <- false;
        if find_in_block a b.(i) then f := true
      )
    done;
  done


let restrict a i n =
  try restrict a i n; saturate a
  with exn ->
    for i = 0 to Array.length changes - 1 do changes.(i) <- false done;
    raise exn

let may_restrict a i n =
  if a.(i) != n then restrict a i n

(* Chains.

   For each unresolved cell, try all the possible choices one by one
   and deduce all the consequences from each one.

   - If we get a contradiction, we can reduce the number of possible
   choices.

   - For all the choices which does not imply an immediate contradiction,
   we consider the set of remaining choices for all cells, and we
   take the unions of all these choices. This set might be smaller
   than the original set of choices.

   - We also compute a best branching cell.

   - We iterate as long as something changed.
*)

let copy_array a1 a2 =
  for i = 0 to Array.length a2 -1 do a2.(i) <- (a1.(i) : int) done

let or_array a1 a2 =
  for i = 0 to Array.length a1 - 1 do a1.(i) <- a1.(i) lor a2.(i) done

let alpha = 1. /. 8.

let rec chains a =
  let r0 = a.(81) in
  let a' = Array.create (Array.length a) 0 in
  let possible = Array.create 81 0 in
  let change = ref false in
  let min_cost = ref infinity in
  let best2 = ref (-1) in
  let min_branch = ref 1000 in
  for i = 0 to 81 - 1 do
    if only_one_1 a.(i) then ()
    else (
      for z = 0 to 81 - 1 do possible.(z) <- 0 done;
      let cost = ref 0. in
      for k = 0 to 9 - 1 do
        let m = 1 lsl k in
        if (a.(i) land m <> 0) then
          try
            copy_array a a';
            may_restrict a' i m;
            or_array possible a';
            if not !change then
              cost := !cost +. (alpha ** (float_of_int (a'.(81) - r0)));
          with Impossible ->
            let n = a.(i) land lnot m in
            restrict a i n;
            change := true
      done;
      (
      let nbb = nb_bits a.(i) in
      if nbb < !min_branch
      then (min_branch := nbb; best2 := i; min_cost := !cost)
      else if nbb = !min_branch && !cost < !min_cost
      then (min_cost := !cost; best2 := i)
      );
      for z = 0 to 81 - 1 do
        let o = a.(z) in
        let n = possible.(z) land o in
        if n != o then (restrict a z n; change := true);
      done;
    )
  done;
  if !change then chains a else !best2

(* Find a cell whose number of remaining choices is minimal and >= 2 *)

let rec main_loop2 a =
  if a.(81) == 81 then print a else
  let i = chains a in
  if i < 0 then print a
  else for k = 0 to 9 - 1 do
    let m = 1 lsl k in
    if a.(i) land m <> 0 then
      try
        let a' =
          if a.(i) land lnot (m lsl 1 - 1) = 0 then a else Array.copy a in
        may_restrict a' i m;
        main_loop a'
      with Impossible -> ()
  done

and main_loop a =
  let old_bs = !real_blocks in
  let old_n = !real_neighbours in
  real_blocks := Array.map (filter_block a) old_bs;
  real_neighbours := Array.map (filter_block a) old_n;
  try main_loop2 a; real_blocks := old_bs; real_neighbours := old_n
  with exn -> real_blocks := old_bs; real_neighbours := old_n; raise exn

let all_bits = ((1 lsl 9) - 1)

let solve_grid clues =
  let a = Array.create (81 + 1) all_bits in
  a.(81) <- 0;
  (try List.iter (fun (i,m) -> may_restrict a i m) clues; main_loop a
   with Impossible -> ())

let read_clues (b : string) =
  let clues = ref [] in
  let ic = Scanf.Scanning.from_string b in
  let get_char (c:char) : int =
    match c with
      | '0' | '.' -> -1
      | _ -> try String.index chars c with Not_found -> -1 in
  for y = 0 to 9 - 1 do
    for x = 0 to 9 - 1 do
      let n = Scanf.bscanf ic "%c " get_char in
      if n >= 0 then clues := (coord x y,1 lsl n) :: !clues;
    done
  done;
  !clues

let solve s =
  let clues = List.rev (read_clues s) in
  solve_grid clues

(*
let () =
  let schema = "0 6 0 1 0 0 0 5 0\n0 0 8 3 0 5 6 0 0\n2 0 0 0 0 0 0 0 1\n8 0 0 4 0 7 0 0 6\n0 0 6 0 0 0 3 0 0\n7 0 0 9 0 1 0 0 4\n5 0 0 0 0 0 0 0 2\n0 0 7 0 0 6 9 0 0\n0 4 0 0 0 8 0 0 0\n" in
  print_endline (solve schema)
*)

(* ------------------------------------------------------------------------- *)
(* ------------------------------------------------------------------------- *)

let add_event_listner =
  let addEventListner = Js.Unsafe.variable "self.addEventListener" in
  fun etype listner ->
    Js.Unsafe.fun_call addEventListner
      [|Js.Unsafe.inject (Js.string etype);
	Js.Unsafe.inject listner|];;

let eventListner (e : Js.Unsafe.any ) : unit =
  let msg = Js.Unsafe.get (Js.Unsafe.get e "data") "data" in
  solve (Js.to_string msg)

add_event_listner "message" eventListner;;
