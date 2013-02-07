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
function caml_array_get (array, index) {
  if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
  return array[index+1];
}
function caml_array_set (array, index, newval) {
  if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
  array[index+1]=newval; return 0;
}
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
function caml_greaterequal (x, y) { return +(caml_compare(x,y,false) >= 0); }
function caml_lessequal (x, y) { return +(caml_compare(x,y,false) <= 0); }
function caml_make_vect (len, init) {
  var b = [0]; for (var i = 1; i <= len; i++) b[i] = init; return b;
}
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
(function(){function k(a8,a9){return a8.length==1?a8(a9):caml_call_gen(a8,[a9]);}caml_register_global(6,[0,new MlString("Not_found")]);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,[0,new MlString("Invalid_argument")]);caml_register_global(2,[0,new MlString("Failure")]);var c=new MlString("Pervasives.do_at_exit");function b(a){return a^-1;}function h(g){var d=caml_ml_out_channels_list(0);for(;;){if(d){var e=d[2];try {}catch(f){}var d=e;continue;}return 0;}}caml_register_named_value(c,h);function C(i,j){if(0===i)return [0];var l=caml_make_vect(i,k(j,0)),m=1,n=i-1|0;if(!(n<m)){var o=m;for(;;){l[o+1]=k(j,o);var p=o+1|0;if(n!==o){var o=p;continue;}break;}}return l;}function D(q){if(q){var r=0,s=q,y=q[2],v=q[1];for(;;){if(s){var u=s[2],t=r+1|0,r=t,s=u;continue;}var w=caml_make_vect(r,v),x=1,z=y;for(;;){if(z){var A=z[2];w[x+1]=z[1];var B=x+1|0,x=B,z=A;continue;}return w;}}}return [0];}var E=caml_sys_get_config(0)[2],F=(1<<(E-10|0))-1|0,G=1024,I=caml_mul(E/8|0,F)-1|0,H=1<=G?G:1;I<H;var J=7,K=1,L=caml_greaterequal(K,J)?K:J;caml_lessequal(L,F);function O(N,M){return N+(9*M|0)|0;}var T=0,W=[0,C(9,function(P){var S=(P%3|0)*3|0,R=(P/3|0)*3|0;return C(9,function(Q){return O(S+(Q%3|0)|0,R+(Q/3|0)|0);});}),T],Z=[0,C(9,function(V){return C(9,function(U){return O(V,U);});}),W],_=[0,C(9,function(X){return C(9,function(Y){return O(Y,X);});}),Z];for(;;){if(_){var $=_[1],aq=_[2];if(!(0<$.length-1)){var _=aq;continue;}var aa=0,ab=_,ae=$[0+1];for(;;){if(ab){var ad=ab[2],ac=aa+(ab[1].length-1)|0,aa=ac,ab=ad;continue;}var af=caml_make_vect(aa,ae),ag=0,ah=_;for(;;){if(ah){var ai=ah[1],aj=0,ak=ai.length-1-1|0,an=ah[2];if(!(ak<aj)){var al=aj;for(;;){af[(ag+al|0)+1]=ai[al+1];var am=al+1|0;if(ak!==al){var al=am;continue;}break;}}var ao=ag+(ai.length-1)|0,ag=ao,ah=an;continue;}var ap=af;break;}break;}}else var ap=[0];var ar=caml_make_vect(81,0),as=0,at=ap.length-1-1|0;if(!(at<as)){var au=as;for(;;){var av=0,aw=caml_array_get(ap,au).length-1-1|0;if(!(aw<av)){var ax=av;for(;;){caml_array_set(ar,caml_array_get(caml_array_get(ap,au),ax),[0,au,caml_array_get(ar,caml_array_get(caml_array_get(ap,au),ax))]);var ay=ax+1|0;if(aw!==ax){var ax=ay;continue;}break;}}var az=au+1|0;if(at!==au){var au=az;continue;}break;}}var aA=ar.length-1;if(0===aA)var aB=[0];else{var aC=caml_make_vect(aA,D(ar[0+1])),aD=1,aE=aA-1|0;if(!(aE<aD)){var aF=aD;for(;;){aC[aF+1]=D(ar[aF+1]);var aG=aF+1|0;if(aE!==aF){var aF=aG;continue;}break;}}var aB=aC;}C(81,function(aJ){var aH=0,aI=0,aK=caml_array_get(aB,aJ).length-1-1|0;if(aK<aI)var aL=aH;else{var aM=aI,aN=aH;for(;;){var aO=0,aP=caml_array_get(ap,caml_array_get(caml_array_get(aB,aJ),aM)).length-1-1|0;if(aP<aO)var aQ=aN;else{var aR=aO,aS=aN;for(;;){var aT=caml_array_get(caml_array_get(ap,caml_array_get(caml_array_get(aB,aJ),aM)),aR),aU=aT!==aJ?1:0;if(aU){var aV=aS;for(;;){if(aV){var aW=aV[2],aX=0===caml_compare(aV[1],aT)?1:0;if(!aX){var aV=aW;continue;}var aY=aX;}else var aY=0;var aZ=1-aY;break;}}else var aZ=aU;var a0=aZ?[0,aT,aS]:aS,a1=aR+1|0;if(aP!==aR){var aR=a1,aS=a0;continue;}var aQ=a0;break;}}var a2=aM+1|0;if(aK!==aM){var aM=a2,aN=aQ;continue;}var aL=aQ;break;}}return D(aL);});C(256,function(a4){var a3=0,a5=a4;for(;;){if(0===a5)return a3;var a7=a5&b(a5&b(a5-1|0)),a6=a3+1|0,a3=a6,a5=a7;continue;}});h(0);return;}}());
