/*
	GEIESSICP - JS mplementations from SICP
	Author: Marco Faustinelli (contacts@faustinelli.net)
	Web: http://faustinelli.net/
	     http://faustinelli.wordpress.com/
	Version: 0.2 - Requires Geieslists 1.1 and Geiesvectors 0.1

	The MIT License - Copyright (c) 2016 GeiesSICP Project
*/

var expect = chai.expect;

describe('Implementing SICP chapter 3 brings to the implementation of', function () {
  describe('a digital circuit simulation system, inside which', function () {
    describe('a wire', function () {
      it('can carry signal, or not', function() {
        var test = S.wire('test');
        expect(test.read()).to.be.not.ok;
        test.set(true);
        expect(test.read()).to.be.ok;
        test.set(false);
        expect(test.read()).to.be.not.ok;
      });
      it('can accept 1/0 and convert it to true/false', function() {
        var test = S.wire('test');
        expect(test.read()).to.be.not.ok;
        test.set(1);
        expect(test.read()).to.be.ok;
        test.set(0);
        expect(test.read()).to.be.not.ok;
      });
      it('accepts callbacks to execute when its own signal changes', function() {
        var probe = { value: 0 };
        var test = S.wire('test');
        test.add_action(() => probe.value += 1);

        expect(probe.value).to.be.equal(0);
        test.set(true);
        expect(probe.value).to.be.equal(1);
        test.set(true);
        expect(probe.value).to.be.equal(1);
        test.set(false);
        expect(probe.value).to.be.equal(2);
      });
    });
    describe('an inverter (aka NOT gate)', function () {
      it('can carry signal, or not', function() {
        var input = S.wire('input');
        var output = S.wire('output');
        var test = S.inverter(input, output);
        expect(output.read()).to.be.ok;
        input.set(true);
        expect(output.read()).to.be.not.ok;
        input.set(false);
        expect(output.read()).to.be.ok;
      });
    });
    describe('an AND gate', function () {
      it('keeps track of two wires', function() {
        var inputA = S.wire('inputA');
        var inputB = S.wire('inputB');
        var output = S.wire('output');
        var test = S.and_gate(inputA, inputB, output);
        inputA.set(true);
        expect(output.read()).to.be.not.ok;
        inputB.set(true);
        expect(output.read()).to.be.ok;
      });
    });
    describe('an OR gate', function () {
      it('keeps track of two wires', function() {
        var inputA = S.wire('inputA');
        var inputB = S.wire('inputB');
        var output = S.wire('output');
        var test = S.or_gate(inputA, inputB, output);
        expect(output.read()).to.be.not.ok;
        inputB.set(true);
        expect(output.read()).to.be.ok;
      });
    });
    describe('an alternative OR gate', function () {
      it('can be built as NOT(NOT(A) AND NOT(B))', function() {
        var inputA = S.wire('inputA');
        var inputNotA = S.wire('inputNotA');
        var inputB = S.wire('inputB');
        var inputNotB = S.wire('inputNotB');
        var inner = S.wire('inner');
        var output = S.wire('output');
        S.inverter(inputA, inputNotA);
        S.inverter(inputB, inputNotB);
        S.and_gate(inputNotA, inputNotB, inner);
        S.inverter(inner, output);

        expect(output.read()).to.be.not.ok;
        inputA.set(true);
        expect(output.read()).to.be.ok;
        inputA.set(false);
        expect(output.read()).to.be.not.ok;
        inputB.set(true);
        expect(output.read()).to.be.ok;
      });
    });
    describe('a half adder', function () {
      beforeEach(function() {
        this.a = S.wire('a');
        this.b = S.wire('b');
        this.s = S.wire('s');
        this.c = S.wire('c');
        this.adder = S.half_adder(this.a, this.b, this.s, this.c);
      });
      it('will turn on s (sum) when either a or b are on', function() {
        expect(this.s.read()).to.be.not.ok;
        this.a.set(true);
        this.b.set(false);
        expect(this.s.read()).to.be.ok;
        this.a.set(false);
        expect(this.s.read()).to.be.not.ok;
        this.b.set(true);
        expect(this.s.read()).to.be.ok;
        this.b.set(false);
        expect(this.s.read()).to.be.not.ok;
      });
      it('will turn on c (carry) when both a and b are on', function() {
        expect(this.c.read()).to.be.not.ok;
        this.a.set(true);
        expect(this.c.read()).to.be.not.ok;
        this.b.set(true);
        expect(this.c.read()).to.be.ok;
        this.a.set(false);
        expect(this.c.read()).to.be.not.ok;
        this.a.set(true);
        this.b.set(false);
        expect(this.c.read()).to.be.not.ok;
      });
    });
    describe('a full adder', function () {
      beforeEach(function() {
        this.a = S.wire('a');
        this.b = S.wire('b');
        this.cin = S.wire('cin');
        this.cout = S.wire('cout');
        this.sum = S.wire('sum');
        this.adder = S.full_adder(this.a, this.b, this.cin, this.sum, this.cout);
      });
      it('will turn on sum when either a, b or cin are on', function() {
        expect(this.sum.read()).to.be.not.ok;
        this.a.set(true);
        expect(this.sum.read()).to.be.ok;
        this.a.set(false);
        expect(this.sum.read()).to.be.not.ok;
        this.b.set(true);
        expect(this.sum.read()).to.be.ok;
        this.b.set(false);
        expect(this.sum.read()).to.be.not.ok;
        this.cin.set(true);
        expect(this.sum.read()).to.be.ok;
      });
      it('will turn on s (sum) when all a, b and cin are on', function() {
        this.a.set(true);
        this.b.set(true);
        this.cin.set(true);
        expect(this.sum.read()).to.be.ok;
      });
      it('will keep sum off when two of a, b and cin are on', function() {
        this.a.set(true);
        expect(this.sum.read()).to.be.ok;
        this.b.set(true);
        expect(this.sum.read()).to.be.not.ok;
        this.a.set(false);
        expect(this.sum.read()).to.be.ok;
        this.cin.set(true);
        expect(this.sum.read()).to.be.not.ok;
        this.b.set(false);
        expect(this.sum.read()).to.be.ok;
        this.a.set(true);
        expect(this.sum.read()).to.be.not.ok;
      });
      it('will turn on cout (carry out) when at least two of a, b and cin are on', function() {
        expect(this.cout.read()).to.be.not.ok;
        this.a.set(true);
        expect(this.cout.read()).to.be.not.ok;
        this.b.set(true);
        expect(this.cout.read()).to.be.ok;
        this.a.set(false);
        expect(this.cout.read()).to.be.not.ok;
        this.a.set(true);
        expect(this.cout.read()).to.be.ok;
        this.cin.set(true);
        expect(this.cout.read()).to.be.ok;
        this.a.set(false);
        expect(this.cout.read()).to.be.ok;
        this.b.set(false);
        expect(this.cout.read()).to.be.not.ok;
      });
      it('will allow simple arithmetics', function() {
        var self = this;
        expect(this.adder.sum(0,0,0)).to.be.equal(0);
        expect(this.adder.sum(1,0,0)).to.be.equal(1);
        expect(this.adder.sum(0,1,0)).to.be.equal(1);
        expect(this.adder.sum(0,0,1)).to.be.equal(1);
        expect(this.adder.sum(1,1,0)).to.be.equal(2);
        expect(this.adder.sum(1,0,1)).to.be.equal(2);
        expect(this.adder.sum(0,1,1)).to.be.equal(2);
        expect(this.adder.sum(1,1,1)).to.be.equal(3);
      });
    });
    describe('a ripple-carry-adder', function() {
      it('is built from n-sized lists of wires', function() {
        function wires(name, size) {
          return Array(size).fill().map((x,i) => S.wire(name + i));
        }
        var size = 3;
        var as = wires('a', size);
        var bs = wires('b', size);
        var ss = wires('s', size);
        var cout = S.wire('cout');

        var rca = S.ripple_carry_adder(as, bs, ss, cout);
        expect(() => rca.sum(7,8)).to.throw;
        expect(() => rca.sum(8,0)).to.throw;
        expect(rca.sum(0,0)).to.be.equal(0);
        expect(rca.sum(2,3)).to.be.equal(5);
        expect(rca.sum(4,1)).to.be.equal(5);
        expect(rca.sum(4,3)).to.be.equal(7);
        expect(rca.sum(4,4)).to.be.equal(8);
        expect(rca.sum(7,7)).to.be.equal(14);
      });
      it('can carry out some pretty impressive calculations!!', function() {
        function wires(name, size) {
          return Array(size).fill().map((x,i) => S.wire(name + i));
        }
        var size = 30;
        var as = wires('a', size);
        var bs = wires('b', size);
        var ss = wires('s', size);
        var cout = S.wire('cout');

        var rca = S.ripple_carry_adder(as, bs, ss, cout);
        expect(rca.sum(33539865,268289782)).to.be.equal(301829647);
      });
    });
  });

  describe('a constraint evaluation system, inside which', function () {
    var _consoleLog = null;
    var probe = function() {
      var _msgs = [];
      var result = function(msg) {
        _msgs.push(msg);
      }
      result.test = function() { return _msgs.join(','); }
      return result
    }

    beforeEach(function() {
      _consoleLog = console.log;
      console.log = probe();
    });
    afterEach(function() {
      console.log = _consoleLog;
      _consoleLog = null;
    });

    describe('a value', function () {
      it('may be null or not null', function() {
        var test = S.value('test');
        expect(test.read()).to.be.null;
      });
      it('may have a name or not', function() {
        var test = S.value('test');
        expect(test.name()).to.be.equal('test');
        var noname = S.value();
        expect(noname.name()).to.be.undefined;
      });
      it('is mutable', function() {
        var test = S.value('test');
        expect(test.read()).to.be.null;
        test.set(124);
        expect(test.read()).to.be.equal(124);
        test.unset();
        expect(test.read()).to.be.null;
      });
      it('logs to the console its own value changes', function() {
        var test = S.value('test');
        expect(console.log.test()).to.be.equal('');
        test.set(123);
        expect(console.log.test()).to.be.equal('test - current value is 123');
        test.unset();
        expect(console.log.test()).to.be.equal('test - current value is 123,test - current value is null');
      });
      it('may link itself to an operator and broadcast its own value changes to it', function() {
        var op = { apply: function() { console.log('got a broadcast signal'); } };
        var test = S.value('test');
        test.link(op);
        test.set(123);
        expect(console.log.test()).to.be.equal('test - current value is 123,got a broadcast signal');
      });
    });
    describe('a constant', function () {
      it('requires an initialisation value', function() {
        expect(function() { return S.constant(); }).to.throw;
        expect(function() { return S.constant(123); }).to.not.throw;
      });
      it('has no name', function() {
        var PI = S.constant(Math.PI);
        expect(PI.name()).to.be.undefined;
      });
      it('is not mutable', function() {
        var PI = S.constant(Math.PI);
        expect(PI.read()).to.be.equal(Math.PI);
        PI.set('whatever');
        expect(PI.read()).to.be.equal(Math.PI);
      });  
    });

    describe('a sum', function () {
      it('requires two operands and one resuls', function() {
        expect(function() { return S.sum(); }).to.throw;
        expect(function() { return S.sum('1'); }).to.throw;
        expect(function() { return S.sum('1','2'); }).to.throw;
        expect(function() { return S.sum('1','2','3'); }).to.not.throw;
      });
      it('tries to resolve constraints at construction by computing sum', function() {
        var result = S.value('result');
        var tredici = S.sum(S.constant(1), S.constant(12), result);
        expect(console.log.test()).to.be.equal('result - current value is 13');
      });
      it('tries to resolve constraints at construction by computing vb', function() {
        var vb = S.value('vb');
        var undici = S.sum(S.constant(1), vb, S.constant(12));
        expect(console.log.test()).to.be.equal('vb - current value is 11');
      });
      it('tries to resolve constraints at construction by computing vb', function() {
        var vb = S.value('vb');
        var minUndici = S.sum(S.constant(12), vb, S.constant(1));
        expect(console.log.test()).to.be.equal('vb - current value is -11');
      });
      it('tries to resolve constraints at construction by computing va', function() {
        var va = S.value('va');
        var undici = S.sum(va, S.constant(1), S.constant(12));
        expect(console.log.test()).to.be.equal('va - current value is 11');
      });
      it('tries to resolve constraints at construction by computing va', function() {
        var va = S.value('va');
        var minUndici = S.sum(va, S.constant(12), S.constant(1));
        expect(console.log.test()).to.be.equal('va - current value is -11');
      });
      it('reacts to broadcast messages from its own values', function() {
        var va = S.value('va');
        var summ = S.value('summ');
        var plus1 = S.sum(va, S.constant(1), summ);

        va.set(1);
        expect(summ.read()).to.be.equal(2);
        expect(console.log.test()).to.contain('va - current value is 1,summ - current value is 2');

        va.unset();
        expect(summ.read()).to.be.null;
        expect(console.log.test()).to.contain('va - current value is null,summ - current value is null');

        summ.set(10);
        expect(va.read()).to.be.equal(9);
        expect(console.log.test()).to.contain('summ - current value is 10,va - current value is 9');

        summ.unset();
        expect(va.read()).to.be.null;
        expect(console.log.test()).to.be.equal('va - current value is 1,summ - current value is 2,va - current value is null,summ - current value is null,summ - current value is 10,va - current value is 9,summ - current value is null,va - current value is null');
      });
    });

    describe('a product', function () {
      it('tries to resolve constraints at construction by computing product', function() {
        var result = S.value('result');
        var ventiquattro = S.product(S.constant(2), S.constant(12), result);
        expect(console.log.test()).to.be.equal('result - current value is 24');
      });
      it('tries to resolve constraints at construction by computing vb', function() {
        var vb = S.value('vb');
        var due = S.product(S.constant(2), vb, S.constant(4));
        expect(console.log.test()).to.be.equal('vb - current value is 2');
      });
      it('tries to resolve constraints at construction by computing vb', function() {
        var vb = S.value('vb');
        var unMezzo = S.product(S.constant(4), vb, S.constant(2));
        expect(console.log.test()).to.be.equal('vb - current value is 0.5');
      });
      it('tries to resolve constraints at construction by computing va', function() {
        var va = S.value('va');
        var due = S.product(va, S.constant(2), S.constant(4));
        expect(console.log.test()).to.be.equal('va - current value is 2');
      });
      it('tries to resolve constraints at construction by computing va', function() {
        var va = S.value('va');
        var unMezzo = S.product(va, S.constant(4), S.constant(2));
        expect(console.log.test()).to.be.equal('va - current value is 0.5');
      });
    });

    describe('a power', function () {
      it('tries to resolve constraints at construction by computing power', function() {
        var result = S.value('result');
        var otto = S.power(S.constant(2), S.constant(3), result);
        expect(console.log.test()).to.be.equal('result - current value is 8');
      });
      it('tries to resolve constraints at construction by computing vb (logarithm)', function() {
        var vb = S.value('vb');
        var three = S.power(S.constant(2), vb, S.constant(8));
        expect(console.log.test()).to.be.equal('vb - current value is 3');
      });
      it('tries to resolve constraints at construction by computing vb (logarithm)', function() {
        var vb = S.value('vb');
        var unMezzo = S.power(S.constant(4), vb, S.constant(2));
        expect(console.log.test()).to.be.equal('vb - current value is 0.5');
      });
      it('tries to resolve constraints at construction by computing va (base)', function() {
        var va = S.value('va');
        var due = S.power(va, S.constant(3), S.constant(8));
        expect(console.log.test()).to.be.equal('va - current value is 2');
      });
      it('tries to resolve constraints at construction by computing va (base)', function() {
        var va = S.value('va');
        var unMezzo = S.power(va, S.constant(3), S.constant(1/8));
        expect(console.log.test()).to.be.equal('va - current value is 0.5');
      });
    });

    describe('an averager', function () {
      beforeEach(function() {
        this.inputA = S.value('inputA');
        this.inputB = S.value('inputB');
        this.inputC = S.value('inputC');
        this.inputD = S.value('inputD');
        this.inputE = S.value('inputE');
        this.inputF = S.value('inputF');
        this.result = S.value('result');
      });
      describe('starts with two inputs', function () {
        it('computing their average', function() {
          var ave = S.averager(this.inputA, this.inputB, this.result);
          this.inputA.set(12);
          this.inputB.set(14);
          expect(this.result.read()).to.be.equal(13);
          expect(console.log.test()).to.contain('result - current value is 13');
        });
        it('computing one of them from the average', function() {
          var ave = S.averager(this.inputA, this.inputB, this.result);
          this.inputA.set(12);
          this.result.set(13);
          expect(this.inputB.read()).to.be.equal(14);
          expect(console.log.test()).to.contain('inputB - current value is 14');
        });
      });
      describe('moves on to work with three inputs', function () {
        it('computing their average', function() {
          var ave = S.averager(this.inputA, this.inputB, this.inputC, this.result);
          this.inputA.set(12);
          this.inputB.set(14);
          this.inputC.set(16);
          expect(this.result.read()).to.be.equal(14);
          expect(console.log.test()).to.contain('result - current value is 14');
        });
        it('computing one of them from the average', function() {
          var ave = S.averager(this.inputA, this.inputB, this.inputC, this.result);
          this.inputA.set(12);
          this.inputB.set(14);
          this.result.set(14);
          expect(this.inputC.read()).to.be.equal(16);
          expect(console.log.test()).to.contain('inputC - current value is 16');
        });
      });
      describe('...and ends up handling any number of inputs', function () {
        it('computing their average', function() {
          var ave = S.averager(this.inputA, this.inputB, this.inputC, this.inputD, this.inputE, this.inputF, this.result);
          this.inputA.set(12);
          this.inputB.set(14);
          this.inputC.set(16);
          this.inputD.set(18);
          this.inputE.set(20);
          this.inputF.set(22);
          expect(this.result.read()).to.be.equal(17);
          expect(console.log.test()).to.contain('result - current value is 17');
        });
        it('computing one of them from the average', function() {
          var ave = S.averager(this.inputA, this.inputB, this.inputC, this.inputD, this.inputE, this.inputF, this.result);
          this.inputA.set(12);
          this.inputB.set(14);
          this.inputC.set(16);
          this.inputD.set(18);
          this.inputE.set(20);
          this.result.set(17);
          expect(this.inputF.read()).to.be.equal(22);
          expect(console.log.test()).to.contain('inputF - current value is 22');
        });
      });
    });

    // P = 2 * (C -32)
    describe('a more complex expression', function() {
      var C = S.value('C');
      var P = S.value('P');
      var vallo = S.value('vallo');
      var cMin32 = S.sum(C, S.constant(-32), vallo);
      var pHalf = S.product(P, S.constant(0.5), vallo);

      it('can be set and unset from any of its own free values', function() {
        C.set(34);
        expect(vallo.read()).to.be.equal(2);
        expect(P.read()).to.be.equal(4);

        P.unset();
        expect(vallo.read()).to.be.null;
        expect(C.read()).to.be.null;

        P.set(4);
        expect(vallo.read()).to.be.equal(2);
        expect(C.read()).to.be.equal(34);
      });
    });

    // P = (2 * (C -32))^(E + 1)
    describe('a multivariable system', function() {
      var C = S.value('C');
      var P = S.value('P');
      var E = S.value('E');
      var cMin32Val = S.value('cMin32Val');
      var ePlus1Val = S.value('ePlus1Val');
      var cMin32Times2Val = S.value('cMin32Times2Val');
      var cMin32 = S.sum(C, S.constant(-32), cMin32Val);
      var ePlus1 = S.sum(E, S.constant(1), ePlus1Val);
      var cMin32Times2 = S.product(cMin32Val, S.constant(2), cMin32Times2Val);
      var thePower = S.power(cMin32Times2Val, ePlus1Val, P);

      it('can be set and unset from any of its own free values', function() {
        C.set(34);
        expect(cMin32Val.read()).to.be.equal(2);
        expect(cMin32Times2Val.read()).to.be.equal(4);
        expect(P.read()).to.be.null;

        E.set(1);
        expect(ePlus1Val.read()).to.be.equal(2);
        expect(P.read()).to.be.equal(16);

        P.unset();
        expect(cMin32Val.read()).to.be.null;
        expect(cMin32Times2Val.read()).to.be.null;
        expect(C.read()).to.be.null;
        expect(ePlus1Val.read()).to.be.null;
        expect(E.read()).to.be.null;

        P.set(16);
        expect(cMin32Times2Val.read()).to.be.null;
        expect(ePlus1Val.read()).to.be.null;

        C.set(34);
        expect(cMin32Val.read()).to.be.equal(2);
        expect(cMin32Times2Val.read()).to.be.equal(4);
        expect(ePlus1Val.read()).to.be.equal(2);
        expect(E.read()).to.be.equal(1);
      });
    });
  });
});
