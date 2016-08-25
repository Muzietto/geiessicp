/*
	GEIESSICP - JS implementations from SICP
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 0.1 - depends on Geieslists 1.1

	The MIT License - Copyright (c) 2016 GeiesSICP Project
*/
var geiessicp = S = function(L) {

  var nil = L.nil;
  var isEmpty = L.isEmpty;

  // chapter 2 - sets
  function make_tree(entry, left, right) { return L.ArrayToList([entry,left,right]); }

  var entry = L.first;
  var left_branch = L.second;
  var right_branch = L.third;

  function depth(tree) {
    if (isEmpty(tree)) return 0;
    return 1 + Math.max(depth(left_branch(tree)), depth(right_branch(tree)));
  }

  function build_set_naive(elements) {
    return build_set_helper(elements, nil);
    function build_set_helper(list, tree) {
      if (isEmpty(list)) return tree;
      if (element_of_set(L.head(list), tree)) return build_set_helper(L.tail(list), tree);
      return build_set_helper(L.tail(list), adjoin_set(L.head(list), tree));
    }
  }

  function tree_to_list1(tree) {
    if (isEmpty(tree)) return nil;
    return L.concat(tree_to_list1(left_branch(tree)),L.cons(entry(tree),tree_to_list1(right_branch(tree))));
  }

  function tree_to_list2(tree) {
    return L.reverse(tree_to_list_helper(tree, nil));
    
    function tree_to_list_helper(tree, list) {
      if (isEmpty(tree)) return list;
      return tree_to_list_helper(right_branch(tree), tree_to_list_helper(left_branch(tree),L.cons(entry(tree),list)));
    }
  }

  function adjoin_set(x, set) {
    if (isEmpty(set)) return make_tree(x, nil, nil);
    var currEntry = entry(set);
    if (x < currEntry) return make_tree(currEntry, adjoin_set(x, left_branch(set)), right_branch(set));
    if (x > currEntry) return make_tree(currEntry, left_branch(set), adjoin_set(x, right_branch(set)));
  }

  function element_of_set(x, set) {
    if (isEmpty(set)) return false;
    if (x === entry(set)) return true;
    if (x < entry(set)) return element_of_set(x, left_branch(set));
    if (x > entry(set)) return element_of_set(x, right_branch(set));
  }

  function build_balanced_tree(elements) {
    return L.head(partial_tree(L.sort(elements), L.size(elements)));

    function partial_tree(elts, n) {
      if (n === 0) return L.cons(nil, elts);
      var left_size = Math.floor((n - 1) / 2);
      var left_result = partial_tree(elts, left_size);
      var left_tree = L.head(left_result);
      var non_left_elts = L.tail(left_result);
      var right_size = n - (left_size+1);
      var this_entry = L.head(non_left_elts);
      var right_result = partial_tree(L.tail(non_left_elts), right_size);
      var right_tree = L.head(right_result);
      var remaining_elts = L.tail(right_result);
      return L.cons(make_tree(this_entry, left_tree,right_tree), remaining_elts);
    }
  }

  // chapter 2 - Huffman trees
  function decodeH (encoded,tree) {
    var symbols = L.first;
    var weight = L.second;
    var left_branch = L.third;
    var right_branch = L.fourth;

    var bits = L.ArrayToList(encoded.split('').filter(function(x) { return (x === '1' || x === '0');}));
    return decode(bits, tree);

    function decode(bits,tree) {
      if (L.size(bits) === 0) {
        if (L.size(L.head(tree)) === 1) {
          return L.head(L.head(tree));
        } else {
          throw new Error('non-existing encoding 1!');
        }
      }
      var currentBit = L.head(bits);
      if (currentBit === '0') return decode(L.tail(bits), left_branch(tree));
      if (currentBit === '1') return decode(L.tail(bits), right_branch(tree));
      throw new Error('non-existing encoding 2!')
    }
  }

  function buildH(symbols) {
    var enrichedSymbols = L.map(symbols, function(symbol) {
      return L.concat(symbol, L.ArrayToList([[],[]]));
    });
    return HtreeBuilder(enrichedSymbols);      
    
    function HtreeBuilder(nodes) {
      if (L.size(nodes) === 1) return L.head(nodes);
      var sortedNodes = L.sort(nodes, symbolsComparator);
      return HtreeBuilder(L.cons(make_parentH(L.first(sortedNodes), L.second(sortedNodes)), L.tail(L.tail(sortedNodes))));
    }
    function make_parentH(sa, sb) {
      var symbolsA = L.first(sa), symbolsB = L.first(sb), weightA = L.second(sa), weightB = L.second(sb);
      return L.ArrayToList([L.concat(symbolsA, symbolsB), weightA + weightB, sa, sb]);
    }
    function symbolsComparator(sa, sb) {
      var weightA = L.second(sa), weightB = L.second(sb);
      if (weightA === weightB) return 0;
      if (weightA > weightB) return 1;
      return -1;
    }
  }
  
  function dictionaryH(string) {
    return L.foldl(
      function(acc, x) {
        if (inDictionary(x, acc)) return increaseCount(x, acc);
        else return L.cons(L.ArrayToList([[x], 1]), acc);
      },
      nil,
      L.ArrayToList(string.split('').filter(function(x){return x !== ' ';})));

    function inDictionary(x, dict) {
      return L.isMember(x, dict, function(a, b) {
        return (a === L.head(L.head(b)));
      });
    }
    function increaseCount(x, dict) {
      return L.map(dict, function(item) {
        if (x === L.head(L.first(item))) return L.ArrayToList([L.first(item), L.second(item) + 1]);
        else return item;
      });
    };
  }

  // chapter 3 - constraints evaluator
  function _applier(name, op, rev1_op, rev2_op) {
    rev2_op = rev2_op || rev1_op;
    return function(va, vb, vresult) {
      var args = [].slice.apply(arguments);
      if (args.length < 2) throw new Error(name + ' - initialisation error');
      _apply();
      var result = {
        apply: _apply,
        unset: _unset
      };
      va.link(result);
      vb.link(result);
      vresult.link(result);
      return result;

      function _unset() {
        va.unset();
        vb.unset();
        vresult.unset();
      }

      function _apply() {
        // avoid stack overflow
        if (args.reduce((acc, v) => (v.read() !== null) ? acc + 1 : acc, 0) === 3) return;
        // skip when two values null
        if (args.reduce((acc, v) => v.read() === null ? acc + 1 : acc, 0) > 1) return;
        var maybeRes = maybe(va.read()).bind(a => maybe(vb.read()).bind(b => maybe(op(a, b))));
        var maybeVb = maybe(vresult.read()).bind(sum => maybe(va.read()).bind(a => maybe(rev1_op(sum, a))));
        var maybeVa = maybe(vresult.read()).bind(sum => maybe(vb.read()).bind(b => maybe(rev2_op(sum, b))));
        maybe(vresult.maybeSet(maybeRes))
          .orElse(maybe(vb.maybeSet(maybeVb)))
          .orElse(maybe(va.maybeSet(maybeVa)))
      }
    };
  }

  var _value = name => {
    var _value = null;
    var _operators = [];
    var _set = value => {
      if (typeof value === 'undefined' || value === null) return null;
      _value = value;
      _log();
      _operators.forEach(function(op) { op.apply(); });
      return value; // needed to make the maybe work
    }
    var _unset = () => {
      // avoid stack overflow
      if (_value === null) return;
      _value = null;
      _log();
      _operators.forEach(function(op) { op.unset(); });
    }
    var _log = () => console.log(name + ' - current value is ' + _value);
    var _link = operator => {
      _operators.push(operator);
    }

    return {
      name: () => name,
      set: _set,
      maybeSet: maybe => maybe.isSome() ? _set(maybe.get()) : null,
      unset: _unset,
      link: _link,
      read: () => JSON.parse(JSON.stringify(_value))
    };
  }

  var _constant = value => {
    if (typeof value === 'undefined') throw new Error('constants must be valued');
    return {
      name: () => {},
      set: () => {},
      unset: () => {},
      maybeSet: () => null,
      read: () => JSON.parse(JSON.stringify(value)),
      link: () => {}
    };
  }

  function maybe(value) {
    if (typeof value === 'undefined') throw new Error('maybe values cannot be undefined');
    var _bind = famb => (value !== null) ? famb(value) : maybe(null);
    var _get = () => value;
    var _orElse = mb => (value !== null) ? maybe(value) : mb;
    return {
      bind: _bind,
      get: _get,
      isSome: () => (value !== null),
      orElse: _orElse
    };
  }

  var _sum = _applier('sum', (a,b)=>a+b, (a,b)=>a-b);

  var _product = _applier('product', (a,b)=>a*b, (a,b)=>a/b);

  var _power = _applier('power', (a,b)=>Math.pow(a,b), (a,b)=>Math.log(a)/Math.log(b), (a,b)=>Math.pow(a,1/b));

  function _averager() {
    var inputs = [].splice.call(arguments, 0);
    var output = inputs.pop();
    var denom = inputs.length;
    var firstInput = inputs.shift();
    var foldInputs = inputs.map(function(input, index) {
      return {
        input: input,
        output: _value('' + index)
      };
    });
    var totalSumOutput = foldInputs.reduce(function(acc, obj) {
      _sum(acc.output, obj.input, obj.output);
      return { output: obj.output };
    }, { output: firstInput }).output;
    return _product(totalSumOutput, _constant(1/denom), output);
  }

  // digital circuit simulator
  function _wire(name) {
    var _value = false;
    var _actions = [];
    function _set(value) {
      if (value === 0) value = false;
      if (value === 1) value = true;
      if (_value !== value) {
        console.log(name + ': ' + value)
        _value = value;
        _actions.forEach(cb => cb(value));
      }
    }
    return {
      read: () => _value,
      set: _set,
      add_action: cb => { _actions.push(cb); cb(); }
    };
  }

  function _wire2(name) {
    var _value = false;
    var _actions = [];
    function _set(value) {
      if (value === 0) value = false;
      if (value === 1) value = true;
      if (_value !== value) {
        console.log(name + ': ' + value)
        _value = value;
        _actions.forEach(cb => cb());
      }
    }
    return {
      read: () => _value,
      set: _set,
      add_action: cb => { _actions.push(cb); cb(); }
    };
  }

  function _inverter(input, output, delay) {
    delay = delay || 5;
    input.add_action(() => output.set(!input.read()));
  }

  function _inverter2(input, output, delay) {
    delay = delay || 5;
    input.add_action(invertInput);
    function invertInput() {
      _afterDelay(delay, () => output.set(!input.read()))
    }
  }

  function _two_wires_gate(operation) {
    return function (inputA, inputB, output) {
      inputA.add_action(() => output.set(operation(inputA.read(), inputB.read())));
      inputB.add_action(() => output.set(operation(inputA.read(), inputB.read())));
    }
  }

  var _and_gate = _two_wires_gate((a,b) => a&&b);

  var _or_gate = _two_wires_gate((a,b) => a||b);

  function _and_gate2(inputA, inputB, output, delay) {
    delay = delay || 8;
    inputA.add_action(andActionProcedure);
    inputB.add_action(andActionProcedure);
    function andActionProcedure() {
      _afterDelay(delay, () => output.set(inputA.read() && inputB.read()))      
    }
  }

  function _or_gate2(inputA, inputB, output, delay) {
    delay = delay || 7;
    inputA.add_action(orActionProcedure);
    inputB.add_action(orActionProcedure);
    function orActionProcedure() {
      _afterDelay(delay, () => output.set(inputA.read() || inputB.read()))      
    }
  }

  function _afterDelay(delay, cb) {
    cb();
  }

  function _half_adder(a, b, s, c) {
    var d = _wire('d');
    var e = _wire('e');
    _or_gate(a, b, d);
    _and_gate(a, b, c);
    _inverter(c, e);
    _and_gate(d, e, s);
    return {};
  }

  function _full_adder(a, b, cin, sum, cout) {
    var s = _wire('s');
    var c1 = _wire('c1');
    var c2 = _wire('c2');
    _half_adder(b, cin, s, c1);
    _half_adder(a, s, sum, c2);
    _or_gate(c1, c2, cout);
    return {
      sum: _sum
    };
    function _sum(val_a, val_b, val_cin) {
      _reset();
      a.set(val_a);
      b.set(val_b);
      cin.set(val_cin);
      return (sum.read() ? 1 : 0) + (cout.read() ? 1 : 0) * 2;
      function _reset() {
        a.set(false);
        b.set(false);
        cin.set(false);
      }
    }
  }

  // https://www.cs.umd.edu/class/sum2003/cmsc311/Notes/Comb/adder.html
  function _ripple_carry_adder(as, bs, ss, cout) {
    var _size = as.length;
    if (bs.length !== _size || ss.length !== _size) throw new Error('ripple carry adder requires equal input/output to have equal size');
    var cs = Array(_size).fill().map((x,i) => _wire('c' + i));

    as.forEach((a, index) => {
      var currentCout = (index === _size-1) ? cout : cs[index+1];
      _full_adder(as[index], bs[index], cs[index], ss[index], currentCout);
    });

    return {
      sum: _sum
    };
    function _sum(val_as, val_bs) {
      if (val_as >= Math.pow(2, _size) || val_bs >= Math.pow(2, _size)) {
        throw new Error('not enough adders to perform this addition');
      }
      _reset();
      // e.g. 3 -> '1100' (using 4 adders)
      var binary_as = padLeft(_size, val_as.toString(2)).reverse();
      var binary_bs = padLeft(_size, val_bs.toString(2)).reverse();
      setInputWires(as, binary_as);
      setInputWires(bs, binary_bs);

      var result = ss.concat([cout]).reduce((acc, s, index) => acc + s.read()*Math.pow(2,index),0);
      return result;

      function _reset() {
        as.forEach(a => a.set(false));
        bs.forEach(b => b.set(false));
      }
      function padLeft(totalLength, string, paddingChar){
        if (string.length > totalLength) return string.slice(0, totalLength);
        return Array(totalLength+1 - string.length).join(paddingChar||'0') + string;
      }
      function setInputWires(wires, binaryDigitString) {
      binaryDigitString.split('')
        .map(s => parseInt(s, 10))
        .forEach((val, index) => wires[index].set(val));        
      }
    }    
  }

  return {
    make_tree: make_tree,
    entry: entry,
    left_branch: left_branch,
    right_branch: right_branch,
    depth: depth,
    build_set_naive: build_set_naive,
    element_of_set: element_of_set,
    adjoin_set: adjoin_set,
    tree_to_list1: tree_to_list1,
    tree_to_list2: tree_to_list2,
    build_balanced_tree: build_balanced_tree,
    decodeH: decodeH,
    buildH: buildH,
    dictionaryH, dictionaryH,
    value: _value,
    constant: _constant,
    sum: _sum,
    product: _product,
    power: _power,
    averager: _averager,
    wire: _wire,
    inverter: _inverter,
    and_gate: _and_gate,
    or_gate: _or_gate,
    half_adder: _half_adder,
    full_adder: _full_adder,
    ripple_carry_adder: _ripple_carry_adder
  };
}(geieslists);
