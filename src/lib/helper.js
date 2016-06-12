'use strict'

//const $ = require('jquery')
const moment = require('moment')
const q = require('q')

const lut = [];
for (let i=0; i<256; i++) {
  lut[i] = (i<16?'0':'')+(i).toString(16);
}
////////////////////////////////////////
const newUUID = function() {
  let d0 = Math.random()*0xffffffff|0;
  let d1 = Math.random()*0xffffffff|0;
  let d2 = Math.random()*0xffffffff|0;
  let d3 = Math.random()*0xffffffff|0;
  return (lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
    lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
    lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
    lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff]).toUpperCase();
}
////////////////////////////////////////

////////////////////////////////////////
// md5
////////////////////////////////////////

const md5 = function(s) {
  const md5cycle = function(x, k) {
  	let a = x[0], b = x[1], c = x[2], d = x[3];

  	a = ff(a, b, c, d, k[0], 7, -680876936);
  	d = ff(d, a, b, c, k[1], 12, -389564586);
  	c = ff(c, d, a, b, k[2], 17,  606105819);
  	b = ff(b, c, d, a, k[3], 22, -1044525330);
  	a = ff(a, b, c, d, k[4], 7, -176418897);
  	d = ff(d, a, b, c, k[5], 12,  1200080426);
  	c = ff(c, d, a, b, k[6], 17, -1473231341);
  	b = ff(b, c, d, a, k[7], 22, -45705983);
  	a = ff(a, b, c, d, k[8], 7,  1770035416);
  	d = ff(d, a, b, c, k[9], 12, -1958414417);
  	c = ff(c, d, a, b, k[10], 17, -42063);
  	b = ff(b, c, d, a, k[11], 22, -1990404162);
  	a = ff(a, b, c, d, k[12], 7,  1804603682);
  	d = ff(d, a, b, c, k[13], 12, -40341101);
  	c = ff(c, d, a, b, k[14], 17, -1502002290);
  	b = ff(b, c, d, a, k[15], 22,  1236535329);

  	a = gg(a, b, c, d, k[1], 5, -165796510);
  	d = gg(d, a, b, c, k[6], 9, -1069501632);
  	c = gg(c, d, a, b, k[11], 14,  643717713);
  	b = gg(b, c, d, a, k[0], 20, -373897302);
  	a = gg(a, b, c, d, k[5], 5, -701558691);
  	d = gg(d, a, b, c, k[10], 9,  38016083);
  	c = gg(c, d, a, b, k[15], 14, -660478335);
  	b = gg(b, c, d, a, k[4], 20, -405537848);
  	a = gg(a, b, c, d, k[9], 5,  568446438);
  	d = gg(d, a, b, c, k[14], 9, -1019803690);
  	c = gg(c, d, a, b, k[3], 14, -187363961);
  	b = gg(b, c, d, a, k[8], 20,  1163531501);
  	a = gg(a, b, c, d, k[13], 5, -1444681467);
  	d = gg(d, a, b, c, k[2], 9, -51403784);
  	c = gg(c, d, a, b, k[7], 14,  1735328473);
  	b = gg(b, c, d, a, k[12], 20, -1926607734);

  	a = hh(a, b, c, d, k[5], 4, -378558);
  	d = hh(d, a, b, c, k[8], 11, -2022574463);
  	c = hh(c, d, a, b, k[11], 16,  1839030562);
  	b = hh(b, c, d, a, k[14], 23, -35309556);
  	a = hh(a, b, c, d, k[1], 4, -1530992060);
  	d = hh(d, a, b, c, k[4], 11,  1272893353);
  	c = hh(c, d, a, b, k[7], 16, -155497632);
  	b = hh(b, c, d, a, k[10], 23, -1094730640);
  	a = hh(a, b, c, d, k[13], 4,  681279174);
  	d = hh(d, a, b, c, k[0], 11, -358537222);
  	c = hh(c, d, a, b, k[3], 16, -722521979);
  	b = hh(b, c, d, a, k[6], 23,  76029189);
  	a = hh(a, b, c, d, k[9], 4, -640364487);
  	d = hh(d, a, b, c, k[12], 11, -421815835);
  	c = hh(c, d, a, b, k[15], 16,  530742520);
  	b = hh(b, c, d, a, k[2], 23, -995338651);

  	a = ii(a, b, c, d, k[0], 6, -198630844);
  	d = ii(d, a, b, c, k[7], 10,  1126891415);
  	c = ii(c, d, a, b, k[14], 15, -1416354905);
  	b = ii(b, c, d, a, k[5], 21, -57434055);
  	a = ii(a, b, c, d, k[12], 6,  1700485571);
  	d = ii(d, a, b, c, k[3], 10, -1894986606);
  	c = ii(c, d, a, b, k[10], 15, -1051523);
  	b = ii(b, c, d, a, k[1], 21, -2054922799);
  	a = ii(a, b, c, d, k[8], 6,  1873313359);
  	d = ii(d, a, b, c, k[15], 10, -30611744);
  	c = ii(c, d, a, b, k[6], 15, -1560198380);
  	b = ii(b, c, d, a, k[13], 21,  1309151649);
  	a = ii(a, b, c, d, k[4], 6, -145523070);
  	d = ii(d, a, b, c, k[11], 10, -1120210379);
  	c = ii(c, d, a, b, k[2], 15,  718787259);
  	b = ii(b, c, d, a, k[9], 21, -343485551);

  	x[0] = add32(a, x[0]);
  	x[1] = add32(b, x[1]);
  	x[2] = add32(c, x[2]);
  	x[3] = add32(d, x[3]);
  }

  const cmn = function(q, a, b, x, s, t) {
  	a = add32(add32(a, q), add32(x, t));
  	return add32((a << s) | (a >>> (32 - s)), b);
  }

  const ff = function(a, b, c, d, x, s, t) {
  	return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }

  const gg = function(a, b, c, d, x, s, t) {
  	return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }

  const hh = function(a, b, c, d, x, s, t) {
  	return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  const ii = function(a, b, c, d, x, s, t) {
  	return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  const md51 = function(s) {
  	let n = s.length,
  	state = [1732584193, -271733879, -1732584194, 271733878], i;
  	for (i=64; i<=s.length; i+=64) {
  		md5cycle(state, md5blk(s.substring(i-64, i)));
  	}
  	s = s.substring(i-64);
  	let tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
  	for (i=0; i<s.length; i++)
  		tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
  	tail[i>>2] |= 0x80 << ((i%4) << 3);
  	if (i > 55) {
  		md5cycle(state, tail);
  		for (i=0; i<16; i++) tail[i] = 0;
  	}
  	tail[14] = n*8;
  	md5cycle(state, tail);
  	return state;
  }

  const md5blk = function(s) { /* I figured global was faster.   */
  	let md5blks = [], i; /* Andy King said do it this way. */
  	for (i=0; i<64; i+=4) {
  		md5blks[i>>2] = s.charCodeAt(i)
  		+ (s.charCodeAt(i+1) << 8)
  		+ (s.charCodeAt(i+2) << 16)
  		+ (s.charCodeAt(i+3) << 24);
  	}
  	return md5blks;
  }

  var hex_chr = '0123456789abcdef'.split('');

  const rhex = function(n)  {
  	let s='', j=0;
  	for(; j<4; j++) {
  		s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
  			   + hex_chr[(n >> (j * 8)) & 0x0F]
    }
  	return s;
  }

  const hex = function(x) {
  	for (let i=0; i<x.length; i++) {
  		x[i] = rhex(x[i]);
    }
  	return x.join('');
  }

  let add32 = function(a, b) {
		return (a + b) & 0xFFFFFFFF;
	}

	// if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
	// 	add32 = function(x, y) {
	// 		var lsw = (x & 0xFFFF) + (y & 0xFFFF),
	// 		msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	// 		return (msw << 16) | (lsw & 0xFFFF);
	// 	}
	// }

	return hex(md51(s));
}

////////////////////////////////////////
// const ajaxRequest = function(path, data, cb) {
//   $.ajax({
//     type:'post',
//     url: path,
//     data: JSON.stringify(data),
//     contentType: 'application/json; charset=utf-8',
//     dataType: 'json',
//     success(res) {
//       if (res.session===false) {
//         console.log('SESSION TIMEOUT')
//       } else {
//         cb(res);
//       }
//     },
//     error(e) {
//       cb({status:false,error:e});
//     }
//   });
// }

const getCookie = function (name, defaultValue, isJSON) {
	var value = window.localStorage.getItem(name);
	if (value===null) {
		return defaultValue;
	}
  if (typeof isJSON==='undefined'||isJSON) {
    return JSON.parse(value)
  }
	return value;
}

const setCookie = function (name, value) {
	var storage;
	storage = window.localStorage;
	if (typeof value === 'object') {
		value = JSON.stringify(value);
	};
	storage.setItem(name, value);
}

const toValidDate = function(s) {
  let date = moment()
  let tmp = s.split(/[\-\/]/i)
//  console.log('tmp=',tmp)
  tmp = tmp.map((t) => {
    let n = parseInt(t)
    return isNaN(n) ? 0 : n
  })
  if (tmp[0]==0) {
    return date.format('YYYY-MM-DD')
  }
  if (tmp.length==1) {
    tmp.push(0)
    tmp.push(0)
  } else if (tmp.length==2) {
    tmp.push(0)
  }
  if (tmp[0] >= 1 && tmp[0] <= 31) { // day
    if (tmp[2]==0) {
    } else if (tmp[2] < 70) {
      date.year(tmp[2]+2000)
    } else if (tmp[2] < 100) {
      date.year(tmp[2]+1900)
    } else if (tmp[2] < 2400) {
      date.year(tmp[2])
    } else {
      date.year(tmp[2]-543)
    }
    if (tmp[1] >= 1 && tmp[1] <= 12) {
      date.month(tmp[1]-1)
    }
    if (tmp[0] <= moment([date.year(),date.month()+1,1]).subtract(1, 'days').date() ) {
      date.date(tmp[0])
    }
  } else if (tmp[0] > 31 ) { // yyyy-mm-dd
    if (tmp[0] < 70) {
      date.year(tmp[0]+2000)
    } else if (tmp[0] < 100) {
      date.year(tmp[0]+1900)
    } else if (tmp[0] < 2400) {
      date.year(tmp[0])
    } else {
      date.year(tmp[0]-543)
    }
    if (tmp[1] >= 1 && tmp[1] <= 12) {
      date.month(tmp[1]-1)
    }
    if (tmp[2] >= 1 && tmp[2] <= moment([date.year(),date.month()+1,0]).date() ) {
      date.date(tmp[2])
    }
  }
  return date.format('YYYY-MM-DD')
}


var toDate = function(text) {
  if (!text) {
    return null;
  }
  var m = text.split(/[-\/]/);
//  console.log('date', m);
  var n = m.map(function(s) {
    return parseInt(s);
  });
  if (isNaN(n[0]) || isNaN(n[1]) || isNaN(n[2])
        || n[0]<=0 || n[1]<=0 || n[2]<=0 || n[1]>12) {
    return null;
  }
  if (n[0] >= 1900) {
    n[0] -= (n[0] >= 2400 ? 543 : 0);
    return new Date(n[0], n[1]-1, n[2]);
  }
  n[2] -= (n[2]>=2400 ? 543 : 0);
  return new Date(n[2], n[1]-1, n[0]);
}

var parseDateRange = function(s) {
  var pattern = /^(\d+[-\/]\d+[-\/]\d+)(?:\s+(?:-\s+)?(\d+[-\/]\d+[-\/]\d+))?$/;
  var m = pattern.exec(s);
  if (m==null) {
    return null;
  }
  var d1 = toDate(m[1]);
  var d2 = toDate(m[2]);
  if (d1==null && d2==null) {
    return null;
  }
  if (d1==null) {
    return [d2, null];
  }
  if (d2==null) {
    return [d1, null];
  }
  if (d2 < d1) {
    return [d2, d1];
  }
  return [d1, d2];
}

const _parseDateCond = function(s) {
  //console.log('s=', s)
  let today = moment()
  let tmp = s.split(/[\/\-]/)
  if (tmp.length==1) {
    tmp.push('')
    tmp.push('')
  }
  if (tmp.length==2) {
    tmp.push('')
  }
  let num = tmp.map((i) => {return parseInt(i)})
  let isRegExp = false
  let yyyy = ''
  let mm = ''
  let dd = ''

  if (isNaN(num[0]) && isNaN(num[2])) {
    return null
  } else if ( (!isNaN(num[0]) && num[0] > 31)
    || (!isNaN(num[2]) && num[2] <= 31) ) {
    // swap
    let num2 = num[2]
    let tmp2 = tmp[2]
    num[2] = num[0]
    num[0] = num2
    tmp[2] = tmp[0]
    tmp[0] = tmp2
    //console.log('swap')
  }

//  console.log(tmp, num)

  if (tmp[0]=='') {
    dd = ('0' + today.date()).substr(-2)
  } else if (tmp[0]=='*' || tmp[0]=='%' || isNaN(num[0])) {
    isRegExp = true
    dd = '\\d{2}'
  } else {
    dd = ('0' + num[0]).substr(-2)
  }

  if (tmp[1]=='') {
    mm = ('0'+(today.month()+1)).substr(-2)
  } else if (tmp[1]=='*' || tmp[1]=='%' || isNaN(num[1])) {
    isRegExp = true
    mm = '\\d{2}'
  } else {
    mm = ('0' + num[1]).substr(-2)
  }

  if (tmp[2]=='') {
    yyyy = ''+today.year()
  } else if (tmp[2]=='*' || tmp[2]=='%' || isNaN(num[2])) {
    isRegExp = true
    yyyy = '\\d{4}'
  } else {
    yyyy = ''+num[2]
  }

//  console.log('pattern=', yyyy + '-' + mm + '-' + dd)

  if (isRegExp) {
    return new RegExp(yyyy + '\\-' + mm + '\\-' + dd)
  }
  return yyyy + '-' + mm + '-' + dd
}

/**
 2016-12-13  => 2016-12-13
 2016/12/13  => 2016-12-13
 2558/12/13  => 2015-12-13
 3           => yyyy-mm-03
 13/12       => yyyy-12-13
 2016        => 2016-\d{2}-\d{2}
 2016/03     => 2016-03-\d{2}
 2016-3      => 2016-03-\d{2}

 13/%/%      => \d{4}-\d{2}-13
 13/7/*      => \d{4}-07-13
 %/%/2016    => 2016-\d{2}-\d{2}
 2016/%/%    => 2016-\d{2}-\d{2}

 > 3         => > yyyy-mm-03
 > 3/4       => > yyyy-04-03
 */

const _genDateFilterFunction = function(keyword) {
  let pattern = /(>|<|>=|<=|=|<>|!=)?\s*([\d\/\-\*%]+)/g
  let opList = []
  let dateCond
  let match
  while (match = pattern.exec(keyword)) {
    dateCond = _parseDateCond(match[2])
    if (!dateCond) {
      continue
    }
    if (!!!match[1]) {
      match[1] = '='
    }
    opList.push({op:match[1]=='!='?'<>':match[1], value:dateCond})
  }

  if (opList.length==0) {
    return null
  }

  if (opList.length >= 2 && opList[0].op=='=' && opList[1].op=='='
    && typeof opList[0].value=='string'
    && typeof opList[1].value=='string') {
    return function(value) {
      return value >= opList[0].value && value <= opList[1].value
    }
  }

  if (typeof opList[0].value!='string') {
    return function(value) {
      return opList[0].value.test(value)
    }
  }

  return function(value) {
    for(let i = 0; i < opList.length;i++) {
      if (typeof opList[i].value != 'string') {
        continue
      }
      if (
        opList[i].op=='=' && value != opList[i].value
        || opList[i].op=='>' && value <= opList[i].value
        || opList[i].op=='<' && value >= opList[i].value
        || opList[i].op=='>=' && value < opList[i].value
        || opList[i].op=='<=' && value > opList[i].value
        || opList[i].op=='<>' && value == opList[i].value
      ) {
        return false
      }
    }
    return true
  }
}

const _genNumberFilterFunction = function(keyword) {
  let pattern = /(>|<|>=|<=|=|<>|!=)?\s*(\d+(?:\.\d*)?)/g
  let opList = []
  let num
  let match
  while (match = pattern.exec(keyword)) {
    num = parseFloat(match[2])
    if (isNaN(num)){
      continue
    }
    if (!!!match[1]) {
      match[1] = '='
    }
    opList.push({op:match[1]=='!='?'<>':match[1], value:num})
  }
  if (opList.length==0) {
    return null
  }
  if (opList.length >= 2 && opList[0].op=='=' && opList[1].op=='=') {
    return function(value) {
      return value >= opList[0].value && value <= opList[1].value
    }
  }
  return function(value) {
    value = parseFloat(value)
    if (isNaN(value)) {
      return false
    }
    for(let i = 0; i < opList.length;i++) {
      if (
        opList[i].op=='=' && value != opList[i].value
        || opList[i].op=='>' && value <= opList[i].value
        || opList[i].op=='<' && value >= opList[i].value
        || opList[i].op=='>=' && value < opList[i].value
        || opList[i].op=='<=' && value > opList[i].value
        || opList[i].op=='<>' && value == opList[i].value
      ) {
        return false
      }
    }
    return true
  }
}

const genFilterFunction = function(columns, filters) {
  let fncList = {}
  let fields = {}

  // map array columns to fields
  columns.forEach((col) => {
    fields[col.name] = col
  })

  let cnt = 0;

  for (let fld in filters) {
    let keyword = filters[fld]
    if (!keyword) {
      continue
    }
    cnt++

    if (fields[fld].type=='date') {
      let fnc = _genDateFilterFunction(keyword)
      if (fnc != null) {
        fncList[fld] = fnc
      }
      continue
    }

    if (fields[fld].type=='number') {
      let fnc = _genNumberFilterFunction(keyword)
      if (fnc != null) {
        fncList[fld] = fnc
      }
      continue
    }

    if (/[\*%]/.test(keyword)) {
      let pattern = keyword.replace(/[\*%]+/g, '.*')
      let regExp = new RegExp('^'+pattern+'$')
      fncList[fld] = function(value) {
        if (!value) {
          return false
        }
        return regExp.test(value)
      }
      continue
    }
    fncList[fld] = function(value) {
      return value==keyword
    }
  } // for (fld in filters)

  if (cnt==0) {
    return null
  }

  return function(row) {
    for(let fld in fncList) {
      if (!fncList[fld](row[fld])) {
        return false
      }
    }
    return true
  }
}

const genSortingFunction = function(sortBy) {
  if (sortBy.length==0) {
    return null
  }
  return function(rowA, rowB) {
    for (let i in sortBy) {
      let sort = sortBy[i]
      let rowA_isEmpty = typeof rowA[sort.col] == 'undefined' || rowA[sort.col]==null
      let rowB_isEmpty = typeof rowB[sort.col] == 'undefined' || rowB[sort.col]==null
      if (rowA_isEmpty && rowB_isEmpty) {
        continue
      }
      if (rowA_isEmpty && !rowB_isEmpty) {
        return sort.dir != 'DESC' ? -1 : 1
      }
      if (!rowA_isEmpty && rowB_isEmpty) {
        return sort.dir != 'DESC' ? 1 : -1
      }

      if (rowA[sort.col] < rowB[sort.col]) {
        return sort.dir != 'DESC' ? -1 : 1
      }
      if (rowA[sort.col] > rowB[sort.col]) {
        return sort.dir != 'DESC' ? 1 : -1
      }
    }
    return 0
  }
}

const char = function(s, len) {
  return (s + '                                ').substr(0, len)
}

const promiseWhile = function (condition, body) {
    var dfd = q.defer();
    function loop() {
        if (!condition()) {
          return dfd.resolve();
        }
        q.when(body(), loop, dfd.reject);
    }
    q.nextTick(loop);
    return dfd.promise;
}

module.exports = {
  newUUID,
//  ajaxRequest,
  md5,
  setCookie,
  getCookie,
  promiseWhile,
  genFilterFunction,
  genSortingFunction,
  char
}
