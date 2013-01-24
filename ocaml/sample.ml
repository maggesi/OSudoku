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
  let msg = Js.Unsafe.get e "data" in
  post_message msg;;

add_event_listner "message" eventListner;;
