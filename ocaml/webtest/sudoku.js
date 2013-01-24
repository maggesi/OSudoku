// This program was compiled from OCaml by js_of_ocaml 1.3
function caml_raise_with_arg (tag, arg) { throw [0, tag, arg]; }
function caml_raise_with_string (tag, msg) {
  caml_raise_with_arg (tag, new MlWrappedString (msg));
}
function caml_invalid_argument (msg) {
  caml_raise_with_string(caml_global_data[4], msg);
}
function caml_array_bound_error () {
  caml_invalid_argument("index out of bounds");
}
function caml_str_repeat(n, s) {
  if (!n) { return ""; }
  if (n & 1) { return caml_str_repeat(n - 1, s) + s; }
  var r = caml_str_repeat(n >> 1, s);
  return r + r;
}
function MlString(param) {
  if (param != null) {
    this.bytes = this.fullBytes = param;
    this.last = this.len = param.length;
  }
}
MlString.prototype = {
  string:null,
  bytes:null,
  fullBytes:null,
  array:null,
  len:null,
  last:0,
  toJsString:function() {
    return this.string = decodeURIComponent (escape(this.getFullBytes()));
  },
  toBytes:function() {
    if (this.string != null)
      var b = unescape (encodeURIComponent (this.string));
    else {
      var b = "", a = this.array, l = a.length;
      for (var i = 0; i < l; i ++) b += String.fromCharCode (a[i]);
    }
    this.bytes = this.fullBytes = b;
    this.last = this.len = b.length;
    return b;
  },
  getBytes:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return b;
  },
  getFullBytes:function() {
    var b = this.fullBytes;
    if (b !== null) return b;
    b = this.bytes;
    if (b == null) b = this.toBytes ();
    if (this.last < this.len) {
      this.bytes = (b += caml_str_repeat(this.len - this.last, '\0'));
      this.last = this.len;
    }
    this.fullBytes = b;
    return b;
  },
  toArray:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes ();
    var a = [], l = this.last;
    for (var i = 0; i < l; i++) a[i] = b.charCodeAt(i);
    for (l = this.len; i < l; i++) a[i] = 0;
    this.string = this.bytes = this.fullBytes = null;
    this.last = this.len;
    this.array = a;
    return a;
  },
  getArray:function() {
    var a = this.array;
    if (!a) a = this.toArray();
    return a;
  },
  getLen:function() {
    var len = this.len;
    if (len !== null) return len;
    this.toBytes();
    return this.len;
  },
  toString:function() { var s = this.string; return s?s:this.toJsString(); },
  valueOf:function() { var s = this.string; return s?s:this.toJsString(); },
  blitToArray:function(i1, a2, i2, l) {
    var a1 = this.array;
    if (a1) {
      if (i2 <= i1) {
        for (var i = 0; i < l; i++) a2[i2 + i] = a1[i1 + i];
      } else {
        for (var i = l - 1; i >= 0; i--) a2[i2 + i] = a1[i1 + i];
      }
    } else {
      var b = this.bytes;
      if (b == null) b = this.toBytes();
      var l1 = this.last - i1;
      if (l <= l1)
        for (var i = 0; i < l; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
      else {
        for (var i = 0; i < l1; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
        for (; i < l; i++) a2 [i2 + i] = 0;
      }
    }
  },
  get:function (i) {
    var a = this.array;
    if (a) return a[i];
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return (i<this.last)?b.charCodeAt(i):0;
  },
  safeGet:function (i) {
    if (!this.len) this.toBytes();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    return this.get(i);
  },
  set:function (i, c) {
    var a = this.array;
    if (!a) {
      if (this.last == i) {
        this.bytes += String.fromCharCode (c & 0xff);
        this.last ++;
        return 0;
      }
      a = this.toArray();
    } else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    a[i] = c & 0xff;
    return 0;
  },
  safeSet:function (i, c) {
    if (this.len == null) this.toBytes ();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    this.set(i, c);
  },
  fill:function (ofs, len, c) {
    if (ofs >= this.last && this.last && c == 0) return;
    var a = this.array;
    if (!a) a = this.toArray();
    else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    var l = ofs + len;
    for (var i = ofs; i < l; i++) a[i] = c;
  },
  compare:function (s2) {
    if (this.string != null && s2.string != null) {
      if (this.string < s2.string) return -1;
      if (this.string > s2.string) return 1;
      return 0;
    }
    var b1 = this.getFullBytes ();
    var b2 = s2.getFullBytes ();
    if (b1 < b2) return -1;
    if (b1 > b2) return 1;
    return 0;
  },
  equal:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string == s2.string;
    return this.getFullBytes () == s2.getFullBytes ();
  },
  lessThan:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string < s2.string;
    return this.getFullBytes () < s2.getFullBytes ();
  },
  lessEqual:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string <= s2.string;
    return this.getFullBytes () <= s2.getFullBytes ();
  }
}
function MlWrappedString (s) { this.string = s; }
MlWrappedString.prototype = new MlString();
function MlMakeString (l) { this.bytes = ""; this.len = l; }
MlMakeString.prototype = new MlString ();
function caml_call_gen(f, args) {
  if(f.fun)
    return caml_call_gen(f.fun, args);
  var n = f.length;
  var d = n - args.length;
  if (d == 0)
    return f.apply(null, args);
  else if (d < 0)
    return caml_call_gen(f.apply(null, args.slice(0,n)), args.slice(n));
  else
    return function (x){ return caml_call_gen(f, args.concat([x])); };
}
function caml_int64_compare(x,y) {
  var x3 = x[3] << 16;
  var y3 = y[3] << 16;
  if (x3 > y3) return 1;
  if (x3 < y3) return -1;
  if (x[2] > y[2]) return 1;
  if (x[2] < y[2]) return -1;
  if (x[1] > y[1]) return 1;
  if (x[1] < y[1]) return -1;
  return 0;
}
function caml_int_compare (a, b) {
  if (a < b) return (-1); if (a == b) return 0; return 1;
}
function caml_compare_val (a, b, total) {
  var stack = [];
  for(;;) {
    if (!(total && a === b)) {
      if (a instanceof MlString) {
        if (b instanceof MlString) {
            if (a != b) {
		var x = a.compare(b);
		if (x != 0) return x;
	    }
        } else
          return 1;
      } else if (a instanceof Array && a[0] === (a[0]|0)) {
        var ta = a[0];
        if (ta === 250) {
          a = a[1];
          continue;
        } else if (b instanceof Array && b[0] === (b[0]|0)) {
          var tb = b[0];
          if (tb === 250) {
            b = b[1];
            continue;
          } else if (ta != tb) {
            return (ta < tb)?-1:1;
          } else {
            switch (ta) {
            case 248: {
		var x = caml_int_compare(a[2], b[2]);
		if (x != 0) return x;
		break;
	    }
            case 255: {
		var x = caml_int64_compare(a, b);
		if (x != 0) return x;
		break;
	    }
            default:
              if (a.length != b.length) return (a.length < b.length)?-1:1;
              if (a.length > 1) stack.push(a, b, 1);
            }
          }
        } else
          return 1;
      } else if (b instanceof MlString ||
                 (b instanceof Array && b[0] === (b[0]|0))) {
        return -1;
      } else {
        if (a < b) return -1;
        if (a > b) return 1;
        if (total && a != b) {
          if (a == a) return 1;
          if (b == b) return -1;
        }
      }
    }
    if (stack.length == 0) return 0;
    var i = stack.pop();
    b = stack.pop();
    a = stack.pop();
    if (i + 1 < a.length) stack.push(a, b, i + 1);
    a = a[i];
    b = b[i];
  }
}
function caml_compare (a, b) { return caml_compare_val (a, b, true); }
function caml_equal (x, y) { return +(caml_compare_val(x,y,false) == 0); }
function caml_greaterequal (x, y) { return +(caml_compare(x,y,false) >= 0); }
function caml_lessequal (x, y) { return +(caml_compare(x,y,false) <= 0); }
function caml_ml_out_channels_list () { return 0; }
function caml_mul(x,y) {
  return ((((x >> 16) * y) << 16) + (x & 0xffff) * y)|0;
}
var caml_global_data = [0];
function caml_register_global (n, v) { caml_global_data[n + 1] = v; }
var caml_named_values = {};
function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;
}
function caml_sys_get_config () {
  return [0, new MlWrappedString("Unix"), 32, 0];
}
(function(){function aH(br,bs,bt){return br.length==2?br(bs,bt):caml_call_gen(br,[bs,bt]);}function aL(bp,bq){return bp.length==1?bp(bq):caml_call_gen(bp,[bq]);}var a=[0,new MlString("Invalid_argument")],b=[0,new MlString("Not_found")];caml_register_global(6,b);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,a);caml_register_global(2,[0,new MlString("Failure")]);var j=new MlString("Pervasives.do_at_exit"),i=new MlString("Set.remove_min_elt"),h=new MlString("Set.bal"),g=new MlString("Set.bal"),f=new MlString("Set.bal"),e=new MlString("Set.bal");function d(c){throw [0,a,c];}function o(n){var k=caml_ml_out_channels_list(0);for(;;){if(k){var l=k[2];try {}catch(m){}var k=l;continue;}return 0;}}caml_register_named_value(j,o);var p=caml_sys_get_config(0)[2],q=(1<<(p-10|0))-1|0,r=1024,t=caml_mul(p/8|0,q)-1|0,s=1<=r?r:1;t<s;var u=7,v=1,w=caml_greaterequal(v,u)?v:u;caml_lessequal(w,q);function z(y,x){return caml_compare(y,x);}function O(A){return A?A[4]:0;}function Q(B,G,D){var C=B?B[4]:0,E=D?D[4]:0,F=E<=C?C+1|0:E+1|0;return [0,B,G,D,F];}function ai(H,R,J){var I=H?H[4]:0,K=J?J[4]:0;if((K+2|0)<I){if(H){var L=H[3],M=H[2],N=H[1],P=O(L);if(P<=O(N))return Q(N,M,Q(L,R,J));if(L){var T=L[2],S=L[1],U=Q(L[3],R,J);return Q(Q(N,M,S),T,U);}return d(h);}return d(g);}if((I+2|0)<K){if(J){var V=J[3],W=J[2],X=J[1],Y=O(X);if(Y<=O(V))return Q(Q(H,R,X),W,V);if(X){var _=X[2],Z=X[1],$=Q(X[3],W,V);return Q(Q(H,R,Z),_,$);}return d(f);}return d(e);}var aa=K<=I?I+1|0:K+1|0;return [0,H,R,J,aa];}function ah(af,ab){if(ab){var ac=ab[3],ad=ab[2],ae=ab[1],ag=z(af,ad);return 0===ag?ab:0<=ag?ai(ae,ad,ah(af,ac)):ai(ah(af,ae),ad,ac);}return [0,0,af,0,1];}function al(aj){if(aj){var ak=aj[1];if(ak){var an=aj[3],am=aj[2];return ai(al(ak),am,an);}return aj[3];}return d(i);}function ay(as,ao){if(ao){var ap=ao[3],aq=ao[2],ar=ao[1],at=z(as,aq);if(0===at){if(ar)if(ap){var au=ap,aw=al(ap);for(;;){if(!au)throw [0,b];var av=au[1];if(av){var au=av;continue;}var ax=ai(ar,au[2],aw);break;}}else var ax=ar;else var ax=ap;return ax;}return 0<=at?ai(ar,aq,ay(as,ap)):ai(ay(as,ar),aq,ap);}return 0;}function aD(aE,az,aB){var aA=az,aC=aB;for(;;){if(aA){var aG=aA[3],aF=aA[2],aI=aH(aE,aF,aD(aE,aA[1],aC)),aA=aG,aC=aI;continue;}return aC;}}function aV(aM,aK,aJ){return aL(aM,aL(aK,aJ));}function aR(aN){return aN;}function bo(aP,aO){return [0,aP,aO];}function a5(aS){function aT(aQ){if(8<aQ)return aR;var aU=aL(aS,aQ);return aH(aV,aT(aQ+1|0),aU);}return aT(0);}function bl(aW){var aX=aW[2],aY=aW[1],aZ=aY[2],a0=aY[1],a6=a5(function(a1){var a2=aL(ay,[0,[0,a1,aZ],aX]),a3=aH(aV,aL(ay,[0,[0,a0,a1],aX]),a2),a4=aH(aV,aL(ay,[0,[0,a0,aZ],a1]),a3);return aH(aV,aL(ay,[0,[0,((a0/3|0)*3|0)+(a1/3|0)|0,((aZ/3|0)*3|0)+(a1%3|0)|0],aX]),a4);});return aH(aV,aL(ah,aW),a6);}a5(aH(aV,a5,aH(aV,aL(aV,function(a9,bm,bj){function bd(a7){var a8=a7[1];return caml_equal([0,a8[1],a8[2]],a9);}function bh(a_,ba){var a$=a_,bb=ba;for(;;){if(bb){var bc=bb[2],bf=bb[3],be=bb[1],bg=bd(bc)?ah(bc,a$):a$,bi=bh(bg,be),a$=bi,bb=bf;continue;}return a$;}}var bn=bh(0,bj);return aH(aD,function(bk){return aL(bm,aH(bl,bk,bj));},bn);}),bo)));o(0);return;}());
