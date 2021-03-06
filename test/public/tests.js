var public;
(function (modules) {
    var cache = {}, require = function (id) {
            var module = cache[id];
            if (!module) {
                module = cache[id] = {};
                var exports = module.exports = {};
                modules[id].call(exports, require, module, exports, typeof window == 'undefined' ? {} : window);
            }
            return module.exports;
        };
    public = require('0');
}({
    '0': function (require, module, exports, global) {
        require('1');
        require('3');
        require('4');
        require('5');
        require('6');
        require('7');
        require('8');
        require('9');
    },
    '1': function (require, module, exports, global) {
        var expect = require('2');
        describe('Socket.IO: Connect', function () {
            it('should `connect` and `disconnect`', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.disconnect();
                });
                socket.on('disconnect', function () {
                    done();
                });
                socket.on('connect_failed', function () {
                    throw new Error('client failed to connect');
                });
                socket.on('error', function () {
                    throw new Error('client error');
                });
            });
        });
    },
    '2': function (require, module, exports, global) {
        (function (global, module) {
            if ('undefined' == typeof module) {
                var module = { exports: {} }, exports = module.exports;
            }
            module.exports = expect;
            expect.Assertion = Assertion;
            expect.version = '0.1.2';
            var flags = {
                    not: [
                        'to',
                        'be',
                        'have',
                        'include',
                        'only'
                    ],
                    to: [
                        'be',
                        'have',
                        'include',
                        'only',
                        'not'
                    ],
                    only: ['have'],
                    have: ['own'],
                    be: ['an']
                };
            function expect(obj) {
                return new Assertion(obj);
            }
            function Assertion(obj, flag, parent) {
                this.obj = obj;
                this.flags = {};
                if (undefined != parent) {
                    this.flags[flag] = true;
                    for (var i in parent.flags) {
                        if (parent.flags.hasOwnProperty(i)) {
                            this.flags[i] = true;
                        }
                    }
                }
                var $flags = flag ? flags[flag] : keys(flags), self = this;
                if ($flags) {
                    for (var i = 0, l = $flags.length; i < l; i++) {
                        if (this.flags[$flags[i]])
                            continue;
                        var name = $flags[i], assertion = new Assertion(this.obj, name, this);
                        if ('function' == typeof Assertion.prototype[name]) {
                            var old = this[name];
                            this[name] = function () {
                                return old.apply(self, arguments);
                            };
                            for (var fn in Assertion.prototype) {
                                if (Assertion.prototype.hasOwnProperty(fn) && fn != name) {
                                    this[name][fn] = bind(assertion[fn], assertion);
                                }
                            }
                        } else {
                            this[name] = assertion;
                        }
                    }
                }
            }
            ;
            Assertion.prototype.assert = function (truth, msg, error) {
                var msg = this.flags.not ? error : msg, ok = this.flags.not ? !truth : truth;
                if (!ok) {
                    throw new Error(msg.call(this));
                }
                this.and = new Assertion(this.obj);
            };
            Assertion.prototype.ok = function () {
                this.assert(!!this.obj, function () {
                    return 'expected ' + i(this.obj) + ' to be truthy';
                }, function () {
                    return 'expected ' + i(this.obj) + ' to be falsy';
                });
            };
            Assertion.prototype.throwError = Assertion.prototype.throwException = function (fn) {
                expect(this.obj).to.be.a('function');
                var thrown = false, not = this.flags.not;
                try {
                    this.obj();
                } catch (e) {
                    if ('function' == typeof fn) {
                        fn(e);
                    } else if ('object' == typeof fn) {
                        var subject = 'string' == typeof e ? e : e.message;
                        if (not) {
                            expect(subject).to.not.match(fn);
                        } else {
                            expect(subject).to.match(fn);
                        }
                    }
                    thrown = true;
                }
                if ('object' == typeof fn && not) {
                    this.flags.not = false;
                }
                var name = this.obj.name || 'fn';
                this.assert(thrown, function () {
                    return 'expected ' + name + ' to throw an exception';
                }, function () {
                    return 'expected ' + name + ' not to throw an exception';
                });
            };
            Assertion.prototype.empty = function () {
                var expectation;
                if ('object' == typeof this.obj && null !== this.obj && !isArray(this.obj)) {
                    if ('number' == typeof this.obj.length) {
                        expectation = !this.obj.length;
                    } else {
                        expectation = !keys(this.obj).length;
                    }
                } else {
                    if ('string' != typeof this.obj) {
                        expect(this.obj).to.be.an('object');
                    }
                    expect(this.obj).to.have.property('length');
                    expectation = !this.obj.length;
                }
                this.assert(expectation, function () {
                    return 'expected ' + i(this.obj) + ' to be empty';
                }, function () {
                    return 'expected ' + i(this.obj) + ' to not be empty';
                });
                return this;
            };
            Assertion.prototype.be = Assertion.prototype.equal = function (obj) {
                this.assert(obj === this.obj, function () {
                    return 'expected ' + i(this.obj) + ' to equal ' + i(obj);
                }, function () {
                    return 'expected ' + i(this.obj) + ' to not equal ' + i(obj);
                });
                return this;
            };
            Assertion.prototype.eql = function (obj) {
                this.assert(expect.eql(obj, this.obj), function () {
                    return 'expected ' + i(this.obj) + ' to sort of equal ' + i(obj);
                }, function () {
                    return 'expected ' + i(this.obj) + ' to sort of not equal ' + i(obj);
                });
                return this;
            };
            Assertion.prototype.within = function (start, finish) {
                var range = start + '..' + finish;
                this.assert(this.obj >= start && this.obj <= finish, function () {
                    return 'expected ' + i(this.obj) + ' to be within ' + range;
                }, function () {
                    return 'expected ' + i(this.obj) + ' to not be within ' + range;
                });
                return this;
            };
            Assertion.prototype.a = Assertion.prototype.an = function (type) {
                if ('string' == typeof type) {
                    var n = /^[aeiou]/.test(type) ? 'n' : '';
                    this.assert('array' == type ? isArray(this.obj) : 'object' == type ? 'object' == typeof this.obj && null !== this.obj : type == typeof this.obj, function () {
                        return 'expected ' + i(this.obj) + ' to be a' + n + ' ' + type;
                    }, function () {
                        return 'expected ' + i(this.obj) + ' not to be a' + n + ' ' + type;
                    });
                } else {
                    var name = type.name || 'supplied constructor';
                    this.assert(this.obj instanceof type, function () {
                        return 'expected ' + i(this.obj) + ' to be an instance of ' + name;
                    }, function () {
                        return 'expected ' + i(this.obj) + ' not to be an instance of ' + name;
                    });
                }
                return this;
            };
            Assertion.prototype.greaterThan = Assertion.prototype.above = function (n) {
                this.assert(this.obj > n, function () {
                    return 'expected ' + i(this.obj) + ' to be above ' + n;
                }, function () {
                    return 'expected ' + i(this.obj) + ' to be below ' + n;
                });
                return this;
            };
            Assertion.prototype.lessThan = Assertion.prototype.below = function (n) {
                this.assert(this.obj < n, function () {
                    return 'expected ' + i(this.obj) + ' to be below ' + n;
                }, function () {
                    return 'expected ' + i(this.obj) + ' to be above ' + n;
                });
                return this;
            };
            Assertion.prototype.match = function (regexp) {
                this.assert(regexp.exec(this.obj), function () {
                    return 'expected ' + i(this.obj) + ' to match ' + regexp;
                }, function () {
                    return 'expected ' + i(this.obj) + ' not to match ' + regexp;
                });
                return this;
            };
            Assertion.prototype.length = function (n) {
                expect(this.obj).to.have.property('length');
                var len = this.obj.length;
                this.assert(n == len, function () {
                    return 'expected ' + i(this.obj) + ' to have a length of ' + n + ' but got ' + len;
                }, function () {
                    return 'expected ' + i(this.obj) + ' to not have a length of ' + len;
                });
                return this;
            };
            Assertion.prototype.property = function (name, val) {
                if (this.flags.own) {
                    this.assert(Object.prototype.hasOwnProperty.call(this.obj, name), function () {
                        return 'expected ' + i(this.obj) + ' to have own property ' + i(name);
                    }, function () {
                        return 'expected ' + i(this.obj) + ' to not have own property ' + i(name);
                    });
                    return this;
                }
                if (this.flags.not && undefined !== val) {
                    if (undefined === this.obj[name]) {
                        throw new Error(i(this.obj) + ' has no property ' + i(name));
                    }
                } else {
                    var hasProp;
                    try {
                        hasProp = name in this.obj;
                    } catch (e) {
                        hasProp = undefined !== this.obj[name];
                    }
                    this.assert(hasProp, function () {
                        return 'expected ' + i(this.obj) + ' to have a property ' + i(name);
                    }, function () {
                        return 'expected ' + i(this.obj) + ' to not have a property ' + i(name);
                    });
                }
                if (undefined !== val) {
                    this.assert(val === this.obj[name], function () {
                        return 'expected ' + i(this.obj) + ' to have a property ' + i(name) + ' of ' + i(val) + ', but got ' + i(this.obj[name]);
                    }, function () {
                        return 'expected ' + i(this.obj) + ' to not have a property ' + i(name) + ' of ' + i(val);
                    });
                }
                this.obj = this.obj[name];
                return this;
            };
            Assertion.prototype.string = Assertion.prototype.contain = function (obj) {
                if ('string' == typeof this.obj) {
                    this.assert(~this.obj.indexOf(obj), function () {
                        return 'expected ' + i(this.obj) + ' to contain ' + i(obj);
                    }, function () {
                        return 'expected ' + i(this.obj) + ' to not contain ' + i(obj);
                    });
                } else {
                    this.assert(~indexOf(this.obj, obj), function () {
                        return 'expected ' + i(this.obj) + ' to contain ' + i(obj);
                    }, function () {
                        return 'expected ' + i(this.obj) + ' to not contain ' + i(obj);
                    });
                }
                return this;
            };
            Assertion.prototype.key = Assertion.prototype.keys = function ($keys) {
                var str, ok = true;
                $keys = isArray($keys) ? $keys : Array.prototype.slice.call(arguments);
                if (!$keys.length)
                    throw new Error('keys required');
                var actual = keys(this.obj), len = $keys.length;
                ok = every($keys, function (key) {
                    return ~indexOf(actual, key);
                });
                if (!this.flags.not && this.flags.only) {
                    ok = ok && $keys.length == actual.length;
                }
                if (len > 1) {
                    $keys = map($keys, function (key) {
                        return i(key);
                    });
                    var last = $keys.pop();
                    str = $keys.join(', ') + ', and ' + last;
                } else {
                    str = i($keys[0]);
                }
                str = (len > 1 ? 'keys ' : 'key ') + str;
                str = (!this.flags.only ? 'include ' : 'only have ') + str;
                this.assert(ok, function () {
                    return 'expected ' + i(this.obj) + ' to ' + str;
                }, function () {
                    return 'expected ' + i(this.obj) + ' to not ' + str;
                });
                return this;
            };
            Assertion.prototype.fail = function (msg) {
                msg = msg || 'explicit failure';
                this.assert(false, msg, msg);
                return this;
            };
            function bind(fn, scope) {
                return function () {
                    return fn.apply(scope, arguments);
                };
            }
            function every(arr, fn, thisObj) {
                var scope = thisObj || global;
                for (var i = 0, j = arr.length; i < j; ++i) {
                    if (!fn.call(scope, arr[i], i, arr)) {
                        return false;
                    }
                }
                return true;
            }
            ;
            function indexOf(arr, o, i) {
                if (Array.prototype.indexOf) {
                    return Array.prototype.indexOf.call(arr, o, i);
                }
                if (arr.length === undefined) {
                    return -1;
                }
                for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0; i < j && arr[i] !== o; i++);
                return j <= i ? -1 : i;
            }
            ;
            var getOuterHTML = function (element) {
                if ('outerHTML' in element)
                    return element.outerHTML;
                var ns = 'http://www.w3.org/1999/xhtml';
                var container = document.createElementNS(ns, '_');
                var elemProto = (window.HTMLElement || window.Element).prototype;
                var xmlSerializer = new XMLSerializer();
                var html;
                if (document.xmlVersion) {
                    return xmlSerializer.serializeToString(element);
                } else {
                    container.appendChild(element.cloneNode(false));
                    html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
                    container.innerHTML = '';
                    return html;
                }
            };
            var isDOMElement = function (object) {
                if (typeof HTMLElement === 'object') {
                    return object instanceof HTMLElement;
                } else {
                    return object && typeof object === 'object' && object.nodeType === 1 && typeof object.nodeName === 'string';
                }
            };
            function i(obj, showHidden, depth) {
                var seen = [];
                function stylize(str) {
                    return str;
                }
                ;
                function format(value, recurseTimes) {
                    if (value && typeof value.inspect === 'function' && value !== exports && !(value.constructor && value.constructor.prototype === value)) {
                        return value.inspect(recurseTimes);
                    }
                    switch (typeof value) {
                    case 'undefined':
                        return stylize('undefined', 'undefined');
                    case 'string':
                        var simple = '\'' + json.stringify(value).replace(/^"|"$/g, '').replace(/'/g, '\\\'').replace(/\\"/g, '"') + '\'';
                        return stylize(simple, 'string');
                    case 'number':
                        return stylize('' + value, 'number');
                    case 'boolean':
                        return stylize('' + value, 'boolean');
                    }
                    if (value === null) {
                        return stylize('null', 'null');
                    }
                    if (isDOMElement(value)) {
                        return getOuterHTML(value);
                    }
                    var visible_keys = keys(value);
                    var $keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;
                    if (typeof value === 'function' && $keys.length === 0) {
                        if (isRegExp(value)) {
                            return stylize('' + value, 'regexp');
                        } else {
                            var name = value.name ? ': ' + value.name : '';
                            return stylize('[Function' + name + ']', 'special');
                        }
                    }
                    if (isDate(value) && $keys.length === 0) {
                        return stylize(value.toUTCString(), 'date');
                    }
                    var base, type, braces;
                    if (isArray(value)) {
                        type = 'Array';
                        braces = [
                            '[',
                            ']'
                        ];
                    } else {
                        type = 'Object';
                        braces = [
                            '{',
                            '}'
                        ];
                    }
                    if (typeof value === 'function') {
                        var n = value.name ? ': ' + value.name : '';
                        base = isRegExp(value) ? ' ' + value : ' [Function' + n + ']';
                    } else {
                        base = '';
                    }
                    if (isDate(value)) {
                        base = ' ' + value.toUTCString();
                    }
                    if ($keys.length === 0) {
                        return braces[0] + base + braces[1];
                    }
                    if (recurseTimes < 0) {
                        if (isRegExp(value)) {
                            return stylize('' + value, 'regexp');
                        } else {
                            return stylize('[Object]', 'special');
                        }
                    }
                    seen.push(value);
                    var output = map($keys, function (key) {
                            var name, str;
                            if (value.__lookupGetter__) {
                                if (value.__lookupGetter__(key)) {
                                    if (value.__lookupSetter__(key)) {
                                        str = stylize('[Getter/Setter]', 'special');
                                    } else {
                                        str = stylize('[Getter]', 'special');
                                    }
                                } else {
                                    if (value.__lookupSetter__(key)) {
                                        str = stylize('[Setter]', 'special');
                                    }
                                }
                            }
                            if (indexOf(visible_keys, key) < 0) {
                                name = '[' + key + ']';
                            }
                            if (!str) {
                                if (indexOf(seen, value[key]) < 0) {
                                    if (recurseTimes === null) {
                                        str = format(value[key]);
                                    } else {
                                        str = format(value[key], recurseTimes - 1);
                                    }
                                    if (str.indexOf('\n') > -1) {
                                        if (isArray(value)) {
                                            str = map(str.split('\n'), function (line) {
                                                return '  ' + line;
                                            }).join('\n').substr(2);
                                        } else {
                                            str = '\n' + map(str.split('\n'), function (line) {
                                                return '   ' + line;
                                            }).join('\n');
                                        }
                                    }
                                } else {
                                    str = stylize('[Circular]', 'special');
                                }
                            }
                            if (typeof name === 'undefined') {
                                if (type === 'Array' && key.match(/^\d+$/)) {
                                    return str;
                                }
                                name = json.stringify('' + key);
                                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                                    name = name.substr(1, name.length - 2);
                                    name = stylize(name, 'name');
                                } else {
                                    name = name.replace(/'/g, '\\\'').replace(/\\"/g, '"').replace(/(^"|"$)/g, '\'');
                                    name = stylize(name, 'string');
                                }
                            }
                            return name + ': ' + str;
                        });
                    seen.pop();
                    var numLinesEst = 0;
                    var length = reduce(output, function (prev, cur) {
                            numLinesEst++;
                            if (indexOf(cur, '\n') >= 0)
                                numLinesEst++;
                            return prev + cur.length + 1;
                        }, 0);
                    if (length > 50) {
                        output = braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
                    } else {
                        output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
                    }
                    return output;
                }
                return format(obj, typeof depth === 'undefined' ? 2 : depth);
            }
            ;
            function isArray(ar) {
                return Object.prototype.toString.call(ar) == '[object Array]';
            }
            ;
            function isRegExp(re) {
                var s;
                try {
                    s = '' + re;
                } catch (e) {
                    return false;
                }
                return re instanceof RegExp || typeof re === 'function' && re.constructor.name === 'RegExp' && re.compile && re.test && re.exec && s.match(/^\/.*\/[gim]{0,3}$/);
            }
            ;
            function isDate(d) {
                if (d instanceof Date)
                    return true;
                return false;
            }
            ;
            function keys(obj) {
                if (Object.keys) {
                    return Object.keys(obj);
                }
                var keys = [];
                for (var i in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, i)) {
                        keys.push(i);
                    }
                }
                return keys;
            }
            function map(arr, mapper, that) {
                if (Array.prototype.map) {
                    return Array.prototype.map.call(arr, mapper, that);
                }
                var other = new Array(arr.length);
                for (var i = 0, n = arr.length; i < n; i++)
                    if (i in arr)
                        other[i] = mapper.call(that, arr[i], i, arr);
                return other;
            }
            ;
            function reduce(arr, fun) {
                if (Array.prototype.reduce) {
                    return Array.prototype.reduce.apply(arr, Array.prototype.slice.call(arguments, 1));
                }
                var len = +this.length;
                if (typeof fun !== 'function')
                    throw new TypeError();
                if (len === 0 && arguments.length === 1)
                    throw new TypeError();
                var i = 0;
                if (arguments.length >= 2) {
                    var rv = arguments[1];
                } else {
                    do {
                        if (i in this) {
                            rv = this[i++];
                            break;
                        }
                        if (++i >= len)
                            throw new TypeError();
                    } while (true);
                }
                for (; i < len; i++) {
                    if (i in this)
                        rv = fun.call(null, rv, this[i], i, this);
                }
                return rv;
            }
            ;
            expect.eql = function eql(actual, expected) {
                if (actual === expected) {
                    return true;
                } else if ('undefined' != typeof Buffer && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
                    if (actual.length != expected.length)
                        return false;
                    for (var i = 0; i < actual.length; i++) {
                        if (actual[i] !== expected[i])
                            return false;
                    }
                    return true;
                } else if (actual instanceof Date && expected instanceof Date) {
                    return actual.getTime() === expected.getTime();
                } else if (typeof actual != 'object' && typeof expected != 'object') {
                    return actual == expected;
                } else {
                    return objEquiv(actual, expected);
                }
            };
            function isUndefinedOrNull(value) {
                return value === null || value === undefined;
            }
            function isArguments(object) {
                return Object.prototype.toString.call(object) == '[object Arguments]';
            }
            function objEquiv(a, b) {
                if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
                    return false;
                if (a.prototype !== b.prototype)
                    return false;
                if (isArguments(a)) {
                    if (!isArguments(b)) {
                        return false;
                    }
                    a = pSlice.call(a);
                    b = pSlice.call(b);
                    return expect.eql(a, b);
                }
                try {
                    var ka = keys(a), kb = keys(b), key, i;
                } catch (e) {
                    return false;
                }
                if (ka.length != kb.length)
                    return false;
                ka.sort();
                kb.sort();
                for (i = ka.length - 1; i >= 0; i--) {
                    if (ka[i] != kb[i])
                        return false;
                }
                for (i = ka.length - 1; i >= 0; i--) {
                    key = ka[i];
                    if (!expect.eql(a[key], b[key]))
                        return false;
                }
                return true;
            }
            var json = function () {
                    'use strict';
                    if ('object' == typeof JSON && JSON.parse && JSON.stringify) {
                        return {
                            parse: nativeJSON.parse,
                            stringify: nativeJSON.stringify
                        };
                    }
                    var JSON = {};
                    function f(n) {
                        return n < 10 ? '0' + n : n;
                    }
                    function date(d, key) {
                        return isFinite(d.valueOf()) ? d.getUTCFullYear() + '-' + f(d.getUTCMonth() + 1) + '-' + f(d.getUTCDate()) + 'T' + f(d.getUTCHours()) + ':' + f(d.getUTCMinutes()) + ':' + f(d.getUTCSeconds()) + 'Z' : null;
                    }
                    ;
                    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {
                            '\b': '\\b',
                            '\t': '\\t',
                            '\n': '\\n',
                            '\f': '\\f',
                            '\r': '\\r',
                            '"': '\\"',
                            '\\': '\\\\'
                        }, rep;
                    function quote(string) {
                        escapable.lastIndex = 0;
                        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                            var c = meta[a];
                            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                        }) + '"' : '"' + string + '"';
                    }
                    function str(key, holder) {
                        var i, k, v, length, mind = gap, partial, value = holder[key];
                        if (value instanceof Date) {
                            value = date(key);
                        }
                        if (typeof rep === 'function') {
                            value = rep.call(holder, key, value);
                        }
                        switch (typeof value) {
                        case 'string':
                            return quote(value);
                        case 'number':
                            return isFinite(value) ? String(value) : 'null';
                        case 'boolean':
                        case 'null':
                            return String(value);
                        case 'object':
                            if (!value) {
                                return 'null';
                            }
                            gap += indent;
                            partial = [];
                            if (Object.prototype.toString.apply(value) === '[object Array]') {
                                length = value.length;
                                for (i = 0; i < length; i += 1) {
                                    partial[i] = str(i, value) || 'null';
                                }
                                v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                                gap = mind;
                                return v;
                            }
                            if (rep && typeof rep === 'object') {
                                length = rep.length;
                                for (i = 0; i < length; i += 1) {
                                    if (typeof rep[i] === 'string') {
                                        k = rep[i];
                                        v = str(k, value);
                                        if (v) {
                                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                        }
                                    }
                                }
                            } else {
                                for (k in value) {
                                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                                        v = str(k, value);
                                        if (v) {
                                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                        }
                                    }
                                }
                            }
                            v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                            gap = mind;
                            return v;
                        }
                    }
                    JSON.stringify = function (value, replacer, space) {
                        var i;
                        gap = '';
                        indent = '';
                        if (typeof space === 'number') {
                            for (i = 0; i < space; i += 1) {
                                indent += ' ';
                            }
                        } else if (typeof space === 'string') {
                            indent = space;
                        }
                        rep = replacer;
                        if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                            throw new Error('JSON.stringify');
                        }
                        return str('', { '': value });
                    };
                    JSON.parse = function (text, reviver) {
                        var j;
                        function walk(holder, key) {
                            var k, v, value = holder[key];
                            if (value && typeof value === 'object') {
                                for (k in value) {
                                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                                        v = walk(value, k);
                                        if (v !== undefined) {
                                            value[k] = v;
                                        } else {
                                            delete value[k];
                                        }
                                    }
                                }
                            }
                            return reviver.call(holder, key, value);
                        }
                        text = String(text);
                        cx.lastIndex = 0;
                        if (cx.test(text)) {
                            text = text.replace(cx, function (a) {
                                return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                            });
                        }
                        if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                            j = eval('(' + text + ')');
                            return typeof reviver === 'function' ? walk({ '': j }, '') : j;
                        }
                        throw new SyntaxError('JSON.parse');
                    };
                    return JSON;
                }();
            if ('undefined' != typeof window) {
                window.expect = module.exports;
            }
        }(this, 'undefined' != typeof module ? module : {}, 'undefined' != typeof exports ? exports : {}));
    },
    '3': function (require, module, exports, global) {
        var expect = require('2');
        describe('Planet Client API: Set', function () {
            it('should allow for `set` key value pairs', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('set', 'key-u', 123);
                });
                socket.on('set', function (key, value) {
                    expect(key).to.be.a('string');
                    expect(key).to.be('key-u');
                    expect(value).to.be.a('number');
                    expect(value).to.be(123);
                    this.disconnect();
                    done();
                });
            });
            it('should `set` values with all possible types', function (done) {
                var container = {}, socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('set', 'key-a', 12);
                    socket.emit('set', 'key-b', '');
                    socket.emit('set', 'key-c', null);
                    socket.emit('set', 'key-d', []);
                    socket.emit('set', 'key-e', {});
                    socket.emit('set', 'key-f', false);
                    socket.emit('set', 'key-g', new Date());
                });
                socket.on('set', function (key, value) {
                    expect(key).to.be.a('string');
                    container[key] = value;
                    if (key == 'key-g')
                        socket.disconnect();
                });
                socket.on('disconnect', function () {
                    expect(container['key-a']).to.be.a('number');
                    expect(container).to.have.property('key-a', 12);
                    expect(container['key-b']).to.be.a('string');
                    expect(container).to.have.property('key-b', '');
                    expect(container['key-c']).to.be(null);
                    expect(container).to.have.property('key-c', null);
                    expect(container['key-d']).to.be.an('array');
                    expect(container).to.have.property('key-d');
                    expect(container['key-d']).to.be.empty();
                    expect(container['key-e']).to.be.an('object');
                    expect(container).to.have.property('key-e');
                    expect(container['key-f']).to.be.a('boolean');
                    expect(container).to.have.property('key-f', false);
                    expect(container['key-g']).to.be.a('string');
                    done();
                });
            });
            it('should allow for `set` the same key', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('set', [
                        'a',
                        'b',
                        'c'
                    ], 10);
                    socket.emit('set', [
                        'a',
                        'b',
                        'c'
                    ], 20);
                    socket.emit('set', 'a.b.c'.split('.'), 30);
                });
                socket.on('set', function (key, value) {
                    expect(key).to.be.an('array');
                    expect(value).to.be.a('number');
                    expect(key.length).to.be(3);
                    expect(key[0]).to.be('a');
                    expect(key[1]).to.be('b');
                    expect(key[2]).to.be('c');
                    expect(value).to.be.within(10, 30);
                    if (value == 30)
                        this.disconnect();
                });
                socket.on('disconnect', function () {
                    done();
                });
            });
            it('should allow `set` with reserved object props and methods as key names', function (done) {
                var arrayProtos = [
                        'prototype',
                        'isArray',
                        'length',
                        'pop',
                        'push',
                        'reverse',
                        'shift',
                        'sort',
                        'splice',
                        'unshift',
                        'concat',
                        'join',
                        'slice',
                        'toString',
                        'indexOf',
                        'lastIndexOf',
                        'filter',
                        'forEach',
                        'every',
                        'map',
                        'some',
                        'reduce',
                        'reduceRight'
                    ];
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    arrayProtos.forEach(function (item) {
                        socket.emit('set', item, false);
                    });
                });
                var indexOf = Array.prototype.indexOf;
                socket.on('set', function (key, value) {
                    expect(indexOf.call(arrayProtos, key)).not.to.be(-1);
                    expect(value).to.be(false);
                    if (key == 'reduceRight')
                        this.disconnect();
                });
                socket.on('disconnect', function () {
                    done();
                });
            });
            it('should `error` on corrupt `set` keys', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('set', 789);
                    socket.emit('set', 0, 0);
                    socket.emit('set', false, 1);
                    socket.emit('set', [], 2);
                    socket.emit('set', {}, 3);
                    socket.emit('set', null, 4);
                    socket.emit('set', undefined, 5);
                    socket.emit('set', 'key-x');
                    socket.emit('set', false);
                    socket.emit('set', []);
                    socket.emit('set', {});
                    socket.emit('set', null);
                    socket.emit('set', undefined);
                    socket.emit('set');
                    socket.emit('set', [false], 2);
                    socket.emit('set', [[]], 3);
                    socket.emit('set', [{}], 4);
                    socket.emit('set', [null], 5);
                    socket.emit('set', [undefined], 6);
                    socket.emit('set', [
                        'a',
                        false
                    ], 2);
                    socket.emit('set', [
                        'a',
                        []
                    ], 3);
                    socket.emit('set', [
                        'a',
                        {}
                    ], 4);
                    socket.emit('set', [
                        'a',
                        null
                    ], 5);
                    socket.emit('set', [
                        'a',
                        undefined
                    ], 6);
                    socket.emit('set', 'done', 'finally');
                });
                socket.on('error', function (type, key, value) {
                    expect(type).to.be('set');
                });
                socket.on('set', function (key, value) {
                    if (key == 'done')
                        this.disconnect();
                    else
                        console.log('WARNING', key, value);
                });
                socket.on('disconnect', function () {
                    done();
                });
            });
        });
    },
    '4': function (require, module, exports, global) {
        var expect = require('2');
        describe('Planet Client API: Merge', function () {
            it('should allow to merge an object', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('merge', {
                        'key-a': 12,
                        'key-b': 'ok',
                        'key-c': null,
                        'key-d': [],
                        'key-e': {},
                        'key-f': false,
                        'key-g': new Date()
                    });
                });
                socket.on('merge', function (data) {
                    expect(data).to.be.an('object');
                    expect(data).to.have.property('key-a', 12);
                    expect(data['key-a']).to.be.a('number');
                    expect(data).to.have.property('key-b', 'ok');
                    expect(data['key-b']).to.be.a('string');
                    expect(data).to.have.property('key-c', null);
                    expect(data).to.have.property('key-d');
                    expect(data['key-d']).to.be.an('array');
                    expect(data['key-d']).to.be.empty();
                    expect(data).to.have.property('key-e');
                    expect(data['key-e']).to.be.an('object');
                    expect(data['key-e']).to.be.empty();
                    expect(data).to.have.property('key-f', false);
                    expect(data).to.have.property('key-g');
                    expect(data['key-g']).to.be.a('string');
                    this.disconnect();
                    done();
                });
            });
            it('should allow reserved object properties and methods as key names', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.emit('merge', {
                    'prototype': null,
                    'create': null,
                    'defineProperty': null,
                    'defineProperties': null,
                    'getOwnPropertyDescriptor': null,
                    'keys': null,
                    'getOwnPropertyNames': null,
                    'getPrototypeOf': null,
                    'preventExtensions': null,
                    'isExtensible': null,
                    'seal': null,
                    'isSealed': null,
                    'freeze': null,
                    'isFrozen': null,
                    'hasOwnProperty': null,
                    'isPrototypeOf': null,
                    'propertyIsEnumerable': null,
                    'toLocaleString': null,
                    'toString': null,
                    'valueOf': null
                });
                socket.on('merge', function (data) {
                    expect(data).to.be.an('object');
                    expect(data).to.have.property('prototype', null);
                    expect(data).to.have.property('create', null);
                    expect(data).to.have.property('defineProperty', null);
                    expect(data).to.have.property('defineProperties', null);
                    expect(data).to.have.property('getOwnPropertyDescriptor', null);
                    expect(data).to.have.property('keys', null);
                    expect(data).to.have.property('getOwnPropertyNames', null);
                    expect(data).to.have.property('getPrototypeOf', null);
                    expect(data).to.have.property('preventExtensions', null);
                    expect(data).to.have.property('isExtensible', null);
                    expect(data).to.have.property('seal', null);
                    expect(data).to.have.property('isSealed', null);
                    expect(data).to.have.property('freeze', null);
                    expect(data).to.have.property('isFrozen', null);
                    expect(data).to.have.property('hasOwnProperty', null);
                    expect(data).to.have.property('isPrototypeOf', null);
                    expect(data).to.have.property('propertyIsEnumerable', null);
                    expect(data).to.have.property('toLocaleString', null);
                    expect(data).to.have.property('toString', null);
                    expect(data).to.have.property('valueOf', null);
                    this.disconnect();
                    done();
                });
            });
            it('should send data to merge to all connected clients', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                function merges(data) {
                    expect(data).to.be.an('object');
                    expect(data).to.have.property('key-a');
                    expect(data).to.have.property('key-b');
                    expect(data).to.have.property('key-c');
                    expect(data).to.have.property('key-d');
                    expect(data).to.have.property('key-e');
                    expect(data).to.have.property('key-f');
                    expect(data['key-a']).to.be.a('number');
                    expect(data['key-a']).to.be(12);
                    expect(data['key-b']).to.be.a('string');
                    expect(data['key-b']).to.be('ok');
                    expect(data['key-c']).to.be(null);
                    expect(data['key-d']).to.be.an('array');
                    expect(data['key-e']).to.be.an('object');
                    expect(data['key-f']).to.be(false);
                    this.disconnect();
                }
                first.on('merge', merges);
                first.on('connect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.on('merge', merges);
                    second.on('connect', function () {
                        first.emit('merge', {
                            'key-a': 12,
                            'key-b': 'ok',
                            'key-c': null,
                            'key-d': [],
                            'key-e': {},
                            'key-f': false
                        });
                        done();
                    });
                });
            });
            it('should recursively merge objects into planet', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('merge', {
                        'key-a': 1,
                        'key-b': 'ok',
                        'key-e': {
                            'key-a': 2,
                            'key-b': 'ok',
                            'key-c': null,
                            'key-d': [],
                            'key-e': {}
                        }
                    });
                    socket.emit('merge', {
                        'key-a': { 'a': [] },
                        'key-c': null,
                        'key-d': [],
                        'key-e': {
                            'key-a': null,
                            'key-c': false,
                            'key-d': {},
                            'key-e': []
                        }
                    });
                    socket.emit('merge', {
                        'key-e': { 'key-f': 4 },
                        'key-f': 5
                    });
                    this.disconnect();
                });
                socket.on('disconnect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.emit('get', function (data) {
                        expect(data).to.be.an('object');
                        expect(data).to.have.property('key-a');
                        expect(data).to.have.property('key-b');
                        expect(data).to.have.property('key-c');
                        expect(data).to.have.property('key-d');
                        expect(data).to.have.property('key-e');
                        expect(data).to.have.property('key-f');
                        expect(data['key-a']).to.be.an('object');
                        expect(data['key-b']).to.be.a('string');
                        expect(data['key-c']).to.be(null);
                        expect(data['key-d']).to.be.an('array');
                        expect(data['key-e']).to.be.an('object');
                        expect(data['key-f']).to.be.a('number');
                        expect(data['key-a']).to.have.property('a');
                        expect(data['key-a']['a']).to.be.an('array');
                        expect(data['key-e']).to.have.property('key-a');
                        expect(data['key-e']).to.have.property('key-b');
                        expect(data['key-e']).to.have.property('key-c');
                        expect(data['key-e']).to.have.property('key-d');
                        expect(data['key-e']).to.have.property('key-e');
                        expect(data['key-e']).to.have.property('key-f');
                        expect(data['key-e']['key-a']).to.be(null);
                        expect(data['key-e']['key-b']).to.be('ok');
                        expect(data['key-e']['key-c']).to.be(false);
                        expect(data['key-e']['key-d']).to.be.an('object');
                        expect(data['key-e']['key-e']).to.be.an('array');
                        expect(data['key-e']['key-e']).to.have.length(0);
                        expect(data['key-f']).to.be(5);
                        this.disconnect();
                        done();
                    });
                });
            });
            it('should harmoninze strange keys', function (done) {
                var storage = {}, socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('merge', {
                        '': 1,
                        1: null,
                        null: '',
                        undefined: {},
                        false: []
                    });
                    socket.emit('merge', {
                        '': 2,
                        1: 'ok',
                        null: null,
                        undefined: [],
                        false: {}
                    });
                });
                socket.on('merge', function (data) {
                    storage = data;
                    if (data['1'] == 'ok')
                        this.disconnect();
                });
                socket.on('disconnect', function () {
                    expect(storage).to.be.an('object');
                    expect(storage).to.have.property('');
                    expect(storage).to.have.property('1');
                    expect(storage).to.have.property('null');
                    expect(storage).to.have.property('undefined');
                    expect(storage).to.have.property('false');
                    expect(storage['']).to.be.a('number');
                    expect(storage['']).to.be(2);
                    expect(storage['1']).to.be.a('string');
                    expect(storage['1']).to.be('ok');
                    expect(storage['null']).to.be(null);
                    expect(storage['undefined']).to.be.an('array');
                    expect(storage['false']).to.be.an('object');
                    done();
                });
            });
            it('should error for merging invalid data', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('merge');
                    socket.emit('merge', 12);
                    socket.emit('merge', '');
                    socket.emit('merge', null);
                    socket.emit('merge', []);
                    socket.emit('merge', {});
                    socket.emit('merge', false);
                    socket.emit('merge', true);
                    socket.emit('merge', undefined);
                    socket.emit('merge', new Date());
                    socket.emit('merge', new String('lalala'));
                    socket.disconnect();
                });
                socket.on('merge', function (data) {
                });
                socket.on('error', function (type) {
                    expect(type).to.be.a('string');
                });
                socket.on('disconnect', function () {
                    done();
                });
            });
        });
    },
    '5': function (require, module, exports, global) {
        var expect = require('2');
        describe('Planet Client API: Get', function () {
            it('should `get` the current state', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('delete');
                    socket.emit('get', function (data) {
                        expect(data).to.be.an('object');
                        expect(data).to.be.empty();
                        socket.disconnect();
                    });
                });
                socket.on('disconnect', function () {
                    done();
                });
            });
            it('should `get` the latest data', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.on('connect', function () {
                    first.emit('merge', { a: { b: { c: 123 } } });
                });
                first.on('merge', function (data) {
                    first.emit('set', [
                        'a',
                        'b',
                        'c'
                    ], 321);
                });
                first.on('set', function (key, value) {
                    this.disconnect();
                });
                first.on('disconnect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.emit('get', function (data) {
                        expect(data).to.be.an('object');
                        expect(data.a).to.be.an('object');
                        expect(data.a.b).to.be.an('object');
                        expect(data.a.b.c).to.be.a('number');
                        expect(data.a.b.c).to.be(321);
                        this.disconnect();
                        done();
                    });
                });
            });
            it('should emit `get` search a value by key', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.on('connect', function () {
                    first.emit('merge', { a: { b: { c: 0 } } });
                });
                first.on('merge', function (data) {
                    first.disconnect();
                });
                first.on('disconnect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.on('error', function () {
                        throw new Error('client error');
                    });
                    second.emit('get', function (data) {
                        expect(data).to.be.an('object');
                        expect(data.a).to.be.an('object');
                        expect(data.a.b).to.be.an('object');
                        expect(data.a.b.c).to.be.a('number');
                        expect(data.a.b.c).to.be(0);
                    });
                    second.emit('get', 'a', function (data) {
                        expect(data).to.be.an('object');
                        expect(data.b).to.be.an('object');
                        expect(data.b.c).to.be.an('number');
                        expect(data.b.c).to.be(0);
                    });
                    second.emit('get', [
                        'a',
                        'b'
                    ], function (data) {
                        expect(data).to.be.an('object');
                        expect(data.c).to.be.a('number');
                        expect(data.c).to.be(0);
                    });
                    second.emit('get', [
                        'a',
                        'b',
                        'c'
                    ], function (data) {
                        expect(data).to.be(0);
                        second.disconnect();
                        done();
                    });
                });
            });
            it('should return null for nonexistent or invalid keys', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.on('connect', function () {
                    first.emit('merge', { a: { b: { c: 0 } } });
                });
                first.on('merge', function (data) {
                    first.disconnect();
                });
                first.on('disconnect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.on('error', function () {
                        throw new Error('client error');
                    });
                    second.emit('get', 'd', function (data) {
                        expect(data).to.be(null);
                    });
                    second.emit('get', 1, function (data) {
                        expect(data).to.be(null);
                    });
                    second.emit('get', [null], function (data) {
                        expect(data).to.be(null);
                    });
                    second.emit('get', [
                        'no',
                        'key',
                        'here'
                    ], function (data) {
                        expect(data).to.be(null);
                    });
                    second.emit('get', new Date(), function (data) {
                        expect(data).to.be(null);
                        second.disconnect();
                        done();
                    });
                });
            });
            it('should error on invalid keys', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.on('connect', function () {
                    first.emit('merge', { a: { b: { c: 0 } } });
                });
                first.on('merge', function (data) {
                    first.disconnect();
                });
                first.on('disconnect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.on('error', function (error) {
                        expect(error).to.be.a('string');
                    });
                    function get() {
                        throw new Error('shouldnt get here!');
                    }
                    second.emit('get', null, get);
                    second.emit('get', undefined, get);
                    second.emit('get', [], get);
                    second.emit('get', {}, get);
                    second.emit('set', 'done', 'uh u');
                    second.on('set', function (key, value) {
                        if (key == 'done')
                            second.disconnect();
                    });
                    second.on('disconnect', function () {
                        done();
                    });
                });
            });
            it('should get reserved property and method names as keys', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.emit('merge', {
                    'prototype': null,
                    'create': null,
                    'defineProperty': null,
                    'defineProperties': null,
                    'getOwnPropertyDescriptor': null,
                    'keys': null,
                    'getOwnPropertyNames': null,
                    'getPrototypeOf': null,
                    'preventExtensions': null,
                    'isExtensible': null,
                    'seal': null,
                    'isSealed': null,
                    'freeze': null,
                    'isFrozen': null,
                    'hasOwnProperty': null,
                    'isPrototypeOf': null,
                    'propertyIsEnumerable': null,
                    'toLocaleString': null,
                    'toString': null,
                    'valueOf': null
                });
                socket.emit('get', function (data) {
                    expect(data).to.be.an('object');
                    expect(data).to.have.property('prototype');
                    expect(data['prototype']).to.be(null);
                    expect(data).to.have.property('create', null);
                    expect(data).to.have.property('defineProperty', null);
                    expect(data).to.have.property('defineProperties', null);
                    expect(data).to.have.property('getOwnPropertyDescriptor', null);
                    expect(data).to.have.property('keys', null);
                    expect(data).to.have.property('getOwnPropertyNames', null);
                    expect(data).to.have.property('getPrototypeOf', null);
                    expect(data).to.have.property('preventExtensions', null);
                    expect(data).to.have.property('isExtensible', null);
                    expect(data).to.have.property('seal', null);
                    expect(data).to.have.property('isSealed', null);
                    expect(data).to.have.property('freeze', null);
                    expect(data).to.have.property('isFrozen', null);
                    expect(data).to.have.property('hasOwnProperty', null);
                    expect(data).to.have.property('isPrototypeOf', null);
                    expect(data).to.have.property('propertyIsEnumerable', null);
                    expect(data).to.have.property('toLocaleString', null);
                    expect(data).to.have.property('toString', null);
                    expect(data).to.have.property('valueOf', null);
                    this.disconnect();
                    done();
                });
            });
        });
    },
    '6': function (require, module, exports, global) {
        var expect = require('2');
        describe('Planet Client API: Delete', function () {
            it('should delete everything', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.on('connect', function () {
                    first.emit('merge', {
                        'key-a': null,
                        'key-b': ''
                    });
                    first.emit('delete');
                    first.disconnect();
                });
                first.on('disconnect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.emit('get', function (data) {
                        expect(data).to.be.an('object');
                        expect(data).not.to.have.property('key-a');
                        expect(data).not.to.have.property('key-b');
                        expect(data).to.be.empty();
                        expect(Object.keys(data)).to.have.length(0);
                        second.disconnect();
                        done();
                    });
                });
            });
        });
    },
    '7': function (require, module, exports, global) {
        var expect = require('2');
        describe('Planet Client API: Remove', function () {
            it('should remove by key (string)', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.on('connect', function () {
                    first.emit('merge', {
                        'key-a': 12,
                        'key-b': 'ok',
                        'key-c': null,
                        'key-d': [],
                        'key-e': {},
                        'key-f': false
                    });
                });
                first.on('merge', function (data) {
                    first.emit('remove', 'key-a');
                    first.emit('remove', 'key-b');
                    first.emit('remove', 'key-c');
                    first.emit('remove', 'key-d');
                    first.emit('remove', 'key-e');
                    first.emit('remove', 'key-f');
                });
                first.on('remove', function (key) {
                    expect(key).to.match(/key-[a-f]/);
                    if (key == 'key-f')
                        first.disconnect();
                });
                first.on('disconnect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.emit('get', function (data) {
                        expect(data).to.be.an('object');
                        expect(data).not.to.have.property('key-a');
                        expect(data).not.to.have.property('key-b');
                        expect(data).not.to.have.property('key-c');
                        expect(data['key-c']).not.to.be(null);
                        expect(data).not.to.have.property('key-d');
                        expect(data).not.to.have.property('key-e');
                        expect(data['key-e']).not.to.be.an('object');
                        expect(data).not.to.have.property('key-f');
                        expect(data['key-f']).not.to.be.a('boolean');
                        second.disconnect();
                        done();
                    });
                });
            });
            it('should remove a nested object by path (array)', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.on('connect', function () {
                    first.emit('merge', {
                        'key-a': {
                            'key-a': 12,
                            'key-b': 'ok',
                            'key-c': null,
                            'key-d': [],
                            'key-e': {},
                            'key-f': false
                        }
                    });
                });
                first.on('merge', function (data) {
                    first.emit('remove', [
                        'key-a',
                        'key-a'
                    ]);
                    first.emit('remove', [
                        'key-a',
                        'key-b'
                    ]);
                    first.emit('remove', [
                        'key-a',
                        'key-c'
                    ]);
                    first.emit('remove', [
                        'key-a',
                        'key-d'
                    ]);
                    first.emit('remove', [
                        'key-a',
                        'key-e'
                    ]);
                    first.emit('remove', [
                        'key-a',
                        'key-f'
                    ]);
                });
                first.on('remove', function (key) {
                    expect(key).to.be.an('array');
                    expect(key[0]).to.be('key-a');
                    expect(key[1]).to.match(/key-[a-f]/);
                    if (key[1] == 'key-f')
                        first.disconnect();
                });
                first.on('disconnect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.emit('get', function (data) {
                        expect(data).to.be.an('object');
                        expect(data).to.have.property('key-a');
                        expect(data['key-a']).to.be.an('object');
                        expect(data['key-a']).not.to.have.property('key-a');
                        expect(data['key-a']).not.to.have.property('key-b');
                        expect(data['key-a']).not.to.have.property('key-c');
                        expect(data['key-a']).not.to.have.property('key-d');
                        expect(data['key-a']).not.to.have.property('key-e');
                        expect(data['key-a']).not.to.have.property('key-f');
                        second.disconnect();
                        done();
                    });
                });
            });
            it('should error when removing nonexistent keys', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.on('connect', function () {
                    first.emit('delete');
                    first.emit('merge', { 'key-a': { 'key-a': 1 } });
                });
                first.on('merge', function (data) {
                    first.emit('remove', 'key-b');
                    first.emit('remove', ['key-b']);
                    first.emit('remove', [
                        'key-a',
                        'key-b'
                    ]);
                    console.log('TODO move this test to Error!');
                    first.disconnect();
                });
                first.on('error', function (type) {
                    expect(type).to.be.a('string');
                });
                first.on('remove', function () {
                });
                first.on('disconnect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.emit('get', function (data) {
                        expect(data).to.be.an('object');
                        expect(data).to.have.property('key-a');
                        expect(data['key-a']).to.be.an('object');
                        expect(data['key-a']).to.have.property('key-a');
                        expect(data['key-a']).not.to.have.property('key-b');
                        expect(Object.keys(data)).to.have.length(1);
                        second.disconnect();
                        done();
                    });
                });
            });
            it('should allow `remove` reserved properties and method names', function (done) {
                var props = {
                        'prototype': true,
                        'isArray': true,
                        'length': true,
                        'pop': true,
                        'push': true,
                        'reverse': true,
                        'shift': true,
                        'sort': true,
                        'splice': true,
                        'unshift': true,
                        'concat': true,
                        'join': true,
                        'slice': true,
                        'toString': true,
                        'indexOf': true,
                        'lastIndexOf': true,
                        'filter': true,
                        'forEach': true,
                        'every': true,
                        'map': true,
                        'some': true,
                        'reduce': true,
                        'reduceRight': true
                    };
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('delete');
                    socket.emit('merge', props);
                });
                socket.on('remove', function (key) {
                    delete props[key];
                });
                socket.on('merge', function (data) {
                    for (var key in props) {
                        socket.emit('remove', key);
                    }
                    socket.emit('get', function (data) {
                        expect(data).to.be.empty();
                        expect(props).to.be.empty();
                        socket.disconnect();
                        done();
                    });
                });
            });
            it('should not allow removing invalid keys', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.on('connect', function () {
                    first.emit('delete');
                    first.emit('merge', {
                        'key-a': 1,
                        'key-b': [
                            0,
                            1,
                            2,
                            3,
                            4
                        ]
                    });
                });
                first.on('merge', function (data) {
                    first.emit('remove', 12);
                    first.emit('remove', null);
                    first.emit('remove', true);
                    first.emit('remove', false);
                    first.emit('remove', []);
                    first.emit('remove', [
                        null,
                        false,
                        {}
                    ]);
                    first.emit('remove', [
                        'key-b',
                        2
                    ]);
                    first.emit('remove', {});
                    first.disconnect();
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.emit('get', function (data) {
                        expect(data).to.be.an('object');
                        expect(data).to.have.property('key-a');
                        expect(data['key-a']).to.be.a('number');
                        expect(data['key-a']).to.be(1);
                        expect(data['key-b']).to.be.an('array');
                        expect(data['key-b'][2]).to.be(2);
                        expect(Object.keys(data)).to.have.length(2);
                        second.disconnect();
                        done();
                    });
                });
                first.on('error', function (type, key) {
                    expect(type).to.be.a('string');
                });
            });
        });
    },
    '8': function (require, module, exports, global) {
        var expect = require('2');
        describe('Planet Client API: Array', function () {
            it('should `get` an element from an array', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('merge', {
                        '_a': [
                            'a0',
                            'a1',
                            'a2'
                        ],
                        '_b': {
                            'bb': [
                                'b0',
                                'b1',
                                'b2'
                            ]
                        },
                        '_c': [[
                                'c0',
                                'c1',
                                'c2'
                            ]],
                        '_d': [{
                                'dd': [
                                    'd0',
                                    'd1',
                                    'd2'
                                ]
                            }]
                    });
                });
                socket.on('merge', function () {
                    socket.emit('get', [
                        '_a',
                        0
                    ], function (data) {
                        expect(data).to.be('a0');
                    });
                    socket.emit('get', [
                        '_b',
                        'bb',
                        1
                    ], function (data) {
                        expect(data).to.be('b1');
                    });
                    socket.emit('get', [
                        '_c',
                        0,
                        2
                    ], function (data) {
                        expect(data).to.be('c2');
                    });
                    socket.emit('get', [
                        '_d',
                        0,
                        'dd',
                        0
                    ], function (data) {
                        expect(data).to.be('d0');
                        socket.disconnect();
                        done();
                    });
                });
            });
            it('should `set` an element to an array', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.emit('get', function (data) {
                    socket.emit('merge', {
                        '_f': [
                            'a1',
                            'a2',
                            'a3'
                        ],
                        '_g': [
                            [
                                'b1',
                                'b2'
                            ],
                            [
                                'b3',
                                'b4'
                            ]
                        ],
                        '_h': {
                            'cc': [
                                'cc1',
                                'cc2'
                            ]
                        },
                        '_i': [
                            { 'dd': 'dd1' },
                            { 'ddd': 'dd2' }
                        ],
                        '_j': [{ 'ee': ['ee1'] }]
                    });
                });
                socket.on('merge', function (data) {
                    socket.emit('set', [
                        '_f',
                        0
                    ], 'F1 (new)');
                    socket.emit('set', [
                        '_g',
                        0,
                        0
                    ], 'G1 (new)');
                    socket.emit('set', [
                        '_h',
                        'cc',
                        0
                    ], 'HH1 (new)');
                    socket.emit('set', [
                        '_i',
                        0,
                        'dd'
                    ], 'II1 (new)');
                    socket.emit('set', [
                        '_j',
                        0,
                        'ee',
                        0
                    ], 'JJ1 (new)');
                    socket.emit('set', [
                        '_j',
                        0,
                        'ee',
                        1
                    ], 'JJ2 (new)');
                    socket.emit('get', [
                        '_f',
                        0
                    ], function (data) {
                        expect(data).to.be('F1 (new)');
                    });
                    socket.emit('get', '_g', function (data) {
                        expect(data[0][0]).to.be('G1 (new)');
                    });
                    socket.emit('get', '_g', function (data) {
                        expect(data[0][0]).to.be('G1 (new)');
                        expect(data[0][1]).to.be('b2');
                        expect(data[1][0]).to.be('b3');
                        expect(data[1][1]).to.be('b4');
                    });
                    socket.emit('get', [
                        '_h',
                        'cc'
                    ], function (data) {
                        expect(data[0]).to.be('HH1 (new)');
                    });
                    socket.emit('get', [
                        '_i',
                        0,
                        'dd'
                    ], function (data) {
                        expect(data).to.be('II1 (new)');
                    });
                    socket.emit('get', [
                        '_i',
                        1,
                        'ddd'
                    ], function (data) {
                        expect(data).to.be('dd2');
                    });
                    socket.emit('get', [
                        '_j',
                        0,
                        'ee',
                        0
                    ], function (data) {
                        expect(data).to.be('JJ1 (new)');
                    });
                    socket.emit('get', [
                        '_j',
                        0,
                        'ee',
                        1
                    ], function (data) {
                        expect(data).to.be('JJ2 (new)');
                        socket.disconnect();
                        done();
                    });
                });
                socket.on('error', function (type, key, value) {
                    console.log('\nerror', type, key, value);
                });
            });
            it('should `get` a single char from a string', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('merge', { 'a string': '%is a string%' });
                });
                socket.on('merge', function () {
                    socket.emit('get', [
                        'a string',
                        0
                    ], function (data) {
                        expect(data).to.be('%');
                    });
                    socket.emit('get', [
                        'a string',
                        1
                    ], function (data) {
                        expect(data).to.be('i');
                        socket.disconnect();
                        done();
                    });
                });
            });
            it('should `set` a single char of a string', function (done) {
                var socket = io.connect('//:8004', { 'force new connection': true });
                socket.on('connect', function () {
                    socket.emit('delete');
                    socket.emit('merge', { 'a string': 'is a string' });
                    socket.emit('set', [
                        'a string',
                        1
                    ], 'n');
                });
                socket.on('set', function () {
                    socket.emit('get', 'a string', function (string) {
                        expect(string).to.be('in a string');
                    });
                    socket.emit('get', [
                        'a string',
                        1
                    ], function (data) {
                        expect(data).to.be('n');
                    });
                    socket.emit('get', function (data) {
                        expect(Object.keys(data)).to.have.length(1);
                        socket.disconnect();
                        done();
                    });
                });
            });
        });
    },
    '9': function (require, module, exports, global) {
        var expect = require('2');
        describe('Planet: Stress Test', function () {
            this.timeout(10000);
            it('should `merge` and `get` get a big object', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.emit('delete');
                var local = {};
                for (var i = 0; i < 19999; i++) {
                    local[i] = Math.random();
                }
                ;
                first.on('connect', function () {
                    first.emit('merge', local);
                });
                first.on('merge', function (data) {
                    first.disconnect();
                });
                first.on('disconnect', function () {
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.emit('get', function (data) {
                        expect(Object.keys(local).length).to.be(Object.keys(data).length);
                        expect(data).to.be.an('object');
                        second.emit('delete');
                    });
                    second.on('delete', function (data) {
                        second.disconnect();
                        done();
                    });
                });
            });
            it('should `set` many keys/values and `get` them all', function (done) {
                var first = io.connect('//:8004', { 'force new connection': true });
                first.emit('delete');
                var i = 0, local = {}, returned = {};
                first.on('connect', function () {
                    var start = new Date().getTime();
                    while (start + 100 >= new Date().getTime()) {
                        local['key-' + ++i] = Math.random();
                        first.emit('set', 'key-' + i, local['key-' + i]);
                    }
                    console.log('\n...set', i, 'key/values during 100ms');
                });
                first.on('set', function (key, value) {
                    returned[key] = value;
                    if ('key-' + i == key)
                        first.disconnect();
                });
                first.on('disconnect', function () {
                    var l = Object.keys(local).length;
                    expect(Object.keys(returned)).to.have.length(l);
                    var second = io.connect('//:8004', { 'force new connection': true });
                    second.emit('get', function (data) {
                        expect(Object.keys(data).length).to.be(l);
                        expect(data).to.be.an('object');
                        second.emit('delete');
                    });
                    second.on('delete', function (data) {
                        second.disconnect();
                        done();
                    });
                });
            });
            [
                64,
                128
            ].forEach(function (amount) {
                it('should `connect` ' + amount + ' clients then `disconnect`', function (done) {
                    var sockets = [], count = 0;
                    (function connect() {
                        var socket = io.connect('//:8004', {
                                'force new connection': true,
                                'try multiple transports': false,
                                'reconnect': false
                            });
                        socket.on('connect', function () {
                            if (++count == amount) {
                                for (var i = 0; i < amount; ++i) {
                                    sockets[i].disconnect();
                                }
                                ;
                            }
                        });
                        socket.on('disconnect', function () {
                            if (--count == 0) {
                                done();
                            }
                        });
                        socket.on('error', function (msg) {
                            throw new Error('Planet error');
                        });
                        sockets.push(socket);
                        setTimeout(function () {
                            if (sockets.length < amount)
                                connect();
                        }, 0);
                    }());
                });
            });
        });
    }
}));