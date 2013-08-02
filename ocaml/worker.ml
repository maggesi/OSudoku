open Solver

let post_message =
  let postMessage = Js.Unsafe.variable "self.postMessage" in
  fun (msg : Js.Unsafe.any ) ->
    Js.Unsafe.fun_call (postMessage) [| msg |]

let post_solution sol =
  let s = Js.string (Buffer.contents sol) in
  post_message (Js.Unsafe.obj [| "data", (Js.Unsafe.inject s) |])

let add_event_listner =
  let addEventListner = Js.Unsafe.variable "self.addEventListener" in
  fun etype listner ->
    Js.Unsafe.fun_call addEventListner
      [| Js.Unsafe.inject (Js.string etype);
	 Js.Unsafe.inject listner |]

let eventListner (e : Js.Unsafe.any ) : unit =
  let msg = Js.Unsafe.get (Js.Unsafe.get e "data") "data" in
  solve post_solution (Js.to_string msg)

let () = add_event_listner "message" eventListner
