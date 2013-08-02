val chars : string
val coord : int -> int -> int
val blocks : int array array
val regions : int array array
val compute_neighbours : int -> int array
val neighbours : int array array
val bit_rank : int -> int
val least_bit : int -> int
val only_one_1 : int -> bool
val count_bits : int -> int
val nb_bits_byte : int array
val nb_bits : int -> int
val buf : Buffer.t
val print : int array -> Buffer.t
val real_blocks : int array array ref
val real_neighbours : int array array ref
val filter_block : int array -> int array -> int array
exception Impossible
val changes : bool array
val propagate : int array -> int -> unit
val find_in_block : int array -> int array -> bool
val saturate : int array -> unit
val restrict : int array -> int -> int -> unit
val may_restrict : int array -> int -> int -> unit
val copy_array : int array -> int array -> unit
val or_array : int array -> int array -> unit
val alpha : float
val chains : int array -> int
val main_loop2 : (Buffer.t -> unit) -> int array -> unit
val main_loop : (Buffer.t -> unit) -> int array -> unit
val all_bits : int
val solve_grid : (Buffer.t -> unit) -> (int * int) list -> unit
val read_clues : string -> (int * int) list
val solve : (Buffer.t -> unit) -> string -> unit
