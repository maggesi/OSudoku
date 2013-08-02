open Solver

let post_solution buf = print_endline (Buffer.contents buf)

let () = 
  let schema = "0 6 0 1 0 0 0 5 0\n0 0 8 3 0 5 6 0 0\n2 0 0 0 0 0 0 0 1\n8 0 0 4 0 7 0 0 6\n0 0 6 0 0 0 3 0 0\n7 0 0 9 0 1 0 0 4\n5 0 0 0 0 0 0 0 2\n0 0 7 0 0 6 9 0 0\n0 4 0 0 0 8 0 0 0\n" in
  solve post_solution schema
