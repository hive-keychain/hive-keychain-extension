! function(t) {
    function e(n) {
        if (r[n]) return r[n].exports;
        var i = r[n] = {
            exports: {},
            id: n,
            loaded: !1
        };
        return t[n].call(i.exports, i, i.exports, e), i.loaded = !0, i.exports
    }
    var r = {};
    return e.m = t, e.c = r, e.p = "", e(0)
}(function(t) {
    for (var e in t)
        if (Object.prototype.hasOwnProperty.call(t, e)) switch (typeof t[e]) {
            case "function":
                break;
            case "object":
                t[e] = function(e) {
                    var r = e.slice(1),
                        n = t[e[0]];
                    return function(t, e, i) {
                        n.apply(this, [t, e, i].concat(r))
                    }
                }(t[e]);
                break;
            default:
                t[e] = t[t[e]]
        }
    return t
}([function(t, e, r) {
    (function(n) {
        "use strict";
        var i = r(1),
            o = r(227),
            s = r(228),
            a = r(42),
            u = r(230)(i),
            f = r(120),
            c = {
                api: i,
                auth: o,
                broadcast: s,
                config: a,
                formatter: u,
                utils: f
            };
        "undefined" != typeof window && (window.steem = c), "undefined" != typeof n && (n.steem = c), e = t.exports = c
    }).call(e, function() {
        return this
    }())
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }

    function i(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }

    function o(t, e) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }

    function s(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
    var a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
        } : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        },
        u = function() {
            function t(t, e) {
                for (var r = 0; r < e.length; r++) {
                    var n = e[r];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                }
            }
            return function(e, r, n) {
                return r && t(e.prototype, r), n && t(e, n), e
            }
        }(),
        f = r(2),
        c = n(f),
        h = r(3),
        l = n(h),
        p = r(42),
        d = n(p),
        v = r(83),
        y = n(v),
        g = r(84),
        _ = n(g),
        m = r(120),
        b = r(121),
        w = r(216),
        E = function(t) {
            function e() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                i(this, e);
                var r = o(this, (e.__proto__ || Object.getPrototypeOf(e)).call(this, t));
                return r._setTransport(t), r._setLogger(t), r.options = t, r
            }
            return s(e, t), u(e, [{
                key: "_setTransport",
                value: function(t) {
                    if (t.url.match("^((http|https)?://)")) t.uri = t.url, t.transport = "http", this._transportType = t.transport, this.options = t, this.transport = new _.default.http(t);
                    else if (t.url.match("^((ws|wss)?://)")) t.websocket = t.url, t.transport = "ws", this._transportType = t.transport, this.options = t, this.transport = new _.default.ws(t);
                    else if (t.transport)
                        if (this.transport && this._transportType !== t.transport && this.transport.stop(), this._transportType = t.transport, "string" == typeof t.transport) {
                            if (!_.default[t.transport]) throw new TypeError("Invalid `transport`, valid values are `http`, `ws` or a class");
                            this.transport = new _.default[t.transport](t)
                        } else this.transport = new t.transport(t);
                    else this.transport = new _.default.ws(t)
                }
            }, {
                key: "_setLogger",
                value: function(t) {
                    if (t.hasOwnProperty("logger")) switch (a(t.logger)) {
                        case "function":
                            this.__logger = {
                                log: t.logger
                            };
                            break;
                        case "object":
                            if ("function" != typeof t.logger.log) throw new Error("setOptions({logger:{}}) must have a property .log of type function");
                            this.__logger = t.logger;
                            break;
                        case "undefined":
                            if (this.__logger) break;
                        default:
                            this.__logger = !1
                    }
                }
            }, {
                key: "log",
                value: function(t) {
                    if (this.__logger)
                        if (arguments.length > 1 && "function" == typeof this.__logger[t]) {
                            var e = Array.prototype.slice.call(arguments, 1);
                            this.__logger[t].apply(this.__logger, e)
                        } else this.__logger.log.apply(this.__logger, arguments)
                }
            }, {
                key: "start",
                value: function() {
                    return this.transport.start()
                }
            }, {
                key: "stop",
                value: function() {
                    return this.transport.stop()
                }
            }, {
                key: "send",
                value: function(t, e, r) {
                    var n = r;
                    if (this.__logger) {
                        var i = Math.random(),
                            o = this;
                        this.log("xmit:" + i + ":", e), n = function(t, e) {
                            t ? o.log("error", "rsp:" + i + ":\n\n", t, e) : o.log("rsp:" + i + ":", e), r && r.apply(o, arguments)
                        }
                    }
                    return this.transport.send(t, e, n)
                }
            }, {
                key: "setOptions",
                value: function(t) {
                    Object.assign(this.options, t), this._setLogger(t), this._setTransport(this.options), this.transport.setOptions(this.options)
                }
            }, {
                key: "setWebSocket",
                value: function(t) {
                    this.setOptions({
                        websocket: t
                    })
                }
            }, {
                key: "setUri",
                value: function(t) {
                    this.setOptions({
                        uri: t
                    })
                }
            }, {
                key: "streamBlockNumber",
                value: function() {
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "head",
                        e = this,
                        r = arguments[1],
                        n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 200;
                    "function" == typeof t && (r = t, t = "head");
                    var i = "",
                        o = !0,
                        s = function s() {
                            o && e.getDynamicGlobalPropertiesAsync().then(function(e) {
                                var o = "irreversible" === t ? e.last_irreversible_block_num : e.head_block_number;
                                if (o !== i)
                                    if (i)
                                        for (var a = i; a < o; a++) a !== i && r(null, a), i = a;
                                    else i = o, r(null, o);
                                l.default.delay(n).then(function() {
                                    s()
                                })
                            }, function(t) {
                                r(t)
                            })
                        };
                    return s(),
                        function() {
                            o = !1
                        }
                }
            }, {
                key: "streamBlock",
                value: function() {
                    var t = this,
                        e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "head",
                        r = arguments[1];
                    "function" == typeof e && (r = e, e = "head");
                    var n = "",
                        i = "",
                        o = this.streamBlockNumber(e, function(e, s) {
                            return e ? (o(), void r(e)) : (n = s, void(n !== i && (i = n, t.getBlock(n, r))))
                        });
                    return o
                }
            }, {
                key: "streamTransactions",
                value: function() {
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "head",
                        e = arguments[1];
                    "function" == typeof t && (e = t, t = "head");
                    var r = this.streamBlock(t, function(t, n) {
                        return t ? (r(), void e(t)) : void(n && n.transactions && n.transactions.forEach(function(t) {
                            e(null, t)
                        }))
                    });
                    return r
                }
            }, {
                key: "streamOperations",
                value: function() {
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "head",
                        e = arguments[1];
                    "function" == typeof t && (e = t, t = "head");
                    var r = this.streamTransactions(t, function(t, n) {
                        return t ? (r(), void e(t)) : void n.operations.forEach(function(t) {
                            e(null, t)
                        })
                    });
                    return r
                }
            }]), e
        }(c.default);
    y.default.forEach(function(t) {
        var e = t.method_name || (0, m.camelCase)(t.method),
            r = t.params || [];
        E.prototype[e + "With"] = function(e, n) {
            var i = r.map(function(t) {
                return e[t]
            });
            return this.send(t.api, {
                method: t.method,
                params: i
            }, n)
        }, E.prototype[e] = function() {
            for (var t = arguments.length, n = Array(t), i = 0; i < t; i++) n[i] = arguments[i];
            var o = r.reduce(function(t, e, r) {
                    return t[e] = n[r], t
                }, {}),
                s = n[r.length];
            return this[e + "With"](o, s)
        }
    }), E.prototype.broadcastTransactionSynchronousWith = function(t, e) {
        var r = t.trx;
        return this.send("network_broadcast_api", {
            method: "broadcast_transaction_synchronous",
            params: [r]
        }, function(t, n) {
            if (t) {
                var i = w.ops.signed_transaction,
                    o = i.toObject(r),
                    s = i.toBuffer(r);
                t.digest = b.hash.sha256(s).toString("hex"), t.transaction_id = s.toString("hex"), t.transaction = JSON.stringify(o), e(t, "")
            } else e("", n)
        })
    }, l.default.promisifyAll(E.prototype);
    var k = new E(d.default);
    e = t.exports = k, e.Steem = E
}, function(t, e) {
    function r() {
        this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0
    }

    function n(t) {
        return "function" == typeof t
    }

    function i(t) {
        return "number" == typeof t
    }

    function o(t) {
        return "object" == typeof t && null !== t
    }

    function s(t) {
        return void 0 === t
    }
    t.exports = r, r.EventEmitter = r, r.prototype._events = void 0, r.prototype._maxListeners = void 0, r.defaultMaxListeners = 10, r.prototype.setMaxListeners = function(t) {
        if (!i(t) || t < 0 || isNaN(t)) throw TypeError("n must be a positive number");
        return this._maxListeners = t, this
    }, r.prototype.emit = function(t) {
        var e, r, i, a, u, f;
        if (this._events || (this._events = {}), "error" === t && (!this._events.error || o(this._events.error) && !this._events.error.length)) {
            if (e = arguments[1], e instanceof Error) throw e;
            var c = new Error('Uncaught, unspecified "error" event. (' + e + ")");
            throw c.context = e, c
        }
        if (r = this._events[t], s(r)) return !1;
        if (n(r)) switch (arguments.length) {
            case 1:
                r.call(this);
                break;
            case 2:
                r.call(this, arguments[1]);
                break;
            case 3:
                r.call(this, arguments[1], arguments[2]);
                break;
            default:
                a = Array.prototype.slice.call(arguments, 1), r.apply(this, a)
        } else if (o(r))
            for (a = Array.prototype.slice.call(arguments, 1), f = r.slice(), i = f.length, u = 0; u < i; u++) f[u].apply(this, a);
        return !0
    }, r.prototype.addListener = function(t, e) {
        var i;
        if (!n(e)) throw TypeError("listener must be a function");
        return this._events || (this._events = {}), this._events.newListener && this.emit("newListener", t, n(e.listener) ? e.listener : e), this._events[t] ? o(this._events[t]) ? this._events[t].push(e) : this._events[t] = [this._events[t], e] : this._events[t] = e, o(this._events[t]) && !this._events[t].warned && (i = s(this._maxListeners) ? r.defaultMaxListeners : this._maxListeners, i && i > 0 && this._events[t].length > i && (this._events[t].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[t].length), "function" == typeof console.trace && console.trace())), this
    }, r.prototype.on = r.prototype.addListener, r.prototype.once = function(t, e) {
        function r() {
            this.removeListener(t, r), i || (i = !0, e.apply(this, arguments))
        }
        if (!n(e)) throw TypeError("listener must be a function");
        var i = !1;
        return r.listener = e, this.on(t, r), this
    }, r.prototype.removeListener = function(t, e) {
        var r, i, s, a;
        if (!n(e)) throw TypeError("listener must be a function");
        if (!this._events || !this._events[t]) return this;
        if (r = this._events[t], s = r.length, i = -1, r === e || n(r.listener) && r.listener === e) delete this._events[t], this._events.removeListener && this.emit("removeListener", t, e);
        else if (o(r)) {
            for (a = s; a-- > 0;)
                if (r[a] === e || r[a].listener && r[a].listener === e) {
                    i = a;
                    break
                }
            if (i < 0) return this;
            1 === r.length ? (r.length = 0, delete this._events[t]) : r.splice(i, 1), this._events.removeListener && this.emit("removeListener", t, e)
        }
        return this
    }, r.prototype.removeAllListeners = function(t) {
        var e, r;
        if (!this._events) return this;
        if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[t] && delete this._events[t], this;
        if (0 === arguments.length) {
            for (e in this._events) "removeListener" !== e && this.removeAllListeners(e);
            return this.removeAllListeners("removeListener"), this._events = {}, this
        }
        if (r = this._events[t], n(r)) this.removeListener(t, r);
        else if (r)
            for (; r.length;) this.removeListener(t, r[r.length - 1]);
        return delete this._events[t], this
    }, r.prototype.listeners = function(t) {
        var e;
        return e = this._events && this._events[t] ? n(this._events[t]) ? [this._events[t]] : this._events[t].slice() : []
    }, r.prototype.listenerCount = function(t) {
        if (this._events) {
            var e = this._events[t];
            if (n(e)) return 1;
            if (e) return e.length
        }
        return 0
    }, r.listenerCount = function(t, e) {
        return t.listenerCount(e)
    }
}, function(t, e, r) {
    "use strict";

    function n() {
        try {
            Promise === o && (Promise = i)
        } catch (t) {}
        return o
    }
    var i;
    "undefined" != typeof Promise && (i = Promise);
    var o = r(4)();
    o.noConflict = n, t.exports = o
}, function(t, e, r) {
    (function(e) {
        "use strict";
        t.exports = function() {
            function n() {}

            function i(t, e) {
                if (null == t || t.constructor !== o) throw new m("the promise constructor cannot be invoked directly\n\n    See http://goo.gl/MqrFmX\n");
                if ("function" != typeof e) throw new m("expecting a function but got " + d.classString(e))
            }

            function o(t) {
                t !== w && i(this, t), this._bitField = 0, this._fulfillmentHandler0 = void 0, this._rejectionHandler0 = void 0, this._promise0 = void 0, this._receiver0 = void 0, this._resolveFromExecutor(t), this._promiseCreated(), this._fireEvent("promiseCreated", this)
            }

            function s(t) {
                this.promise._resolveCallback(t)
            }

            function a(t) {
                this.promise._rejectCallback(t, !1)
            }

            function u(t) {
                var e = new o(w);
                e._fulfillmentHandler0 = t, e._rejectionHandler0 = t, e._promise0 = t, e._receiver0 = t
            }
            var f, c = function() {
                    return new m("circular promise resolution chain\n\n    See http://goo.gl/MqrFmX\n")
                },
                h = function() {
                    return new o.PromiseInspection(this._target())
                },
                l = function(t) {
                    return o.reject(new m(t))
                },
                p = {},
                d = r(6);
            f = d.isNode ? function() {
                var t = e.domain;
                return void 0 === t && (t = null), t
            } : function() {
                return null
            }, d.notEnumerableProp(o, "_getDomain", f);
            var v = r(7),
                y = r(8),
                g = new y;
            v.defineProperty(o, "_async", {
                value: g
            });
            var _ = r(13),
                m = o.TypeError = _.TypeError;
            o.RangeError = _.RangeError;
            var b = o.CancellationError = _.CancellationError;
            o.TimeoutError = _.TimeoutError, o.OperationalError = _.OperationalError, o.RejectionError = _.OperationalError, o.AggregateError = _.AggregateError;
            var w = function() {},
                E = {},
                k = {},
                T = r(14)(o, w),
                B = r(15)(o, w, T, l, n),
                S = r(16)(o),
                x = S.create,
                A = r(17)(o, S),
                I = (A.CapturedTrace, r(18)(o, T, k)),
                O = r(19)(k),
                j = r(20),
                C = d.errorObj,
                R = d.tryCatch;
            return o.prototype.toString = function() {
                return "[object Promise]"
            }, o.prototype.caught = o.prototype.catch = function(t) {
                var e = arguments.length;
                if (e > 1) {
                    var r, n = new Array(e - 1),
                        i = 0;
                    for (r = 0; r < e - 1; ++r) {
                        var o = arguments[r];
                        if (!d.isObject(o)) return l("Catch statement predicate: expecting an object but got " + d.classString(o));
                        n[i++] = o
                    }
                    return n.length = i, t = arguments[r], this.then(void 0, O(n, t, this))
                }
                return this.then(void 0, t)
            }, o.prototype.reflect = function() {
                return this._then(h, h, void 0, this, void 0)
            }, o.prototype.then = function(t, e) {
                if (A.warnings() && arguments.length > 0 && "function" != typeof t && "function" != typeof e) {
                    var r = ".then() only accepts functions but was passed: " + d.classString(t);
                    arguments.length > 1 && (r += ", " + d.classString(e)), this._warn(r)
                }
                return this._then(t, e, void 0, void 0, void 0)
            }, o.prototype.done = function(t, e) {
                var r = this._then(t, e, void 0, void 0, void 0);
                r._setIsFinal()
            }, o.prototype.spread = function(t) {
                return "function" != typeof t ? l("expecting a function but got " + d.classString(t)) : this.all()._then(t, void 0, void 0, E, void 0)
            }, o.prototype.toJSON = function() {
                var t = {
                    isFulfilled: !1,
                    isRejected: !1,
                    fulfillmentValue: void 0,
                    rejectionReason: void 0
                };
                return this.isFulfilled() ? (t.fulfillmentValue = this.value(), t.isFulfilled = !0) : this.isRejected() && (t.rejectionReason = this.reason(), t.isRejected = !0), t
            }, o.prototype.all = function() {
                return arguments.length > 0 && this._warn(".all() was passed arguments but it does not take any"), new B(this).promise()
            }, o.prototype.error = function(t) {
                return this.caught(d.originatesFromRejection, t)
            }, o.getNewLibraryCopy = t.exports, o.is = function(t) {
                return t instanceof o
            }, o.fromNode = o.fromCallback = function(t) {
                var e = new o(w);
                e._captureStackTrace();
                var r = arguments.length > 1 && !!Object(arguments[1]).multiArgs,
                    n = R(t)(j(e, r));
                return n === C && e._rejectCallback(n.e, !0), e._isFateSealed() || e._setAsyncGuaranteed(), e
            }, o.all = function(t) {
                return new B(t).promise()
            }, o.cast = function(t) {
                var e = T(t);
                return e instanceof o || (e = new o(w), e._captureStackTrace(), e._setFulfilled(), e._rejectionHandler0 = t), e
            }, o.resolve = o.fulfilled = o.cast, o.reject = o.rejected = function(t) {
                var e = new o(w);
                return e._captureStackTrace(), e._rejectCallback(t, !0), e
            }, o.setScheduler = function(t) {
                if ("function" != typeof t) throw new m("expecting a function but got " + d.classString(t));
                return g.setScheduler(t)
            }, o.prototype._then = function(t, e, r, n, i) {
                var s = void 0 !== i,
                    a = s ? i : new o(w),
                    u = this._target(),
                    c = u._bitField;
                s || (a._propagateFrom(this, 3), a._captureStackTrace(), void 0 === n && 0 !== (2097152 & this._bitField) && (n = 0 !== (50397184 & c) ? this._boundValue() : u === this ? void 0 : this._boundTo), this._fireEvent("promiseChained", this, a));
                var h = f();
                if (0 !== (50397184 & c)) {
                    var l, p, v = u._settlePromiseCtx;
                    0 !== (33554432 & c) ? (p = u._rejectionHandler0, l = t) : 0 !== (16777216 & c) ? (p = u._fulfillmentHandler0, l = e, u._unsetRejectionIsUnhandled()) : (v = u._settlePromiseLateCancellationObserver, p = new b("late cancellation observer"), u._attachExtraTrace(p), l = e), g.invoke(v, u, {
                        handler: null === h ? l : "function" == typeof l && d.domainBind(h, l),
                        promise: a,
                        receiver: n,
                        value: p
                    })
                } else u._addCallbacks(t, e, a, n, h);
                return a
            }, o.prototype._length = function() {
                return 65535 & this._bitField
            }, o.prototype._isFateSealed = function() {
                return 0 !== (117506048 & this._bitField)
            }, o.prototype._isFollowing = function() {
                return 67108864 === (67108864 & this._bitField)
            }, o.prototype._setLength = function(t) {
                this._bitField = this._bitField & -65536 | 65535 & t
            }, o.prototype._setFulfilled = function() {
                this._bitField = 33554432 | this._bitField, this._fireEvent("promiseFulfilled", this)
            }, o.prototype._setRejected = function() {
                this._bitField = 16777216 | this._bitField, this._fireEvent("promiseRejected", this)
            }, o.prototype._setFollowing = function() {
                this._bitField = 67108864 | this._bitField, this._fireEvent("promiseResolved", this)
            }, o.prototype._setIsFinal = function() {
                this._bitField = 4194304 | this._bitField
            }, o.prototype._isFinal = function() {
                return (4194304 & this._bitField) > 0
            }, o.prototype._unsetCancelled = function() {
                this._bitField = this._bitField & -65537
            }, o.prototype._setCancelled = function() {
                this._bitField = 65536 | this._bitField, this._fireEvent("promiseCancelled", this)
            }, o.prototype._setWillBeCancelled = function() {
                this._bitField = 8388608 | this._bitField
            }, o.prototype._setAsyncGuaranteed = function() {
                g.hasCustomScheduler() || (this._bitField = 134217728 | this._bitField)
            }, o.prototype._receiverAt = function(t) {
                var e = 0 === t ? this._receiver0 : this[4 * t - 4 + 3];
                if (e !== p) return void 0 === e && this._isBound() ? this._boundValue() : e
            }, o.prototype._promiseAt = function(t) {
                return this[4 * t - 4 + 2]
            }, o.prototype._fulfillmentHandlerAt = function(t) {
                return this[4 * t - 4 + 0]
            }, o.prototype._rejectionHandlerAt = function(t) {
                return this[4 * t - 4 + 1]
            }, o.prototype._boundValue = function() {}, o.prototype._migrateCallback0 = function(t) {
                var e = (t._bitField, t._fulfillmentHandler0),
                    r = t._rejectionHandler0,
                    n = t._promise0,
                    i = t._receiverAt(0);
                void 0 === i && (i = p), this._addCallbacks(e, r, n, i, null)
            }, o.prototype._migrateCallbackAt = function(t, e) {
                var r = t._fulfillmentHandlerAt(e),
                    n = t._rejectionHandlerAt(e),
                    i = t._promiseAt(e),
                    o = t._receiverAt(e);
                void 0 === o && (o = p), this._addCallbacks(r, n, i, o, null)
            }, o.prototype._addCallbacks = function(t, e, r, n, i) {
                var o = this._length();
                if (o >= 65531 && (o = 0, this._setLength(0)), 0 === o) this._promise0 = r, this._receiver0 = n, "function" == typeof t && (this._fulfillmentHandler0 = null === i ? t : d.domainBind(i, t)), "function" == typeof e && (this._rejectionHandler0 = null === i ? e : d.domainBind(i, e));
                else {
                    var s = 4 * o - 4;
                    this[s + 2] = r, this[s + 3] = n, "function" == typeof t && (this[s + 0] = null === i ? t : d.domainBind(i, t)), "function" == typeof e && (this[s + 1] = null === i ? e : d.domainBind(i, e))
                }
                return this._setLength(o + 1), o
            }, o.prototype._proxy = function(t, e) {
                this._addCallbacks(void 0, void 0, e, t, null)
            }, o.prototype._resolveCallback = function(t, e) {
                if (0 === (117506048 & this._bitField)) {
                    if (t === this) return this._rejectCallback(c(), !1);
                    var r = T(t, this);
                    if (!(r instanceof o)) return this._fulfill(t);
                    e && this._propagateFrom(r, 2);
                    var n = r._target();
                    if (n === this) return void this._reject(c());
                    var i = n._bitField;
                    if (0 === (50397184 & i)) {
                        var s = this._length();
                        s > 0 && n._migrateCallback0(this);
                        for (var a = 1; a < s; ++a) n._migrateCallbackAt(this, a);
                        this._setFollowing(), this._setLength(0), this._setFollowee(n)
                    } else if (0 !== (33554432 & i)) this._fulfill(n._value());
                    else if (0 !== (16777216 & i)) this._reject(n._reason());
                    else {
                        var u = new b("late cancellation observer");
                        n._attachExtraTrace(u), this._reject(u)
                    }
                }
            }, o.prototype._rejectCallback = function(t, e, r) {
                var n = d.ensureErrorObject(t),
                    i = n === t;
                if (!i && !r && A.warnings()) {
                    var o = "a promise was rejected with a non-error: " + d.classString(t);
                    this._warn(o, !0)
                }
                this._attachExtraTrace(n, !!e && i), this._reject(t)
            }, o.prototype._resolveFromExecutor = function(t) {
                if (t !== w) {
                    var e = this;
                    this._captureStackTrace(), this._pushContext();
                    var r = !0,
                        n = this._execute(t, function(t) {
                            e._resolveCallback(t)
                        }, function(t) {
                            e._rejectCallback(t, r)
                        });
                    r = !1, this._popContext(), void 0 !== n && e._rejectCallback(n, !0)
                }
            }, o.prototype._settlePromiseFromHandler = function(t, e, r, n) {
                var i = n._bitField;
                if (0 === (65536 & i)) {
                    n._pushContext();
                    var o;
                    e === E ? r && "number" == typeof r.length ? o = R(t).apply(this._boundValue(), r) : (o = C, o.e = new m("cannot .spread() a non-array: " + d.classString(r))) : o = R(t).call(e, r);
                    var s = n._popContext();
                    i = n._bitField, 0 === (65536 & i) && (o === k ? n._reject(r) : o === C ? n._rejectCallback(o.e, !1) : (A.checkForgottenReturns(o, s, "", n, this), n._resolveCallback(o)))
                }
            }, o.prototype._target = function() {
                for (var t = this; t._isFollowing();) t = t._followee();
                return t
            }, o.prototype._followee = function() {
                return this._rejectionHandler0
            }, o.prototype._setFollowee = function(t) {
                this._rejectionHandler0 = t
            }, o.prototype._settlePromise = function(t, e, r, i) {
                var s = t instanceof o,
                    a = this._bitField,
                    u = 0 !== (134217728 & a);
                0 !== (65536 & a) ? (s && t._invokeInternalOnCancel(), r instanceof I && r.isFinallyHandler() ? (r.cancelPromise = t, R(e).call(r, i) === C && t._reject(C.e)) : e === h ? t._fulfill(h.call(r)) : r instanceof n ? r._promiseCancelled(t) : s || t instanceof B ? t._cancel() : r.cancel()) : "function" == typeof e ? s ? (u && t._setAsyncGuaranteed(), this._settlePromiseFromHandler(e, r, i, t)) : e.call(r, i, t) : r instanceof n ? r._isResolved() || (0 !== (33554432 & a) ? r._promiseFulfilled(i, t) : r._promiseRejected(i, t)) : s && (u && t._setAsyncGuaranteed(), 0 !== (33554432 & a) ? t._fulfill(i) : t._reject(i))
            }, o.prototype._settlePromiseLateCancellationObserver = function(t) {
                var e = t.handler,
                    r = t.promise,
                    n = t.receiver,
                    i = t.value;
                "function" == typeof e ? r instanceof o ? this._settlePromiseFromHandler(e, n, i, r) : e.call(n, i, r) : r instanceof o && r._reject(i)
            }, o.prototype._settlePromiseCtx = function(t) {
                this._settlePromise(t.promise, t.handler, t.receiver, t.value)
            }, o.prototype._settlePromise0 = function(t, e, r) {
                var n = this._promise0,
                    i = this._receiverAt(0);
                this._promise0 = void 0, this._receiver0 = void 0, this._settlePromise(n, t, i, e)
            }, o.prototype._clearCallbackDataAtIndex = function(t) {
                var e = 4 * t - 4;
                this[e + 2] = this[e + 3] = this[e + 0] = this[e + 1] = void 0
            }, o.prototype._fulfill = function(t) {
                var e = this._bitField;
                if (!((117506048 & e) >>> 16)) {
                    if (t === this) {
                        var r = c();
                        return this._attachExtraTrace(r), this._reject(r)
                    }
                    this._setFulfilled(), this._rejectionHandler0 = t, (65535 & e) > 0 && (0 !== (134217728 & e) ? this._settlePromises() : g.settlePromises(this))
                }
            }, o.prototype._reject = function(t) {
                var e = this._bitField;
                if (!((117506048 & e) >>> 16)) return this._setRejected(), this._fulfillmentHandler0 = t, this._isFinal() ? g.fatalError(t, d.isNode) : void((65535 & e) > 0 ? g.settlePromises(this) : this._ensurePossibleRejectionHandled())
            }, o.prototype._fulfillPromises = function(t, e) {
                for (var r = 1; r < t; r++) {
                    var n = this._fulfillmentHandlerAt(r),
                        i = this._promiseAt(r),
                        o = this._receiverAt(r);
                    this._clearCallbackDataAtIndex(r), this._settlePromise(i, n, o, e)
                }
            }, o.prototype._rejectPromises = function(t, e) {
                for (var r = 1; r < t; r++) {
                    var n = this._rejectionHandlerAt(r),
                        i = this._promiseAt(r),
                        o = this._receiverAt(r);
                    this._clearCallbackDataAtIndex(r), this._settlePromise(i, n, o, e)
                }
            }, o.prototype._settlePromises = function() {
                var t = this._bitField,
                    e = 65535 & t;
                if (e > 0) {
                    if (0 !== (16842752 & t)) {
                        var r = this._fulfillmentHandler0;
                        this._settlePromise0(this._rejectionHandler0, r, t), this._rejectPromises(e, r)
                    } else {
                        var n = this._rejectionHandler0;
                        this._settlePromise0(this._fulfillmentHandler0, n, t), this._fulfillPromises(e, n)
                    }
                    this._setLength(0)
                }
                this._clearCancellationData()
            }, o.prototype._settledValue = function() {
                var t = this._bitField;
                return 0 !== (33554432 & t) ? this._rejectionHandler0 : 0 !== (16777216 & t) ? this._fulfillmentHandler0 : void 0
            }, o.defer = o.pending = function() {
                A.deprecated("Promise.defer", "new Promise");
                var t = new o(w);
                return {
                    promise: t,
                    resolve: s,
                    reject: a
                }
            }, d.notEnumerableProp(o, "_makeSelfResolutionError", c), r(21)(o, w, T, l, A), r(22)(o, w, T, A), r(23)(o, B, l, A), r(24)(o), r(25)(o), r(26)(o, B, T, w, g, f), o.Promise = o, o.version = "3.5.0", r(27)(o, B, l, T, w, A), r(28)(o), r(29)(o, l, T, x, w, A), r(30)(o, w, A), r(31)(o, l, w, T, n, A), r(32)(o), r(33)(o, w), r(34)(o, B, T, l), r(35)(o, w, T, l), r(36)(o, B, l, T, w, A), r(37)(o, B, A), r(38)(o, B, l), r(39)(o, w), r(40)(o, w), r(41)(o), d.toFastProperties(o), d.toFastProperties(o.prototype), u({
                a: 1
            }), u({
                b: 2
            }), u({
                c: 3
            }), u(1), u(function() {}), u(void 0), u(!1), u(new o(w)), A.setBounds(y.firstLineError, d.lastLineError), o
        }
    }).call(e, r(5))
}, function(t, e) {
    function r() {
        throw new Error("setTimeout has not been defined")
    }

    function n() {
        throw new Error("clearTimeout has not been defined")
    }

    function i(t) {
        if (c === setTimeout) return setTimeout(t, 0);
        if ((c === r || !c) && setTimeout) return c = setTimeout, setTimeout(t, 0);
        try {
            return c(t, 0)
        } catch (e) {
            try {
                return c.call(null, t, 0)
            } catch (e) {
                return c.call(this, t, 0)
            }
        }
    }

    function o(t) {
        if (h === clearTimeout) return clearTimeout(t);
        if ((h === n || !h) && clearTimeout) return h = clearTimeout, clearTimeout(t);
        try {
            return h(t)
        } catch (e) {
            try {
                return h.call(null, t)
            } catch (e) {
                return h.call(this, t)
            }
        }
    }

    function s() {
        v && p && (v = !1, p.length ? d = p.concat(d) : y = -1, d.length && a())
    }

    function a() {
        if (!v) {
            var t = i(s);
            v = !0;
            for (var e = d.length; e;) {
                for (p = d, d = []; ++y < e;) p && p[y].run();
                y = -1, e = d.length
            }
            p = null, v = !1, o(t)
        }
    }

    function u(t, e) {
        this.fun = t, this.array = e
    }

    function f() {}
    var c, h, l = t.exports = {};
    ! function() {
        try {
            c = "function" == typeof setTimeout ? setTimeout : r
        } catch (t) {
            c = r
        }
        try {
            h = "function" == typeof clearTimeout ? clearTimeout : n
        } catch (t) {
            h = n
        }
    }();
    var p, d = [],
        v = !1,
        y = -1;
    l.nextTick = function(t) {
        var e = new Array(arguments.length - 1);
        if (arguments.length > 1)
            for (var r = 1; r < arguments.length; r++) e[r - 1] = arguments[r];
        d.push(new u(t, e)), 1 !== d.length || v || i(a)
    }, u.prototype.run = function() {
        this.fun.apply(null, this.array)
    }, l.title = "browser", l.browser = !0, l.env = {}, l.argv = [], l.version = "", l.versions = {}, l.on = f, l.addListener = f, l.once = f, l.off = f, l.removeListener = f, l.removeAllListeners = f, l.emit = f, l.prependListener = f, l.prependOnceListener = f, l.listeners = function(t) {
        return []
    }, l.binding = function(t) {
        throw new Error("process.binding is not supported")
    }, l.cwd = function() {
        return "/"
    }, l.chdir = function(t) {
        throw new Error("process.chdir is not supported")
    }, l.umask = function() {
        return 0
    }
}, function(t, e, r) {
    (function(e, n) {
        "use strict";

        function i() {
            try {
                var t = O;
                return O = null, t.apply(this, arguments)
            } catch (t) {
                return I.e = t, I
            }
        }

        function o(t) {
            return O = t, i
        }

        function s(t) {
            return null == t || t === !0 || t === !1 || "string" == typeof t || "number" == typeof t
        }

        function a(t) {
            return "function" == typeof t || "object" == typeof t && null !== t
        }

        function u(t) {
            return s(t) ? new Error(g(t)) : t
        }

        function f(t, e) {
            var r, n = t.length,
                i = new Array(n + 1);
            for (r = 0; r < n; ++r) i[r] = t[r];
            return i[r] = e, i
        }

        function c(t, e, r) {
            if (!x.isES5) return {}.hasOwnProperty.call(t, e) ? t[e] : void 0;
            var n = Object.getOwnPropertyDescriptor(t, e);
            return null != n ? null == n.get && null == n.set ? n.value : r : void 0
        }

        function h(t, e, r) {
            if (s(t)) return t;
            var n = {
                value: r,
                configurable: !0,
                enumerable: !1,
                writable: !0
            };
            return x.defineProperty(t, e, n), t
        }

        function l(t) {
            throw t
        }

        function p(t) {
            try {
                if ("function" == typeof t) {
                    var e = x.names(t.prototype),
                        r = x.isES5 && e.length > 1,
                        n = e.length > 0 && !(1 === e.length && "constructor" === e[0]),
                        i = L.test(t + "") && x.names(t).length > 0;
                    if (r || n || i) return !0
                }
                return !1
            } catch (t) {
                return !1
            }
        }

        function d(t) {
            function e() {}
            e.prototype = t;
            for (var r = 8; r--;) new e;
            return t
        }

        function v(t) {
            return U.test(t)
        }

        function y(t, e, r) {
            for (var n = new Array(t), i = 0; i < t; ++i) n[i] = e + i + r;
            return n
        }

        function g(t) {
            try {
                return t + ""
            } catch (t) {
                return "[no string representation]"
            }
        }

        function _(t) {
            return null !== t && "object" == typeof t && "string" == typeof t.message && "string" == typeof t.name
        }

        function m(t) {
            try {
                h(t, "isOperational", !0)
            } catch (t) {}
        }

        function b(t) {
            return null != t && (t instanceof Error.__BluebirdErrorTypes__.OperationalError || t.isOperational === !0)
        }

        function w(t) {
            return _(t) && x.propertyIsWritable(t, "stack")
        }

        function E(t) {
            return {}.toString.call(t)
        }

        function k(t, e, r) {
            for (var n = x.names(t), i = 0; i < n.length; ++i) {
                var o = n[i];
                if (r(o)) try {
                    x.defineProperty(e, o, x.getDescriptor(t, o))
                } catch (t) {}
            }
        }

        function T(t) {
            return M ? n.env[t] : void 0
        }

        function B() {
            if ("function" == typeof Promise) try {
                var t = new Promise(function() {});
                if ("[object Promise]" === {}.toString.call(t)) return Promise
            } catch (t) {}
        }

        function S(t, e) {
            return t.bind(e)
        }
        var x = r(7),
            A = "undefined" == typeof navigator,
            I = {
                e: {}
            },
            O, j = "undefined" != typeof self ? self : "undefined" != typeof window ? window : "undefined" != typeof e ? e : void 0 !== this ? this : null,
            C = function(t, e) {
                function r() {
                    this.constructor = t, this.constructor$ = e;
                    for (var r in e.prototype) n.call(e.prototype, r) && "$" !== r.charAt(r.length - 1) && (this[r + "$"] = e.prototype[r])
                }
                var n = {}.hasOwnProperty;
                return r.prototype = e.prototype, t.prototype = new r, t.prototype
            },
            R = function() {
                var t = [Array.prototype, Object.prototype, Function.prototype],
                    e = function(e) {
                        for (var r = 0; r < t.length; ++r)
                            if (t[r] === e) return !0;
                        return !1
                    };
                if (x.isES5) {
                    var r = Object.getOwnPropertyNames;
                    return function(t) {
                        for (var n = [], i = Object.create(null); null != t && !e(t);) {
                            var o;
                            try {
                                o = r(t)
                            } catch (t) {
                                return n
                            }
                            for (var s = 0; s < o.length; ++s) {
                                var a = o[s];
                                if (!i[a]) {
                                    i[a] = !0;
                                    var u = Object.getOwnPropertyDescriptor(t, a);
                                    null != u && null == u.get && null == u.set && n.push(a)
                                }
                            }
                            t = x.getPrototypeOf(t)
                        }
                        return n
                    }
                }
                var n = {}.hasOwnProperty;
                return function(r) {
                    if (e(r)) return [];
                    var i = [];
                    t: for (var o in r)
                        if (n.call(r, o)) i.push(o);
                        else {
                            for (var s = 0; s < t.length; ++s)
                                if (n.call(t[s], o)) continue t;
                            i.push(o)
                        }
                    return i
                }
            }(),
            L = /this\s*\.\s*\S+\s*=/,
            U = /^[a-z$_][a-z$_0-9]*$/i,
            F = function() {
                return "stack" in new Error ? function(t) {
                    return w(t) ? t : new Error(g(t))
                } : function(t) {
                    if (w(t)) return t;
                    try {
                        throw new Error(g(t))
                    } catch (t) {
                        return t
                    }
                }
            }(),
            P = function(t) {
                return x.isArray(t) ? t : null
            };
        if ("undefined" != typeof Symbol && Symbol.iterator) {
            var D = "function" == typeof Array.from ? function(t) {
                return Array.from(t)
            } : function(t) {
                for (var e, r = [], n = t[Symbol.iterator](); !(e = n.next()).done;) r.push(e.value);
                return r
            };
            P = function(t) {
                return x.isArray(t) ? t : null != t && "function" == typeof t[Symbol.iterator] ? D(t) : null
            }
        }
        var N = "undefined" != typeof n && "[object process]" === E(n).toLowerCase(),
            M = "undefined" != typeof n && "undefined" != typeof n.env,
            q = {
                isClass: p,
                isIdentifier: v,
                inheritedDataKeys: R,
                getDataPropertyOrDefault: c,
                thrower: l,
                isArray: x.isArray,
                asArray: P,
                notEnumerableProp: h,
                isPrimitive: s,
                isObject: a,
                isError: _,
                canEvaluate: A,
                errorObj: I,
                tryCatch: o,
                inherits: C,
                withAppended: f,
                maybeWrapAsError: u,
                toFastProperties: d,
                filledRange: y,
                toString: g,
                canAttachTrace: w,
                ensureErrorObject: F,
                originatesFromRejection: b,
                markAsOriginatingFromRejection: m,
                classString: E,
                copyDescriptors: k,
                hasDevTools: "undefined" != typeof chrome && chrome && "function" == typeof chrome.loadTimes,
                isNode: N,
                hasEnvVariables: M,
                env: T,
                global: j,
                getNativePromise: B,
                domainBind: S
            };
        q.isRecentNode = q.isNode && function() {
            var t = n.versions.node.split(".").map(Number);
            return 0 === t[0] && t[1] > 10 || t[0] > 0
        }(), q.isNode && q.toFastProperties(n);
        try {
            throw new Error
        } catch (t) {
            q.lastLineError = t
        }
        t.exports = q
    }).call(e, function() {
        return this
    }(), r(5))
}, function(t, e) {
    var r = function() {
        "use strict";
        return void 0 === this
    }();
    if (r) t.exports = {
        freeze: Object.freeze,
        defineProperty: Object.defineProperty,
        getDescriptor: Object.getOwnPropertyDescriptor,
        keys: Object.keys,
        names: Object.getOwnPropertyNames,
        getPrototypeOf: Object.getPrototypeOf,
        isArray: Array.isArray,
        isES5: r,
        propertyIsWritable: function(t, e) {
            var r = Object.getOwnPropertyDescriptor(t, e);
            return !(r && !r.writable && !r.set)
        }
    };
    else {
        var n = {}.hasOwnProperty,
            i = {}.toString,
            o = {}.constructor.prototype,
            s = function(t) {
                var e = [];
                for (var r in t) n.call(t, r) && e.push(r);
                return e
            },
            a = function(t, e) {
                return {
                    value: t[e]
                }
            },
            u = function(t, e, r) {
                return t[e] = r.value, t
            },
            f = function(t) {
                return t
            },
            c = function(t) {
                try {
                    return Object(t).constructor.prototype
                } catch (t) {
                    return o
                }
            },
            h = function(t) {
                try {
                    return "[object Array]" === i.call(t)
                } catch (t) {
                    return !1
                }
            };
        t.exports = {
            isArray: h,
            keys: s,
            names: s,
            defineProperty: u,
            getDescriptor: a,
            freeze: f,
            getPrototypeOf: c,
            isES5: r,
            propertyIsWritable: function() {
                return !0
            }
        }
    }
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n() {
            this._customScheduler = !1, this._isTickUsed = !1, this._lateQueue = new f(16), this._normalQueue = new f(16), this._haveDrainedQueues = !1, this._trampolineEnabled = !0;
            var t = this;
            this.drainQueues = function() {
                t._drainQueues()
            }, this._schedule = u
        }

        function i(t, e, r) {
            this._lateQueue.push(t, e, r), this._queueTick()
        }

        function o(t, e, r) {
            this._normalQueue.push(t, e, r), this._queueTick()
        }

        function s(t) {
            this._normalQueue._pushOne(t), this._queueTick()
        }
        var a;
        try {
            throw new Error
        } catch (t) {
            a = t
        }
        var u = r(9),
            f = r(12),
            c = r(6);
        n.prototype.setScheduler = function(t) {
            var e = this._schedule;
            return this._schedule = t, this._customScheduler = !0, e
        }, n.prototype.hasCustomScheduler = function() {
            return this._customScheduler
        }, n.prototype.enableTrampoline = function() {
            this._trampolineEnabled = !0
        }, n.prototype.disableTrampolineIfNecessary = function() {
            c.hasDevTools && (this._trampolineEnabled = !1)
        }, n.prototype.haveItemsQueued = function() {
            return this._isTickUsed || this._haveDrainedQueues
        }, n.prototype.fatalError = function(t, r) {
            r ? (e.stderr.write("Fatal " + (t instanceof Error ? t.stack : t) + "\n"), e.exit(2)) : this.throwLater(t)
        }, n.prototype.throwLater = function(t, e) {
            if (1 === arguments.length && (e = t, t = function() {
                    throw e
                }), "undefined" != typeof setTimeout) setTimeout(function() {
                t(e)
            }, 0);
            else try {
                this._schedule(function() {
                    t(e)
                })
            } catch (t) {
                throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n")
            }
        }, c.hasDevTools ? (n.prototype.invokeLater = function(t, e, r) {
            this._trampolineEnabled ? i.call(this, t, e, r) : this._schedule(function() {
                setTimeout(function() {
                    t.call(e, r)
                }, 100)
            })
        }, n.prototype.invoke = function(t, e, r) {
            this._trampolineEnabled ? o.call(this, t, e, r) : this._schedule(function() {
                t.call(e, r)
            })
        }, n.prototype.settlePromises = function(t) {
            this._trampolineEnabled ? s.call(this, t) : this._schedule(function() {
                t._settlePromises()
            })
        }) : (n.prototype.invokeLater = i, n.prototype.invoke = o, n.prototype.settlePromises = s), n.prototype._drainQueue = function(t) {
            for (; t.length() > 0;) {
                var e = t.shift();
                if ("function" == typeof e) {
                    var r = t.shift(),
                        n = t.shift();
                    e.call(r, n)
                } else e._settlePromises()
            }
        }, n.prototype._drainQueues = function() {
            this._drainQueue(this._normalQueue), this._reset(), this._haveDrainedQueues = !0, this._drainQueue(this._lateQueue)
        }, n.prototype._queueTick = function() {
            this._isTickUsed || (this._isTickUsed = !0, this._schedule(this.drainQueues))
        }, n.prototype._reset = function() {
            this._isTickUsed = !1
        }, t.exports = n, t.exports.firstLineError = a
    }).call(e, r(5))
}, function(t, e, r) {
    (function(e, n, i) {
        "use strict";
        var o, s = r(6),
            a = function() {
                throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n")
            },
            u = s.getNativePromise();
        if (s.isNode && "undefined" == typeof MutationObserver) {
            var f = e.setImmediate,
                c = n.nextTick;
            o = s.isRecentNode ? function(t) {
                f.call(e, t)
            } : function(t) {
                c.call(n, t)
            }
        } else if ("function" == typeof u && "function" == typeof u.resolve) {
            var h = u.resolve();
            o = function(t) {
                h.then(t)
            }
        } else o = "undefined" == typeof MutationObserver || "undefined" != typeof window && window.navigator && (window.navigator.standalone || window.cordova) ? "undefined" != typeof i ? function(t) {
            i(t)
        } : "undefined" != typeof setTimeout ? function(t) {
            setTimeout(t, 0)
        } : a : function() {
            var t = document.createElement("div"),
                e = {
                    attributes: !0
                },
                r = !1,
                n = document.createElement("div"),
                i = new MutationObserver(function() {
                    t.classList.toggle("foo"), r = !1
                });
            i.observe(n, e);
            var o = function() {
                r || (r = !0, n.classList.toggle("foo"))
            };
            return function(r) {
                var n = new MutationObserver(function() {
                    n.disconnect(), r()
                });
                n.observe(t, e), o()
            }
        }();
        t.exports = o
    }).call(e, function() {
        return this
    }(), r(5), r(10).setImmediate)
}, function(t, e, r) {
    function n(t, e) {
        this._id = t, this._clearFn = e
    }
    var i = Function.prototype.apply;
    e.setTimeout = function() {
        return new n(i.call(setTimeout, window, arguments), clearTimeout)
    }, e.setInterval = function() {
        return new n(i.call(setInterval, window, arguments), clearInterval)
    }, e.clearTimeout = e.clearInterval = function(t) {
        t && t.close()
    }, n.prototype.unref = n.prototype.ref = function() {}, n.prototype.close = function() {
        this._clearFn.call(window, this._id)
    }, e.enroll = function(t, e) {
        clearTimeout(t._idleTimeoutId), t._idleTimeout = e
    }, e.unenroll = function(t) {
        clearTimeout(t._idleTimeoutId), t._idleTimeout = -1
    }, e._unrefActive = e.active = function(t) {
        clearTimeout(t._idleTimeoutId);
        var e = t._idleTimeout;
        e >= 0 && (t._idleTimeoutId = setTimeout(function() {
            t._onTimeout && t._onTimeout()
        }, e))
    }, r(11), e.setImmediate = setImmediate, e.clearImmediate = clearImmediate
}, function(t, e, r) {
    (function(t, e) {
        ! function(t, r) {
            "use strict";

            function n(t) {
                "function" != typeof t && (t = new Function("" + t));
                for (var e = new Array(arguments.length - 1), r = 0; r < e.length; r++) e[r] = arguments[r + 1];
                var n = {
                    callback: t,
                    args: e
                };
                return v[d] = n, p(d), d++
            }

            function i(t) {
                delete v[t]
            }

            function o(t) {
                var e = t.callback,
                    n = t.args;
                switch (n.length) {
                    case 0:
                        e();
                        break;
                    case 1:
                        e(n[0]);
                        break;
                    case 2:
                        e(n[0], n[1]);
                        break;
                    case 3:
                        e(n[0], n[1], n[2]);
                        break;
                    default:
                        e.apply(r, n)
                }
            }

            function s(t) {
                if (y) setTimeout(s, 0, t);
                else {
                    var e = v[t];
                    if (e) {
                        y = !0;
                        try {
                            o(e)
                        } finally {
                            i(t), y = !1
                        }
                    }
                }
            }

            function a() {
                p = function(t) {
                    e.nextTick(function() {
                        s(t)
                    })
                }
            }

            function u() {
                if (t.postMessage && !t.importScripts) {
                    var e = !0,
                        r = t.onmessage;
                    return t.onmessage = function() {
                        e = !1
                    }, t.postMessage("", "*"), t.onmessage = r, e
                }
            }

            function f() {
                var e = "setImmediate$" + Math.random() + "$",
                    r = function(r) {
                        r.source === t && "string" == typeof r.data && 0 === r.data.indexOf(e) && s(+r.data.slice(e.length))
                    };
                t.addEventListener ? t.addEventListener("message", r, !1) : t.attachEvent("onmessage", r), p = function(r) {
                    t.postMessage(e + r, "*")
                }
            }

            function c() {
                var t = new MessageChannel;
                t.port1.onmessage = function(t) {
                    var e = t.data;
                    s(e)
                }, p = function(e) {
                    t.port2.postMessage(e)
                }
            }

            function h() {
                var t = g.documentElement;
                p = function(e) {
                    var r = g.createElement("script");
                    r.onreadystatechange = function() {
                        s(e), r.onreadystatechange = null, t.removeChild(r), r = null
                    }, t.appendChild(r)
                }
            }

            function l() {
                p = function(t) {
                    setTimeout(s, 0, t)
                }
            }
            if (!t.setImmediate) {
                var p, d = 1,
                    v = {},
                    y = !1,
                    g = t.document,
                    _ = Object.getPrototypeOf && Object.getPrototypeOf(t);
                _ = _ && _.setTimeout ? _ : t, "[object process]" === {}.toString.call(t.process) ? a() : u() ? f() : t.MessageChannel ? c() : g && "onreadystatechange" in g.createElement("script") ? h() : l(), _.setImmediate = n, _.clearImmediate = i
            }
        }("undefined" == typeof self ? "undefined" == typeof t ? this : t : self)
    }).call(e, function() {
        return this
    }(), r(5))
}, function(t, e) {
    "use strict";

    function r(t, e, r, n, i) {
        for (var o = 0; o < i; ++o) r[o + n] = t[o + e], t[o + e] = void 0
    }

    function n(t) {
        this._capacity = t, this._length = 0, this._front = 0
    }
    n.prototype._willBeOverCapacity = function(t) {
        return this._capacity < t
    }, n.prototype._pushOne = function(t) {
        var e = this.length();
        this._checkCapacity(e + 1);
        var r = this._front + e & this._capacity - 1;
        this[r] = t, this._length = e + 1
    }, n.prototype.push = function(t, e, r) {
        var n = this.length() + 3;
        if (this._willBeOverCapacity(n)) return this._pushOne(t), this._pushOne(e), void this._pushOne(r);
        var i = this._front + n - 3;
        this._checkCapacity(n);
        var o = this._capacity - 1;
        this[i + 0 & o] = t, this[i + 1 & o] = e, this[i + 2 & o] = r, this._length = n
    }, n.prototype.shift = function() {
        var t = this._front,
            e = this[t];
        return this[t] = void 0, this._front = t + 1 & this._capacity - 1, this._length--, e
    }, n.prototype.length = function() {
        return this._length
    }, n.prototype._checkCapacity = function(t) {
        this._capacity < t && this._resizeTo(this._capacity << 1)
    }, n.prototype._resizeTo = function(t) {
        var e = this._capacity;
        this._capacity = t;
        var n = this._front,
            i = this._length,
            o = n + i & e - 1;
        r(this, 0, this, e, o)
    }, t.exports = n
}, function(t, e, r) {
    "use strict";

    function n(t, e) {
        function r(n) {
            return this instanceof r ? (h(this, "message", "string" == typeof n ? n : e), h(this, "name", t), void(Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : Error.call(this))) : new r(n)
        }
        return c(r, Error), r
    }

    function i(t) {
        return this instanceof i ? (h(this, "name", "OperationalError"), h(this, "message", t), this.cause = t, this.isOperational = !0, void(t instanceof Error ? (h(this, "message", t.message), h(this, "stack", t.stack)) : Error.captureStackTrace && Error.captureStackTrace(this, this.constructor))) : new i(t)
    }
    var o, s, a = r(7),
        u = a.freeze,
        f = r(6),
        c = f.inherits,
        h = f.notEnumerableProp,
        l = n("Warning", "warning"),
        p = n("CancellationError", "cancellation error"),
        d = n("TimeoutError", "timeout error"),
        v = n("AggregateError", "aggregate error");
    try {
        o = TypeError, s = RangeError
    } catch (t) {
        o = n("TypeError", "type error"), s = n("RangeError", "range error")
    }
    for (var y = "join pop push shift unshift slice filter forEach some every map indexOf lastIndexOf reduce reduceRight sort reverse".split(" "), g = 0; g < y.length; ++g) "function" == typeof Array.prototype[y[g]] && (v.prototype[y[g]] = Array.prototype[y[g]]);
    a.defineProperty(v.prototype, "length", {
        value: 0,
        configurable: !1,
        writable: !0,
        enumerable: !0
    }), v.prototype.isOperational = !0;
    var _ = 0;
    v.prototype.toString = function() {
        var t = Array(4 * _ + 1).join(" "),
            e = "\n" + t + "AggregateError of:\n";
        _++, t = Array(4 * _ + 1).join(" ");
        for (var r = 0; r < this.length; ++r) {
            for (var n = this[r] === this ? "[Circular AggregateError]" : this[r] + "", i = n.split("\n"), o = 0; o < i.length; ++o) i[o] = t + i[o];
            n = i.join("\n"), e += n + "\n"
        }
        return _--, e
    }, c(i, Error);
    var m = Error.__BluebirdErrorTypes__;
    m || (m = u({
        CancellationError: p,
        TimeoutError: d,
        OperationalError: i,
        RejectionError: i,
        AggregateError: v
    }), a.defineProperty(Error, "__BluebirdErrorTypes__", {
        value: m,
        writable: !1,
        enumerable: !1,
        configurable: !1
    })), t.exports = {
        Error: Error,
        TypeError: o,
        RangeError: s,
        CancellationError: m.CancellationError,
        OperationalError: m.OperationalError,
        TimeoutError: m.TimeoutError,
        AggregateError: m.AggregateError,
        Warning: l
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e) {
        function n(r, n) {
            if (c(r)) {
                if (r instanceof t) return r;
                var i = o(r);
                if (i === f) {
                    n && n._pushContext();
                    var u = t.reject(i.e);
                    return n && n._popContext(), u
                }
                if ("function" == typeof i) {
                    if (s(r)) {
                        var u = new t(e);
                        return r._then(u._fulfill, u._reject, void 0, u, null), u
                    }
                    return a(r, i, n)
                }
            }
            return r
        }

        function i(t) {
            return t.then
        }

        function o(t) {
            try {
                return i(t)
            } catch (t) {
                return f.e = t, f
            }
        }

        function s(t) {
            try {
                return h.call(t, "_promise0")
            } catch (t) {
                return !1
            }
        }

        function a(r, n, i) {
            function o(t) {
                a && (a._resolveCallback(t), a = null)
            }

            function s(t) {
                a && (a._rejectCallback(t, h, !0), a = null)
            }
            var a = new t(e),
                c = a;
            i && i._pushContext(), a._captureStackTrace(), i && i._popContext();
            var h = !0,
                l = u.tryCatch(n).call(r, o, s);
            return h = !1, a && l === f && (a._rejectCallback(l.e, !0, !0), a = null), c
        }
        var u = r(6),
            f = u.errorObj,
            c = u.isObject,
            h = {}.hasOwnProperty;
        return n
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n, i, o) {
        function s(t) {
            switch (t) {
                case -2:
                    return [];
                case -3:
                    return {};
                case -6:
                    return new Map
            }
        }

        function a(r) {
            var n = this._promise = new t(e);
            r instanceof t && n._propagateFrom(r, 3), n._setOnCancel(this), this._values = r, this._length = 0, this._totalResolved = 0, this._init(void 0, -2)
        }
        var u = r(6);
        u.isArray;
        return u.inherits(a, o), a.prototype.length = function() {
            return this._length
        }, a.prototype.promise = function() {
            return this._promise
        }, a.prototype._init = function e(r, o) {
            var a = n(this._values, this._promise);
            if (a instanceof t) {
                a = a._target();
                var f = a._bitField;
                if (this._values = a, 0 === (50397184 & f)) return this._promise._setAsyncGuaranteed(), a._then(e, this._reject, void 0, this, o);
                if (0 === (33554432 & f)) return 0 !== (16777216 & f) ? this._reject(a._reason()) : this._cancel();
                a = a._value()
            }
            if (a = u.asArray(a), null === a) {
                var c = i("expecting an array or an iterable object but got " + u.classString(a)).reason();
                return void this._promise._rejectCallback(c, !1)
            }
            return 0 === a.length ? void(o === -5 ? this._resolveEmptyArray() : this._resolve(s(o))) : void this._iterate(a)
        }, a.prototype._iterate = function(e) {
            var r = this.getActualLength(e.length);
            this._length = r, this._values = this.shouldCopyValues() ? new Array(r) : this._values;
            for (var i = this._promise, o = !1, s = null, a = 0; a < r; ++a) {
                var u = n(e[a], i);
                u instanceof t ? (u = u._target(), s = u._bitField) : s = null, o ? null !== s && u.suppressUnhandledRejections() : null !== s ? 0 === (50397184 & s) ? (u._proxy(this, a), this._values[a] = u) : o = 0 !== (33554432 & s) ? this._promiseFulfilled(u._value(), a) : 0 !== (16777216 & s) ? this._promiseRejected(u._reason(), a) : this._promiseCancelled(a) : o = this._promiseFulfilled(u, a)
            }
            o || i._setAsyncGuaranteed()
        }, a.prototype._isResolved = function() {
            return null === this._values
        }, a.prototype._resolve = function(t) {
            this._values = null, this._promise._fulfill(t)
        }, a.prototype._cancel = function() {
            !this._isResolved() && this._promise._isCancellable() && (this._values = null, this._promise._cancel())
        }, a.prototype._reject = function(t) {
            this._values = null, this._promise._rejectCallback(t, !1)
        }, a.prototype._promiseFulfilled = function(t, e) {
            this._values[e] = t;
            var r = ++this._totalResolved;
            return r >= this._length && (this._resolve(this._values), !0)
        }, a.prototype._promiseCancelled = function() {
            return this._cancel(), !0
        }, a.prototype._promiseRejected = function(t) {
            return this._totalResolved++, this._reject(t), !0
        }, a.prototype._resultCancelled = function() {
            if (!this._isResolved()) {
                var e = this._values;
                if (this._cancel(), e instanceof t) e.cancel();
                else
                    for (var r = 0; r < e.length; ++r) e[r] instanceof t && e[r].cancel()
            }
        }, a.prototype.shouldCopyValues = function() {
            return !0
        }, a.prototype.getActualLength = function(t) {
            return t
        }, a
    }
}, function(t, e) {
    "use strict";
    t.exports = function(t) {
        function e() {
            this._trace = new e.CapturedTrace(n())
        }

        function r() {
            if (i) return new e
        }

        function n() {
            var t = o.length - 1;
            if (t >= 0) return o[t]
        }
        var i = !1,
            o = [];
        return t.prototype._promiseCreated = function() {}, t.prototype._pushContext = function() {}, t.prototype._popContext = function() {
            return null
        }, t._peekContext = t.prototype._peekContext = function() {}, e.prototype._pushContext = function() {
            void 0 !== this._trace && (this._trace._promiseCreated = null, o.push(this._trace))
        }, e.prototype._popContext = function() {
            if (void 0 !== this._trace) {
                var t = o.pop(),
                    e = t._promiseCreated;
                return t._promiseCreated = null, e
            }
            return null
        }, e.CapturedTrace = null, e.create = r, e.deactivateLongStackTraces = function() {}, e.activateLongStackTraces = function() {
            var r = t.prototype._pushContext,
                o = t.prototype._popContext,
                s = t._peekContext,
                a = t.prototype._peekContext,
                u = t.prototype._promiseCreated;
            e.deactivateLongStackTraces = function() {
                t.prototype._pushContext = r, t.prototype._popContext = o, t._peekContext = s, t.prototype._peekContext = a, t.prototype._promiseCreated = u, i = !1
            }, i = !0, t.prototype._pushContext = e.prototype._pushContext, t.prototype._popContext = e.prototype._popContext, t._peekContext = t.prototype._peekContext = n, t.prototype._promiseCreated = function() {
                var t = this._peekContext();
                t && null == t._promiseCreated && (t._promiseCreated = this)
            }
        }, e
    }
}, function(t, e, r) {
    (function(e) {
        "use strict";
        t.exports = function(t, n) {
            function i(t, e) {
                return {
                    promise: e
                }
            }

            function o() {
                return !1
            }

            function s(t, e, r) {
                var n = this;
                try {
                    t(e, r, function(t) {
                        if ("function" != typeof t) throw new TypeError("onCancel must be a function, got: " + N.toString(t));
                        n._attachCancellationCallback(t)
                    })
                } catch (t) {
                    return t
                }
            }

            function a(t) {
                if (!this._isCancellable()) return this;
                var e = this._onCancel();
                void 0 !== e ? N.isArray(e) ? e.push(t) : this._setOnCancel([e, t]) : this._setOnCancel(t)
            }

            function u() {
                return this._onCancelField
            }

            function f(t) {
                this._onCancelField = t
            }

            function c() {
                this._cancellationParent = void 0, this._onCancelField = void 0
            }

            function h(t, e) {
                if (0 !== (1 & e)) {
                    this._cancellationParent = t;
                    var r = t._branchesRemainingToCancel;
                    void 0 === r && (r = 0), t._branchesRemainingToCancel = r + 1
                }
                0 !== (2 & e) && t._isBound() && this._setBoundTo(t._boundTo)
            }

            function l(t, e) {
                0 !== (2 & e) && t._isBound() && this._setBoundTo(t._boundTo)
            }

            function p() {
                var e = this._boundTo;
                return void 0 !== e && e instanceof t ? e.isFulfilled() ? e.value() : void 0 : e
            }

            function d() {
                this._trace = new C(this._peekContext())
            }

            function v(t, e) {
                if (M(t)) {
                    var r = this._trace;
                    if (void 0 !== r && e && (r = r._parent), void 0 !== r) r.attachExtraTrace(t);
                    else if (!t.__stackCleaned__) {
                        var n = T(t);
                        N.notEnumerableProp(t, "stack", n.message + "\n" + n.stack.join("\n")), N.notEnumerableProp(t, "__stackCleaned__", !0)
                    }
                }
            }

            function y(t, e, r, n, i) {
                if (void 0 === t && null !== e && Z) {
                    if (void 0 !== i && i._returnedNonUndefined()) return;
                    if (0 === (65535 & n._bitField)) return;
                    r && (r += " ");
                    var o = "",
                        s = "";
                    if (e._trace) {
                        for (var a = e._trace.stack.split("\n"), u = E(a), f = u.length - 1; f >= 0; --f) {
                            var c = u[f];
                            if (!z.test(c)) {
                                var h = c.match(V);
                                h && (o = "at " + h[1] + ":" + h[2] + ":" + h[3] + " ");
                                break
                            }
                        }
                        if (u.length > 0)
                            for (var l = u[0], f = 0; f < a.length; ++f)
                                if (a[f] === l) {
                                    f > 0 && (s = "\n" + a[f - 1]);
                                    break
                                }
                    }
                    var p = "a promise was created in a " + r + "handler " + o + "but was not returned from it, see http://goo.gl/rRqMUw" + s;
                    n._warn(p, !0, e)
                }
            }

            function g(t, e) {
                var r = t + " is deprecated and will be removed in a future version.";
                return e && (r += " Use " + e + " instead."), _(r)
            }

            function _(e, r, n) {
                if (st.warnings) {
                    var i, o = new D(e);
                    if (r) n._attachExtraTrace(o);
                    else if (st.longStackTraces && (i = t._peekContext())) i.attachExtraTrace(o);
                    else {
                        var s = T(o);
                        o.stack = s.message + "\n" + s.stack.join("\n")
                    }
                    et("warning", o) || B(o, "", !0)
                }
            }

            function m(t, e) {
                for (var r = 0; r < e.length - 1; ++r) e[r].push("From previous event:"), e[r] = e[r].join("\n");
                return r < e.length && (e[r] = e[r].join("\n")), t + "\n" + e.join("\n")
            }

            function b(t) {
                for (var e = 0; e < t.length; ++e)(0 === t[e].length || e + 1 < t.length && t[e][0] === t[e + 1][0]) && (t.splice(e, 1), e--)
            }

            function w(t) {
                for (var e = t[0], r = 1; r < t.length; ++r) {
                    for (var n = t[r], i = e.length - 1, o = e[i], s = -1, a = n.length - 1; a >= 0; --a)
                        if (n[a] === o) {
                            s = a;
                            break
                        }
                    for (var a = s; a >= 0; --a) {
                        var u = n[a];
                        if (e[i] !== u) break;
                        e.pop(), i--
                    }
                    e = n
                }
            }

            function E(t) {
                for (var e = [], r = 0; r < t.length; ++r) {
                    var n = t[r],
                        i = "    (No stack trace)" === n || H.test(n),
                        o = i && nt(n);
                    i && !o && (Y && " " !== n.charAt(0) && (n = "    " + n), e.push(n))
                }
                return e
            }

            function k(t) {
                for (var e = t.stack.replace(/\s+$/g, "").split("\n"), r = 0; r < e.length; ++r) {
                    var n = e[r];
                    if ("    (No stack trace)" === n || H.test(n)) break
                }
                return r > 0 && "SyntaxError" != t.name && (e = e.slice(r)), e
            }

            function T(t) {
                var e = t.stack,
                    r = t.toString();
                return e = "string" == typeof e && e.length > 0 ? k(t) : ["    (No stack trace)"], {
                    message: r,
                    stack: "SyntaxError" == t.name ? e : E(e)
                }
            }

            function B(t, e, r) {
                if ("undefined" != typeof console) {
                    var n;
                    if (N.isObject(t)) {
                        var i = t.stack;
                        n = e + W(i, t)
                    } else n = e + String(t);
                    "function" == typeof U ? U(n, r) : "function" != typeof console.log && "object" != typeof console.log || console.log(n)
                }
            }

            function S(t, e, r, n) {
                var i = !1;
                try {
                    "function" == typeof e && (i = !0, "rejectionHandled" === t ? e(n) : e(r, n))
                } catch (t) {
                    P.throwLater(t)
                }
                "unhandledRejection" === t ? et(t, r, n) || i || B(r, "Unhandled rejection ") : et(t, n)
            }

            function x(t) {
                var e;
                if ("function" == typeof t) e = "[function " + (t.name || "anonymous") + "]";
                else {
                    e = t && "function" == typeof t.toString ? t.toString() : N.toString(t);
                    var r = /\[object [a-zA-Z0-9$_]+\]/;
                    if (r.test(e)) try {
                        var n = JSON.stringify(t);
                        e = n
                    } catch (t) {}
                    0 === e.length && (e = "(empty array)")
                }
                return "(<" + A(e) + ">, no stack trace)"
            }

            function A(t) {
                var e = 41;
                return t.length < e ? t : t.substr(0, e - 3) + "..."
            }

            function I() {
                return "function" == typeof ot
            }

            function O(t) {
                var e = t.match(it);
                if (e) return {
                    fileName: e[1],
                    line: parseInt(e[2], 10)
                }
            }

            function j(t, e) {
                if (I()) {
                    for (var r, n, i = t.stack.split("\n"), o = e.stack.split("\n"), s = -1, a = -1, u = 0; u < i.length; ++u) {
                        var f = O(i[u]);
                        if (f) {
                            r = f.fileName, s = f.line;
                            break
                        }
                    }
                    for (var u = 0; u < o.length; ++u) {
                        var f = O(o[u]);
                        if (f) {
                            n = f.fileName, a = f.line;
                            break
                        }
                    }
                    s < 0 || a < 0 || !r || !n || r !== n || s >= a || (nt = function(t) {
                        if (q.test(t)) return !0;
                        var e = O(t);
                        return !!(e && e.fileName === r && s <= e.line && e.line <= a)
                    })
                }
            }

            function C(t) {
                this._parent = t, this._promisesCreated = 0;
                var e = this._length = 1 + (void 0 === t ? 0 : t._length);
                ot(this, C), e > 32 && this.uncycle()
            }
            var R, L, U, F = t._getDomain,
                P = t._async,
                D = r(13).Warning,
                N = r(6),
                M = N.canAttachTrace,
                q = /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/,
                z = /\((?:timers\.js):\d+:\d+\)/,
                V = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/,
                H = null,
                W = null,
                Y = !1,
                G = !(0 == N.env("BLUEBIRD_DEBUG") || !N.env("BLUEBIRD_DEBUG") && "development" !== N.env("NODE_ENV")),
                $ = !(0 == N.env("BLUEBIRD_WARNINGS") || !G && !N.env("BLUEBIRD_WARNINGS")),
                X = !(0 == N.env("BLUEBIRD_LONG_STACK_TRACES") || !G && !N.env("BLUEBIRD_LONG_STACK_TRACES")),
                Z = 0 != N.env("BLUEBIRD_W_FORGOTTEN_RETURN") && ($ || !!N.env("BLUEBIRD_W_FORGOTTEN_RETURN"));
            t.prototype.suppressUnhandledRejections = function() {
                var t = this._target();
                t._bitField = t._bitField & -1048577 | 524288
            }, t.prototype._ensurePossibleRejectionHandled = function() {
                0 === (524288 & this._bitField) && (this._setRejectionIsUnhandled(), P.invokeLater(this._notifyUnhandledRejection, this, void 0))
            }, t.prototype._notifyUnhandledRejectionIsHandled = function() {
                S("rejectionHandled", R, void 0, this)
            }, t.prototype._setReturnedNonUndefined = function() {
                this._bitField = 268435456 | this._bitField
            }, t.prototype._returnedNonUndefined = function() {
                return 0 !== (268435456 & this._bitField)
            }, t.prototype._notifyUnhandledRejection = function() {
                if (this._isRejectionUnhandled()) {
                    var t = this._settledValue();
                    this._setUnhandledRejectionIsNotified(), S("unhandledRejection", L, t, this)
                }
            }, t.prototype._setUnhandledRejectionIsNotified = function() {
                this._bitField = 262144 | this._bitField
            }, t.prototype._unsetUnhandledRejectionIsNotified = function() {
                this._bitField = this._bitField & -262145
            }, t.prototype._isUnhandledRejectionNotified = function() {
                return (262144 & this._bitField) > 0
            }, t.prototype._setRejectionIsUnhandled = function() {
                this._bitField = 1048576 | this._bitField
            }, t.prototype._unsetRejectionIsUnhandled = function() {
                this._bitField = this._bitField & -1048577, this._isUnhandledRejectionNotified() && (this._unsetUnhandledRejectionIsNotified(), this._notifyUnhandledRejectionIsHandled())
            }, t.prototype._isRejectionUnhandled = function() {
                return (1048576 & this._bitField) > 0
            }, t.prototype._warn = function(t, e, r) {
                return _(t, e, r || this)
            }, t.onPossiblyUnhandledRejection = function(t) {
                var e = F();
                L = "function" == typeof t ? null === e ? t : N.domainBind(e, t) : void 0
            }, t.onUnhandledRejectionHandled = function(t) {
                var e = F();
                R = "function" == typeof t ? null === e ? t : N.domainBind(e, t) : void 0
            };
            var K = function() {};
            t.longStackTraces = function() {
                if (P.haveItemsQueued() && !st.longStackTraces) throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");
                if (!st.longStackTraces && I()) {
                    var e = t.prototype._captureStackTrace,
                        r = t.prototype._attachExtraTrace;
                    st.longStackTraces = !0, K = function() {
                        if (P.haveItemsQueued() && !st.longStackTraces) throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");
                        t.prototype._captureStackTrace = e, t.prototype._attachExtraTrace = r, n.deactivateLongStackTraces(), P.enableTrampoline(), st.longStackTraces = !1
                    }, t.prototype._captureStackTrace = d, t.prototype._attachExtraTrace = v, n.activateLongStackTraces(), P.disableTrampolineIfNecessary()
                }
            }, t.hasLongStackTraces = function() {
                return st.longStackTraces && I()
            };
            var Q = function() {
                    try {
                        if ("function" == typeof CustomEvent) {
                            var t = new CustomEvent("CustomEvent");
                            return N.global.dispatchEvent(t),
                                function(t, e) {
                                    var r = new CustomEvent(t.toLowerCase(), {
                                        detail: e,
                                        cancelable: !0
                                    });
                                    return !N.global.dispatchEvent(r)
                                }
                        }
                        if ("function" == typeof Event) {
                            var t = new Event("CustomEvent");
                            return N.global.dispatchEvent(t),
                                function(t, e) {
                                    var r = new Event(t.toLowerCase(), {
                                        cancelable: !0
                                    });
                                    return r.detail = e, !N.global.dispatchEvent(r)
                                }
                        }
                        var t = document.createEvent("CustomEvent");
                        return t.initCustomEvent("testingtheevent", !1, !0, {}), N.global.dispatchEvent(t),
                            function(t, e) {
                                var r = document.createEvent("CustomEvent");
                                return r.initCustomEvent(t.toLowerCase(), !1, !0, e), !N.global.dispatchEvent(r)
                            }
                    } catch (t) {}
                    return function() {
                        return !1
                    }
                }(),
                J = function() {
                    return N.isNode ? function() {
                        return e.emit.apply(e, arguments)
                    } : N.global ? function(t) {
                        var e = "on" + t.toLowerCase(),
                            r = N.global[e];
                        return !!r && (r.apply(N.global, [].slice.call(arguments, 1)), !0)
                    } : function() {
                        return !1
                    }
                }(),
                tt = {
                    promiseCreated: i,
                    promiseFulfilled: i,
                    promiseRejected: i,
                    promiseResolved: i,
                    promiseCancelled: i,
                    promiseChained: function(t, e, r) {
                        return {
                            promise: e,
                            child: r
                        }
                    },
                    warning: function(t, e) {
                        return {
                            warning: e
                        }
                    },
                    unhandledRejection: function(t, e, r) {
                        return {
                            reason: e,
                            promise: r
                        }
                    },
                    rejectionHandled: i
                },
                et = function(t) {
                    var e = !1;
                    try {
                        e = J.apply(null, arguments)
                    } catch (t) {
                        P.throwLater(t), e = !0
                    }
                    var r = !1;
                    try {
                        r = Q(t, tt[t].apply(null, arguments))
                    } catch (t) {
                        P.throwLater(t), r = !0
                    }
                    return r || e
                };
            t.config = function(e) {
                if (e = Object(e), "longStackTraces" in e && (e.longStackTraces ? t.longStackTraces() : !e.longStackTraces && t.hasLongStackTraces() && K()), "warnings" in e) {
                    var r = e.warnings;
                    st.warnings = !!r, Z = st.warnings, N.isObject(r) && "wForgottenReturn" in r && (Z = !!r.wForgottenReturn)
                }
                if ("cancellation" in e && e.cancellation && !st.cancellation) {
                    if (P.haveItemsQueued()) throw new Error("cannot enable cancellation after promises are in use");
                    t.prototype._clearCancellationData = c, t.prototype._propagateFrom = h, t.prototype._onCancel = u, t.prototype._setOnCancel = f, t.prototype._attachCancellationCallback = a, t.prototype._execute = s, rt = h, st.cancellation = !0
                }
                return "monitoring" in e && (e.monitoring && !st.monitoring ? (st.monitoring = !0, t.prototype._fireEvent = et) : !e.monitoring && st.monitoring && (st.monitoring = !1, t.prototype._fireEvent = o)), t
            }, t.prototype._fireEvent = o, t.prototype._execute = function(t, e, r) {
                try {
                    t(e, r)
                } catch (t) {
                    return t
                }
            }, t.prototype._onCancel = function() {}, t.prototype._setOnCancel = function(t) {}, t.prototype._attachCancellationCallback = function(t) {}, t.prototype._captureStackTrace = function() {}, t.prototype._attachExtraTrace = function() {}, t.prototype._clearCancellationData = function() {}, t.prototype._propagateFrom = function(t, e) {};
            var rt = l,
                nt = function() {
                    return !1
                },
                it = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
            N.inherits(C, Error), n.CapturedTrace = C, C.prototype.uncycle = function() {
                var t = this._length;
                if (!(t < 2)) {
                    for (var e = [], r = {}, n = 0, i = this; void 0 !== i; ++n) e.push(i), i = i._parent;
                    t = this._length = n;
                    for (var n = t - 1; n >= 0; --n) {
                        var o = e[n].stack;
                        void 0 === r[o] && (r[o] = n)
                    }
                    for (var n = 0; n < t; ++n) {
                        var s = e[n].stack,
                            a = r[s];
                        if (void 0 !== a && a !== n) {
                            a > 0 && (e[a - 1]._parent = void 0, e[a - 1]._length = 1), e[n]._parent = void 0, e[n]._length = 1;
                            var u = n > 0 ? e[n - 1] : this;
                            a < t - 1 ? (u._parent = e[a + 1], u._parent.uncycle(), u._length = u._parent._length + 1) : (u._parent = void 0, u._length = 1);
                            for (var f = u._length + 1, c = n - 2; c >= 0; --c) e[c]._length = f, f++;
                            return
                        }
                    }
                }
            }, C.prototype.attachExtraTrace = function(t) {
                if (!t.__stackCleaned__) {
                    this.uncycle();
                    for (var e = T(t), r = e.message, n = [e.stack], i = this; void 0 !== i;) n.push(E(i.stack.split("\n"))), i = i._parent;
                    w(n), b(n), N.notEnumerableProp(t, "stack", m(r, n)), N.notEnumerableProp(t, "__stackCleaned__", !0)
                }
            };
            var ot = function() {
                var t = /^\s*at\s*/,
                    e = function(t, e) {
                        return "string" == typeof t ? t : void 0 !== e.name && void 0 !== e.message ? e.toString() : x(e)
                    };
                if ("number" == typeof Error.stackTraceLimit && "function" == typeof Error.captureStackTrace) {
                    Error.stackTraceLimit += 6, H = t, W = e;
                    var r = Error.captureStackTrace;
                    return nt = function(t) {
                            return q.test(t)
                        },
                        function(t, e) {
                            Error.stackTraceLimit += 6, r(t, e), Error.stackTraceLimit -= 6
                        }
                }
                var n = new Error;
                if ("string" == typeof n.stack && n.stack.split("\n")[0].indexOf("stackDetection@") >= 0) return H = /@/, W = e, Y = !0,
                    function(t) {
                        t.stack = (new Error).stack
                    };
                var i;
                try {
                    throw new Error
                } catch (t) {
                    i = "stack" in t
                }
                return "stack" in n || !i || "number" != typeof Error.stackTraceLimit ? (W = function(t, e) {
                    return "string" == typeof t ? t : "object" != typeof e && "function" != typeof e || void 0 === e.name || void 0 === e.message ? x(e) : e.toString()
                }, null) : (H = t, W = e, function(t) {
                    Error.stackTraceLimit += 6;
                    try {
                        throw new Error
                    } catch (e) {
                        t.stack = e.stack
                    }
                    Error.stackTraceLimit -= 6
                })
            }([]);
            "undefined" != typeof console && "undefined" != typeof console.warn && (U = function(t) {
                console.warn(t)
            }, N.isNode && e.stderr.isTTY ? U = function(t, e) {
                var r = e ? "[33m" : "[31m";
                console.warn(r + t + "[0m\n")
            } : N.isNode || "string" != typeof(new Error).stack || (U = function(t, e) {
                console.warn("%c" + t, e ? "color: darkorange" : "color: red")
            }));
            var st = {
                warnings: $,
                longStackTraces: !1,
                cancellation: !1,
                monitoring: !1
            };
            return X && t.longStackTraces(), {
                longStackTraces: function() {
                    return st.longStackTraces
                },
                warnings: function() {
                    return st.warnings
                },
                cancellation: function() {
                    return st.cancellation
                },
                monitoring: function() {
                    return st.monitoring
                },
                propagateFromFunction: function() {
                    return rt
                },
                boundValueFunction: function() {
                    return p
                },
                checkForgottenReturns: y,
                setBounds: j,
                warn: _,
                deprecated: g,
                CapturedTrace: C,
                fireDomEvent: Q,
                fireGlobalEvent: J
            }
        }
    }).call(e, r(5))
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n) {
        function i(t, e, r) {
            this.promise = t, this.type = e, this.handler = r, this.called = !1, this.cancelPromise = null
        }

        function o(t) {
            this.finallyHandler = t
        }

        function s(t, e) {
            return null != t.cancelPromise && (arguments.length > 1 ? t.cancelPromise._reject(e) : t.cancelPromise._cancel(), t.cancelPromise = null, !0)
        }

        function a() {
            return f.call(this, this.promise._target()._settledValue())
        }

        function u(t) {
            if (!s(this, t)) return l.e = t, l
        }

        function f(r) {
            var i = this.promise,
                f = this.handler;
            if (!this.called) {
                this.called = !0;
                var c = this.isFinallyHandler() ? f.call(i._boundValue()) : f.call(i._boundValue(), r);
                if (c === n) return c;
                if (void 0 !== c) {
                    i._setReturnedNonUndefined();
                    var p = e(c, i);
                    if (p instanceof t) {
                        if (null != this.cancelPromise) {
                            if (p._isCancelled()) {
                                var d = new h("late cancellation observer");
                                return i._attachExtraTrace(d), l.e = d, l
                            }
                            p.isPending() && p._attachCancellationCallback(new o(this))
                        }
                        return p._then(a, u, void 0, this, void 0)
                    }
                }
            }
            return i.isRejected() ? (s(this), l.e = r, l) : (s(this), r)
        }
        var c = r(6),
            h = t.CancellationError,
            l = c.errorObj,
            p = r(19)(n);
        return i.prototype.isFinallyHandler = function() {
            return 0 === this.type
        }, o.prototype._resultCancelled = function() {
            s(this.finallyHandler)
        }, t.prototype._passThrough = function(t, e, r, n) {
            return "function" != typeof t ? this.then() : this._then(r, n, void 0, new i(this, e, t), void 0)
        }, t.prototype.lastly = t.prototype.finally = function(t) {
            return this._passThrough(t, 0, f, f)
        }, t.prototype.tap = function(t) {
            return this._passThrough(t, 1, f)
        }, t.prototype.tapCatch = function(e) {
            var r = arguments.length;
            if (1 === r) return this._passThrough(e, 1, void 0, f);
            var n, i = new Array(r - 1),
                o = 0;
            for (n = 0; n < r - 1; ++n) {
                var s = arguments[n];
                if (!c.isObject(s)) return t.reject(new TypeError("tapCatch statement predicate: expecting an object but got " + c.classString(s)));
                i[o++] = s
            }
            i.length = o;
            var a = arguments[n];
            return this._passThrough(p(i, a, this), 1, void 0, f)
        }, i
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t) {
        function e(e, r, a) {
            return function(u) {
                var f = a._boundValue();
                t: for (var c = 0; c < e.length; ++c) {
                    var h = e[c];
                    if (h === Error || null != h && h.prototype instanceof Error) {
                        if (u instanceof h) return o(r).call(f, u)
                    } else if ("function" == typeof h) {
                        var l = o(h).call(f, u);
                        if (l === s) return l;
                        if (l) return o(r).call(f, u)
                    } else if (n.isObject(u)) {
                        for (var p = i(h), d = 0; d < p.length; ++d) {
                            var v = p[d];
                            if (h[v] != u[v]) continue t
                        }
                        return o(r).call(f, u)
                    }
                }
                return t
            }
        }
        var n = r(6),
            i = r(7).keys,
            o = n.tryCatch,
            s = n.errorObj;
        return e
    }
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t instanceof Error && c.getPrototypeOf(t) === Error.prototype
    }

    function i(t) {
        var e;
        if (n(t)) {
            e = new f(t), e.name = t.name, e.message = t.message, e.stack = t.stack;
            for (var r = c.keys(t), i = 0; i < r.length; ++i) {
                var o = r[i];
                h.test(o) || (e[o] = t[o])
            }
            return e
        }
        return s.markAsOriginatingFromRejection(t), t
    }

    function o(t, e) {
        return function(r, n) {
            if (null !== t) {
                if (r) {
                    var o = i(a(r));
                    t._attachExtraTrace(o), t._reject(o)
                } else if (e) {
                    for (var s = arguments.length, u = new Array(Math.max(s - 1, 0)), f = 1; f < s; ++f) u[f - 1] = arguments[f];
                    t._fulfill(u)
                } else t._fulfill(n);
                t = null
            }
        }
    }
    var s = r(6),
        a = s.maybeWrapAsError,
        u = r(13),
        f = u.OperationalError,
        c = r(7),
        h = /^(?:name|message|stack|cause)$/;
    t.exports = o
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n, i, o) {
        var s = r(6),
            a = s.tryCatch;
        t.method = function(r) {
            if ("function" != typeof r) throw new t.TypeError("expecting a function but got " + s.classString(r));
            return function() {
                var n = new t(e);
                n._captureStackTrace(), n._pushContext();
                var i = a(r).apply(this, arguments),
                    s = n._popContext();
                return o.checkForgottenReturns(i, s, "Promise.method", n), n._resolveFromSyncValue(i), n
            }
        }, t.attempt = t.try = function(r) {
            if ("function" != typeof r) return i("expecting a function but got " + s.classString(r));
            var n = new t(e);
            n._captureStackTrace(), n._pushContext();
            var u;
            if (arguments.length > 1) {
                o.deprecated("calling Promise.try with more than 1 argument");
                var f = arguments[1],
                    c = arguments[2];
                u = s.isArray(f) ? a(r).apply(c, f) : a(r).call(c, f)
            } else u = a(r)();
            var h = n._popContext();
            return o.checkForgottenReturns(u, h, "Promise.try", n), n._resolveFromSyncValue(u), n
        }, t.prototype._resolveFromSyncValue = function(t) {
            t === s.errorObj ? this._rejectCallback(t.e, !1) : this._resolveCallback(t, !0)
        }
    }
}, function(t, e) {
    "use strict";
    t.exports = function(t, e, r, n) {
        var i = !1,
            o = function(t, e) {
                this._reject(e)
            },
            s = function(t, e) {
                e.promiseRejectionQueued = !0, e.bindingPromise._then(o, o, null, this, t)
            },
            a = function(t, e) {
                0 === (50397184 & this._bitField) && this._resolveCallback(e.target)
            },
            u = function(t, e) {
                e.promiseRejectionQueued || this._reject(t)
            };
        t.prototype.bind = function(o) {
            i || (i = !0, t.prototype._propagateFrom = n.propagateFromFunction(), t.prototype._boundValue = n.boundValueFunction());
            var f = r(o),
                c = new t(e);
            c._propagateFrom(this, 1);
            var h = this._target();
            if (c._setBoundTo(f), f instanceof t) {
                var l = {
                    promiseRejectionQueued: !1,
                    promise: c,
                    target: h,
                    bindingPromise: f
                };
                h._then(e, s, void 0, c, l), f._then(a, u, void 0, c, l), c._setOnCancel(f)
            } else c._resolveCallback(h);
            return c
        }, t.prototype._setBoundTo = function(t) {
            void 0 !== t ? (this._bitField = 2097152 | this._bitField, this._boundTo = t) : this._bitField = this._bitField & -2097153
        }, t.prototype._isBound = function() {
            return 2097152 === (2097152 & this._bitField)
        }, t.bind = function(e, r) {
            return t.resolve(r).bind(e)
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n, i) {
        var o = r(6),
            s = o.tryCatch,
            a = o.errorObj,
            u = t._async;
        t.prototype.break = t.prototype.cancel = function() {
            if (!i.cancellation()) return this._warn("cancellation is disabled");
            for (var t = this, e = t; t._isCancellable();) {
                if (!t._cancelBy(e)) {
                    e._isFollowing() ? e._followee().cancel() : e._cancelBranched();
                    break
                }
                var r = t._cancellationParent;
                if (null == r || !r._isCancellable()) {
                    t._isFollowing() ? t._followee().cancel() : t._cancelBranched();
                    break
                }
                t._isFollowing() && t._followee().cancel(), t._setWillBeCancelled(), e = t, t = r
            }
        }, t.prototype._branchHasCancelled = function() {
            this._branchesRemainingToCancel--
        }, t.prototype._enoughBranchesHaveCancelled = function() {
            return void 0 === this._branchesRemainingToCancel || this._branchesRemainingToCancel <= 0
        }, t.prototype._cancelBy = function(t) {
            return t === this ? (this._branchesRemainingToCancel = 0, this._invokeOnCancel(), !0) : (this._branchHasCancelled(), !!this._enoughBranchesHaveCancelled() && (this._invokeOnCancel(), !0))
        }, t.prototype._cancelBranched = function() {
            this._enoughBranchesHaveCancelled() && this._cancel()
        }, t.prototype._cancel = function() {
            this._isCancellable() && (this._setCancelled(), u.invoke(this._cancelPromises, this, void 0))
        }, t.prototype._cancelPromises = function() {
            this._length() > 0 && this._settlePromises()
        }, t.prototype._unsetOnCancel = function() {
            this._onCancelField = void 0
        }, t.prototype._isCancellable = function() {
            return this.isPending() && !this._isCancelled()
        }, t.prototype.isCancellable = function() {
            return this.isPending() && !this.isCancelled()
        }, t.prototype._doInvokeOnCancel = function(t, e) {
            if (o.isArray(t))
                for (var r = 0; r < t.length; ++r) this._doInvokeOnCancel(t[r], e);
            else if (void 0 !== t)
                if ("function" == typeof t) {
                    if (!e) {
                        var n = s(t).call(this._boundValue());
                        n === a && (this._attachExtraTrace(n.e), u.throwLater(n.e))
                    }
                } else t._resultCancelled(this)
        }, t.prototype._invokeOnCancel = function() {
            var t = this._onCancel();
            this._unsetOnCancel(), u.invoke(this._doInvokeOnCancel, this, t)
        }, t.prototype._invokeInternalOnCancel = function() {
            this._isCancellable() && (this._doInvokeOnCancel(this._onCancel(), !0), this._unsetOnCancel())
        }, t.prototype._resultCancelled = function() {
            this.cancel()
        }
    }
}, function(t, e) {
    "use strict";
    t.exports = function(t) {
        function e() {
            return this.value
        }

        function r() {
            throw this.reason
        }
        t.prototype.return = t.prototype.thenReturn = function(r) {
            return r instanceof t && r.suppressUnhandledRejections(), this._then(e, void 0, void 0, {
                value: r
            }, void 0)
        }, t.prototype.throw = t.prototype.thenThrow = function(t) {
            return this._then(r, void 0, void 0, {
                reason: t
            }, void 0)
        }, t.prototype.catchThrow = function(t) {
            if (arguments.length <= 1) return this._then(void 0, r, void 0, {
                reason: t
            }, void 0);
            var e = arguments[1],
                n = function() {
                    throw e
                };
            return this.caught(t, n)
        }, t.prototype.catchReturn = function(r) {
            if (arguments.length <= 1) return r instanceof t && r.suppressUnhandledRejections(), this._then(void 0, e, void 0, {
                value: r
            }, void 0);
            var n = arguments[1];
            n instanceof t && n.suppressUnhandledRejections();
            var i = function() {
                return n
            };
            return this.caught(r, i)
        }
    }
}, function(t, e) {
    "use strict";
    t.exports = function(t) {
        function e(t) {
            void 0 !== t ? (t = t._target(), this._bitField = t._bitField, this._settledValueField = t._isFateSealed() ? t._settledValue() : void 0) : (this._bitField = 0, this._settledValueField = void 0)
        }
        e.prototype._settledValue = function() {
            return this._settledValueField
        };
        var r = e.prototype.value = function() {
                if (!this.isFulfilled()) throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/MqrFmX\n");
                return this._settledValue()
            },
            n = e.prototype.error = e.prototype.reason = function() {
                if (!this.isRejected()) throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/MqrFmX\n");
                return this._settledValue()
            },
            i = e.prototype.isFulfilled = function() {
                return 0 !== (33554432 & this._bitField)
            },
            o = e.prototype.isRejected = function() {
                return 0 !== (16777216 & this._bitField)
            },
            s = e.prototype.isPending = function() {
                return 0 === (50397184 & this._bitField)
            },
            a = e.prototype.isResolved = function() {
                return 0 !== (50331648 & this._bitField)
            };
        e.prototype.isCancelled = function() {
            return 0 !== (8454144 & this._bitField)
        }, t.prototype.__isCancelled = function() {
            return 65536 === (65536 & this._bitField)
        }, t.prototype._isCancelled = function() {
            return this._target().__isCancelled()
        }, t.prototype.isCancelled = function() {
            return 0 !== (8454144 & this._target()._bitField)
        }, t.prototype.isPending = function() {
            return s.call(this._target())
        }, t.prototype.isRejected = function() {
            return o.call(this._target())
        }, t.prototype.isFulfilled = function() {
            return i.call(this._target())
        }, t.prototype.isResolved = function() {
            return a.call(this._target())
        }, t.prototype.value = function() {
            return r.call(this._target())
        }, t.prototype.reason = function() {
            var t = this._target();
            return t._unsetRejectionIsUnhandled(), n.call(t)
        }, t.prototype._value = function() {
            return this._settledValue()
        }, t.prototype._reason = function() {
            return this._unsetRejectionIsUnhandled(), this._settledValue()
        }, t.PromiseInspection = e
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n, i, o, s) {
        var a, u = r(6),
            f = u.canEvaluate,
            c = u.tryCatch,
            h = u.errorObj;
        if (f) {
            for (var l = function(t) {
                    return new Function("value", "holder", "                             \n\t            'use strict';                                                    \n\t            holder.pIndex = value;                                           \n\t            holder.checkFulfillment(this);                                   \n\t            ".replace(/Index/g, t))
                }, p = function(t) {
                    return new Function("promise", "holder", "                           \n\t            'use strict';                                                    \n\t            holder.pIndex = promise;                                         \n\t            ".replace(/Index/g, t))
                }, d = function(e) {
                    for (var r = new Array(e), n = 0; n < r.length; ++n) r[n] = "this.p" + (n + 1);
                    var i = r.join(" = ") + " = null;",
                        s = "var promise;\n" + r.map(function(t) {
                            return "                                                         \n\t                promise = " + t + ";                                      \n\t                if (promise instanceof Promise) {                            \n\t                    promise.cancel();                                        \n\t                }                                                            \n\t            "
                        }).join("\n"),
                        a = r.join(", "),
                        u = "Holder$" + e,
                        f = "return function(tryCatch, errorObj, Promise, async) {    \n\t            'use strict';                                                    \n\t            function [TheName](fn) {                                         \n\t                [TheProperties]                                              \n\t                this.fn = fn;                                                \n\t                this.asyncNeeded = true;                                     \n\t                this.now = 0;                                                \n\t            }                                                                \n\t                                                                             \n\t            [TheName].prototype._callFunction = function(promise) {          \n\t                promise._pushContext();                                      \n\t                var ret = tryCatch(this.fn)([ThePassedArguments]);           \n\t                promise._popContext();                                       \n\t                if (ret === errorObj) {                                      \n\t                    promise._rejectCallback(ret.e, false);                   \n\t                } else {                                                     \n\t                    promise._resolveCallback(ret);                           \n\t                }                                                            \n\t            };                                                               \n\t                                                                             \n\t            [TheName].prototype.checkFulfillment = function(promise) {       \n\t                var now = ++this.now;                                        \n\t                if (now === [TheTotal]) {                                    \n\t                    if (this.asyncNeeded) {                                  \n\t                        async.invoke(this._callFunction, this, promise);     \n\t                    } else {                                                 \n\t                        this._callFunction(promise);                         \n\t                    }                                                        \n\t                                                                             \n\t                }                                                            \n\t            };                                                               \n\t                                                                             \n\t            [TheName].prototype._resultCancelled = function() {              \n\t                [CancellationCode]                                           \n\t            };                                                               \n\t                                                                             \n\t            return [TheName];                                                \n\t        }(tryCatch, errorObj, Promise, async);                               \n\t        ";
                    return f = f.replace(/\[TheName\]/g, u).replace(/\[TheTotal\]/g, e).replace(/\[ThePassedArguments\]/g, a).replace(/\[TheProperties\]/g, i).replace(/\[CancellationCode\]/g, s), new Function("tryCatch", "errorObj", "Promise", "async", f)(c, h, t, o)
                }, v = [], y = [], g = [], _ = 0; _ < 8; ++_) v.push(d(_ + 1)), y.push(l(_ + 1)), g.push(p(_ + 1));
            a = function(t) {
                this._reject(t)
            }
        }
        t.join = function() {
            var r, o = arguments.length - 1;
            if (o > 0 && "function" == typeof arguments[o] && (r = arguments[o], o <= 8 && f)) {
                var c = new t(i);
                c._captureStackTrace();
                for (var h = v[o - 1], l = new h(r), p = y, d = 0; d < o; ++d) {
                    var _ = n(arguments[d], c);
                    if (_ instanceof t) {
                        _ = _._target();
                        var m = _._bitField;
                        0 === (50397184 & m) ? (_._then(p[d], a, void 0, c, l), g[d](_, l), l.asyncNeeded = !1) : 0 !== (33554432 & m) ? p[d].call(c, _._value(), l) : 0 !== (16777216 & m) ? c._reject(_._reason()) : c._cancel()
                    } else p[d].call(c, _, l)
                }
                if (!c._isFateSealed()) {
                    if (l.asyncNeeded) {
                        var b = s();
                        null !== b && (l.fn = u.domainBind(b, l.fn))
                    }
                    c._setAsyncGuaranteed(), c._setOnCancel(l)
                }
                return c
            }
            for (var w = arguments.length, E = new Array(w), k = 0; k < w; ++k) E[k] = arguments[k];
            r && E.pop();
            var c = new e(E).promise();
            return void 0 !== r ? c.spread(r) : c
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n, i, o, s) {
        function a(t, e, r, n) {
            this.constructor$(t), this._promise._captureStackTrace();
            var i = f();
            this._callback = null === i ? e : c.domainBind(i, e), this._preservedValues = n === o ? new Array(this.length()) : null, this._limit = r, this._inFlight = 0, this._queue = [], p.invoke(this._asyncInit, this, void 0)
        }

        function u(e, r, i, o) {
            if ("function" != typeof r) return n("expecting a function but got " + c.classString(r));
            var s = 0;
            if (void 0 !== i) {
                if ("object" != typeof i || null === i) return t.reject(new TypeError("options argument must be an object but it is " + c.classString(i)));
                if ("number" != typeof i.concurrency) return t.reject(new TypeError("'concurrency' must be a number but it is " + c.classString(i.concurrency)));
                s = i.concurrency
            }
            return s = "number" == typeof s && isFinite(s) && s >= 1 ? s : 0, new a(e, r, s, o).promise()
        }
        var f = t._getDomain,
            c = r(6),
            h = c.tryCatch,
            l = c.errorObj,
            p = t._async;
        c.inherits(a, e), a.prototype._asyncInit = function() {
            this._init$(void 0, -2)
        }, a.prototype._init = function() {}, a.prototype._promiseFulfilled = function(e, r) {
            var n = this._values,
                o = this.length(),
                a = this._preservedValues,
                u = this._limit;
            if (r < 0) {
                if (r = r * -1 - 1, n[r] = e, u >= 1 && (this._inFlight--, this._drainQueue(), this._isResolved())) return !0
            } else {
                if (u >= 1 && this._inFlight >= u) return n[r] = e, this._queue.push(r), !1;
                null !== a && (a[r] = e);
                var f = this._promise,
                    c = this._callback,
                    p = f._boundValue();
                f._pushContext();
                var d = h(c).call(p, e, r, o),
                    v = f._popContext();
                if (s.checkForgottenReturns(d, v, null !== a ? "Promise.filter" : "Promise.map", f), d === l) return this._reject(d.e), !0;
                var y = i(d, this._promise);
                if (y instanceof t) {
                    y = y._target();
                    var g = y._bitField;
                    if (0 === (50397184 & g)) return u >= 1 && this._inFlight++, n[r] = y, y._proxy(this, (r + 1) * -1), !1;
                    if (0 === (33554432 & g)) return 0 !== (16777216 & g) ? (this._reject(y._reason()), !0) : (this._cancel(), !0);
                    d = y._value()
                }
                n[r] = d
            }
            var _ = ++this._totalResolved;
            return _ >= o && (null !== a ? this._filter(n, a) : this._resolve(n), !0)
        }, a.prototype._drainQueue = function() {
            for (var t = this._queue, e = this._limit, r = this._values; t.length > 0 && this._inFlight < e;) {
                if (this._isResolved()) return;
                var n = t.pop();
                this._promiseFulfilled(r[n], n)
            }
        }, a.prototype._filter = function(t, e) {
            for (var r = e.length, n = new Array(r), i = 0, o = 0; o < r; ++o) t[o] && (n[i++] = e[o]);
            n.length = i, this._resolve(n)
        }, a.prototype.preservedValues = function() {
            return this._preservedValues
        }, t.prototype.map = function(t, e) {
            return u(this, t, e, null)
        }, t.map = function(t, e, r, n) {
            return u(t, e, r, n)
        }
    }
}, function(t, e, r) {
    "use strict";
    var n = Object.create;
    if (n) {
        var i = n(null),
            o = n(null);
        i[" size"] = o[" size"] = 0
    }
    t.exports = function(t) {
        function e(e, r) {
            var n;
            if (null != e && (n = e[r]), "function" != typeof n) {
                var i = "Object " + c.classString(e) + " has no method '" + c.toString(r) + "'";
                throw new t.TypeError(i)
            }
            return n
        }

        function n(t) {
            var r = this.pop(),
                n = e(t, r);
            return n.apply(t, this)
        }

        function s(t) {
            return t[this]
        }

        function a(t) {
            var e = +this;
            return e < 0 && (e = Math.max(0, e + t.length)), t[e]
        }
        var u, f, c = r(6),
            h = c.canEvaluate,
            l = c.isIdentifier,
            p = function(t) {
                return new Function("ensureMethod", "                                    \n\t        return function(obj) {                                               \n\t            'use strict'                                                     \n\t            var len = this.length;                                           \n\t            ensureMethod(obj, 'methodName');                                 \n\t            switch(len) {                                                    \n\t                case 1: return obj.methodName(this[0]);                      \n\t                case 2: return obj.methodName(this[0], this[1]);             \n\t                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\t                case 0: return obj.methodName();                             \n\t                default:                                                     \n\t                    return obj.methodName.apply(obj, this);                  \n\t            }                                                                \n\t        };                                                                   \n\t        ".replace(/methodName/g, t))(e)
            },
            d = function(t) {
                return new Function("obj", "                                             \n\t        'use strict';                                                        \n\t        return obj.propertyName;                                             \n\t        ".replace("propertyName", t))
            },
            v = function(t, e, r) {
                var n = r[t];
                if ("function" != typeof n) {
                    if (!l(t)) return null;
                    if (n = e(t), r[t] = n, r[" size"]++, r[" size"] > 512) {
                        for (var i = Object.keys(r), o = 0; o < 256; ++o) delete r[i[o]];
                        r[" size"] = i.length - 256
                    }
                }
                return n
            };
        u = function(t) {
            return v(t, p, i)
        }, f = function(t) {
            return v(t, d, o)
        }, t.prototype.call = function(t) {
            for (var e = arguments.length, r = new Array(Math.max(e - 1, 0)), i = 1; i < e; ++i) r[i - 1] = arguments[i];
            if (h) {
                var o = u(t);
                if (null !== o) return this._then(o, void 0, void 0, r, void 0)
            }
            return r.push(t), this._then(n, void 0, void 0, r, void 0)
        }, t.prototype.get = function(t) {
            var e, r = "number" == typeof t;
            if (r) e = a;
            else if (h) {
                var n = f(t);
                e = null !== n ? n : s
            } else e = s;
            return this._then(e, void 0, void 0, t, void 0)
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n, i, o, s) {
        function a(t) {
            setTimeout(function() {
                throw t
            }, 0)
        }

        function u(t) {
            var e = n(t);
            return e !== t && "function" == typeof t._isDisposable && "function" == typeof t._getDisposer && t._isDisposable() && e._setDisposable(t._getDisposer()), e
        }

        function f(e, r) {
            function i() {
                if (s >= f) return c._fulfill();
                var o = u(e[s++]);
                if (o instanceof t && o._isDisposable()) {
                    try {
                        o = n(o._getDisposer().tryDispose(r), e.promise)
                    } catch (t) {
                        return a(t)
                    }
                    if (o instanceof t) return o._then(i, a, null, null, null)
                }
                i()
            }
            var s = 0,
                f = e.length,
                c = new t(o);
            return i(), c
        }

        function c(t, e, r) {
            this._data = t, this._promise = e, this._context = r
        }

        function h(t, e, r) {
            this.constructor$(t, e, r)
        }

        function l(t) {
            return c.isDisposer(t) ? (this.resources[this.index]._setDisposable(t), t.promise()) : t
        }

        function p(t) {
            this.length = t, this.promise = null, this[t - 1] = null
        }
        var d = r(6),
            v = r(13).TypeError,
            y = r(6).inherits,
            g = d.errorObj,
            _ = d.tryCatch,
            m = {};
        c.prototype.data = function() {
            return this._data
        }, c.prototype.promise = function() {
            return this._promise
        }, c.prototype.resource = function() {
            return this.promise().isFulfilled() ? this.promise().value() : m
        }, c.prototype.tryDispose = function(t) {
            var e = this.resource(),
                r = this._context;
            void 0 !== r && r._pushContext();
            var n = e !== m ? this.doDispose(e, t) : null;
            return void 0 !== r && r._popContext(), this._promise._unsetDisposable(), this._data = null, n
        }, c.isDisposer = function(t) {
            return null != t && "function" == typeof t.resource && "function" == typeof t.tryDispose
        }, y(h, c), h.prototype.doDispose = function(t, e) {
            var r = this.data();
            return r.call(t, t, e)
        }, p.prototype._resultCancelled = function() {
            for (var e = this.length, r = 0; r < e; ++r) {
                var n = this[r];
                n instanceof t && n.cancel()
            }
        }, t.using = function() {
            var r = arguments.length;
            if (r < 2) return e("you must pass at least 2 arguments to Promise.using");
            var i = arguments[r - 1];
            if ("function" != typeof i) return e("expecting a function but got " + d.classString(i));
            var o, a = !0;
            2 === r && Array.isArray(arguments[0]) ? (o = arguments[0], r = o.length, a = !1) : (o = arguments, r--);
            for (var u = new p(r), h = 0; h < r; ++h) {
                var v = o[h];
                if (c.isDisposer(v)) {
                    var y = v;
                    v = v.promise(), v._setDisposable(y)
                } else {
                    var m = n(v);
                    m instanceof t && (v = m._then(l, null, null, {
                        resources: u,
                        index: h
                    }, void 0))
                }
                u[h] = v
            }
            for (var b = new Array(u.length), h = 0; h < b.length; ++h) b[h] = t.resolve(u[h]).reflect();
            var w = t.all(b).then(function(t) {
                    for (var e = 0; e < t.length; ++e) {
                        var r = t[e];
                        if (r.isRejected()) return g.e = r.error(), g;
                        if (!r.isFulfilled()) return void w.cancel();
                        t[e] = r.value()
                    }
                    E._pushContext(), i = _(i);
                    var n = a ? i.apply(void 0, t) : i(t),
                        o = E._popContext();
                    return s.checkForgottenReturns(n, o, "Promise.using", E), n
                }),
                E = w.lastly(function() {
                    var e = new t.PromiseInspection(w);
                    return f(u, e)
                });
            return u.promise = E, E._setOnCancel(u), E
        }, t.prototype._setDisposable = function(t) {
            this._bitField = 131072 | this._bitField, this._disposer = t
        }, t.prototype._isDisposable = function() {
            return (131072 & this._bitField) > 0
        }, t.prototype._getDisposer = function() {
            return this._disposer
        }, t.prototype._unsetDisposable = function() {
            this._bitField = this._bitField & -131073, this._disposer = void 0
        }, t.prototype.disposer = function(t) {
            if ("function" == typeof t) return new h(t, this, i());
            throw new v
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n) {
        function i(t) {
            this.handle = t
        }

        function o(t) {
            return clearTimeout(this.handle), t
        }

        function s(t) {
            throw clearTimeout(this.handle), t
        }
        var a = r(6),
            u = t.TimeoutError;
        i.prototype._resultCancelled = function() {
            clearTimeout(this.handle)
        };
        var f = function(t) {
                return c(+this).thenReturn(t)
            },
            c = t.delay = function(r, o) {
                var s, a;
                return void 0 !== o ? (s = t.resolve(o)._then(f, null, null, r, void 0), n.cancellation() && o instanceof t && s._setOnCancel(o)) : (s = new t(e), a = setTimeout(function() {
                    s._fulfill()
                }, +r), n.cancellation() && s._setOnCancel(new i(a)), s._captureStackTrace()), s._setAsyncGuaranteed(), s
            };
        t.prototype.delay = function(t) {
            return c(t, this)
        };
        var h = function(t, e, r) {
            var n;
            n = "string" != typeof e ? e instanceof Error ? e : new u("operation timed out") : new u(e), a.markAsOriginatingFromRejection(n), t._attachExtraTrace(n), t._reject(n), null != r && r.cancel()
        };
        t.prototype.timeout = function(t, e) {
            t = +t;
            var r, a, u = new i(setTimeout(function() {
                r.isPending() && h(r, e, a)
            }, t));
            return n.cancellation() ? (a = this.then(), r = a._then(o, s, void 0, u, void 0), r._setOnCancel(u)) : r = this._then(o, s, void 0, u, void 0), r
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n, i, o, s) {
        function a(e, r, n) {
            for (var o = 0; o < r.length; ++o) {
                n._pushContext();
                var s = p(r[o])(e);
                if (n._popContext(), s === l) {
                    n._pushContext();
                    var a = t.reject(l.e);
                    return n._popContext(), a
                }
                var u = i(s, n);
                if (u instanceof t) return u
            }
            return null
        }

        function u(e, r, i, o) {
            if (s.cancellation()) {
                var a = new t(n),
                    u = this._finallyPromise = new t(n);
                this._promise = a.lastly(function() {
                    return u
                }), a._captureStackTrace(), a._setOnCancel(this)
            } else {
                var f = this._promise = new t(n);
                f._captureStackTrace()
            }
            this._stack = o, this._generatorFunction = e, this._receiver = r, this._generator = void 0, this._yieldHandlers = "function" == typeof i ? [i].concat(d) : d, this._yieldedPromise = null, this._cancellationPhase = !1
        }
        var f = r(13),
            c = f.TypeError,
            h = r(6),
            l = h.errorObj,
            p = h.tryCatch,
            d = [];
        h.inherits(u, o), u.prototype._isResolved = function() {
            return null === this._promise
        }, u.prototype._cleanup = function() {
            this._promise = this._generator = null, s.cancellation() && null !== this._finallyPromise && (this._finallyPromise._fulfill(), this._finallyPromise = null)
        }, u.prototype._promiseCancelled = function() {
            if (!this._isResolved()) {
                var e, r = "undefined" != typeof this._generator.return;
                if (r) this._promise._pushContext(), e = p(this._generator.return).call(this._generator, void 0), this._promise._popContext();
                else {
                    var n = new t.CancellationError("generator .return() sentinel");
                    t.coroutine.returnSentinel = n, this._promise._attachExtraTrace(n), this._promise._pushContext(), e = p(this._generator.throw).call(this._generator, n), this._promise._popContext()
                }
                this._cancellationPhase = !0, this._yieldedPromise = null, this._continue(e)
            }
        }, u.prototype._promiseFulfilled = function(t) {
            this._yieldedPromise = null, this._promise._pushContext();
            var e = p(this._generator.next).call(this._generator, t);
            this._promise._popContext(), this._continue(e)
        }, u.prototype._promiseRejected = function(t) {
            this._yieldedPromise = null, this._promise._attachExtraTrace(t), this._promise._pushContext();
            var e = p(this._generator.throw).call(this._generator, t);
            this._promise._popContext(), this._continue(e)
        }, u.prototype._resultCancelled = function() {
            if (this._yieldedPromise instanceof t) {
                var e = this._yieldedPromise;
                this._yieldedPromise = null, e.cancel()
            }
        }, u.prototype.promise = function() {
            return this._promise
        }, u.prototype._run = function() {
            this._generator = this._generatorFunction.call(this._receiver), this._receiver = this._generatorFunction = void 0, this._promiseFulfilled(void 0)
        }, u.prototype._continue = function(e) {
            var r = this._promise;
            if (e === l) return this._cleanup(), this._cancellationPhase ? r.cancel() : r._rejectCallback(e.e, !1);
            var n = e.value;
            if (e.done === !0) return this._cleanup(), this._cancellationPhase ? r.cancel() : r._resolveCallback(n);
            var o = i(n, this._promise);
            if (!(o instanceof t) && (o = a(o, this._yieldHandlers, this._promise), null === o)) return void this._promiseRejected(new c("A value %s was yielded that could not be treated as a promise\n\n    See http://goo.gl/MqrFmX\n\n".replace("%s", String(n)) + "From coroutine:\n" + this._stack.split("\n").slice(1, -7).join("\n")));
            o = o._target();
            var s = o._bitField;
            0 === (50397184 & s) ? (this._yieldedPromise = o, o._proxy(this, null)) : 0 !== (33554432 & s) ? t._async.invoke(this._promiseFulfilled, this, o._value()) : 0 !== (16777216 & s) ? t._async.invoke(this._promiseRejected, this, o._reason()) : this._promiseCancelled()
        }, t.coroutine = function(t, e) {
            if ("function" != typeof t) throw new c("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");
            var r = Object(e).yieldHandler,
                n = u,
                i = (new Error).stack;
            return function() {
                var e = t.apply(this, arguments),
                    o = new n(void 0, void 0, r, i),
                    s = o.promise();
                return o._generator = e, o._promiseFulfilled(void 0), s
            }
        }, t.coroutine.addYieldHandler = function(t) {
            if ("function" != typeof t) throw new c("expecting a function but got " + h.classString(t));
            d.push(t)
        }, t.spawn = function(r) {
            if (s.deprecated("Promise.spawn()", "Promise.coroutine()"), "function" != typeof r) return e("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");
            var n = new u(r, this),
                i = n.promise();
            return n._run(t.spawn), i
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t) {
        function e(t, e) {
            var r = this;
            if (!o.isArray(t)) return n.call(r, t, e);
            var i = a(e).apply(r._boundValue(), [null].concat(t));
            i === u && s.throwLater(i.e)
        }

        function n(t, e) {
            var r = this,
                n = r._boundValue(),
                i = void 0 === t ? a(e).call(n, null) : a(e).call(n, null, t);
            i === u && s.throwLater(i.e)
        }

        function i(t, e) {
            var r = this;
            if (!t) {
                var n = new Error(t + "");
                n.cause = t, t = n
            }
            var i = a(e).call(r._boundValue(), t);
            i === u && s.throwLater(i.e)
        }
        var o = r(6),
            s = t._async,
            a = o.tryCatch,
            u = o.errorObj;
        t.prototype.asCallback = t.prototype.nodeify = function(t, r) {
            if ("function" == typeof t) {
                var o = n;
                void 0 !== r && Object(r).spread && (o = e), this._then(o, i, void 0, this, t)
            }
            return this
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e) {
        function n(t) {
            return !E.test(t)
        }

        function i(t) {
            try {
                return t.__isPromisified__ === !0
            } catch (t) {
                return !1
            }
        }

        function o(t, e, r) {
            var n = p.getDataPropertyOrDefault(t, e + r, b);
            return !!n && i(n)
        }

        function s(t, e, r) {
            for (var n = 0; n < t.length; n += 2) {
                var i = t[n];
                if (r.test(i))
                    for (var o = i.replace(r, ""), s = 0; s < t.length; s += 2)
                        if (t[s] === o) throw new _("Cannot promisify an API that has normal methods with '%s'-suffix\n\n    See http://goo.gl/MqrFmX\n".replace("%s", e))
            }
        }

        function a(t, e, r, n) {
            for (var a = p.inheritedDataKeys(t), u = [], f = 0; f < a.length; ++f) {
                var c = a[f],
                    h = t[c],
                    l = n === k || k(c, h, t);
                "function" != typeof h || i(h) || o(t, c, e) || !n(c, h, t, l) || u.push(c, h)
            }
            return s(u, e, r), u
        }

        function u(r, n, i, o, s, a) {
            function u() {
                var i = n;
                n === l && (i = this);
                var o = new t(e);
                o._captureStackTrace();
                var s = "string" == typeof c && this !== f ? this[c] : r,
                    u = d(o, a);
                try {
                    s.apply(i, v(arguments, u))
                } catch (t) {
                    o._rejectCallback(y(t), !0, !0)
                }
                return o._isFateSealed() || o._setAsyncGuaranteed(), o
            }
            var f = function() {
                    return this
                }(),
                c = r;
            return "string" == typeof c && (r = o), p.notEnumerableProp(u, "__isPromisified__", !0), u
        }

        function f(t, e, r, n, i) {
            for (var o = new RegExp(T(e) + "$"), s = a(t, e, o, r), u = 0, f = s.length; u < f; u += 2) {
                var c = s[u],
                    h = s[u + 1],
                    d = c + e;
                if (n === I) t[d] = I(c, l, c, h, e, i);
                else {
                    var v = n(h, function() {
                        return I(c, l, c, h, e, i)
                    });
                    p.notEnumerableProp(v, "__isPromisified__", !0), t[d] = v
                }
            }
            return p.toFastProperties(t), t
        }

        function c(t, e, r) {
            return I(t, e, void 0, t, null, r)
        }
        var h, l = {},
            p = r(6),
            d = r(20),
            v = p.withAppended,
            y = p.maybeWrapAsError,
            g = p.canEvaluate,
            _ = r(13).TypeError,
            m = "Async",
            b = {
                __isPromisified__: !0
            },
            w = ["arity", "length", "name", "arguments", "caller", "callee", "prototype", "__isPromisified__"],
            E = new RegExp("^(?:" + w.join("|") + ")$"),
            k = function(t) {
                return p.isIdentifier(t) && "_" !== t.charAt(0) && "constructor" !== t
            },
            T = function(t) {
                return t.replace(/([$])/, "\\$")
            },
            B = function(t) {
                for (var e = [t], r = Math.max(0, t - 1 - 3), n = t - 1; n >= r; --n) e.push(n);
                for (var n = t + 1; n <= 3; ++n) e.push(n);
                return e
            },
            S = function(t) {
                return p.filledRange(t, "_arg", "")
            },
            x = function(t) {
                return p.filledRange(Math.max(t, 3), "_arg", "")
            },
            A = function(t) {
                return "number" == typeof t.length ? Math.max(Math.min(t.length, 1024), 0) : 0
            };
        h = function(r, n, i, o, s, a) {
            function u(t) {
                var e, r = S(t).join(", "),
                    i = t > 0 ? ", " : "";
                return e = g ? "ret = callback.call(this, {{args}}, nodeback); break;\n" : void 0 === n ? "ret = callback({{args}}, nodeback); break;\n" : "ret = callback.call(receiver, {{args}}, nodeback); break;\n", e.replace("{{args}}", r).replace(", ", i)
            }

            function f() {
                for (var t = "", e = 0; e < h.length; ++e) t += "case " + h[e] + ":" + u(h[e]);
                return t += "                                                             \n\t        default:                                                             \n\t            var args = new Array(len + 1);                                   \n\t            var i = 0;                                                       \n\t            for (var i = 0; i < len; ++i) {                                  \n\t               args[i] = arguments[i];                                       \n\t            }                                                                \n\t            args[i] = nodeback;                                              \n\t            [CodeForCall]                                                    \n\t            break;                                                           \n\t        ".replace("[CodeForCall]", g ? "ret = callback.apply(this, args);\n" : "ret = callback.apply(receiver, args);\n")
            }
            var c = Math.max(0, A(o) - 1),
                h = B(c),
                g = "string" == typeof r || n === l,
                _ = "string" == typeof r ? "this != null ? this['" + r + "'] : fn" : "fn",
                m = "'use strict';                                                \n\t        var ret = function (Parameters) {                                    \n\t            'use strict';                                                    \n\t            var len = arguments.length;                                      \n\t            var promise = new Promise(INTERNAL);                             \n\t            promise._captureStackTrace();                                    \n\t            var nodeback = nodebackForPromise(promise, " + a + ");   \n\t            var ret;                                                         \n\t            var callback = tryCatch([GetFunctionCode]);                      \n\t            switch(len) {                                                    \n\t                [CodeForSwitchCase]                                          \n\t            }                                                                \n\t            if (ret === errorObj) {                                          \n\t                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\t            }                                                                \n\t            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();     \n\t            return promise;                                                  \n\t        };                                                                   \n\t        notEnumerableProp(ret, '__isPromisified__', true);                   \n\t        return ret;                                                          \n\t    ".replace("[CodeForSwitchCase]", f()).replace("[GetFunctionCode]", _);
            return m = m.replace("Parameters", x(c)), new Function("Promise", "fn", "receiver", "withAppended", "maybeWrapAsError", "nodebackForPromise", "tryCatch", "errorObj", "notEnumerableProp", "INTERNAL", m)(t, o, n, v, y, d, p.tryCatch, p.errorObj, p.notEnumerableProp, e)
        };
        var I = g ? h : u;
        t.promisify = function(t, e) {
            if ("function" != typeof t) throw new _("expecting a function but got " + p.classString(t));
            if (i(t)) return t;
            e = Object(e);
            var r = void 0 === e.context ? l : e.context,
                o = !!e.multiArgs,
                s = c(t, r, o);
            return p.copyDescriptors(t, s, n), s
        }, t.promisifyAll = function(t, e) {
            if ("function" != typeof t && "object" != typeof t) throw new _("the target of promisifyAll must be an object or a function\n\n    See http://goo.gl/MqrFmX\n");
            e = Object(e);
            var r = !!e.multiArgs,
                n = e.suffix;
            "string" != typeof n && (n = m);
            var i = e.filter;
            "function" != typeof i && (i = k);
            var o = e.promisifier;
            if ("function" != typeof o && (o = I), !p.isIdentifier(n)) throw new RangeError("suffix must be a valid identifier\n\n    See http://goo.gl/MqrFmX\n");
            for (var s = p.inheritedDataKeys(t), a = 0; a < s.length; ++a) {
                var u = t[s[a]];
                "constructor" !== s[a] && p.isClass(u) && (f(u.prototype, n, i, o, r), f(u, n, i, o, r))
            }
            return f(t, n, i, o, r)
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n, i) {
        function o(t) {
            var e, r = !1;
            if (void 0 !== a && t instanceof a) e = h(t), r = !0;
            else {
                var n = c.keys(t),
                    i = n.length;
                e = new Array(2 * i);
                for (var o = 0; o < i; ++o) {
                    var s = n[o];
                    e[o] = t[s], e[o + i] = s
                }
            }
            this.constructor$(e), this._isMap = r, this._init$(void 0, r ? -6 : -3)
        }

        function s(e) {
            var r, s = n(e);
            return f(s) ? (r = s instanceof t ? s._then(t.props, void 0, void 0, void 0, void 0) : new o(s).promise(), s instanceof t && r._propagateFrom(s, 2), r) : i("cannot await properties of a non-object\n\n    See http://goo.gl/MqrFmX\n")
        }
        var a, u = r(6),
            f = u.isObject,
            c = r(7);
        "function" == typeof Map && (a = Map);
        var h = function() {
                function t(t, n) {
                    this[e] = t, this[e + r] = n, e++
                }
                var e = 0,
                    r = 0;
                return function(n) {
                    r = n.size, e = 0;
                    var i = new Array(2 * n.size);
                    return n.forEach(t, i), i
                }
            }(),
            l = function(t) {
                for (var e = new a, r = t.length / 2 | 0, n = 0; n < r; ++n) {
                    var i = t[r + n],
                        o = t[n];
                    e.set(i, o)
                }
                return e
            };
        u.inherits(o, e), o.prototype._init = function() {}, o.prototype._promiseFulfilled = function(t, e) {
            this._values[e] = t;
            var r = ++this._totalResolved;
            if (r >= this._length) {
                var n;
                if (this._isMap) n = l(this._values);
                else {
                    n = {};
                    for (var i = this.length(), o = 0, s = this.length(); o < s; ++o) n[this._values[o + i]] = this._values[o]
                }
                return this._resolve(n), !0
            }
            return !1
        }, o.prototype.shouldCopyValues = function() {
            return !1
        }, o.prototype.getActualLength = function(t) {
            return t >> 1
        }, t.prototype.props = function() {
            return s(this)
        }, t.props = function(t) {
            return s(t)
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n, i) {
        function o(r, o) {
            var u = n(r);
            if (u instanceof t) return a(u);
            if (r = s.asArray(r), null === r) return i("expecting an array or an iterable object but got " + s.classString(r));
            var f = new t(e);
            void 0 !== o && f._propagateFrom(o, 3);
            for (var c = f._fulfill, h = f._reject, l = 0, p = r.length; l < p; ++l) {
                var d = r[l];
                (void 0 !== d || l in r) && t.cast(d)._then(c, h, void 0, f, null)
            }
            return f
        }
        var s = r(6),
            a = function(t) {
                return t.then(function(e) {
                    return o(e, t)
                })
            };
        t.race = function(t) {
            return o(t, void 0)
        }, t.prototype.race = function() {
            return o(this, void 0)
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n, i, o, s) {
        function a(e, r, n, i) {
            this.constructor$(e);
            var s = l();
            this._fn = null === s ? r : p.domainBind(s, r), void 0 !== n && (n = t.resolve(n), n._attachCancellationCallback(this)), this._initialValue = n, this._currentCancellable = null, i === o ? this._eachValues = Array(this._length) : 0 === i ? this._eachValues = null : this._eachValues = void 0, this._promise._captureStackTrace(), this._init$(void 0, -5)
        }

        function u(t, e) {
            this.isFulfilled() ? e._resolve(t) : e._reject(t)
        }

        function f(t, e, r, i) {
            if ("function" != typeof e) return n("expecting a function but got " + p.classString(e));
            var o = new a(t, e, r, i);
            return o.promise()
        }

        function c(e) {
            this.accum = e, this.array._gotAccum(e);
            var r = i(this.value, this.array._promise);
            return r instanceof t ? (this.array._currentCancellable = r, r._then(h, void 0, void 0, this, void 0)) : h.call(this, r)
        }

        function h(e) {
            var r = this.array,
                n = r._promise,
                i = d(r._fn);
            n._pushContext();
            var o;
            o = void 0 !== r._eachValues ? i.call(n._boundValue(), e, this.index, this.length) : i.call(n._boundValue(), this.accum, e, this.index, this.length), o instanceof t && (r._currentCancellable = o);
            var a = n._popContext();
            return s.checkForgottenReturns(o, a, void 0 !== r._eachValues ? "Promise.each" : "Promise.reduce", n), o
        }
        var l = t._getDomain,
            p = r(6),
            d = p.tryCatch;
        p.inherits(a, e), a.prototype._gotAccum = function(t) {
                void 0 !== this._eachValues && null !== this._eachValues && t !== o && this._eachValues.push(t)
            }, a.prototype._eachComplete = function(t) {
                return null !== this._eachValues && this._eachValues.push(t), this._eachValues
            }, a.prototype._init = function() {}, a.prototype._resolveEmptyArray = function() {
                this._resolve(void 0 !== this._eachValues ? this._eachValues : this._initialValue)
            }, a.prototype.shouldCopyValues = function() {
                return !1
            }, a.prototype._resolve = function(t) {
                this._promise._resolveCallback(t), this._values = null
            },
            a.prototype._resultCancelled = function(e) {
                return e === this._initialValue ? this._cancel() : void(this._isResolved() || (this._resultCancelled$(), this._currentCancellable instanceof t && this._currentCancellable.cancel(), this._initialValue instanceof t && this._initialValue.cancel()))
            }, a.prototype._iterate = function(e) {
                this._values = e;
                var r, n, i = e.length;
                if (void 0 !== this._initialValue ? (r = this._initialValue, n = 0) : (r = t.resolve(e[0]), n = 1), this._currentCancellable = r, !r.isRejected())
                    for (; n < i; ++n) {
                        var o = {
                            accum: null,
                            value: e[n],
                            index: n,
                            length: i,
                            array: this
                        };
                        r = r._then(c, void 0, void 0, o, void 0)
                    }
                void 0 !== this._eachValues && (r = r._then(this._eachComplete, void 0, void 0, this, void 0)), r._then(u, u, void 0, r, this)
            }, t.prototype.reduce = function(t, e) {
                return f(this, t, e, null)
            }, t.reduce = function(t, e, r, n) {
                return f(t, e, r, n)
            }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n) {
        function i(t) {
            this.constructor$(t)
        }
        var o = t.PromiseInspection,
            s = r(6);
        s.inherits(i, e), i.prototype._promiseResolved = function(t, e) {
            this._values[t] = e;
            var r = ++this._totalResolved;
            return r >= this._length && (this._resolve(this._values), !0)
        }, i.prototype._promiseFulfilled = function(t, e) {
            var r = new o;
            return r._bitField = 33554432, r._settledValueField = t, this._promiseResolved(e, r)
        }, i.prototype._promiseRejected = function(t, e) {
            var r = new o;
            return r._bitField = 16777216, r._settledValueField = t, this._promiseResolved(e, r)
        }, t.settle = function(t) {
            return n.deprecated(".settle()", ".reflect()"), new i(t).promise()
        }, t.prototype.settle = function() {
            return t.settle(this)
        }
    }
}, function(t, e, r) {
    "use strict";
    t.exports = function(t, e, n) {
        function i(t) {
            this.constructor$(t), this._howMany = 0, this._unwrap = !1, this._initialized = !1
        }

        function o(t, e) {
            if ((0 | e) !== e || e < 0) return n("expecting a positive integer\n\n    See http://goo.gl/MqrFmX\n");
            var r = new i(t),
                o = r.promise();
            return r.setHowMany(e), r.init(), o
        }
        var s = r(6),
            a = r(13).RangeError,
            u = r(13).AggregateError,
            f = s.isArray,
            c = {};
        s.inherits(i, e), i.prototype._init = function() {
            if (this._initialized) {
                if (0 === this._howMany) return void this._resolve([]);
                this._init$(void 0, -5);
                var t = f(this._values);
                !this._isResolved() && t && this._howMany > this._canPossiblyFulfill() && this._reject(this._getRangeError(this.length()))
            }
        }, i.prototype.init = function() {
            this._initialized = !0, this._init()
        }, i.prototype.setUnwrap = function() {
            this._unwrap = !0
        }, i.prototype.howMany = function() {
            return this._howMany
        }, i.prototype.setHowMany = function(t) {
            this._howMany = t
        }, i.prototype._promiseFulfilled = function(t) {
            return this._addFulfilled(t), this._fulfilled() === this.howMany() && (this._values.length = this.howMany(), 1 === this.howMany() && this._unwrap ? this._resolve(this._values[0]) : this._resolve(this._values), !0)
        }, i.prototype._promiseRejected = function(t) {
            return this._addRejected(t), this._checkOutcome()
        }, i.prototype._promiseCancelled = function() {
            return this._values instanceof t || null == this._values ? this._cancel() : (this._addRejected(c), this._checkOutcome())
        }, i.prototype._checkOutcome = function() {
            if (this.howMany() > this._canPossiblyFulfill()) {
                for (var t = new u, e = this.length(); e < this._values.length; ++e) this._values[e] !== c && t.push(this._values[e]);
                return t.length > 0 ? this._reject(t) : this._cancel(), !0
            }
            return !1
        }, i.prototype._fulfilled = function() {
            return this._totalResolved
        }, i.prototype._rejected = function() {
            return this._values.length - this.length()
        }, i.prototype._addRejected = function(t) {
            this._values.push(t)
        }, i.prototype._addFulfilled = function(t) {
            this._values[this._totalResolved++] = t
        }, i.prototype._canPossiblyFulfill = function() {
            return this.length() - this._rejected()
        }, i.prototype._getRangeError = function(t) {
            var e = "Input array must contain at least " + this._howMany + " items but contains only " + t + " items";
            return new a(e)
        }, i.prototype._resolveEmptyArray = function() {
            this._reject(this._getRangeError(0))
        }, t.some = function(t, e) {
            return o(t, e)
        }, t.prototype.some = function(t) {
            return o(this, t)
        }, t._SomePromiseArray = i
    }
}, function(t, e) {
    "use strict";
    t.exports = function(t, e) {
        var r = t.map;
        t.prototype.filter = function(t, n) {
            return r(this, t, n, e)
        }, t.filter = function(t, n, i) {
            return r(t, n, i, e)
        }
    }
}, function(t, e) {
    "use strict";
    t.exports = function(t, e) {
        function r() {
            return o(this)
        }

        function n(t, r) {
            return i(t, r, e, e)
        }
        var i = t.reduce,
            o = t.all;
        t.prototype.each = function(t) {
            return i(this, t, e, 0)._then(r, void 0, void 0, this, void 0)
        }, t.prototype.mapSeries = function(t) {
            return i(this, t, e, e)
        }, t.each = function(t, n) {
            return i(t, n, e, 0)._then(r, void 0, void 0, t, void 0)
        }, t.mapSeries = n
    }
}, function(t, e) {
    "use strict";
    t.exports = function(t) {
        function e(t) {
            var e = new r(t),
                n = e.promise();
            return e.setHowMany(1), e.setUnwrap(), e.init(), n
        }
        var r = t._SomePromiseArray;
        t.any = function(t) {
            return e(t)
        }, t.prototype.any = function() {
            return e(this)
        }
    }
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }

    function i(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    var o = function() {
            function t(t, e) {
                for (var r = 0; r < e.length; r++) {
                    var n = e[r];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                }
            }
            return function(e, r, n) {
                return r && t(e.prototype, r), n && t(e, n), e
            }
        }(),
        s = r(43),
        a = n(s),
        u = r(82),
        f = function() {
            function t(e) {
                var r = this;
                i(this, t), (0, a.default)(e, function(t, e) {
                    r[e] = t
                })
            }
            return o(t, [{
                key: "get",
                value: function(t) {
                    return this[t]
                }
            }, {
                key: "set",
                value: function(t, e) {
                    this[t] = e
                }
            }]), t
        }();
    t.exports = new f(u)
}, function(t, e, r) {
    t.exports = r(44)
}, function(t, e, r) {
    function n(t, e) {
        var r = a(t) ? i : o;
        return r(t, s(e))
    }
    var i = r(45),
        o = r(46),
        s = r(80),
        a = r(62);
    t.exports = n
}, function(t, e) {
    function r(t, e) {
        for (var r = -1, n = null == t ? 0 : t.length; ++r < n && e(t[r], r, t) !== !1;);
        return t
    }
    t.exports = r
}, function(t, e, r) {
    var n = r(47),
        i = r(79),
        o = i(n);
    t.exports = o
}, function(t, e, r) {
    function n(t, e) {
        return t && i(t, e, o)
    }
    var i = r(48),
        o = r(50);
    t.exports = n
}, function(t, e, r) {
    var n = r(49),
        i = n();
    t.exports = i
}, function(t, e) {
    function r(t) {
        return function(e, r, n) {
            for (var i = -1, o = Object(e), s = n(e), a = s.length; a--;) {
                var u = s[t ? a : ++i];
                if (r(o[u], u, o) === !1) break
            }
            return e
        }
    }
    t.exports = r
}, function(t, e, r) {
    function n(t) {
        return s(t) ? i(t) : o(t)
    }
    var i = r(51),
        o = r(72),
        s = r(76);
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        var r = s(t),
            n = !r && o(t),
            c = !r && !n && a(t),
            l = !r && !n && !c && f(t),
            p = r || n || c || l,
            d = p ? i(t.length, String) : [],
            v = d.length;
        for (var y in t) !e && !h.call(t, y) || p && ("length" == y || c && ("offset" == y || "parent" == y) || l && ("buffer" == y || "byteLength" == y || "byteOffset" == y) || u(y, v)) || d.push(y);
        return d
    }
    var i = r(52),
        o = r(53),
        s = r(62),
        a = r(63),
        u = r(66),
        f = r(67),
        c = Object.prototype,
        h = c.hasOwnProperty;
    t.exports = n
}, function(t, e) {
    function r(t, e) {
        for (var r = -1, n = Array(t); ++r < t;) n[r] = e(r);
        return n
    }
    t.exports = r
}, function(t, e, r) {
    var n = r(54),
        i = r(61),
        o = Object.prototype,
        s = o.hasOwnProperty,
        a = o.propertyIsEnumerable,
        u = n(function() {
            return arguments
        }()) ? n : function(t) {
            return i(t) && s.call(t, "callee") && !a.call(t, "callee")
        };
    t.exports = u
}, function(t, e, r) {
    function n(t) {
        return o(t) && i(t) == s
    }
    var i = r(55),
        o = r(61),
        s = "[object Arguments]";
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        return null == t ? void 0 === t ? u : a : f && f in Object(t) ? o(t) : s(t)
    }
    var i = r(56),
        o = r(59),
        s = r(60),
        a = "[object Null]",
        u = "[object Undefined]",
        f = i ? i.toStringTag : void 0;
    t.exports = n
}, function(t, e, r) {
    var n = r(57),
        i = n.Symbol;
    t.exports = i
}, function(t, e, r) {
    var n = r(58),
        i = "object" == typeof self && self && self.Object === Object && self,
        o = n || i || Function("return this")();
    t.exports = o
}, function(t, e) {
    (function(e) {
        var r = "object" == typeof e && e && e.Object === Object && e;
        t.exports = r
    }).call(e, function() {
        return this
    }())
}, function(t, e, r) {
    function n(t) {
        var e = s.call(t, u),
            r = t[u];
        try {
            t[u] = void 0;
            var n = !0
        } catch (t) {}
        var i = a.call(t);
        return n && (e ? t[u] = r : delete t[u]), i
    }
    var i = r(56),
        o = Object.prototype,
        s = o.hasOwnProperty,
        a = o.toString,
        u = i ? i.toStringTag : void 0;
    t.exports = n
}, function(t, e) {
    function r(t) {
        return i.call(t)
    }
    var n = Object.prototype,
        i = n.toString;
    t.exports = r
}, function(t, e) {
    function r(t) {
        return null != t && "object" == typeof t
    }
    t.exports = r
}, function(t, e) {
    var r = Array.isArray;
    t.exports = r
}, function(t, e, r) {
    (function(t) {
        var n = r(57),
            i = r(65),
            o = "object" == typeof e && e && !e.nodeType && e,
            s = o && "object" == typeof t && t && !t.nodeType && t,
            a = s && s.exports === o,
            u = a ? n.Buffer : void 0,
            f = u ? u.isBuffer : void 0,
            c = f || i;
        t.exports = c
    }).call(e, r(64)(t))
}, function(t, e) {
    t.exports = function(t) {
        return t.webpackPolyfill || (t.deprecate = function() {}, t.paths = [], t.children = [], t.webpackPolyfill = 1), t
    }
}, function(t, e) {
    function r() {
        return !1
    }
    t.exports = r
}, function(t, e) {
    function r(t, e) {
        return e = null == e ? n : e, !!e && ("number" == typeof t || i.test(t)) && t > -1 && t % 1 == 0 && t < e
    }
    var n = 9007199254740991,
        i = /^(?:0|[1-9]\d*)$/;
    t.exports = r
}, function(t, e, r) {
    var n = r(68),
        i = r(70),
        o = r(71),
        s = o && o.isTypedArray,
        a = s ? i(s) : n;
    t.exports = a
}, function(t, e, r) {
    function n(t) {
        return s(t) && o(t.length) && !!j[i(t)]
    }
    var i = r(55),
        o = r(69),
        s = r(61),
        a = "[object Arguments]",
        u = "[object Array]",
        f = "[object Boolean]",
        c = "[object Date]",
        h = "[object Error]",
        l = "[object Function]",
        p = "[object Map]",
        d = "[object Number]",
        v = "[object Object]",
        y = "[object RegExp]",
        g = "[object Set]",
        _ = "[object String]",
        m = "[object WeakMap]",
        b = "[object ArrayBuffer]",
        w = "[object DataView]",
        E = "[object Float32Array]",
        k = "[object Float64Array]",
        T = "[object Int8Array]",
        B = "[object Int16Array]",
        S = "[object Int32Array]",
        x = "[object Uint8Array]",
        A = "[object Uint8ClampedArray]",
        I = "[object Uint16Array]",
        O = "[object Uint32Array]",
        j = {};
    j[E] = j[k] = j[T] = j[B] = j[S] = j[x] = j[A] = j[I] = j[O] = !0, j[a] = j[u] = j[b] = j[f] = j[w] = j[c] = j[h] = j[l] = j[p] = j[d] = j[v] = j[y] = j[g] = j[_] = j[m] = !1, t.exports = n
}, function(t, e) {
    function r(t) {
        return "number" == typeof t && t > -1 && t % 1 == 0 && t <= n
    }
    var n = 9007199254740991;
    t.exports = r
}, function(t, e) {
    function r(t) {
        return function(e) {
            return t(e)
        }
    }
    t.exports = r
}, function(t, e, r) {
    (function(t) {
        var n = r(58),
            i = "object" == typeof e && e && !e.nodeType && e,
            o = i && "object" == typeof t && t && !t.nodeType && t,
            s = o && o.exports === i,
            a = s && n.process,
            u = function() {
                try {
                    return a && a.binding && a.binding("util")
                } catch (t) {}
            }();
        t.exports = u
    }).call(e, r(64)(t))
}, function(t, e, r) {
    function n(t) {
        if (!i(t)) return o(t);
        var e = [];
        for (var r in Object(t)) a.call(t, r) && "constructor" != r && e.push(r);
        return e
    }
    var i = r(73),
        o = r(74),
        s = Object.prototype,
        a = s.hasOwnProperty;
    t.exports = n
}, function(t, e) {
    function r(t) {
        var e = t && t.constructor,
            r = "function" == typeof e && e.prototype || n;
        return t === r
    }
    var n = Object.prototype;
    t.exports = r
}, function(t, e, r) {
    var n = r(75),
        i = n(Object.keys, Object);
    t.exports = i
}, function(t, e) {
    function r(t, e) {
        return function(r) {
            return t(e(r))
        }
    }
    t.exports = r
}, function(t, e, r) {
    function n(t) {
        return null != t && o(t.length) && !i(t)
    }
    var i = r(77),
        o = r(69);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        if (!o(t)) return !1;
        var e = i(t);
        return e == a || e == u || e == s || e == f
    }
    var i = r(55),
        o = r(78),
        s = "[object AsyncFunction]",
        a = "[object Function]",
        u = "[object GeneratorFunction]",
        f = "[object Proxy]";
    t.exports = n
}, function(t, e) {
    function r(t) {
        var e = typeof t;
        return null != t && ("object" == e || "function" == e)
    }
    t.exports = r
}, function(t, e, r) {
    function n(t, e) {
        return function(r, n) {
            if (null == r) return r;
            if (!i(r)) return t(r, n);
            for (var o = r.length, s = e ? o : -1, a = Object(r);
                (e ? s-- : ++s < o) && n(a[s], s, a) !== !1;);
            return r
        }
    }
    var i = r(76);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        return "function" == typeof t ? t : i
    }
    var i = r(81);
    t.exports = n
}, function(t, e) {
    function r(t) {
        return t
    }
    t.exports = r
}, function(t, e) {
    t.exports = {
        transport: "ws",
        websocket: "wss://steemd.steemit.com",
        uri: "https://steemd.steemit.com",
        url: "",
        dev_uri: "https://steemd.steemitdev.com",
        stage_uri: "https://steemd.steemitstage.com",
        address_prefix: "STM",
        chain_id: "0000000000000000000000000000000000000000000000000000000000000000"
    }
}, function(t, e) {
    "use strict";
    t.exports = [{
        api: "database_api",
        method: "set_subscribe_callback",
        params: ["callback", "clearFilter"]
    }, {
        api: "database_api",
        method: "set_pending_transaction_callback",
        params: ["cb"]
    }, {
        api: "database_api",
        method: "set_block_applied_callback",
        params: ["cb"]
    }, {
        api: "database_api",
        method: "cancel_all_subscriptions"
    }, {
        api: "database_api",
        method: "get_trending_tags",
        params: ["afterTag", "limit"]
    }, {
        api: "database_api",
        method: "get_tags_used_by_author",
        params: ["author"]
    }, {
        api: "database_api",
        method: "get_post_discussions_by_payout",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_comment_discussions_by_payout",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_trending",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_trending30",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_created",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_active",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_cashout",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_payout",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_votes",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_children",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_hot",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_feed",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_blog",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_comments",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_discussions_by_promoted",
        params: ["query"]
    }, {
        api: "database_api",
        method: "get_block_header",
        params: ["blockNum"]
    }, {
        api: "database_api",
        method: "get_block",
        params: ["blockNum"]
    }, {
        api: "database_api",
        method: "get_ops_in_block",
        params: ["blockNum", "onlyVirtual"]
    }, {
        api: "database_api",
        method: "get_state",
        params: ["path"]
    }, {
        api: "database_api",
        method: "get_trending_categories",
        params: ["after", "limit"]
    }, {
        api: "database_api",
        method: "get_best_categories",
        params: ["after", "limit"]
    }, {
        api: "database_api",
        method: "get_active_categories",
        params: ["after", "limit"]
    }, {
        api: "database_api",
        method: "get_recent_categories",
        params: ["after", "limit"]
    }, {
        api: "database_api",
        method: "get_config"
    }, {
        api: "database_api",
        method: "get_dynamic_global_properties"
    }, {
        api: "database_api",
        method: "get_chain_properties"
    }, {
        api: "database_api",
        method: "get_feed_history"
    }, {
        api: "database_api",
        method: "get_current_median_history_price"
    }, {
        api: "database_api",
        method: "get_witness_schedule"
    }, {
        api: "database_api",
        method: "get_hardfork_version"
    }, {
        api: "database_api",
        method: "get_next_scheduled_hardfork"
    }, {
        api: "account_by_key_api",
        method: "get_key_references",
        params: ["key"]
    }, {
        api: "database_api",
        method: "get_accounts",
        params: ["names"]
    }, {
        api: "database_api",
        method: "get_account_references",
        params: ["accountId"]
    }, {
        api: "database_api",
        method: "lookup_account_names",
        params: ["accountNames"]
    }, {
        api: "database_api",
        method: "lookup_accounts",
        params: ["lowerBoundName", "limit"]
    }, {
        api: "database_api",
        method: "get_account_count"
    }, {
        api: "database_api",
        method: "get_conversion_requests",
        params: ["accountName"]
    }, {
        api: "database_api",
        method: "get_account_history",
        params: ["account", "from", "limit"]
    }, {
        api: "database_api",
        method: "get_owner_history",
        params: ["account"]
    }, {
        api: "database_api",
        method: "get_recovery_request",
        params: ["account"]
    }, {
        api: "database_api",
        method: "get_escrow",
        params: ["from", "escrowId"]
    }, {
        api: "database_api",
        method: "get_withdraw_routes",
        params: ["account", "withdrawRouteType"]
    }, {
        api: "database_api",
        method: "get_account_bandwidth",
        params: ["account", "bandwidthType"]
    }, {
        api: "database_api",
        method: "get_savings_withdraw_from",
        params: ["account"]
    }, {
        api: "database_api",
        method: "get_savings_withdraw_to",
        params: ["account"]
    }, {
        api: "database_api",
        method: "get_order_book",
        params: ["limit"]
    }, {
        api: "database_api",
        method: "get_open_orders",
        params: ["owner"]
    }, {
        api: "database_api",
        method: "get_liquidity_queue",
        params: ["startAccount", "limit"]
    }, {
        api: "database_api",
        method: "get_transaction_hex",
        params: ["trx"]
    }, {
        api: "database_api",
        method: "get_transaction",
        params: ["trxId"]
    }, {
        api: "database_api",
        method: "get_required_signatures",
        params: ["trx", "availableKeys"]
    }, {
        api: "database_api",
        method: "get_potential_signatures",
        params: ["trx"]
    }, {
        api: "database_api",
        method: "verify_authority",
        params: ["trx"]
    }, {
        api: "database_api",
        method: "verify_account_authority",
        params: ["nameOrId", "signers"]
    }, {
        api: "database_api",
        method: "get_active_votes",
        params: ["author", "permlink"]
    }, {
        api: "database_api",
        method: "get_account_votes",
        params: ["voter"]
    }, {
        api: "database_api",
        method: "get_content",
        params: ["author", "permlink"]
    }, {
        api: "database_api",
        method: "get_content_replies",
        params: ["author", "permlink"]
    }, {
        api: "database_api",
        method: "get_discussions_by_author_before_date",
        params: ["author", "startPermlink", "beforeDate", "limit"]
    }, {
        api: "database_api",
        method: "get_replies_by_last_update",
        params: ["startAuthor", "startPermlink", "limit"]
    }, {
        api: "database_api",
        method: "get_witnesses",
        params: ["witnessIds"]
    }, {
        api: "database_api",
        method: "get_witness_by_account",
        params: ["accountName"]
    }, {
        api: "database_api",
        method: "get_witnesses_by_vote",
        params: ["from", "limit"]
    }, {
        api: "database_api",
        method: "lookup_witness_accounts",
        params: ["lowerBoundName", "limit"]
    }, {
        api: "database_api",
        method: "get_witness_count"
    }, {
        api: "database_api",
        method: "get_active_witnesses"
    }, {
        api: "database_api",
        method: "get_miner_queue"
    }, {
        api: "database_api",
        method: "get_reward_fund",
        params: ["name"]
    }, {
        api: "database_api",
        method: "get_vesting_delegations",
        params: ["account", "from", "limit"]
    }, {
        api: "login_api",
        method: "login",
        params: ["username", "password"]
    }, {
        api: "login_api",
        method: "get_api_by_name",
        params: ["apiName"]
    }, {
        api: "login_api",
        method: "get_version"
    }, {
        api: "follow_api",
        method: "get_followers",
        params: ["following", "startFollower", "followType", "limit"]
    }, {
        api: "follow_api",
        method: "get_following",
        params: ["follower", "startFollowing", "followType", "limit"]
    }, {
        api: "follow_api",
        method: "get_follow_count",
        params: ["account"]
    }, {
        api: "follow_api",
        method: "get_feed_entries",
        params: ["account", "entryId", "limit"]
    }, {
        api: "follow_api",
        method: "get_feed",
        params: ["account", "entryId", "limit"]
    }, {
        api: "follow_api",
        method: "get_blog_entries",
        params: ["account", "entryId", "limit"]
    }, {
        api: "follow_api",
        method: "get_blog",
        params: ["account", "entryId", "limit"]
    }, {
        api: "follow_api",
        method: "get_account_reputations",
        params: ["lowerBoundName", "limit"]
    }, {
        api: "follow_api",
        method: "get_reblogged_by",
        params: ["author", "permlink"]
    }, {
        api: "follow_api",
        method: "get_blog_authors",
        params: ["blogAccount"]
    }, {
        api: "network_broadcast_api",
        method: "broadcast_transaction",
        params: ["trx"]
    }, {
        api: "network_broadcast_api",
        method: "broadcast_transaction_with_callback",
        params: ["confirmationCallback", "trx"]
    }, {
        api: "network_broadcast_api",
        method: "broadcast_transaction_synchronous",
        params: ["trx"]
    }, {
        api: "network_broadcast_api",
        method: "broadcast_block",
        params: ["b"]
    }, {
        api: "network_broadcast_api",
        method: "set_max_block_age",
        params: ["maxBlockAge"]
    }, {
        api: "market_history_api",
        method: "get_ticker",
        params: []
    }, {
        api: "market_history_api",
        method: "get_volume",
        params: []
    }, {
        api: "market_history_api",
        method: "get_order_book",
        method_name: "getMarketOrderBook",
        params: ["limit"]
    }, {
        api: "market_history_api",
        method: "get_trade_history",
        params: ["start", "end", "limit"]
    }, {
        api: "market_history_api",
        method: "get_recent_trades",
        params: ["limit"]
    }, {
        api: "market_history_api",
        method: "get_market_history",
        params: ["bucket_seconds", "start", "end"]
    }, {
        api: "market_history_api",
        method: "get_market_history_buckets",
        params: []
    }]
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var i = r(85),
        o = n(i),
        s = r(91),
        a = n(s);
    e.default = {
        http: o.default,
        ws: a.default
    }
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }

    function i(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }

    function o(t, e) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }

    function s(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var a = function() {
            function t(t, e) {
                for (var r = 0; r < e.length; r++) {
                    var n = e[r];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                }
            }
            return function(e, r, n) {
                return r && t(e.prototype, r), n && t(e, n), e
            }
        }(),
        u = r(86),
        f = n(u),
        c = r(3),
        h = n(c),
        l = r(87),
        p = n(l),
        d = r(90),
        v = n(d),
        y = (0, f.default)(h.default),
        g = y.fetch,
        _ = (0, p.default)("steem:http"),
        m = function(t) {
            function e() {
                return i(this, e), o(this, (e.__proto__ || Object.getPrototypeOf(e)).apply(this, arguments))
            }
            return s(e, t), a(e, [{
                key: "send",
                value: function(t, e, r) {
                    _("Steem::send", t, e);
                    var n = e.id || this.id++,
                        i = {
                            id: n,
                            jsonrpc: "2.0",
                            method: "call",
                            params: [t, e.method, e.params]
                        };
                    g(this.options.uri, {
                        method: "POST",
                        body: JSON.stringify(i)
                    }).then(function(r) {
                        return _("Steem::receive", t, e), r.json()
                    }).then(function(t) {
                        var e = t.error || "",
                            n = t.result || "";
                        r(e, n)
                    }).catch(function(t) {
                        r(t, "")
                    })
                }
            }]), e
        }(v.default);
    e.default = m
}, function(t, e, r) {
    var n;
    ! function(i) {
        "use strict";

        function o(t) {
            var e = t && t.Promise || i.Promise,
                r = t && t.XMLHttpRequest || i.XMLHttpRequest,
                n = i;
            return function() {
                var t = Object.create(n, {
                    fetch: {
                        value: void 0,
                        writable: !0
                    }
                });
                return function(t) {
                    function n(t) {
                        if ("string" != typeof t && (t = String(t)), /[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(t)) throw new TypeError("Invalid character in header field name");
                        return t.toLowerCase()
                    }

                    function i(t) {
                        return "string" != typeof t && (t = String(t)), t
                    }

                    function o(t) {
                        var e = {
                            next: function() {
                                var e = t.shift();
                                return {
                                    done: void 0 === e,
                                    value: e
                                }
                            }
                        };
                        return m.iterable && (e[Symbol.iterator] = function() {
                            return e
                        }), e
                    }

                    function s(t) {
                        this.map = {}, t instanceof s ? t.forEach(function(t, e) {
                            this.append(e, t)
                        }, this) : Array.isArray(t) ? t.forEach(function(t) {
                            this.append(t[0], t[1])
                        }, this) : t && Object.getOwnPropertyNames(t).forEach(function(e) {
                            this.append(e, t[e])
                        }, this)
                    }

                    function a(t) {
                        return t.bodyUsed ? e.reject(new TypeError("Already read")) : void(t.bodyUsed = !0)
                    }

                    function u(t) {
                        return new e(function(e, r) {
                            t.onload = function() {
                                e(t.result)
                            }, t.onerror = function() {
                                r(t.error)
                            }
                        })
                    }

                    function f(t) {
                        var e = new FileReader,
                            r = u(e);
                        return e.readAsArrayBuffer(t), r
                    }

                    function c(t) {
                        var e = new FileReader,
                            r = u(e);
                        return e.readAsText(t), r
                    }

                    function h(t) {
                        for (var e = new Uint8Array(t), r = new Array(e.length), n = 0; n < e.length; n++) r[n] = String.fromCharCode(e[n]);
                        return r.join("")
                    }

                    function l(t) {
                        if (t.slice) return t.slice(0);
                        var e = new Uint8Array(t.byteLength);
                        return e.set(new Uint8Array(t)), e.buffer
                    }

                    function p() {
                        return this.bodyUsed = !1, this._initBody = function(t) {
                            if (this._bodyInit = t, t)
                                if ("string" == typeof t) this._bodyText = t;
                                else if (m.blob && Blob.prototype.isPrototypeOf(t)) this._bodyBlob = t;
                            else if (m.formData && FormData.prototype.isPrototypeOf(t)) this._bodyFormData = t;
                            else if (m.searchParams && URLSearchParams.prototype.isPrototypeOf(t)) this._bodyText = t.toString();
                            else if (m.arrayBuffer && m.blob && w(t)) this._bodyArrayBuffer = l(t.buffer), this._bodyInit = new Blob([this._bodyArrayBuffer]);
                            else {
                                if (!m.arrayBuffer || !ArrayBuffer.prototype.isPrototypeOf(t) && !E(t)) throw new Error("unsupported BodyInit type");
                                this._bodyArrayBuffer = l(t)
                            } else this._bodyText = "";
                            this.headers.get("content-type") || ("string" == typeof t ? this.headers.set("content-type", "text/plain;charset=UTF-8") : this._bodyBlob && this._bodyBlob.type ? this.headers.set("content-type", this._bodyBlob.type) : m.searchParams && URLSearchParams.prototype.isPrototypeOf(t) && this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"))
                        }, m.blob && (this.blob = function() {
                            var t = a(this);
                            if (t) return t;
                            if (this._bodyBlob) return e.resolve(this._bodyBlob);
                            if (this._bodyArrayBuffer) return e.resolve(new Blob([this._bodyArrayBuffer]));
                            if (this._bodyFormData) throw new Error("could not read FormData body as blob");
                            return e.resolve(new Blob([this._bodyText]))
                        }, this.arrayBuffer = function() {
                            return this._bodyArrayBuffer ? a(this) || e.resolve(this._bodyArrayBuffer) : this.blob().then(f)
                        }), this.text = function() {
                            var t = a(this);
                            if (t) return t;
                            if (this._bodyBlob) return c(this._bodyBlob);
                            if (this._bodyArrayBuffer) return e.resolve(h(this._bodyArrayBuffer));
                            if (this._bodyFormData) throw new Error("could not read FormData body as text");
                            return e.resolve(this._bodyText)
                        }, m.formData && (this.formData = function() {
                            return this.text().then(y)
                        }), this.json = function() {
                            return this.text().then(JSON.parse)
                        }, this
                    }

                    function d(t) {
                        var e = t.toUpperCase();
                        return k.indexOf(e) > -1 ? e : t
                    }

                    function v(t, e) {
                        e = e || {};
                        var r = e.body;
                        if (t instanceof v) {
                            if (t.bodyUsed) throw new TypeError("Already read");
                            this.url = t.url, this.credentials = t.credentials, e.headers || (this.headers = new s(t.headers)), this.method = t.method, this.mode = t.mode, r || null == t._bodyInit || (r = t._bodyInit, t.bodyUsed = !0)
                        } else this.url = String(t);
                        if (this.credentials = e.credentials || this.credentials || "omit", !e.headers && this.headers || (this.headers = new s(e.headers)), this.method = d(e.method || this.method || "GET"), this.mode = e.mode || this.mode || null, this.referrer = null, ("GET" === this.method || "HEAD" === this.method) && r) throw new TypeError("Body not allowed for GET or HEAD requests");
                        this._initBody(r)
                    }

                    function y(t) {
                        var e = new FormData;
                        return t.trim().split("&").forEach(function(t) {
                            if (t) {
                                var r = t.split("="),
                                    n = r.shift().replace(/\+/g, " "),
                                    i = r.join("=").replace(/\+/g, " ");
                                e.append(decodeURIComponent(n), decodeURIComponent(i))
                            }
                        }), e
                    }

                    function g(t) {
                        var e = new s;
                        return t.split(/\r?\n/).forEach(function(t) {
                            var r = t.split(":"),
                                n = r.shift().trim();
                            if (n) {
                                var i = r.join(":").trim();
                                e.append(n, i)
                            }
                        }), e
                    }

                    function _(t, e) {
                        e || (e = {}), this.type = "default", this.status = "status" in e ? e.status : 200, this.ok = this.status >= 200 && this.status < 300, this.statusText = "statusText" in e ? e.statusText : "OK", this.headers = new s(e.headers), this.url = e.url || "", this._initBody(t)
                    }
                    if (!t.fetch) {
                        var m = {
                            searchParams: "URLSearchParams" in t,
                            iterable: "Symbol" in t && "iterator" in Symbol,
                            blob: "FileReader" in t && "Blob" in t && function() {
                                try {
                                    return new Blob, !0
                                } catch (t) {
                                    return !1
                                }
                            }(),
                            formData: "FormData" in t,
                            arrayBuffer: "ArrayBuffer" in t
                        };
                        if (m.arrayBuffer) var b = ["[object Int8Array]", "[object Uint8Array]", "[object Uint8ClampedArray]", "[object Int16Array]", "[object Uint16Array]", "[object Int32Array]", "[object Uint32Array]", "[object Float32Array]", "[object Float64Array]"],
                            w = function(t) {
                                return t && DataView.prototype.isPrototypeOf(t)
                            },
                            E = ArrayBuffer.isView || function(t) {
                                return t && b.indexOf(Object.prototype.toString.call(t)) > -1
                            };
                        s.prototype.append = function(t, e) {
                            t = n(t), e = i(e);
                            var r = this.map[t];
                            this.map[t] = r ? r + "," + e : e
                        }, s.prototype.delete = function(t) {
                            delete this.map[n(t)]
                        }, s.prototype.get = function(t) {
                            return t = n(t), this.has(t) ? this.map[t] : null
                        }, s.prototype.has = function(t) {
                            return this.map.hasOwnProperty(n(t))
                        }, s.prototype.set = function(t, e) {
                            this.map[n(t)] = i(e)
                        }, s.prototype.forEach = function(t, e) {
                            for (var r in this.map) this.map.hasOwnProperty(r) && t.call(e, this.map[r], r, this)
                        }, s.prototype.keys = function() {
                            var t = [];
                            return this.forEach(function(e, r) {
                                t.push(r)
                            }), o(t)
                        }, s.prototype.values = function() {
                            var t = [];
                            return this.forEach(function(e) {
                                t.push(e)
                            }), o(t)
                        }, s.prototype.entries = function() {
                            var t = [];
                            return this.forEach(function(e, r) {
                                t.push([r, e])
                            }), o(t)
                        }, m.iterable && (s.prototype[Symbol.iterator] = s.prototype.entries);
                        var k = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
                        v.prototype.clone = function() {
                            return new v(this, {
                                body: this._bodyInit
                            })
                        }, p.call(v.prototype), p.call(_.prototype), _.prototype.clone = function() {
                            return new _(this._bodyInit, {
                                status: this.status,
                                statusText: this.statusText,
                                headers: new s(this.headers),
                                url: this.url
                            })
                        }, _.error = function() {
                            var t = new _(null, {
                                status: 0,
                                statusText: ""
                            });
                            return t.type = "error", t
                        };
                        var T = [301, 302, 303, 307, 308];
                        _.redirect = function(t, e) {
                            if (T.indexOf(e) === -1) throw new RangeError("Invalid status code");
                            return new _(null, {
                                status: e,
                                headers: {
                                    location: t
                                }
                            })
                        }, t.Headers = s, t.Request = v, t.Response = _, t.fetch = function(t, n) {
                            return new e(function(e, i) {
                                var o = new v(t, n),
                                    s = new r;
                                s.onload = function() {
                                    var t = {
                                        status: s.status,
                                        statusText: s.statusText,
                                        headers: g(s.getAllResponseHeaders() || "")
                                    };
                                    t.url = "responseURL" in s ? s.responseURL : t.headers.get("X-Request-URL");
                                    var r = "response" in s ? s.response : s.responseText;
                                    e(new _(r, t))
                                }, s.onerror = function() {
                                    i(new TypeError("Network request failed"))
                                }, s.ontimeout = function() {
                                    i(new TypeError("Network request failed"))
                                }, s.open(o.method, o.url, !0), "include" === o.credentials && (s.withCredentials = !0), "responseType" in s && m.blob && (s.responseType = "blob"), o.headers.forEach(function(t, e) {
                                    s.setRequestHeader(e, t)
                                }), s.send("undefined" == typeof o._bodyInit ? null : o._bodyInit)
                            })
                        }, t.fetch.polyfill = !0
                    }
                }("undefined" != typeof t ? t : this), {
                    fetch: t.fetch,
                    Headers: t.Headers,
                    Request: t.Request,
                    Response: t.Response
                }
            }()
        }
        n = function() {
            return o
        }.call(e, r, e, t), !(void 0 !== n && (t.exports = n))
    }("undefined" == typeof self ? this : self)
}, function(t, e, r) {
    (function(n) {
        function i() {
            return !("undefined" == typeof window || !window.process || "renderer" !== window.process.type) || ("undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
        }

        function o(t) {
            var r = this.useColors;
            if (t[0] = (r ? "%c" : "") + this.namespace + (r ? " %c" : " ") + t[0] + (r ? "%c " : " ") + "+" + e.humanize(this.diff), r) {
                var n = "color: " + this.color;
                t.splice(1, 0, n, "color: inherit");
                var i = 0,
                    o = 0;
                t[0].replace(/%[a-zA-Z%]/g, function(t) {
                    "%%" !== t && (i++, "%c" === t && (o = i))
                }), t.splice(o, 0, n)
            }
        }

        function s() {
            return "object" == typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments)
        }

        function a(t) {
            try {
                null == t ? e.storage.removeItem("debug") : e.storage.debug = t
            } catch (t) {}
        }

        function u() {
            var t;
            try {
                t = e.storage.debug
            } catch (t) {}
            return !t && "undefined" != typeof n && "env" in n && (t = n.env.DEBUG), t
        }

        function f() {
            try {
                return window.localStorage
            } catch (t) {}
        }
        e = t.exports = r(88), e.log = s, e.formatArgs = o, e.save = a, e.load = u, e.useColors = i, e.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : f(), e.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"], e.formatters.j = function(t) {
            try {
                return JSON.stringify(t)
            } catch (t) {
                return "[UnexpectedJSONParseError]: " + t.message
            }
        }, e.enable(u())
    }).call(e, r(5))
}, function(t, e, r) {
    function n(t) {
        var r, n = 0;
        for (r in t) n = (n << 5) - n + t.charCodeAt(r), n |= 0;
        return e.colors[Math.abs(n) % e.colors.length]
    }

    function i(t) {
        function r() {
            if (r.enabled) {
                var t = r,
                    n = +new Date,
                    i = n - (f || n);
                t.diff = i, t.prev = f, t.curr = n, f = n;
                for (var o = new Array(arguments.length), s = 0; s < o.length; s++) o[s] = arguments[s];
                o[0] = e.coerce(o[0]), "string" != typeof o[0] && o.unshift("%O");
                var a = 0;
                o[0] = o[0].replace(/%([a-zA-Z%])/g, function(r, n) {
                    if ("%%" === r) return r;
                    a++;
                    var i = e.formatters[n];
                    if ("function" == typeof i) {
                        var s = o[a];
                        r = i.call(t, s), o.splice(a, 1), a--
                    }
                    return r
                }), e.formatArgs.call(t, o);
                var u = r.log || e.log || console.log.bind(console);
                u.apply(t, o)
            }
        }
        return r.namespace = t, r.enabled = e.enabled(t), r.useColors = e.useColors(), r.color = n(t), "function" == typeof e.init && e.init(r), r
    }

    function o(t) {
        e.save(t), e.names = [], e.skips = [];
        for (var r = ("string" == typeof t ? t : "").split(/[\s,]+/), n = r.length, i = 0; i < n; i++) r[i] && (t = r[i].replace(/\*/g, ".*?"), "-" === t[0] ? e.skips.push(new RegExp("^" + t.substr(1) + "$")) : e.names.push(new RegExp("^" + t + "$")))
    }

    function s() {
        e.enable("")
    }

    function a(t) {
        var r, n;
        for (r = 0, n = e.skips.length; r < n; r++)
            if (e.skips[r].test(t)) return !1;
        for (r = 0, n = e.names.length; r < n; r++)
            if (e.names[r].test(t)) return !0;
        return !1
    }

    function u(t) {
        return t instanceof Error ? t.stack || t.message : t
    }
    e = t.exports = i.debug = i.default = i, e.coerce = u, e.disable = s, e.enable = o, e.enabled = a, e.humanize = r(89), e.names = [], e.skips = [], e.formatters = {};
    var f
}, function(t, e) {
    function r(t) {
        if (t = String(t), !(t.length > 100)) {
            var e = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(t);
            if (e) {
                var r = parseFloat(e[1]),
                    n = (e[2] || "ms").toLowerCase();
                switch (n) {
                    case "years":
                    case "year":
                    case "yrs":
                    case "yr":
                    case "y":
                        return r * c;
                    case "days":
                    case "day":
                    case "d":
                        return r * f;
                    case "hours":
                    case "hour":
                    case "hrs":
                    case "hr":
                    case "h":
                        return r * u;
                    case "minutes":
                    case "minute":
                    case "mins":
                    case "min":
                    case "m":
                        return r * a;
                    case "seconds":
                    case "second":
                    case "secs":
                    case "sec":
                    case "s":
                        return r * s;
                    case "milliseconds":
                    case "millisecond":
                    case "msecs":
                    case "msec":
                    case "ms":
                        return r;
                    default:
                        return
                }
            }
        }
    }

    function n(t) {
        return t >= f ? Math.round(t / f) + "d" : t >= u ? Math.round(t / u) + "h" : t >= a ? Math.round(t / a) + "m" : t >= s ? Math.round(t / s) + "s" : t + "ms"
    }

    function i(t) {
        return o(t, f, "day") || o(t, u, "hour") || o(t, a, "minute") || o(t, s, "second") || t + " ms"
    }

    function o(t, e, r) {
        if (!(t < e)) return t < 1.5 * e ? Math.floor(t / e) + " " + r : Math.ceil(t / e) + " " + r + "s"
    }
    var s = 1e3,
        a = 60 * s,
        u = 60 * a,
        f = 24 * u,
        c = 365.25 * f;
    t.exports = function(t, e) {
        e = e || {};
        var o = typeof t;
        if ("string" === o && t.length > 0) return r(t);
        if ("number" === o && isNaN(t) === !1) return e.long ? i(t) : n(t);
        throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(t))
    }
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }

    function i(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }

    function o(t, e) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }

    function s(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var a = function() {
            function t(t, e) {
                for (var r = 0; r < e.length; r++) {
                    var n = e[r];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                }
            }
            return function(e, r, n) {
                return r && t(e.prototype, r), n && t(e, n), e
            }
        }(),
        u = r(3),
        f = n(u),
        c = r(2),
        h = n(c),
        l = r(43),
        p = n(l),
        d = function(t) {
            function e() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                i(this, e);
                var r = o(this, (e.__proto__ || Object.getPrototypeOf(e)).call(this, t));
                return r.options = t, r.id = 0, r
            }
            return s(e, t), a(e, [{
                key: "setOptions",
                value: function(t) {
                    var e = this;
                    (0, p.default)(t, function(t, r) {
                        e.options[r] = t
                    }), this.stop()
                }
            }, {
                key: "listenTo",
                value: function(t, e, r) {
                    return t.addEventListener ? t.addEventListener(e, r) : t.on(e, r),
                        function() {
                            t.removeEventListener ? t.removeEventListener(e, r) : t.removeListener(e, r)
                        }
                }
            }, {
                key: "send",
                value: function() {}
            }, {
                key: "start",
                value: function() {}
            }, {
                key: "stop",
                value: function() {}
            }]), e
        }(h.default);
    e.default = d, f.default.promisifyAll(d.prototype)
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }

    function i(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }

    function o(t, e) {
        if (!t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return !e || "object" != typeof e && "function" != typeof e ? t : e
    }

    function s(t, e) {
        if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function, not " + typeof e);
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), e && (Object.setPrototypeOf ? Object.setPrototypeOf(t, e) : t.__proto__ = e)
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var a = function() {
            function t(t, e) {
                for (var r = 0; r < e.length; r++) {
                    var n = e[r];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                }
            }
            return function(e, r, n) {
                return r && t(e.prototype, r), n && t(e, n), e
            }
        }(),
        u = r(3),
        f = n(u),
        c = r(92),
        h = n(c),
        l = r(118),
        p = n(l),
        d = r(87),
        v = n(d),
        y = r(90),
        g = n(y),
        _ = void 0;
    if (p.default) _ = r(119);
    else {
        if ("undefined" == typeof window) throw new Error("Couldn't decide on a `WebSocket` class");
        _ = window.WebSocket
    }
    var m = (0, v.default)("steem:ws"),
        b = {
            apiIds: {
                database_api: 0,
                login_api: 1,
                follow_api: 2,
                network_broadcast_api: 4
            },
            id: 0
        },
        w = function(t) {
            function e() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                i(this, e), (0, h.default)(t, b);
                var r = o(this, (e.__proto__ || Object.getPrototypeOf(e)).call(this, t));
                return r.apiIds = t.apiIds, r.inFlight = 0, r.currentP = f.default.fulfilled(), r.isOpen = !1, r.releases = [], r.requests = {}, r.requestsTime = {}, r.apiIdsP = {}, r
            }
            return s(e, t), a(e, [{
                key: "start",
                value: function() {
                    var t = this;
                    if (this.startP) return this.startP;
                    var e = new f.default(function(r, n) {
                        if (e === t.startP) {
                            var i = t.options.websocket;
                            t.ws = new _(i);
                            var o = t.listenTo(t.ws, "open", function() {
                                    m("Opened WS connection with", i), t.isOpen = !0, o(), r()
                                }),
                                s = t.listenTo(t.ws, "close", function() {
                                    m("Closed WS connection with", i), t.isOpen = !1, delete t.ws, t.stop(), e.isPending() && n(new Error("The WS connection was closed before this operation was made"))
                                }),
                                a = t.listenTo(t.ws, "message", function(e) {
                                    m("Received message", e.data);
                                    var r = JSON.parse(e.data),
                                        n = r.id,
                                        i = t.requests[n];
                                    i || m("Steem.onMessage: unknown request ", n), delete t.requests[n], t.onMessage(r, i)
                                });
                            t.releases = t.releases.concat([o, s, a])
                        }
                    });
                    return this.startP = e, this.getApiIds(), e
                }
            }, {
                key: "stop",
                value: function() {
                    m("Stopping..."), this.ws && this.ws.close(), this.apiIdsP = {}, delete this.startP, delete this.ws, this.releases.forEach(function(t) {
                        return t()
                    }), this.releases = []
                }
            }, {
                key: "getApiIds",
                value: function(t, e) {
                    var r = this;
                    if (!e && t && this.apiIdsP[t]) return this.apiIdsP[t];
                    var n = t ? [t] : Object.keys(this.apiIds);
                    return n.forEach(function(t) {
                        r.apiIdsP[t] = r.sendAsync("login_api", {
                            method: "get_api_by_name",
                            params: [t]
                        }).then(function(e) {
                            null != e && (r.apiIds[t] = e)
                        })
                    }), t ? this.apiIdsP[t] : f.default.props(this.apiIdsP)
                }
            }, {
                key: "send",
                value: function(t, e, r) {
                    var n = this;
                    m("Steem::send", t, e);
                    var i = e.id || this.id++,
                        o = this.start(),
                        s = "login_api" === t && "get_api_by_name" === e.method ? f.default.fulfilled() : this.getApiIds(t);
                    return m("login_api" === t && "get_api_by_name" === e.method ? "Sending setup message" : "Going to wait for setup messages to resolve"), this.currentP = f.default.join(o, s).then(function() {
                        return new f.default(function(r, o) {
                            if (!n.ws) return void o(new Error("The WS connection was closed while this request was pending"));
                            var s = JSON.stringify({
                                id: i,
                                method: "call",
                                params: [n.apiIds[t], e.method, e.params]
                            });
                            m("Sending message", s), n.requests[i] = {
                                api: t,
                                data: e,
                                resolve: r,
                                reject: o,
                                start_time: Date.now()
                            }, n.ws.send(s)
                        })
                    }).nodeify(r), this.currentP
                }
            }, {
                key: "onMessage",
                value: function(t, e) {
                    var r = e.api,
                        n = e.data,
                        i = e.resolve,
                        o = e.reject,
                        s = e.start_time;
                    m("-- Steem.onMessage -->", t.id);
                    var a = t.error;
                    if (a) {
                        var u = new Error((a.message || "Failed to complete operation") + " (see err.payload for the full error payload)");
                        return u.payload = t, void o(u)
                    }
                    "login_api" === r && "login" === n.method && (m("network_broadcast_api API ID depends on the WS' session. Triggering a refresh..."), this.getApiIds("network_broadcast_api", !0)), m("Resolved", r, n, "->", t), this.emit("track-performance", n.method, Date.now() - s), delete this.requests[t.id], i(t.result)
                }
            }]), e
        }(g.default);
    e.default = w
}, function(t, e, r) {
    var n = r(93),
        i = r(94),
        o = r(107),
        s = r(117),
        a = o(function(t) {
            return t.push(void 0, s), n(i, void 0, t)
        });
    t.exports = a
}, function(t, e) {
    function r(t, e, r) {
        switch (r.length) {
            case 0:
                return t.call(e);
            case 1:
                return t.call(e, r[0]);
            case 2:
                return t.call(e, r[0], r[1]);
            case 3:
                return t.call(e, r[0], r[1], r[2])
        }
        return t.apply(e, r)
    }
    t.exports = r
}, function(t, e, r) {
    var n = r(95),
        i = r(106),
        o = r(114),
        s = i(function(t, e, r, i) {
            n(e, o(e), t, i)
        });
    t.exports = s
}, function(t, e, r) {
    function n(t, e, r, n) {
        var s = !r;
        r || (r = {});
        for (var a = -1, u = e.length; ++a < u;) {
            var f = e[a],
                c = n ? n(r[f], t[f], f, r, t) : void 0;
            void 0 === c && (c = t[f]), s ? o(r, f, c) : i(r, f, c)
        }
        return r
    }
    var i = r(96),
        o = r(97);
    t.exports = n
}, function(t, e, r) {
    function n(t, e, r) {
        var n = t[e];
        a.call(t, e) && o(n, r) && (void 0 !== r || e in t) || i(t, e, r)
    }
    var i = r(97),
        o = r(105),
        s = Object.prototype,
        a = s.hasOwnProperty;
    t.exports = n
}, function(t, e, r) {
    function n(t, e, r) {
        "__proto__" == e && i ? i(t, e, {
            configurable: !0,
            enumerable: !0,
            value: r,
            writable: !0
        }) : t[e] = r
    }
    var i = r(98);
    t.exports = n
}, function(t, e, r) {
    var n = r(99),
        i = function() {
            try {
                var t = n(Object, "defineProperty");
                return t({}, "", {}), t
            } catch (t) {}
        }();
    t.exports = i
}, function(t, e, r) {
    function n(t, e) {
        var r = o(t, e);
        return i(r) ? r : void 0
    }
    var i = r(100),
        o = r(104);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        if (!s(t) || o(t)) return !1;
        var e = i(t) ? d : f;
        return e.test(a(t))
    }
    var i = r(77),
        o = r(101),
        s = r(78),
        a = r(103),
        u = /[\\^$.*+?()[\]{}|]/g,
        f = /^\[object .+?Constructor\]$/,
        c = Function.prototype,
        h = Object.prototype,
        l = c.toString,
        p = h.hasOwnProperty,
        d = RegExp("^" + l.call(p).replace(u, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        return !!o && o in t
    }
    var i = r(102),
        o = function() {
            var t = /[^.]+$/.exec(i && i.keys && i.keys.IE_PROTO || "");
            return t ? "Symbol(src)_1." + t : ""
        }();
    t.exports = n
}, function(t, e, r) {
    var n = r(57),
        i = n["__core-js_shared__"];
    t.exports = i
}, function(t, e) {
    function r(t) {
        if (null != t) {
            try {
                return i.call(t)
            } catch (t) {}
            try {
                return t + ""
            } catch (t) {}
        }
        return ""
    }
    var n = Function.prototype,
        i = n.toString;
    t.exports = r
}, function(t, e) {
    function r(t, e) {
        return null == t ? void 0 : t[e]
    }
    t.exports = r
}, function(t, e) {
    function r(t, e) {
        return t === e || t !== t && e !== e
    }
    t.exports = r
}, function(t, e, r) {
    function n(t) {
        return i(function(e, r) {
            var n = -1,
                i = r.length,
                s = i > 1 ? r[i - 1] : void 0,
                a = i > 2 ? r[2] : void 0;
            for (s = t.length > 3 && "function" == typeof s ? (i--, s) : void 0, a && o(r[0], r[1], a) && (s = i < 3 ? void 0 : s, i = 1), e = Object(e); ++n < i;) {
                var u = r[n];
                u && t(e, u, n, s)
            }
            return e
        })
    }
    var i = r(107),
        o = r(113);
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        return s(o(t, e, i), t + "")
    }
    var i = r(81),
        o = r(108),
        s = r(109);
    t.exports = n
}, function(t, e, r) {
    function n(t, e, r) {
        return e = o(void 0 === e ? t.length - 1 : e, 0),
            function() {
                for (var n = arguments, s = -1, a = o(n.length - e, 0), u = Array(a); ++s < a;) u[s] = n[e + s];
                s = -1;
                for (var f = Array(e + 1); ++s < e;) f[s] = n[s];
                return f[e] = r(u), i(t, this, f)
            }
    }
    var i = r(93),
        o = Math.max;
    t.exports = n
}, function(t, e, r) {
    var n = r(110),
        i = r(112),
        o = i(n);
    t.exports = o
}, function(t, e, r) {
    var n = r(111),
        i = r(98),
        o = r(81),
        s = i ? function(t, e) {
            return i(t, "toString", {
                configurable: !0,
                enumerable: !1,
                value: n(e),
                writable: !0
            })
        } : o;
    t.exports = s
}, function(t, e) {
    function r(t) {
        return function() {
            return t
        }
    }
    t.exports = r
}, function(t, e) {
    function r(t) {
        var e = 0,
            r = 0;
        return function() {
            var s = o(),
                a = i - (s - r);
            if (r = s, a > 0) {
                if (++e >= n) return arguments[0]
            } else e = 0;
            return t.apply(void 0, arguments)
        }
    }
    var n = 800,
        i = 16,
        o = Date.now;
    t.exports = r
}, function(t, e, r) {
    function n(t, e, r) {
        if (!a(r)) return !1;
        var n = typeof e;
        return !!("number" == n ? o(r) && s(e, r.length) : "string" == n && e in r) && i(r[e], t)
    }
    var i = r(105),
        o = r(76),
        s = r(66),
        a = r(78);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        return s(t) ? i(t, !0) : o(t)
    }
    var i = r(51),
        o = r(115),
        s = r(76);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        if (!i(t)) return s(t);
        var e = o(t),
            r = [];
        for (var n in t)("constructor" != n || !e && u.call(t, n)) && r.push(n);
        return r
    }
    var i = r(78),
        o = r(73),
        s = r(116),
        a = Object.prototype,
        u = a.hasOwnProperty;
    t.exports = n
}, function(t, e) {
    function r(t) {
        var e = [];
        if (null != t)
            for (var r in Object(t)) e.push(r);
        return e
    }
    t.exports = r
}, function(t, e, r) {
    function n(t, e, r, n) {
        return void 0 === t || i(t, o[r]) && !s.call(n, r) ? e : t
    }
    var i = r(105),
        o = Object.prototype,
        s = o.hasOwnProperty;
    t.exports = n
}, function(t, e) {
    (function(e) {
        t.exports = !1;
        try {
            t.exports = "[object process]" === Object.prototype.toString.call(e.process)
        } catch (t) {}
    }).call(e, function() {
        return this
    }())
}, function(t, e) {}, function(t, e) {
    "use strict";

    function r(t) {
        return t.replace(i, function(t, e) {
            return e.toUpperCase()
        })
    }

    function n(t) {
        var e = void 0,
            r = void 0,
            n = void 0,
            i = void 0;
        if (i = "Account name should ", !t) return i + "not be empty.";
        var o = t.length;
        if (o < 3) return i + "be longer.";
        if (o > 16) return i + "be shorter.";
        /\./.test(t) && (i = "Each account segment should ");
        var s = t.split(".");
        for (e = 0, n = s.length; e < n; e++) {
            if (r = s[e], !/^[a-z]/.test(r)) return i + "start with a letter.";
            if (!/^[a-z0-9-]*$/.test(r)) return i + "have only letters, digits, or dashes.";
            if (/--/.test(r)) return i + "have only one dash in a row.";
            if (!/[a-z0-9]$/.test(r)) return i + "end with a letter or digit.";
            if (!(r.length >= 3)) return i + "be longer"
        }
        return null
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    }), e.camelCase = r, e.validateAccountName = n;
    var i = /_([a-z])/g
}, function(t, e, r) {
    "use strict";
    t.exports = {
        Address: r(122),
        Aes: r(173),
        PrivateKey: r(209),
        PublicKey: r(199),
        Signature: r(210),
        brainKey: r(214),
        key_utils: r(215),
        hash: r(131),
        ecc_config: r(42)
    }
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n(t, e) {
            if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
        }
        var i = function() {
                function t(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                    }
                }
                return function(e, r, n) {
                    return r && t(e.prototype, r), n && t(e, n), e
                }
            }(),
            o = r(127),
            s = r(42),
            a = r(131),
            u = r(171),
            f = function() {
                function t(e) {
                    n(this, t), this.addy = e
                }
                return i(t, [{
                    key: "toBuffer",
                    value: function() {
                        return this.addy
                    }
                }, {
                    key: "toString",
                    value: function() {
                        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : s.get("address_prefix"),
                            r = a.ripemd160(this.addy),
                            n = e.concat([this.addy, r.slice(0, 4)]);
                        return t + u.encode(n)
                    }
                }], [{
                    key: "fromBuffer",
                    value: function(e) {
                        var r = a.sha512(e),
                            n = a.ripemd160(r);
                        return new t(n)
                    }
                }, {
                    key: "fromString",
                    value: function(r) {
                        var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : s.get("address_prefix"),
                            i = r.slice(0, n.length);
                        o.equal(n, i, "Expecting key to begin with " + n + ", instead got " + i);
                        var f = r.slice(n.length);
                        f = new e(u.decode(f), "binary");
                        var c = f.slice(-4);
                        f = f.slice(0, -4);
                        var h = a.ripemd160(f);
                        return h = h.slice(0, 4), o.deepEqual(c, h, "Checksum did not match"), new t(f)
                    }
                }, {
                    key: "fromPublic",
                    value: function(r) {
                        var n = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1],
                            i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 56,
                            o = a.sha256(r.toBuffer(n)),
                            s = a.ripemd160(o),
                            u = new e(1);
                        u.writeUInt8(255 & i, 0);
                        var f = e.concat([u, s]),
                            c = a.sha256(f);
                        c = a.sha256(c);
                        var h = e.concat([f, c.slice(0, 4)]);
                        return new t(a.ripemd160(h))
                    }
                }]), t
            }();
        t.exports = f
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(t) {
        "use strict";

        function n() {
            try {
                var t = new Uint8Array(1);
                return t.__proto__ = {
                    __proto__: Uint8Array.prototype,
                    foo: function() {
                        return 42
                    }
                }, 42 === t.foo() && "function" == typeof t.subarray && 0 === t.subarray(1, 1).byteLength
            } catch (t) {
                return !1
            }
        }

        function i() {
            return s.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823
        }

        function o(t, e) {
            if (i() < e) throw new RangeError("Invalid typed array length");
            return s.TYPED_ARRAY_SUPPORT ? (t = new Uint8Array(e), t.__proto__ = s.prototype) : (null === t && (t = new s(e)), t.length = e), t
        }

        function s(t, e, r) {
            if (!(s.TYPED_ARRAY_SUPPORT || this instanceof s)) return new s(t, e, r);
            if ("number" == typeof t) {
                if ("string" == typeof e) throw new Error("If encoding is specified then the first argument must be a string");
                return c(this, t)
            }
            return a(this, t, e, r)
        }

        function a(t, e, r, n) {
            if ("number" == typeof e) throw new TypeError('"value" argument must not be a number');
            return "undefined" != typeof ArrayBuffer && e instanceof ArrayBuffer ? p(t, e, r, n) : "string" == typeof e ? h(t, e, r) : d(t, e)
        }

        function u(t) {
            if ("number" != typeof t) throw new TypeError('"size" argument must be a number');
            if (t < 0) throw new RangeError('"size" argument must not be negative')
        }

        function f(t, e, r, n) {
            return u(e), e <= 0 ? o(t, e) : void 0 !== r ? "string" == typeof n ? o(t, e).fill(r, n) : o(t, e).fill(r) : o(t, e)
        }

        function c(t, e) {
            if (u(e), t = o(t, e < 0 ? 0 : 0 | v(e)), !s.TYPED_ARRAY_SUPPORT)
                for (var r = 0; r < e; ++r) t[r] = 0;
            return t
        }

        function h(t, e, r) {
            if ("string" == typeof r && "" !== r || (r = "utf8"), !s.isEncoding(r)) throw new TypeError('"encoding" must be a valid string encoding');
            var n = 0 | g(e, r);
            t = o(t, n);
            var i = t.write(e, r);
            return i !== n && (t = t.slice(0, i)), t
        }

        function l(t, e) {
            var r = e.length < 0 ? 0 : 0 | v(e.length);
            t = o(t, r);
            for (var n = 0; n < r; n += 1) t[n] = 255 & e[n];
            return t
        }

        function p(t, e, r, n) {
            if (e.byteLength, r < 0 || e.byteLength < r) throw new RangeError("'offset' is out of bounds");
            if (e.byteLength < r + (n || 0)) throw new RangeError("'length' is out of bounds");
            return e = void 0 === r && void 0 === n ? new Uint8Array(e) : void 0 === n ? new Uint8Array(e, r) : new Uint8Array(e, r, n), s.TYPED_ARRAY_SUPPORT ? (t = e, t.__proto__ = s.prototype) : t = l(t, e), t
        }

        function d(t, e) {
            if (s.isBuffer(e)) {
                var r = 0 | v(e.length);
                return t = o(t, r), 0 === t.length ? t : (e.copy(t, 0, 0, r), t)
            }
            if (e) {
                if ("undefined" != typeof ArrayBuffer && e.buffer instanceof ArrayBuffer || "length" in e) return "number" != typeof e.length || Z(e.length) ? o(t, 0) : l(t, e);
                if ("Buffer" === e.type && J(e.data)) return l(t, e.data)
            }
            throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")
        }

        function v(t) {
            if (t >= i()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + i().toString(16) + " bytes");
            return 0 | t
        }

        function y(t) {
            return +t != t && (t = 0), s.alloc(+t)
        }

        function g(t, e) {
            if (s.isBuffer(t)) return t.length;
            if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(t) || t instanceof ArrayBuffer)) return t.byteLength;
            "string" != typeof t && (t = "" + t);
            var r = t.length;
            if (0 === r) return 0;
            for (var n = !1;;) switch (e) {
                case "ascii":
                case "latin1":
                case "binary":
                    return r;
                case "utf8":
                case "utf-8":
                case void 0:
                    return W(t).length;
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return 2 * r;
                case "hex":
                    return r >>> 1;
                case "base64":
                    return $(t).length;
                default:
                    if (n) return W(t).length;
                    e = ("" + e).toLowerCase(), n = !0
            }
        }

        function _(t, e, r) {
            var n = !1;
            if ((void 0 === e || e < 0) && (e = 0), e > this.length) return "";
            if ((void 0 === r || r > this.length) && (r = this.length), r <= 0) return "";
            if (r >>>= 0, e >>>= 0, r <= e) return "";
            for (t || (t = "utf8");;) switch (t) {
                case "hex":
                    return R(this, e, r);
                case "utf8":
                case "utf-8":
                    return I(this, e, r);
                case "ascii":
                    return j(this, e, r);
                case "latin1":
                case "binary":
                    return C(this, e, r);
                case "base64":
                    return A(this, e, r);
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return L(this, e, r);
                default:
                    if (n) throw new TypeError("Unknown encoding: " + t);
                    t = (t + "").toLowerCase(), n = !0
            }
        }

        function m(t, e, r) {
            var n = t[e];
            t[e] = t[r], t[r] = n
        }

        function b(t, e, r, n, i) {
            if (0 === t.length) return -1;
            if ("string" == typeof r ? (n = r, r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648), r = +r, isNaN(r) && (r = i ? 0 : t.length - 1), r < 0 && (r = t.length + r), r >= t.length) {
                if (i) return -1;
                r = t.length - 1
            } else if (r < 0) {
                if (!i) return -1;
                r = 0
            }
            if ("string" == typeof e && (e = s.from(e, n)), s.isBuffer(e)) return 0 === e.length ? -1 : w(t, e, r, n, i);
            if ("number" == typeof e) return e &= 255, s.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf ? i ? Uint8Array.prototype.indexOf.call(t, e, r) : Uint8Array.prototype.lastIndexOf.call(t, e, r) : w(t, [e], r, n, i);
            throw new TypeError("val must be string, number or Buffer")
        }

        function w(t, e, r, n, i) {
            function o(t, e) {
                return 1 === s ? t[e] : t.readUInt16BE(e * s)
            }
            var s = 1,
                a = t.length,
                u = e.length;
            if (void 0 !== n && (n = String(n).toLowerCase(), "ucs2" === n || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
                if (t.length < 2 || e.length < 2) return -1;
                s = 2, a /= 2, u /= 2, r /= 2
            }
            var f;
            if (i) {
                var c = -1;
                for (f = r; f < a; f++)
                    if (o(t, f) === o(e, c === -1 ? 0 : f - c)) {
                        if (c === -1 && (c = f), f - c + 1 === u) return c * s
                    } else c !== -1 && (f -= f - c), c = -1
            } else
                for (r + u > a && (r = a - u), f = r; f >= 0; f--) {
                    for (var h = !0, l = 0; l < u; l++)
                        if (o(t, f + l) !== o(e, l)) {
                            h = !1;
                            break
                        }
                    if (h) return f
                }
            return -1
        }

        function E(t, e, r, n) {
            r = Number(r) || 0;
            var i = t.length - r;
            n ? (n = Number(n), n > i && (n = i)) : n = i;
            var o = e.length;
            if (o % 2 !== 0) throw new TypeError("Invalid hex string");
            n > o / 2 && (n = o / 2);
            for (var s = 0; s < n; ++s) {
                var a = parseInt(e.substr(2 * s, 2), 16);
                if (isNaN(a)) return s;
                t[r + s] = a
            }
            return s
        }

        function k(t, e, r, n) {
            return X(W(e, t.length - r), t, r, n)
        }

        function T(t, e, r, n) {
            return X(Y(e), t, r, n)
        }

        function B(t, e, r, n) {
            return T(t, e, r, n)
        }

        function S(t, e, r, n) {
            return X($(e), t, r, n)
        }

        function x(t, e, r, n) {
            return X(G(e, t.length - r), t, r, n)
        }

        function A(t, e, r) {
            return 0 === e && r === t.length ? K.fromByteArray(t) : K.fromByteArray(t.slice(e, r))
        }

        function I(t, e, r) {
            r = Math.min(t.length, r);
            for (var n = [], i = e; i < r;) {
                var o = t[i],
                    s = null,
                    a = o > 239 ? 4 : o > 223 ? 3 : o > 191 ? 2 : 1;
                if (i + a <= r) {
                    var u, f, c, h;
                    switch (a) {
                        case 1:
                            o < 128 && (s = o);
                            break;
                        case 2:
                            u = t[i + 1], 128 === (192 & u) && (h = (31 & o) << 6 | 63 & u, h > 127 && (s = h));
                            break;
                        case 3:
                            u = t[i + 1], f = t[i + 2], 128 === (192 & u) && 128 === (192 & f) && (h = (15 & o) << 12 | (63 & u) << 6 | 63 & f, h > 2047 && (h < 55296 || h > 57343) && (s = h));
                            break;
                        case 4:
                            u = t[i + 1], f = t[i + 2], c = t[i + 3], 128 === (192 & u) && 128 === (192 & f) && 128 === (192 & c) && (h = (15 & o) << 18 | (63 & u) << 12 | (63 & f) << 6 | 63 & c, h > 65535 && h < 1114112 && (s = h))
                    }
                }
                null === s ? (s = 65533, a = 1) : s > 65535 && (s -= 65536, n.push(s >>> 10 & 1023 | 55296), s = 56320 | 1023 & s), n.push(s), i += a
            }
            return O(n)
        }

        function O(t) {
            var e = t.length;
            if (e <= tt) return String.fromCharCode.apply(String, t);
            for (var r = "", n = 0; n < e;) r += String.fromCharCode.apply(String, t.slice(n, n += tt));
            return r
        }

        function j(t, e, r) {
            var n = "";
            r = Math.min(t.length, r);
            for (var i = e; i < r; ++i) n += String.fromCharCode(127 & t[i]);
            return n
        }

        function C(t, e, r) {
            var n = "";
            r = Math.min(t.length, r);
            for (var i = e; i < r; ++i) n += String.fromCharCode(t[i]);
            return n
        }

        function R(t, e, r) {
            var n = t.length;
            (!e || e < 0) && (e = 0), (!r || r < 0 || r > n) && (r = n);
            for (var i = "", o = e; o < r; ++o) i += H(t[o]);
            return i
        }

        function L(t, e, r) {
            for (var n = t.slice(e, r), i = "", o = 0; o < n.length; o += 2) i += String.fromCharCode(n[o] + 256 * n[o + 1]);
            return i
        }

        function U(t, e, r) {
            if (t % 1 !== 0 || t < 0) throw new RangeError("offset is not uint");
            if (t + e > r) throw new RangeError("Trying to access beyond buffer length")
        }

        function F(t, e, r, n, i, o) {
            if (!s.isBuffer(t)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (e > i || e < o) throw new RangeError('"value" argument is out of bounds');
            if (r + n > t.length) throw new RangeError("Index out of range")
        }

        function P(t, e, r, n) {
            e < 0 && (e = 65535 + e + 1);
            for (var i = 0, o = Math.min(t.length - r, 2); i < o; ++i) t[r + i] = (e & 255 << 8 * (n ? i : 1 - i)) >>> 8 * (n ? i : 1 - i)
        }

        function D(t, e, r, n) {
            e < 0 && (e = 4294967295 + e + 1);
            for (var i = 0, o = Math.min(t.length - r, 4); i < o; ++i) t[r + i] = e >>> 8 * (n ? i : 3 - i) & 255
        }

        function N(t, e, r, n, i, o) {
            if (r + n > t.length) throw new RangeError("Index out of range");
            if (r < 0) throw new RangeError("Index out of range")
        }

        function M(t, e, r, n, i) {
            return i || N(t, e, r, 4, 3.4028234663852886e38, -3.4028234663852886e38), Q.write(t, e, r, n, 23, 4), r + 4
        }

        function q(t, e, r, n, i) {
            return i || N(t, e, r, 8, 1.7976931348623157e308, -1.7976931348623157e308), Q.write(t, e, r, n, 52, 8), r + 8
        }

        function z(t) {
            if (t = V(t).replace(et, ""), t.length < 2) return "";
            for (; t.length % 4 !== 0;) t += "=";
            return t
        }

        function V(t) {
            return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "")
        }

        function H(t) {
            return t < 16 ? "0" + t.toString(16) : t.toString(16)
        }

        function W(t, e) {
            e = e || 1 / 0;
            for (var r, n = t.length, i = null, o = [], s = 0; s < n; ++s) {
                if (r = t.charCodeAt(s), r > 55295 && r < 57344) {
                    if (!i) {
                        if (r > 56319) {
                            (e -= 3) > -1 && o.push(239, 191, 189);
                            continue
                        }
                        if (s + 1 === n) {
                            (e -= 3) > -1 && o.push(239, 191, 189);
                            continue
                        }
                        i = r;
                        continue
                    }
                    if (r < 56320) {
                        (e -= 3) > -1 && o.push(239, 191, 189), i = r;
                        continue
                    }
                    r = (i - 55296 << 10 | r - 56320) + 65536
                } else i && (e -= 3) > -1 && o.push(239, 191, 189);
                if (i = null, r < 128) {
                    if ((e -= 1) < 0) break;
                    o.push(r)
                } else if (r < 2048) {
                    if ((e -= 2) < 0) break;
                    o.push(r >> 6 | 192, 63 & r | 128)
                } else if (r < 65536) {
                    if ((e -= 3) < 0) break;
                    o.push(r >> 12 | 224, r >> 6 & 63 | 128, 63 & r | 128)
                } else {
                    if (!(r < 1114112)) throw new Error("Invalid code point");
                    if ((e -= 4) < 0) break;
                    o.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, 63 & r | 128)
                }
            }
            return o
        }

        function Y(t) {
            for (var e = [], r = 0; r < t.length; ++r) e.push(255 & t.charCodeAt(r));
            return e
        }

        function G(t, e) {
            for (var r, n, i, o = [], s = 0; s < t.length && !((e -= 2) < 0); ++s) r = t.charCodeAt(s), n = r >> 8, i = r % 256, o.push(i), o.push(n);
            return o
        }

        function $(t) {
            return K.toByteArray(z(t))
        }

        function X(t, e, r, n) {
            for (var i = 0; i < n && !(i + r >= e.length || i >= t.length); ++i) e[i + r] = t[i];
            return i
        }

        function Z(t) {
            return t !== t
        }
        var K = r(124),
            Q = r(125),
            J = r(126);
        e.Buffer = s, e.SlowBuffer = y, e.INSPECT_MAX_BYTES = 50, s.TYPED_ARRAY_SUPPORT = void 0 !== t.TYPED_ARRAY_SUPPORT ? t.TYPED_ARRAY_SUPPORT : n(), e.kMaxLength = i(), s.poolSize = 8192, s._augment = function(t) {
            return t.__proto__ = s.prototype, t
        }, s.from = function(t, e, r) {
            return a(null, t, e, r)
        }, s.TYPED_ARRAY_SUPPORT && (s.prototype.__proto__ = Uint8Array.prototype, s.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && s[Symbol.species] === s && Object.defineProperty(s, Symbol.species, {
            value: null,
            configurable: !0
        })), s.alloc = function(t, e, r) {
            return f(null, t, e, r)
        }, s.allocUnsafe = function(t) {
            return c(null, t)
        }, s.allocUnsafeSlow = function(t) {
            return c(null, t)
        }, s.isBuffer = function(t) {
            return !(null == t || !t._isBuffer)
        }, s.compare = function(t, e) {
            if (!s.isBuffer(t) || !s.isBuffer(e)) throw new TypeError("Arguments must be Buffers");
            if (t === e) return 0;
            for (var r = t.length, n = e.length, i = 0, o = Math.min(r, n); i < o; ++i)
                if (t[i] !== e[i]) {
                    r = t[i], n = e[i];
                    break
                }
            return r < n ? -1 : n < r ? 1 : 0
        }, s.isEncoding = function(t) {
            switch (String(t).toLowerCase()) {
                case "hex":
                case "utf8":
                case "utf-8":
                case "ascii":
                case "latin1":
                case "binary":
                case "base64":
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return !0;
                default:
                    return !1
            }
        }, s.concat = function(t, e) {
            if (!J(t)) throw new TypeError('"list" argument must be an Array of Buffers');
            if (0 === t.length) return s.alloc(0);
            var r;
            if (void 0 === e)
                for (e = 0, r = 0; r < t.length; ++r) e += t[r].length;
            var n = s.allocUnsafe(e),
                i = 0;
            for (r = 0; r < t.length; ++r) {
                var o = t[r];
                if (!s.isBuffer(o)) throw new TypeError('"list" argument must be an Array of Buffers');
                o.copy(n, i), i += o.length
            }
            return n
        }, s.byteLength = g, s.prototype._isBuffer = !0, s.prototype.swap16 = function() {
            var t = this.length;
            if (t % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
            for (var e = 0; e < t; e += 2) m(this, e, e + 1);
            return this
        }, s.prototype.swap32 = function() {
            var t = this.length;
            if (t % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
            for (var e = 0; e < t; e += 4) m(this, e, e + 3), m(this, e + 1, e + 2);
            return this
        }, s.prototype.swap64 = function() {
            var t = this.length;
            if (t % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
            for (var e = 0; e < t; e += 8) m(this, e, e + 7), m(this, e + 1, e + 6), m(this, e + 2, e + 5), m(this, e + 3, e + 4);
            return this
        }, s.prototype.toString = function() {
            var t = 0 | this.length;
            return 0 === t ? "" : 0 === arguments.length ? I(this, 0, t) : _.apply(this, arguments)
        }, s.prototype.equals = function(t) {
            if (!s.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
            return this === t || 0 === s.compare(this, t)
        }, s.prototype.inspect = function() {
            var t = "",
                r = e.INSPECT_MAX_BYTES;
            return this.length > 0 && (t = this.toString("hex", 0, r).match(/.{2}/g).join(" "), this.length > r && (t += " ... ")), "<Buffer " + t + ">"
        }, s.prototype.compare = function(t, e, r, n, i) {
            if (!s.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
            if (void 0 === e && (e = 0), void 0 === r && (r = t ? t.length : 0), void 0 === n && (n = 0), void 0 === i && (i = this.length), e < 0 || r > t.length || n < 0 || i > this.length) throw new RangeError("out of range index");
            if (n >= i && e >= r) return 0;
            if (n >= i) return -1;
            if (e >= r) return 1;
            if (e >>>= 0, r >>>= 0, n >>>= 0, i >>>= 0, this === t) return 0;
            for (var o = i - n, a = r - e, u = Math.min(o, a), f = this.slice(n, i), c = t.slice(e, r), h = 0; h < u; ++h)
                if (f[h] !== c[h]) {
                    o = f[h], a = c[h];
                    break
                }
            return o < a ? -1 : a < o ? 1 : 0
        }, s.prototype.includes = function(t, e, r) {
            return this.indexOf(t, e, r) !== -1
        }, s.prototype.indexOf = function(t, e, r) {
            return b(this, t, e, r, !0)
        }, s.prototype.lastIndexOf = function(t, e, r) {
            return b(this, t, e, r, !1)
        }, s.prototype.write = function(t, e, r, n) {
            if (void 0 === e) n = "utf8", r = this.length, e = 0;
            else if (void 0 === r && "string" == typeof e) n = e, r = this.length, e = 0;
            else {
                if (!isFinite(e)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                e |= 0, isFinite(r) ? (r |= 0, void 0 === n && (n = "utf8")) : (n = r, r = void 0)
            }
            var i = this.length - e;
            if ((void 0 === r || r > i) && (r = i), t.length > 0 && (r < 0 || e < 0) || e > this.length) throw new RangeError("Attempt to write outside buffer bounds");
            n || (n = "utf8");
            for (var o = !1;;) switch (n) {
                case "hex":
                    return E(this, t, e, r);
                case "utf8":
                case "utf-8":
                    return k(this, t, e, r);
                case "ascii":
                    return T(this, t, e, r);
                case "latin1":
                case "binary":
                    return B(this, t, e, r);
                case "base64":
                    return S(this, t, e, r);
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return x(this, t, e, r);
                default:
                    if (o) throw new TypeError("Unknown encoding: " + n);
                    n = ("" + n).toLowerCase(), o = !0
            }
        }, s.prototype.toJSON = function() {
            return {
                type: "Buffer",
                data: Array.prototype.slice.call(this._arr || this, 0)
            }
        };
        var tt = 4096;
        s.prototype.slice = function(t, e) {
            var r = this.length;
            t = ~~t, e = void 0 === e ? r : ~~e, t < 0 ? (t += r, t < 0 && (t = 0)) : t > r && (t = r), e < 0 ? (e += r, e < 0 && (e = 0)) : e > r && (e = r), e < t && (e = t);
            var n;
            if (s.TYPED_ARRAY_SUPPORT) n = this.subarray(t, e), n.__proto__ = s.prototype;
            else {
                var i = e - t;
                n = new s(i, void 0);
                for (var o = 0; o < i; ++o) n[o] = this[o + t]
            }
            return n
        }, s.prototype.readUIntLE = function(t, e, r) {
            t |= 0, e |= 0, r || U(t, e, this.length);
            for (var n = this[t], i = 1, o = 0; ++o < e && (i *= 256);) n += this[t + o] * i;
            return n
        }, s.prototype.readUIntBE = function(t, e, r) {
            t |= 0, e |= 0, r || U(t, e, this.length);
            for (var n = this[t + --e], i = 1; e > 0 && (i *= 256);) n += this[t + --e] * i;
            return n
        }, s.prototype.readUInt8 = function(t, e) {
            return e || U(t, 1, this.length), this[t]
        }, s.prototype.readUInt16LE = function(t, e) {
            return e || U(t, 2, this.length), this[t] | this[t + 1] << 8
        }, s.prototype.readUInt16BE = function(t, e) {
            return e || U(t, 2, this.length), this[t] << 8 | this[t + 1]
        }, s.prototype.readUInt32LE = function(t, e) {
            return e || U(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3]
        }, s.prototype.readUInt32BE = function(t, e) {
            return e || U(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3])
        }, s.prototype.readIntLE = function(t, e, r) {
            t |= 0, e |= 0, r || U(t, e, this.length);
            for (var n = this[t], i = 1, o = 0; ++o < e && (i *= 256);) n += this[t + o] * i;
            return i *= 128, n >= i && (n -= Math.pow(2, 8 * e)), n
        }, s.prototype.readIntBE = function(t, e, r) {
            t |= 0, e |= 0, r || U(t, e, this.length);
            for (var n = e, i = 1, o = this[t + --n]; n > 0 && (i *= 256);) o += this[t + --n] * i;
            return i *= 128, o >= i && (o -= Math.pow(2, 8 * e)), o
        }, s.prototype.readInt8 = function(t, e) {
            return e || U(t, 1, this.length), 128 & this[t] ? (255 - this[t] + 1) * -1 : this[t]
        }, s.prototype.readInt16LE = function(t, e) {
            e || U(t, 2, this.length);
            var r = this[t] | this[t + 1] << 8;
            return 32768 & r ? 4294901760 | r : r
        }, s.prototype.readInt16BE = function(t, e) {
            e || U(t, 2, this.length);
            var r = this[t + 1] | this[t] << 8;
            return 32768 & r ? 4294901760 | r : r
        }, s.prototype.readInt32LE = function(t, e) {
            return e || U(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24
        }, s.prototype.readInt32BE = function(t, e) {
            return e || U(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]
        }, s.prototype.readFloatLE = function(t, e) {
            return e || U(t, 4, this.length), Q.read(this, t, !0, 23, 4)
        }, s.prototype.readFloatBE = function(t, e) {
            return e || U(t, 4, this.length), Q.read(this, t, !1, 23, 4)
        }, s.prototype.readDoubleLE = function(t, e) {
            return e || U(t, 8, this.length), Q.read(this, t, !0, 52, 8)
        }, s.prototype.readDoubleBE = function(t, e) {
            return e || U(t, 8, this.length), Q.read(this, t, !1, 52, 8)
        }, s.prototype.writeUIntLE = function(t, e, r, n) {
            if (t = +t, e |= 0, r |= 0, !n) {
                var i = Math.pow(2, 8 * r) - 1;
                F(this, t, e, r, i, 0)
            }
            var o = 1,
                s = 0;
            for (this[e] = 255 & t; ++s < r && (o *= 256);) this[e + s] = t / o & 255;
            return e + r
        }, s.prototype.writeUIntBE = function(t, e, r, n) {
            if (t = +t, e |= 0, r |= 0, !n) {
                var i = Math.pow(2, 8 * r) - 1;
                F(this, t, e, r, i, 0)
            }
            var o = r - 1,
                s = 1;
            for (this[e + o] = 255 & t; --o >= 0 && (s *= 256);) this[e + o] = t / s & 255;
            return e + r
        }, s.prototype.writeUInt8 = function(t, e, r) {
            return t = +t, e |= 0, r || F(this, t, e, 1, 255, 0), s.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), this[e] = 255 & t, e + 1
        }, s.prototype.writeUInt16LE = function(t, e, r) {
            return t = +t, e |= 0, r || F(this, t, e, 2, 65535, 0), s.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : P(this, t, e, !0), e + 2
        }, s.prototype.writeUInt16BE = function(t, e, r) {
            return t = +t, e |= 0, r || F(this, t, e, 2, 65535, 0), s.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : P(this, t, e, !1), e + 2
        }, s.prototype.writeUInt32LE = function(t, e, r) {
            return t = +t, e |= 0, r || F(this, t, e, 4, 4294967295, 0), s.TYPED_ARRAY_SUPPORT ? (this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = 255 & t) : D(this, t, e, !0), e + 4
        }, s.prototype.writeUInt32BE = function(t, e, r) {
            return t = +t, e |= 0, r || F(this, t, e, 4, 4294967295, 0), s.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : D(this, t, e, !1), e + 4
        }, s.prototype.writeIntLE = function(t, e, r, n) {
            if (t = +t, e |= 0, !n) {
                var i = Math.pow(2, 8 * r - 1);
                F(this, t, e, r, i - 1, -i)
            }
            var o = 0,
                s = 1,
                a = 0;
            for (this[e] = 255 & t; ++o < r && (s *= 256);) t < 0 && 0 === a && 0 !== this[e + o - 1] && (a = 1), this[e + o] = (t / s >> 0) - a & 255;
            return e + r
        }, s.prototype.writeIntBE = function(t, e, r, n) {
            if (t = +t, e |= 0, !n) {
                var i = Math.pow(2, 8 * r - 1);
                F(this, t, e, r, i - 1, -i)
            }
            var o = r - 1,
                s = 1,
                a = 0;
            for (this[e + o] = 255 & t; --o >= 0 && (s *= 256);) t < 0 && 0 === a && 0 !== this[e + o + 1] && (a = 1), this[e + o] = (t / s >> 0) - a & 255;
            return e + r
        }, s.prototype.writeInt8 = function(t, e, r) {
            return t = +t, e |= 0, r || F(this, t, e, 1, 127, -128), s.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), t < 0 && (t = 255 + t + 1), this[e] = 255 & t, e + 1
        }, s.prototype.writeInt16LE = function(t, e, r) {
            return t = +t, e |= 0, r || F(this, t, e, 2, 32767, -32768), s.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : P(this, t, e, !0), e + 2
        }, s.prototype.writeInt16BE = function(t, e, r) {
            return t = +t, e |= 0, r || F(this, t, e, 2, 32767, -32768), s.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : P(this, t, e, !1), e + 2
        }, s.prototype.writeInt32LE = function(t, e, r) {
            return t = +t, e |= 0, r || F(this, t, e, 4, 2147483647, -2147483648), s.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24) : D(this, t, e, !0), e + 4
        }, s.prototype.writeInt32BE = function(t, e, r) {
            return t = +t, e |= 0, r || F(this, t, e, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), s.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : D(this, t, e, !1), e + 4
        }, s.prototype.writeFloatLE = function(t, e, r) {
            return M(this, t, e, !0, r)
        }, s.prototype.writeFloatBE = function(t, e, r) {
            return M(this, t, e, !1, r)
        }, s.prototype.writeDoubleLE = function(t, e, r) {
            return q(this, t, e, !0, r)
        }, s.prototype.writeDoubleBE = function(t, e, r) {
            return q(this, t, e, !1, r)
        }, s.prototype.copy = function(t, e, r, n) {
            if (r || (r = 0), n || 0 === n || (n = this.length), e >= t.length && (e = t.length), e || (e = 0), n > 0 && n < r && (n = r), n === r) return 0;
            if (0 === t.length || 0 === this.length) return 0;
            if (e < 0) throw new RangeError("targetStart out of bounds");
            if (r < 0 || r >= this.length) throw new RangeError("sourceStart out of bounds");
            if (n < 0) throw new RangeError("sourceEnd out of bounds");
            n > this.length && (n = this.length), t.length - e < n - r && (n = t.length - e + r);
            var i, o = n - r;
            if (this === t && r < e && e < n)
                for (i = o - 1; i >= 0; --i) t[i + e] = this[i + r];
            else if (o < 1e3 || !s.TYPED_ARRAY_SUPPORT)
                for (i = 0; i < o; ++i) t[i + e] = this[i + r];
            else Uint8Array.prototype.set.call(t, this.subarray(r, r + o), e);
            return o
        }, s.prototype.fill = function(t, e, r, n) {
            if ("string" == typeof t) {
                if ("string" == typeof e ? (n = e, e = 0, r = this.length) : "string" == typeof r && (n = r, r = this.length), 1 === t.length) {
                    var i = t.charCodeAt(0);
                    i < 256 && (t = i)
                }
                if (void 0 !== n && "string" != typeof n) throw new TypeError("encoding must be a string");
                if ("string" == typeof n && !s.isEncoding(n)) throw new TypeError("Unknown encoding: " + n)
            } else "number" == typeof t && (t &= 255);
            if (e < 0 || this.length < e || this.length < r) throw new RangeError("Out of range index");
            if (r <= e) return this;
            e >>>= 0, r = void 0 === r ? this.length : r >>> 0, t || (t = 0);
            var o;
            if ("number" == typeof t)
                for (o = e; o < r; ++o) this[o] = t;
            else {
                var a = s.isBuffer(t) ? t : W(new s(t, n).toString()),
                    u = a.length;
                for (o = 0; o < r - e; ++o) this[o + e] = a[o % u]
            }
            return this
        };
        var et = /[^+\/0-9A-Za-z-_]/g
    }).call(e, function() {
        return this
    }())
}, function(t, e) {
    "use strict";

    function r(t) {
        var e = t.length;
        if (e % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
        return "=" === t[e - 2] ? 2 : "=" === t[e - 1] ? 1 : 0
    }

    function n(t) {
        return 3 * t.length / 4 - r(t)
    }

    function i(t) {
        var e, n, i, o, s, a = t.length;
        o = r(t), s = new c(3 * a / 4 - o), n = o > 0 ? a - 4 : a;
        var u = 0;
        for (e = 0; e < n; e += 4) i = f[t.charCodeAt(e)] << 18 | f[t.charCodeAt(e + 1)] << 12 | f[t.charCodeAt(e + 2)] << 6 | f[t.charCodeAt(e + 3)], s[u++] = i >> 16 & 255, s[u++] = i >> 8 & 255, s[u++] = 255 & i;
        return 2 === o ? (i = f[t.charCodeAt(e)] << 2 | f[t.charCodeAt(e + 1)] >> 4, s[u++] = 255 & i) : 1 === o && (i = f[t.charCodeAt(e)] << 10 | f[t.charCodeAt(e + 1)] << 4 | f[t.charCodeAt(e + 2)] >> 2, s[u++] = i >> 8 & 255, s[u++] = 255 & i), s
    }

    function o(t) {
        return u[t >> 18 & 63] + u[t >> 12 & 63] + u[t >> 6 & 63] + u[63 & t]
    }

    function s(t, e, r) {
        for (var n, i = [], s = e; s < r; s += 3) n = (t[s] << 16) + (t[s + 1] << 8) + t[s + 2], i.push(o(n));
        return i.join("")
    }

    function a(t) {
        for (var e, r = t.length, n = r % 3, i = "", o = [], a = 16383, f = 0, c = r - n; f < c; f += a) o.push(s(t, f, f + a > c ? c : f + a));
        return 1 === n ? (e = t[r - 1], i += u[e >> 2], i += u[e << 4 & 63], i += "==") : 2 === n && (e = (t[r - 2] << 8) + t[r - 1], i += u[e >> 10], i += u[e >> 4 & 63], i += u[e << 2 & 63], i += "="), o.push(i), o.join("")
    }
    e.byteLength = n, e.toByteArray = i, e.fromByteArray = a;
    for (var u = [], f = [], c = "undefined" != typeof Uint8Array ? Uint8Array : Array, h = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", l = 0, p = h.length; l < p; ++l) u[l] = h[l], f[h.charCodeAt(l)] = l;
    f["-".charCodeAt(0)] = 62, f["_".charCodeAt(0)] = 63
}, function(t, e) {
    e.read = function(t, e, r, n, i) {
        var o, s, a = 8 * i - n - 1,
            u = (1 << a) - 1,
            f = u >> 1,
            c = -7,
            h = r ? i - 1 : 0,
            l = r ? -1 : 1,
            p = t[e + h];
        for (h += l, o = p & (1 << -c) - 1, p >>= -c, c += a; c > 0; o = 256 * o + t[e + h], h += l, c -= 8);
        for (s = o & (1 << -c) - 1, o >>= -c, c += n; c > 0; s = 256 * s + t[e + h], h += l, c -= 8);
        if (0 === o) o = 1 - f;
        else {
            if (o === u) return s ? NaN : (p ? -1 : 1) * (1 / 0);
            s += Math.pow(2, n), o -= f
        }
        return (p ? -1 : 1) * s * Math.pow(2, o - n)
    }, e.write = function(t, e, r, n, i, o) {
        var s, a, u, f = 8 * o - i - 1,
            c = (1 << f) - 1,
            h = c >> 1,
            l = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
            p = n ? 0 : o - 1,
            d = n ? 1 : -1,
            v = e < 0 || 0 === e && 1 / e < 0 ? 1 : 0;
        for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (a = isNaN(e) ? 1 : 0, s = c) : (s = Math.floor(Math.log(e) / Math.LN2), e * (u = Math.pow(2, -s)) < 1 && (s--, u *= 2), e += s + h >= 1 ? l / u : l * Math.pow(2, 1 - h), e * u >= 2 && (s++, u /= 2), s + h >= c ? (a = 0, s = c) : s + h >= 1 ? (a = (e * u - 1) * Math.pow(2, i), s += h) : (a = e * Math.pow(2, h - 1) * Math.pow(2, i), s = 0)); i >= 8; t[r + p] = 255 & a, p += d, a /= 256, i -= 8);
        for (s = s << i | a, f += i; f > 0; t[r + p] = 255 & s, p += d, s /= 256, f -= 8);
        t[r + p - d] |= 128 * v
    }
}, function(t, e) {
    var r = {}.toString;
    t.exports = Array.isArray || function(t) {
        return "[object Array]" == r.call(t)
    }
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n(t, e) {
            if (t === e) return 0;
            for (var r = t.length, n = e.length, i = 0, o = Math.min(r, n); i < o; ++i)
                if (t[i] !== e[i]) {
                    r = t[i], n = e[i];
                    break
                }
            return r < n ? -1 : n < r ? 1 : 0
        }

        function i(t) {
            return e.Buffer && "function" == typeof e.Buffer.isBuffer ? e.Buffer.isBuffer(t) : !(null == t || !t._isBuffer)
        }

        function o(t) {
            return Object.prototype.toString.call(t)
        }

        function s(t) {
            return !i(t) && ("function" == typeof e.ArrayBuffer && ("function" == typeof ArrayBuffer.isView ? ArrayBuffer.isView(t) : !!t && (t instanceof DataView || !!(t.buffer && t.buffer instanceof ArrayBuffer))))
        }

        function a(t) {
            if (b.isFunction(t)) {
                if (k) return t.name;
                var e = t.toString(),
                    r = e.match(B);
                return r && r[1]
            }
        }

        function u(t, e) {
            return "string" == typeof t ? t.length < e ? t : t.slice(0, e) : t
        }

        function f(t) {
            if (k || !b.isFunction(t)) return b.inspect(t);
            var e = a(t),
                r = e ? ": " + e : "";
            return "[Function" + r + "]"
        }

        function c(t) {
            return u(f(t.actual), 128) + " " + t.operator + " " + u(f(t.expected), 128)
        }

        function h(t, e, r, n, i) {
            throw new T.AssertionError({
                message: r,
                actual: t,
                expected: e,
                operator: n,
                stackStartFunction: i
            })
        }

        function l(t, e) {
            t || h(t, !0, e, "==", T.ok)
        }

        function p(t, e, r, a) {
            if (t === e) return !0;
            if (i(t) && i(e)) return 0 === n(t, e);
            if (b.isDate(t) && b.isDate(e)) return t.getTime() === e.getTime();
            if (b.isRegExp(t) && b.isRegExp(e)) return t.source === e.source && t.global === e.global && t.multiline === e.multiline && t.lastIndex === e.lastIndex && t.ignoreCase === e.ignoreCase;
            if (null !== t && "object" == typeof t || null !== e && "object" == typeof e) {
                if (s(t) && s(e) && o(t) === o(e) && !(t instanceof Float32Array || t instanceof Float64Array)) return 0 === n(new Uint8Array(t.buffer), new Uint8Array(e.buffer));
                if (i(t) !== i(e)) return !1;
                a = a || {
                    actual: [],
                    expected: []
                };
                var u = a.actual.indexOf(t);
                return u !== -1 && u === a.expected.indexOf(e) || (a.actual.push(t), a.expected.push(e), v(t, e, r, a))
            }
            return r ? t === e : t == e
        }

        function d(t) {
            return "[object Arguments]" == Object.prototype.toString.call(t)
        }

        function v(t, e, r, n) {
            if (null === t || void 0 === t || null === e || void 0 === e) return !1;
            if (b.isPrimitive(t) || b.isPrimitive(e)) return t === e;
            if (r && Object.getPrototypeOf(t) !== Object.getPrototypeOf(e)) return !1;
            var i = d(t),
                o = d(e);
            if (i && !o || !i && o) return !1;
            if (i) return t = E.call(t), e = E.call(e), p(t, e, r);
            var s, a, u = S(t),
                f = S(e);
            if (u.length !== f.length) return !1;
            for (u.sort(), f.sort(), a = u.length - 1; a >= 0; a--)
                if (u[a] !== f[a]) return !1;
            for (a = u.length - 1; a >= 0; a--)
                if (s = u[a], !p(t[s], e[s], r, n)) return !1;
            return !0
        }

        function y(t, e, r) {
            p(t, e, !0) && h(t, e, r, "notDeepStrictEqual", y)
        }

        function g(t, e) {
            if (!t || !e) return !1;
            if ("[object RegExp]" == Object.prototype.toString.call(e)) return e.test(t);
            try {
                if (t instanceof e) return !0
            } catch (t) {}
            return !Error.isPrototypeOf(e) && e.call({}, t) === !0
        }

        function _(t) {
            var e;
            try {
                t()
            } catch (t) {
                e = t
            }
            return e
        }

        function m(t, e, r, n) {
            var i;
            if ("function" != typeof e) throw new TypeError('"block" argument must be a function');
            "string" == typeof r && (n = r, r = null), i = _(e), n = (r && r.name ? " (" + r.name + ")." : ".") + (n ? " " + n : "."), t && !i && h(i, r, "Missing expected exception" + n);
            var o = "string" == typeof n,
                s = !t && b.isError(i),
                a = !t && i && !r;
            if ((s && o && g(i, r) || a) && h(i, r, "Got unwanted exception" + n), t && i && r && !g(i, r) || !t && i) throw i
        }
        var b = r(128),
            w = Object.prototype.hasOwnProperty,
            E = Array.prototype.slice,
            k = function() {
                return "foo" === function() {}.name
            }(),
            T = t.exports = l,
            B = /\s*function\s+([^\(\s]*)\s*/;
        T.AssertionError = function(t) {
            this.name = "AssertionError", this.actual = t.actual, this.expected = t.expected, this.operator = t.operator, t.message ? (this.message = t.message, this.generatedMessage = !1) : (this.message = c(this), this.generatedMessage = !0);
            var e = t.stackStartFunction || h;
            if (Error.captureStackTrace) Error.captureStackTrace(this, e);
            else {
                var r = new Error;
                if (r.stack) {
                    var n = r.stack,
                        i = a(e),
                        o = n.indexOf("\n" + i);
                    if (o >= 0) {
                        var s = n.indexOf("\n", o + 1);
                        n = n.substring(s + 1)
                    }
                    this.stack = n
                }
            }
        }, b.inherits(T.AssertionError, Error), T.fail = h, T.ok = l, T.equal = function(t, e, r) {
            t != e && h(t, e, r, "==", T.equal)
        }, T.notEqual = function(t, e, r) {
            t == e && h(t, e, r, "!=", T.notEqual)
        }, T.deepEqual = function(t, e, r) {
            p(t, e, !1) || h(t, e, r, "deepEqual", T.deepEqual)
        }, T.deepStrictEqual = function(t, e, r) {
            p(t, e, !0) || h(t, e, r, "deepStrictEqual", T.deepStrictEqual)
        }, T.notDeepEqual = function(t, e, r) {
            p(t, e, !1) && h(t, e, r, "notDeepEqual", T.notDeepEqual)
        }, T.notDeepStrictEqual = y, T.strictEqual = function(t, e, r) {
            t !== e && h(t, e, r, "===", T.strictEqual)
        }, T.notStrictEqual = function(t, e, r) {
            t === e && h(t, e, r, "!==", T.notStrictEqual)
        }, T.throws = function(t, e, r) {
            m(!0, t, e, r)
        }, T.doesNotThrow = function(t, e, r) {
            m(!1, t, e, r)
        }, T.ifError = function(t) {
            if (t) throw t
        };
        var S = Object.keys || function(t) {
            var e = [];
            for (var r in t) w.call(t, r) && e.push(r);
            return e
        }
    }).call(e, function() {
        return this
    }())
}, function(t, e, r) {
    (function(t, n) {
        function i(t, r) {
            var n = {
                seen: [],
                stylize: s
            };
            return arguments.length >= 3 && (n.depth = arguments[2]), arguments.length >= 4 && (n.colors = arguments[3]), v(r) ? n.showHidden = r : r && e._extend(n, r), w(n.showHidden) && (n.showHidden = !1), w(n.depth) && (n.depth = 2), w(n.colors) && (n.colors = !1), w(n.customInspect) && (n.customInspect = !0), n.colors && (n.stylize = o), u(n, t, n.depth)
        }

        function o(t, e) {
            var r = i.styles[e];
            return r ? "[" + i.colors[r][0] + "m" + t + "[" + i.colors[r][1] + "m" : t
        }

        function s(t, e) {
            return t
        }

        function a(t) {
            var e = {};
            return t.forEach(function(t, r) {
                e[t] = !0
            }), e
        }

        function u(t, r, n) {
            if (t.customInspect && r && S(r.inspect) && r.inspect !== e.inspect && (!r.constructor || r.constructor.prototype !== r)) {
                var i = r.inspect(n, t);
                return m(i) || (i = u(t, i, n)), i
            }
            var o = f(t, r);
            if (o) return o;
            var s = Object.keys(r),
                v = a(s);
            if (t.showHidden && (s = Object.getOwnPropertyNames(r)), B(r) && (s.indexOf("message") >= 0 || s.indexOf("description") >= 0)) return c(r);
            if (0 === s.length) {
                if (S(r)) {
                    var y = r.name ? ": " + r.name : "";
                    return t.stylize("[Function" + y + "]", "special")
                }
                if (E(r)) return t.stylize(RegExp.prototype.toString.call(r), "regexp");
                if (T(r)) return t.stylize(Date.prototype.toString.call(r), "date");
                if (B(r)) return c(r)
            }
            var g = "",
                _ = !1,
                b = ["{", "}"];
            if (d(r) && (_ = !0, b = ["[", "]"]), S(r)) {
                var w = r.name ? ": " + r.name : "";
                g = " [Function" + w + "]"
            }
            if (E(r) && (g = " " + RegExp.prototype.toString.call(r)), T(r) && (g = " " + Date.prototype.toUTCString.call(r)), B(r) && (g = " " + c(r)), 0 === s.length && (!_ || 0 == r.length)) return b[0] + g + b[1];
            if (n < 0) return E(r) ? t.stylize(RegExp.prototype.toString.call(r), "regexp") : t.stylize("[Object]", "special");
            t.seen.push(r);
            var k;
            return k = _ ? h(t, r, n, v, s) : s.map(function(e) {
                return l(t, r, n, v, e, _)
            }), t.seen.pop(), p(k, g, b)
        }

        function f(t, e) {
            if (w(e)) return t.stylize("undefined", "undefined");
            if (m(e)) {
                var r = "'" + JSON.stringify(e).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                return t.stylize(r, "string")
            }
            return _(e) ? t.stylize("" + e, "number") : v(e) ? t.stylize("" + e, "boolean") : y(e) ? t.stylize("null", "null") : void 0
        }

        function c(t) {
            return "[" + Error.prototype.toString.call(t) + "]"
        }

        function h(t, e, r, n, i) {
            for (var o = [], s = 0, a = e.length; s < a; ++s) j(e, String(s)) ? o.push(l(t, e, r, n, String(s), !0)) : o.push("");
            return i.forEach(function(i) {
                i.match(/^\d+$/) || o.push(l(t, e, r, n, i, !0))
            }), o
        }

        function l(t, e, r, n, i, o) {
            var s, a, f;
            if (f = Object.getOwnPropertyDescriptor(e, i) || {
                    value: e[i]
                }, f.get ? a = f.set ? t.stylize("[Getter/Setter]", "special") : t.stylize("[Getter]", "special") : f.set && (a = t.stylize("[Setter]", "special")), j(n, i) || (s = "[" + i + "]"), a || (t.seen.indexOf(f.value) < 0 ? (a = y(r) ? u(t, f.value, null) : u(t, f.value, r - 1), a.indexOf("\n") > -1 && (a = o ? a.split("\n").map(function(t) {
                    return "  " + t
                }).join("\n").substr(2) : "\n" + a.split("\n").map(function(t) {
                    return "   " + t
                }).join("\n"))) : a = t.stylize("[Circular]", "special")), w(s)) {
                if (o && i.match(/^\d+$/)) return a;
                s = JSON.stringify("" + i), s.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (s = s.substr(1, s.length - 2), s = t.stylize(s, "name")) : (s = s.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), s = t.stylize(s, "string"))
            }
            return s + ": " + a
        }

        function p(t, e, r) {
            var n = 0,
                i = t.reduce(function(t, e) {
                    return n++, e.indexOf("\n") >= 0 && n++, t + e.replace(/\u001b\[\d\d?m/g, "").length + 1
                }, 0);
            return i > 60 ? r[0] + ("" === e ? "" : e + "\n ") + " " + t.join(",\n  ") + " " + r[1] : r[0] + e + " " + t.join(", ") + " " + r[1]
        }

        function d(t) {
            return Array.isArray(t)
        }

        function v(t) {
            return "boolean" == typeof t
        }

        function y(t) {
            return null === t
        }

        function g(t) {
            return null == t
        }

        function _(t) {
            return "number" == typeof t
        }

        function m(t) {
            return "string" == typeof t
        }

        function b(t) {
            return "symbol" == typeof t
        }

        function w(t) {
            return void 0 === t
        }

        function E(t) {
            return k(t) && "[object RegExp]" === A(t)
        }

        function k(t) {
            return "object" == typeof t && null !== t
        }

        function T(t) {
            return k(t) && "[object Date]" === A(t)
        }

        function B(t) {
            return k(t) && ("[object Error]" === A(t) || t instanceof Error)
        }

        function S(t) {
            return "function" == typeof t
        }

        function x(t) {
            return null === t || "boolean" == typeof t || "number" == typeof t || "string" == typeof t || "symbol" == typeof t || "undefined" == typeof t
        }

        function A(t) {
            return Object.prototype.toString.call(t)
        }

        function I(t) {
            return t < 10 ? "0" + t.toString(10) : t.toString(10)
        }

        function O() {
            var t = new Date,
                e = [I(t.getHours()), I(t.getMinutes()), I(t.getSeconds())].join(":");
            return [t.getDate(), U[t.getMonth()], e].join(" ")
        }

        function j(t, e) {
            return Object.prototype.hasOwnProperty.call(t, e)
        }
        var C = /%[sdj%]/g;
        e.format = function(t) {
            if (!m(t)) {
                for (var e = [], r = 0; r < arguments.length; r++) e.push(i(arguments[r]));
                return e.join(" ")
            }
            for (var r = 1, n = arguments, o = n.length, s = String(t).replace(C, function(t) {
                    if ("%%" === t) return "%";
                    if (r >= o) return t;
                    switch (t) {
                        case "%s":
                            return String(n[r++]);
                        case "%d":
                            return Number(n[r++]);
                        case "%j":
                            try {
                                return JSON.stringify(n[r++])
                            } catch (t) {
                                return "[Circular]"
                            }
                        default:
                            return t
                    }
                }), a = n[r]; r < o; a = n[++r]) s += y(a) || !k(a) ? " " + a : " " + i(a);
            return s
        }, e.deprecate = function(r, i) {
            function o() {
                if (!s) {
                    if (n.throwDeprecation) throw new Error(i);
                    n.traceDeprecation ? console.trace(i) : console.error(i), s = !0
                }
                return r.apply(this, arguments)
            }
            if (w(t.process)) return function() {
                return e.deprecate(r, i).apply(this, arguments)
            };
            if (n.noDeprecation === !0) return r;
            var s = !1;
            return o
        };
        var R, L = {};
        e.debuglog = function(t) {
            if (w(R) && (R = n.env.NODE_DEBUG || ""), t = t.toUpperCase(), !L[t])
                if (new RegExp("\\b" + t + "\\b", "i").test(R)) {
                    var r = n.pid;
                    L[t] = function() {
                        var n = e.format.apply(e, arguments);
                        console.error("%s %d: %s", t, r, n)
                    }
                } else L[t] = function() {};
            return L[t]
        }, e.inspect = i, i.colors = {
            bold: [1, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            white: [37, 39],
            grey: [90, 39],
            black: [30, 39],
            blue: [34, 39],
            cyan: [36, 39],
            green: [32, 39],
            magenta: [35, 39],
            red: [31, 39],
            yellow: [33, 39]
        }, i.styles = {
            special: "cyan",
            number: "yellow",
            boolean: "yellow",
            undefined: "grey",
            null: "bold",
            string: "green",
            date: "magenta",
            regexp: "red"
        }, e.isArray = d, e.isBoolean = v, e.isNull = y, e.isNullOrUndefined = g, e.isNumber = _, e.isString = m, e.isSymbol = b, e.isUndefined = w, e.isRegExp = E, e.isObject = k, e.isDate = T, e.isError = B, e.isFunction = S, e.isPrimitive = x, e.isBuffer = r(129);
        var U = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        e.log = function() {
            console.log("%s - %s", O(), e.format.apply(e, arguments))
        }, e.inherits = r(130), e._extend = function(t, e) {
            if (!e || !k(e)) return t;
            for (var r = Object.keys(e), n = r.length; n--;) t[r[n]] = e[r[n]];
            return t
        }
    }).call(e, function() {
        return this
    }(), r(5))
}, function(t, e) {
    t.exports = function(t) {
        return t && "object" == typeof t && "function" == typeof t.copy && "function" == typeof t.fill && "function" == typeof t.readUInt8
    }
}, function(t, e) {
    "function" == typeof Object.create ? t.exports = function(t, e) {
        t.super_ = e, t.prototype = Object.create(e.prototype, {
            constructor: {
                value: t,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        })
    } : t.exports = function(t, e) {
        t.super_ = e;
        var r = function() {};
        r.prototype = e.prototype, t.prototype = new r, t.prototype.constructor = t
    }
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }

    function i(t, e) {
        return (0, c.default)("sha1").update(t).digest(e)
    }

    function o(t, e) {
        return (0, c.default)("sha256").update(t).digest(e)
    }

    function s(t, e) {
        return (0, c.default)("sha512").update(t).digest(e)
    }

    function a(t, e) {
        return (0, l.default)("sha256", e).update(t).digest()
    }

    function u(t) {
        return (0, c.default)("rmd160").update(t).digest()
    }
    var f = r(132),
        c = n(f),
        h = r(169),
        l = n(h);
    t.exports = {
        sha1: i,
        sha256: o,
        sha512: s,
        HmacSHA256: a,
        ripemd160: u
    }
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n(t) {
            f.call(this, "digest"), this._hash = t, this.buffers = []
        }

        function i(t) {
            f.call(this, "digest"), this._hash = t
        }
        var o = r(133),
            s = r(134),
            a = r(136),
            u = r(159),
            f = r(167);
        o(n, f), n.prototype._update = function(t) {
            this.buffers.push(t)
        }, n.prototype._final = function() {
            var t = e.concat(this.buffers),
                r = this._hash(t);
            return this.buffers = null, r
        }, o(i, f), i.prototype._update = function(t) {
            this._hash.update(t)
        }, i.prototype._final = function() {
            return this._hash.digest()
        }, t.exports = function(t) {
            return t = t.toLowerCase(), "md5" === t ? new n(s) : new i("rmd160" === t || "ripemd160" === t ? new a : u(t))
        }
    }).call(e, r(123).Buffer)
}, 130, function(t, e, r) {
    "use strict";

    function n(t, e) {
        t[e >> 5] |= 128 << e % 32, t[(e + 64 >>> 9 << 4) + 14] = e;
        for (var r = 1732584193, n = -271733879, i = -1732584194, c = 271733878, h = 0; h < t.length; h += 16) {
            var l = r,
                p = n,
                d = i,
                v = c;
            r = o(r, n, i, c, t[h + 0], 7, -680876936), c = o(c, r, n, i, t[h + 1], 12, -389564586), i = o(i, c, r, n, t[h + 2], 17, 606105819), n = o(n, i, c, r, t[h + 3], 22, -1044525330), r = o(r, n, i, c, t[h + 4], 7, -176418897), c = o(c, r, n, i, t[h + 5], 12, 1200080426), i = o(i, c, r, n, t[h + 6], 17, -1473231341), n = o(n, i, c, r, t[h + 7], 22, -45705983), r = o(r, n, i, c, t[h + 8], 7, 1770035416), c = o(c, r, n, i, t[h + 9], 12, -1958414417), i = o(i, c, r, n, t[h + 10], 17, -42063), n = o(n, i, c, r, t[h + 11], 22, -1990404162), r = o(r, n, i, c, t[h + 12], 7, 1804603682), c = o(c, r, n, i, t[h + 13], 12, -40341101), i = o(i, c, r, n, t[h + 14], 17, -1502002290), n = o(n, i, c, r, t[h + 15], 22, 1236535329), r = s(r, n, i, c, t[h + 1], 5, -165796510), c = s(c, r, n, i, t[h + 6], 9, -1069501632), i = s(i, c, r, n, t[h + 11], 14, 643717713), n = s(n, i, c, r, t[h + 0], 20, -373897302), r = s(r, n, i, c, t[h + 5], 5, -701558691), c = s(c, r, n, i, t[h + 10], 9, 38016083), i = s(i, c, r, n, t[h + 15], 14, -660478335), n = s(n, i, c, r, t[h + 4], 20, -405537848), r = s(r, n, i, c, t[h + 9], 5, 568446438), c = s(c, r, n, i, t[h + 14], 9, -1019803690), i = s(i, c, r, n, t[h + 3], 14, -187363961), n = s(n, i, c, r, t[h + 8], 20, 1163531501), r = s(r, n, i, c, t[h + 13], 5, -1444681467), c = s(c, r, n, i, t[h + 2], 9, -51403784), i = s(i, c, r, n, t[h + 7], 14, 1735328473), n = s(n, i, c, r, t[h + 12], 20, -1926607734), r = a(r, n, i, c, t[h + 5], 4, -378558), c = a(c, r, n, i, t[h + 8], 11, -2022574463), i = a(i, c, r, n, t[h + 11], 16, 1839030562), n = a(n, i, c, r, t[h + 14], 23, -35309556), r = a(r, n, i, c, t[h + 1], 4, -1530992060), c = a(c, r, n, i, t[h + 4], 11, 1272893353), i = a(i, c, r, n, t[h + 7], 16, -155497632), n = a(n, i, c, r, t[h + 10], 23, -1094730640), r = a(r, n, i, c, t[h + 13], 4, 681279174), c = a(c, r, n, i, t[h + 0], 11, -358537222), i = a(i, c, r, n, t[h + 3], 16, -722521979), n = a(n, i, c, r, t[h + 6], 23, 76029189), r = a(r, n, i, c, t[h + 9], 4, -640364487), c = a(c, r, n, i, t[h + 12], 11, -421815835), i = a(i, c, r, n, t[h + 15], 16, 530742520), n = a(n, i, c, r, t[h + 2], 23, -995338651), r = u(r, n, i, c, t[h + 0], 6, -198630844), c = u(c, r, n, i, t[h + 7], 10, 1126891415), i = u(i, c, r, n, t[h + 14], 15, -1416354905), n = u(n, i, c, r, t[h + 5], 21, -57434055), r = u(r, n, i, c, t[h + 12], 6, 1700485571), c = u(c, r, n, i, t[h + 3], 10, -1894986606), i = u(i, c, r, n, t[h + 10], 15, -1051523), n = u(n, i, c, r, t[h + 1], 21, -2054922799), r = u(r, n, i, c, t[h + 8], 6, 1873313359), c = u(c, r, n, i, t[h + 15], 10, -30611744), i = u(i, c, r, n, t[h + 6], 15, -1560198380), n = u(n, i, c, r, t[h + 13], 21, 1309151649), r = u(r, n, i, c, t[h + 4], 6, -145523070), c = u(c, r, n, i, t[h + 11], 10, -1120210379), i = u(i, c, r, n, t[h + 2], 15, 718787259), n = u(n, i, c, r, t[h + 9], 21, -343485551), r = f(r, l), n = f(n, p), i = f(i, d), c = f(c, v)
        }
        return [r, n, i, c]
    }

    function i(t, e, r, n, i, o) {
        return f(c(f(f(e, t), f(n, o)), i), r)
    }

    function o(t, e, r, n, o, s, a) {
        return i(e & r | ~e & n, t, e, o, s, a)
    }

    function s(t, e, r, n, o, s, a) {
        return i(e & n | r & ~n, t, e, o, s, a)
    }

    function a(t, e, r, n, o, s, a) {
        return i(e ^ r ^ n, t, e, o, s, a)
    }

    function u(t, e, r, n, o, s, a) {
        return i(r ^ (e | ~n), t, e, o, s, a)
    }

    function f(t, e) {
        var r = (65535 & t) + (65535 & e),
            n = (t >> 16) + (e >> 16) + (r >> 16);
        return n << 16 | 65535 & r
    }

    function c(t, e) {
        return t << e | t >>> 32 - e
    }
    var h = r(135);
    t.exports = function(t) {
        return h(t, n)
    }
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function r(t) {
            if (t.length % n !== 0) {
                var r = t.length + (n - t.length % n);
                t = e.concat([t, i], r)
            }
            for (var o = new Array(t.length >>> 2), s = 0, a = 0; s < t.length; s += n, a++) o[a] = t.readInt32LE(s);
            return o
        }
        var n = 4,
            i = new e(n);
        i.fill(0);
        var o = 8,
            s = 16;
        t.exports = function(t, n) {
            var i = n(r(t), t.length * o);
            t = new e(s);
            for (var a = 0; a < i.length; a++) t.writeInt32LE(i[a], a << 2, !0);
            return t
        }
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n() {
            h.call(this, 64), this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878, this._e = 3285377520
        }

        function i(t, e) {
            return t << e | t >>> 32 - e
        }

        function o(t, e, r, n, o, s, a, u) {
            return i(t + (e ^ r ^ n) + s + a | 0, u) + o | 0
        }

        function s(t, e, r, n, o, s, a, u) {
            return i(t + (e & r | ~e & n) + s + a | 0, u) + o | 0
        }

        function a(t, e, r, n, o, s, a, u) {
            return i(t + ((e | ~r) ^ n) + s + a | 0, u) + o | 0
        }

        function u(t, e, r, n, o, s, a, u) {
            return i(t + (e & n | r & ~n) + s + a | 0, u) + o | 0
        }

        function f(t, e, r, n, o, s, a, u) {
            return i(t + (e ^ (r | ~n)) + s + a | 0, u) + o | 0
        }
        var c = r(133),
            h = r(137);
        c(n, h), n.prototype._update = function() {
            for (var t = new Array(16), e = 0; e < 16; ++e) t[e] = this._block.readInt32LE(4 * e);
            var r = this._a,
                n = this._b,
                c = this._c,
                h = this._d,
                l = this._e;
            r = o(r, n, c, h, l, t[0], 0, 11), c = i(c, 10), l = o(l, r, n, c, h, t[1], 0, 14), n = i(n, 10), h = o(h, l, r, n, c, t[2], 0, 15), r = i(r, 10), c = o(c, h, l, r, n, t[3], 0, 12), l = i(l, 10), n = o(n, c, h, l, r, t[4], 0, 5), h = i(h, 10), r = o(r, n, c, h, l, t[5], 0, 8), c = i(c, 10), l = o(l, r, n, c, h, t[6], 0, 7), n = i(n, 10), h = o(h, l, r, n, c, t[7], 0, 9), r = i(r, 10), c = o(c, h, l, r, n, t[8], 0, 11), l = i(l, 10), n = o(n, c, h, l, r, t[9], 0, 13), h = i(h, 10), r = o(r, n, c, h, l, t[10], 0, 14), c = i(c, 10), l = o(l, r, n, c, h, t[11], 0, 15), n = i(n, 10), h = o(h, l, r, n, c, t[12], 0, 6), r = i(r, 10), c = o(c, h, l, r, n, t[13], 0, 7), l = i(l, 10), n = o(n, c, h, l, r, t[14], 0, 9), h = i(h, 10), r = o(r, n, c, h, l, t[15], 0, 8), c = i(c, 10), l = s(l, r, n, c, h, t[7], 1518500249, 7), n = i(n, 10), h = s(h, l, r, n, c, t[4], 1518500249, 6), r = i(r, 10), c = s(c, h, l, r, n, t[13], 1518500249, 8), l = i(l, 10), n = s(n, c, h, l, r, t[1], 1518500249, 13), h = i(h, 10), r = s(r, n, c, h, l, t[10], 1518500249, 11), c = i(c, 10), l = s(l, r, n, c, h, t[6], 1518500249, 9), n = i(n, 10), h = s(h, l, r, n, c, t[15], 1518500249, 7), r = i(r, 10), c = s(c, h, l, r, n, t[3], 1518500249, 15), l = i(l, 10), n = s(n, c, h, l, r, t[12], 1518500249, 7), h = i(h, 10), r = s(r, n, c, h, l, t[0], 1518500249, 12), c = i(c, 10), l = s(l, r, n, c, h, t[9], 1518500249, 15), n = i(n, 10), h = s(h, l, r, n, c, t[5], 1518500249, 9), r = i(r, 10), c = s(c, h, l, r, n, t[2], 1518500249, 11), l = i(l, 10), n = s(n, c, h, l, r, t[14], 1518500249, 7), h = i(h, 10), r = s(r, n, c, h, l, t[11], 1518500249, 13), c = i(c, 10), l = s(l, r, n, c, h, t[8], 1518500249, 12), n = i(n, 10), h = a(h, l, r, n, c, t[3], 1859775393, 11), r = i(r, 10), c = a(c, h, l, r, n, t[10], 1859775393, 13), l = i(l, 10), n = a(n, c, h, l, r, t[14], 1859775393, 6), h = i(h, 10), r = a(r, n, c, h, l, t[4], 1859775393, 7), c = i(c, 10), l = a(l, r, n, c, h, t[9], 1859775393, 14), n = i(n, 10), h = a(h, l, r, n, c, t[15], 1859775393, 9), r = i(r, 10), c = a(c, h, l, r, n, t[8], 1859775393, 13), l = i(l, 10), n = a(n, c, h, l, r, t[1], 1859775393, 15), h = i(h, 10), r = a(r, n, c, h, l, t[2], 1859775393, 14), c = i(c, 10), l = a(l, r, n, c, h, t[7], 1859775393, 8), n = i(n, 10), h = a(h, l, r, n, c, t[0], 1859775393, 13), r = i(r, 10), c = a(c, h, l, r, n, t[6], 1859775393, 6), l = i(l, 10), n = a(n, c, h, l, r, t[13], 1859775393, 5), h = i(h, 10), r = a(r, n, c, h, l, t[11], 1859775393, 12), c = i(c, 10), l = a(l, r, n, c, h, t[5], 1859775393, 7), n = i(n, 10), h = a(h, l, r, n, c, t[12], 1859775393, 5), r = i(r, 10), c = u(c, h, l, r, n, t[1], 2400959708, 11), l = i(l, 10), n = u(n, c, h, l, r, t[9], 2400959708, 12), h = i(h, 10), r = u(r, n, c, h, l, t[11], 2400959708, 14), c = i(c, 10), l = u(l, r, n, c, h, t[10], 2400959708, 15), n = i(n, 10), h = u(h, l, r, n, c, t[0], 2400959708, 14), r = i(r, 10), c = u(c, h, l, r, n, t[8], 2400959708, 15), l = i(l, 10), n = u(n, c, h, l, r, t[12], 2400959708, 9), h = i(h, 10), r = u(r, n, c, h, l, t[4], 2400959708, 8), c = i(c, 10), l = u(l, r, n, c, h, t[13], 2400959708, 9), n = i(n, 10), h = u(h, l, r, n, c, t[3], 2400959708, 14), r = i(r, 10), c = u(c, h, l, r, n, t[7], 2400959708, 5), l = i(l, 10), n = u(n, c, h, l, r, t[15], 2400959708, 6), h = i(h, 10), r = u(r, n, c, h, l, t[14], 2400959708, 8), c = i(c, 10), l = u(l, r, n, c, h, t[5], 2400959708, 6), n = i(n, 10), h = u(h, l, r, n, c, t[6], 2400959708, 5), r = i(r, 10), c = u(c, h, l, r, n, t[2], 2400959708, 12), l = i(l, 10), n = f(n, c, h, l, r, t[4], 2840853838, 9), h = i(h, 10), r = f(r, n, c, h, l, t[0], 2840853838, 15), c = i(c, 10), l = f(l, r, n, c, h, t[5], 2840853838, 5), n = i(n, 10), h = f(h, l, r, n, c, t[9], 2840853838, 11), r = i(r, 10), c = f(c, h, l, r, n, t[7], 2840853838, 6), l = i(l, 10), n = f(n, c, h, l, r, t[12], 2840853838, 8), h = i(h, 10), r = f(r, n, c, h, l, t[2], 2840853838, 13), c = i(c, 10), l = f(l, r, n, c, h, t[10], 2840853838, 12), n = i(n, 10), h = f(h, l, r, n, c, t[14], 2840853838, 5), r = i(r, 10), c = f(c, h, l, r, n, t[1], 2840853838, 12), l = i(l, 10), n = f(n, c, h, l, r, t[3], 2840853838, 13), h = i(h, 10), r = f(r, n, c, h, l, t[8], 2840853838, 14), c = i(c, 10), l = f(l, r, n, c, h, t[11], 2840853838, 11), n = i(n, 10), h = f(h, l, r, n, c, t[6], 2840853838, 8), r = i(r, 10), c = f(c, h, l, r, n, t[15], 2840853838, 5), l = i(l, 10), n = f(n, c, h, l, r, t[13], 2840853838, 6), h = i(h, 10);
            var p = this._a,
                d = this._b,
                v = this._c,
                y = this._d,
                g = this._e;
            p = f(p, d, v, y, g, t[5], 1352829926, 8), v = i(v, 10), g = f(g, p, d, v, y, t[14], 1352829926, 9), d = i(d, 10), y = f(y, g, p, d, v, t[7], 1352829926, 9), p = i(p, 10), v = f(v, y, g, p, d, t[0], 1352829926, 11), g = i(g, 10), d = f(d, v, y, g, p, t[9], 1352829926, 13), y = i(y, 10), p = f(p, d, v, y, g, t[2], 1352829926, 15), v = i(v, 10), g = f(g, p, d, v, y, t[11], 1352829926, 15), d = i(d, 10), y = f(y, g, p, d, v, t[4], 1352829926, 5), p = i(p, 10), v = f(v, y, g, p, d, t[13], 1352829926, 7), g = i(g, 10), d = f(d, v, y, g, p, t[6], 1352829926, 7), y = i(y, 10), p = f(p, d, v, y, g, t[15], 1352829926, 8), v = i(v, 10), g = f(g, p, d, v, y, t[8], 1352829926, 11), d = i(d, 10), y = f(y, g, p, d, v, t[1], 1352829926, 14), p = i(p, 10), v = f(v, y, g, p, d, t[10], 1352829926, 14), g = i(g, 10), d = f(d, v, y, g, p, t[3], 1352829926, 12), y = i(y, 10), p = f(p, d, v, y, g, t[12], 1352829926, 6), v = i(v, 10), g = u(g, p, d, v, y, t[6], 1548603684, 9), d = i(d, 10), y = u(y, g, p, d, v, t[11], 1548603684, 13), p = i(p, 10), v = u(v, y, g, p, d, t[3], 1548603684, 15), g = i(g, 10), d = u(d, v, y, g, p, t[7], 1548603684, 7), y = i(y, 10), p = u(p, d, v, y, g, t[0], 1548603684, 12), v = i(v, 10), g = u(g, p, d, v, y, t[13], 1548603684, 8), d = i(d, 10), y = u(y, g, p, d, v, t[5], 1548603684, 9), p = i(p, 10), v = u(v, y, g, p, d, t[10], 1548603684, 11), g = i(g, 10), d = u(d, v, y, g, p, t[14], 1548603684, 7), y = i(y, 10), p = u(p, d, v, y, g, t[15], 1548603684, 7), v = i(v, 10), g = u(g, p, d, v, y, t[8], 1548603684, 12), d = i(d, 10), y = u(y, g, p, d, v, t[12], 1548603684, 7), p = i(p, 10), v = u(v, y, g, p, d, t[4], 1548603684, 6), g = i(g, 10), d = u(d, v, y, g, p, t[9], 1548603684, 15), y = i(y, 10), p = u(p, d, v, y, g, t[1], 1548603684, 13), v = i(v, 10), g = u(g, p, d, v, y, t[2], 1548603684, 11), d = i(d, 10), y = a(y, g, p, d, v, t[15], 1836072691, 9), p = i(p, 10), v = a(v, y, g, p, d, t[5], 1836072691, 7), g = i(g, 10), d = a(d, v, y, g, p, t[1], 1836072691, 15), y = i(y, 10), p = a(p, d, v, y, g, t[3], 1836072691, 11), v = i(v, 10), g = a(g, p, d, v, y, t[7], 1836072691, 8), d = i(d, 10), y = a(y, g, p, d, v, t[14], 1836072691, 6), p = i(p, 10), v = a(v, y, g, p, d, t[6], 1836072691, 6), g = i(g, 10), d = a(d, v, y, g, p, t[9], 1836072691, 14), y = i(y, 10), p = a(p, d, v, y, g, t[11], 1836072691, 12), v = i(v, 10), g = a(g, p, d, v, y, t[8], 1836072691, 13), d = i(d, 10), y = a(y, g, p, d, v, t[12], 1836072691, 5), p = i(p, 10), v = a(v, y, g, p, d, t[2], 1836072691, 14), g = i(g, 10), d = a(d, v, y, g, p, t[10], 1836072691, 13), y = i(y, 10), p = a(p, d, v, y, g, t[0], 1836072691, 13), v = i(v, 10), g = a(g, p, d, v, y, t[4], 1836072691, 7), d = i(d, 10), y = a(y, g, p, d, v, t[13], 1836072691, 5), p = i(p, 10), v = s(v, y, g, p, d, t[8], 2053994217, 15), g = i(g, 10), d = s(d, v, y, g, p, t[6], 2053994217, 5), y = i(y, 10), p = s(p, d, v, y, g, t[4], 2053994217, 8), v = i(v, 10), g = s(g, p, d, v, y, t[1], 2053994217, 11), d = i(d, 10), y = s(y, g, p, d, v, t[3], 2053994217, 14), p = i(p, 10), v = s(v, y, g, p, d, t[11], 2053994217, 14), g = i(g, 10), d = s(d, v, y, g, p, t[15], 2053994217, 6), y = i(y, 10), p = s(p, d, v, y, g, t[0], 2053994217, 14), v = i(v, 10), g = s(g, p, d, v, y, t[5], 2053994217, 6), d = i(d, 10), y = s(y, g, p, d, v, t[12], 2053994217, 9), p = i(p, 10), v = s(v, y, g, p, d, t[2], 2053994217, 12), g = i(g, 10), d = s(d, v, y, g, p, t[13], 2053994217, 9), y = i(y, 10), p = s(p, d, v, y, g, t[9], 2053994217, 12), v = i(v, 10), g = s(g, p, d, v, y, t[7], 2053994217, 5), d = i(d, 10), y = s(y, g, p, d, v, t[10], 2053994217, 15), p = i(p, 10), v = s(v, y, g, p, d, t[14], 2053994217, 8), g = i(g, 10), d = o(d, v, y, g, p, t[12], 0, 8), y = i(y, 10), p = o(p, d, v, y, g, t[15], 0, 5), v = i(v, 10), g = o(g, p, d, v, y, t[10], 0, 12), d = i(d, 10), y = o(y, g, p, d, v, t[4], 0, 9), p = i(p, 10), v = o(v, y, g, p, d, t[1], 0, 12), g = i(g, 10), d = o(d, v, y, g, p, t[5], 0, 5), y = i(y, 10), p = o(p, d, v, y, g, t[8], 0, 14), v = i(v, 10), g = o(g, p, d, v, y, t[7], 0, 6), d = i(d, 10), y = o(y, g, p, d, v, t[6], 0, 8), p = i(p, 10), v = o(v, y, g, p, d, t[2], 0, 13), g = i(g, 10), d = o(d, v, y, g, p, t[13], 0, 6), y = i(y, 10), p = o(p, d, v, y, g, t[14], 0, 5), v = i(v, 10), g = o(g, p, d, v, y, t[0], 0, 15), d = i(d, 10), y = o(y, g, p, d, v, t[3], 0, 13), p = i(p, 10), v = o(v, y, g, p, d, t[9], 0, 11), g = i(g, 10), d = o(d, v, y, g, p, t[11], 0, 11), y = i(y, 10);
            var _ = this._b + c + y | 0;
            this._b = this._c + h + g | 0, this._c = this._d + l + p | 0, this._d = this._e + r + d | 0, this._e = this._a + n + v | 0, this._a = _
        }, n.prototype._digest = function() {
            this._block[this._blockOffset++] = 128, this._blockOffset > 56 && (this._block.fill(0, this._blockOffset, 64), this._update(), this._blockOffset = 0), this._block.fill(0, this._blockOffset, 56), this._block.writeUInt32LE(this._length[0], 56), this._block.writeUInt32LE(this._length[1], 60), this._update();
            var t = new e(20);
            return t.writeInt32LE(this._a, 0), t.writeInt32LE(this._b, 4), t.writeInt32LE(this._c, 8), t.writeInt32LE(this._d, 12), t.writeInt32LE(this._e, 16), t
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n(t) {
            i.call(this), this._block = new e(t), this._blockSize = t, this._blockOffset = 0, this._length = [0, 0, 0, 0], this._finalized = !1
        }
        var i = r(138).Transform,
            o = r(133);
        o(n, i), n.prototype._transform = function(t, r, n) {
            var i = null;
            try {
                "buffer" !== r && (t = new e(t, r)), this.update(t)
            } catch (t) {
                i = t
            }
            n(i)
        }, n.prototype._flush = function(t) {
            var e = null;
            try {
                this.push(this._digest())
            } catch (t) {
                e = t
            }
            t(e)
        }, n.prototype.update = function(t, r) {
            if (!e.isBuffer(t) && "string" != typeof t) throw new TypeError("Data must be a string or a buffer");
            if (this._finalized) throw new Error("Digest already called");
            e.isBuffer(t) || (t = new e(t, r || "binary"));
            for (var n = this._block, i = 0; this._blockOffset + t.length - i >= this._blockSize;) {
                for (var o = this._blockOffset; o < this._blockSize;) n[o++] = t[i++];
                this._update(), this._blockOffset = 0
            }
            for (; i < t.length;) n[this._blockOffset++] = t[i++];
            for (var s = 0, a = 8 * t.length; a > 0; ++s) this._length[s] += a, a = this._length[s] / 4294967296 | 0, a > 0 && (this._length[s] -= 4294967296 * a);
            return this
        }, n.prototype._update = function(t) {
            throw new Error("_update is not implemented")
        }, n.prototype.digest = function(t) {
            if (this._finalized) throw new Error("Digest already called");
            this._finalized = !0;
            var e = this._digest();
            return void 0 !== t && (e = e.toString(t)), e
        }, n.prototype._digest = function() {
            throw new Error("_digest is not implemented")
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    function n() {
        i.call(this)
    }
    t.exports = n;
    var i = r(2).EventEmitter,
        o = r(133);
    o(n, i), n.Readable = r(139), n.Writable = r(155), n.Duplex = r(156), n.Transform = r(157), n.PassThrough = r(158), n.Stream = n, n.prototype.pipe = function(t, e) {
        function r(e) {
            t.writable && !1 === t.write(e) && f.pause && f.pause()
        }

        function n() {
            f.readable && f.resume && f.resume()
        }

        function o() {
            c || (c = !0, t.end())
        }

        function s() {
            c || (c = !0, "function" == typeof t.destroy && t.destroy())
        }

        function a(t) {
            if (u(), 0 === i.listenerCount(this, "error")) throw t
        }

        function u() {
            f.removeListener("data", r), t.removeListener("drain", n), f.removeListener("end", o), f.removeListener("close", s), f.removeListener("error", a), t.removeListener("error", a), f.removeListener("end", u), f.removeListener("close", u), t.removeListener("close", u)
        }
        var f = this;
        f.on("data", r), t.on("drain", n), t._isStdio || e && e.end === !1 || (f.on("end", o), f.on("close", s));
        var c = !1;
        return f.on("error", a), t.on("error", a), f.on("end", u), f.on("close", u), t.on("close", u), t.emit("pipe", f), t
    }
}, function(t, e, r) {
    e = t.exports = r(140), e.Stream = e, e.Readable = e, e.Writable = r(150), e.Duplex = r(149), e.Transform = r(153), e.PassThrough = r(154)
}, function(t, e, r) {
    (function(e, n) {
        "use strict";

        function i(t) {
            return P.from(t)
        }

        function o(t) {
            return P.isBuffer(t) || t instanceof D
        }

        function s(t, e, r) {
            return "function" == typeof t.prependListener ? t.prependListener(e, r) : void(t._events && t._events[e] ? L(t._events[e]) ? t._events[e].unshift(r) : t._events[e] = [r, t._events[e]] : t.on(e, r))
        }

        function a(t, e) {
            R = R || r(149), t = t || {}, this.objectMode = !!t.objectMode, e instanceof R && (this.objectMode = this.objectMode || !!t.readableObjectMode);
            var n = t.highWaterMark,
                i = this.objectMode ? 16 : 16384;
            this.highWaterMark = n || 0 === n ? n : i, this.highWaterMark = Math.floor(this.highWaterMark), this.buffer = new V, this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.destroyed = !1, this.defaultEncoding = t.defaultEncoding || "utf8", this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, t.encoding && (z || (z = r(152).StringDecoder), this.decoder = new z(t.encoding), this.encoding = t.encoding)
        }

        function u(t) {
            return R = R || r(149), this instanceof u ? (this._readableState = new a(t, this), this.readable = !0, t && ("function" == typeof t.read && (this._read = t.read), "function" == typeof t.destroy && (this._destroy = t.destroy)), void F.call(this)) : new u(t)
        }

        function f(t, e, r, n, o) {
            var s = t._readableState;
            if (null === e) s.reading = !1, v(t, s);
            else {
                var a;
                o || (a = h(s, e)), a ? t.emit("error", a) : s.objectMode || e && e.length > 0 ? ("string" == typeof e || s.objectMode || Object.getPrototypeOf(e) === P.prototype || (e = i(e)), n ? s.endEmitted ? t.emit("error", new Error("stream.unshift() after end event")) : c(t, s, e, !0) : s.ended ? t.emit("error", new Error("stream.push() after EOF")) : (s.reading = !1, s.decoder && !r ? (e = s.decoder.write(e), s.objectMode || 0 !== e.length ? c(t, s, e, !1) : _(t, s)) : c(t, s, e, !1))) : n || (s.reading = !1)
            }
            return l(s)
        }

        function c(t, e, r, n) {
            e.flowing && 0 === e.length && !e.sync ? (t.emit("data", r), t.read(0)) : (e.length += e.objectMode ? 1 : r.length, n ? e.buffer.unshift(r) : e.buffer.push(r), e.needReadable && y(t)), _(t, e)
        }

        function h(t, e) {
            var r;
            return o(e) || "string" == typeof e || void 0 === e || t.objectMode || (r = new TypeError("Invalid non-string/buffer chunk")), r
        }

        function l(t) {
            return !t.ended && (t.needReadable || t.length < t.highWaterMark || 0 === t.length)
        }

        function p(t) {
            return t >= Y ? t = Y : (t--, t |= t >>> 1, t |= t >>> 2, t |= t >>> 4, t |= t >>> 8, t |= t >>> 16, t++), t
        }

        function d(t, e) {
            return t <= 0 || 0 === e.length && e.ended ? 0 : e.objectMode ? 1 : t !== t ? e.flowing && e.length ? e.buffer.head.data.length : e.length : (t > e.highWaterMark && (e.highWaterMark = p(t)), t <= e.length ? t : e.ended ? e.length : (e.needReadable = !0, 0))
        }

        function v(t, e) {
            if (!e.ended) {
                if (e.decoder) {
                    var r = e.decoder.end();
                    r && r.length && (e.buffer.push(r), e.length += e.objectMode ? 1 : r.length)
                }
                e.ended = !0, y(t)
            }
        }

        function y(t) {
            var e = t._readableState;
            e.needReadable = !1, e.emittedReadable || (q("emitReadable", e.flowing), e.emittedReadable = !0,
                e.sync ? C(g, t) : g(t))
        }

        function g(t) {
            q("emit readable"), t.emit("readable"), T(t)
        }

        function _(t, e) {
            e.readingMore || (e.readingMore = !0, C(m, t, e))
        }

        function m(t, e) {
            for (var r = e.length; !e.reading && !e.flowing && !e.ended && e.length < e.highWaterMark && (q("maybeReadMore read 0"), t.read(0), r !== e.length);) r = e.length;
            e.readingMore = !1
        }

        function b(t) {
            return function() {
                var e = t._readableState;
                q("pipeOnDrain", e.awaitDrain), e.awaitDrain && e.awaitDrain--, 0 === e.awaitDrain && U(t, "data") && (e.flowing = !0, T(t))
            }
        }

        function w(t) {
            q("readable nexttick read 0"), t.read(0)
        }

        function E(t, e) {
            e.resumeScheduled || (e.resumeScheduled = !0, C(k, t, e))
        }

        function k(t, e) {
            e.reading || (q("resume read 0"), t.read(0)), e.resumeScheduled = !1, e.awaitDrain = 0, t.emit("resume"), T(t), e.flowing && !e.reading && t.read(0)
        }

        function T(t) {
            var e = t._readableState;
            for (q("flow", e.flowing); e.flowing && null !== t.read(););
        }

        function B(t, e) {
            if (0 === e.length) return null;
            var r;
            return e.objectMode ? r = e.buffer.shift() : !t || t >= e.length ? (r = e.decoder ? e.buffer.join("") : 1 === e.buffer.length ? e.buffer.head.data : e.buffer.concat(e.length), e.buffer.clear()) : r = S(t, e.buffer, e.decoder), r
        }

        function S(t, e, r) {
            var n;
            return t < e.head.data.length ? (n = e.head.data.slice(0, t), e.head.data = e.head.data.slice(t)) : n = t === e.head.data.length ? e.shift() : r ? x(t, e) : A(t, e), n
        }

        function x(t, e) {
            var r = e.head,
                n = 1,
                i = r.data;
            for (t -= i.length; r = r.next;) {
                var o = r.data,
                    s = t > o.length ? o.length : t;
                if (i += s === o.length ? o : o.slice(0, t), t -= s, 0 === t) {
                    s === o.length ? (++n, r.next ? e.head = r.next : e.head = e.tail = null) : (e.head = r, r.data = o.slice(s));
                    break
                }++n
            }
            return e.length -= n, i
        }

        function A(t, e) {
            var r = P.allocUnsafe(t),
                n = e.head,
                i = 1;
            for (n.data.copy(r), t -= n.data.length; n = n.next;) {
                var o = n.data,
                    s = t > o.length ? o.length : t;
                if (o.copy(r, r.length - t, 0, s), t -= s, 0 === t) {
                    s === o.length ? (++i, n.next ? e.head = n.next : e.head = e.tail = null) : (e.head = n, n.data = o.slice(s));
                    break
                }++i
            }
            return e.length -= i, r
        }

        function I(t) {
            var e = t._readableState;
            if (e.length > 0) throw new Error('"endReadable()" called on non-empty stream');
            e.endEmitted || (e.ended = !0, C(O, e, t))
        }

        function O(t, e) {
            t.endEmitted || 0 !== t.length || (t.endEmitted = !0, e.readable = !1, e.emit("end"))
        }

        function j(t, e) {
            for (var r = 0, n = t.length; r < n; r++)
                if (t[r] === e) return r;
            return -1
        }
        var C = r(141);
        t.exports = u;
        var R, L = r(126);
        u.ReadableState = a;
        var U = (r(2).EventEmitter, function(t, e) {
                return t.listeners(e).length
            }),
            F = r(142),
            P = r(143).Buffer,
            D = e.Uint8Array || function() {},
            N = r(145);
        N.inherits = r(133);
        var M = r(146),
            q = void 0;
        q = M && M.debuglog ? M.debuglog("stream") : function() {};
        var z, V = r(147),
            H = r(148);
        N.inherits(u, F);
        var W = ["error", "close", "destroy", "pause", "resume"];
        Object.defineProperty(u.prototype, "destroyed", {
            get: function() {
                return void 0 !== this._readableState && this._readableState.destroyed
            },
            set: function(t) {
                this._readableState && (this._readableState.destroyed = t)
            }
        }), u.prototype.destroy = H.destroy, u.prototype._undestroy = H.undestroy, u.prototype._destroy = function(t, e) {
            this.push(null), e(t)
        }, u.prototype.push = function(t, e) {
            var r, n = this._readableState;
            return n.objectMode ? r = !0 : "string" == typeof t && (e = e || n.defaultEncoding, e !== n.encoding && (t = P.from(t, e), e = ""), r = !0), f(this, t, e, !1, r)
        }, u.prototype.unshift = function(t) {
            return f(this, t, null, !0, !1)
        }, u.prototype.isPaused = function() {
            return this._readableState.flowing === !1
        }, u.prototype.setEncoding = function(t) {
            return z || (z = r(152).StringDecoder), this._readableState.decoder = new z(t), this._readableState.encoding = t, this
        };
        var Y = 8388608;
        u.prototype.read = function(t) {
            q("read", t), t = parseInt(t, 10);
            var e = this._readableState,
                r = t;
            if (0 !== t && (e.emittedReadable = !1), 0 === t && e.needReadable && (e.length >= e.highWaterMark || e.ended)) return q("read: emitReadable", e.length, e.ended), 0 === e.length && e.ended ? I(this) : y(this), null;
            if (t = d(t, e), 0 === t && e.ended) return 0 === e.length && I(this), null;
            var n = e.needReadable;
            q("need readable", n), (0 === e.length || e.length - t < e.highWaterMark) && (n = !0, q("length less than watermark", n)), e.ended || e.reading ? (n = !1, q("reading or ended", n)) : n && (q("do read"), e.reading = !0, e.sync = !0, 0 === e.length && (e.needReadable = !0), this._read(e.highWaterMark), e.sync = !1, e.reading || (t = d(r, e)));
            var i;
            return i = t > 0 ? B(t, e) : null, null === i ? (e.needReadable = !0, t = 0) : e.length -= t, 0 === e.length && (e.ended || (e.needReadable = !0), r !== t && e.ended && I(this)), null !== i && this.emit("data", i), i
        }, u.prototype._read = function(t) {
            this.emit("error", new Error("_read() is not implemented"))
        }, u.prototype.pipe = function(t, e) {
            function r(t, e) {
                q("onunpipe"), t === l && e && e.hasUnpiped === !1 && (e.hasUnpiped = !0, o())
            }

            function i() {
                q("onend"), t.end()
            }

            function o() {
                q("cleanup"), t.removeListener("close", f), t.removeListener("finish", c), t.removeListener("drain", y), t.removeListener("error", u), t.removeListener("unpipe", r), l.removeListener("end", i), l.removeListener("end", h), l.removeListener("data", a), g = !0, !p.awaitDrain || t._writableState && !t._writableState.needDrain || y()
            }

            function a(e) {
                q("ondata"), _ = !1;
                var r = t.write(e);
                !1 !== r || _ || ((1 === p.pipesCount && p.pipes === t || p.pipesCount > 1 && j(p.pipes, t) !== -1) && !g && (q("false write response, pause", l._readableState.awaitDrain), l._readableState.awaitDrain++, _ = !0), l.pause())
            }

            function u(e) {
                q("onerror", e), h(), t.removeListener("error", u), 0 === U(t, "error") && t.emit("error", e)
            }

            function f() {
                t.removeListener("finish", c), h()
            }

            function c() {
                q("onfinish"), t.removeListener("close", f), h()
            }

            function h() {
                q("unpipe"), l.unpipe(t)
            }
            var l = this,
                p = this._readableState;
            switch (p.pipesCount) {
                case 0:
                    p.pipes = t;
                    break;
                case 1:
                    p.pipes = [p.pipes, t];
                    break;
                default:
                    p.pipes.push(t)
            }
            p.pipesCount += 1, q("pipe count=%d opts=%j", p.pipesCount, e);
            var d = (!e || e.end !== !1) && t !== n.stdout && t !== n.stderr,
                v = d ? i : h;
            p.endEmitted ? C(v) : l.once("end", v), t.on("unpipe", r);
            var y = b(l);
            t.on("drain", y);
            var g = !1,
                _ = !1;
            return l.on("data", a), s(t, "error", u), t.once("close", f), t.once("finish", c), t.emit("pipe", l), p.flowing || (q("pipe resume"), l.resume()), t
        }, u.prototype.unpipe = function(t) {
            var e = this._readableState,
                r = {
                    hasUnpiped: !1
                };
            if (0 === e.pipesCount) return this;
            if (1 === e.pipesCount) return t && t !== e.pipes ? this : (t || (t = e.pipes), e.pipes = null, e.pipesCount = 0, e.flowing = !1, t && t.emit("unpipe", this, r), this);
            if (!t) {
                var n = e.pipes,
                    i = e.pipesCount;
                e.pipes = null, e.pipesCount = 0, e.flowing = !1;
                for (var o = 0; o < i; o++) n[o].emit("unpipe", this, r);
                return this
            }
            var s = j(e.pipes, t);
            return s === -1 ? this : (e.pipes.splice(s, 1), e.pipesCount -= 1, 1 === e.pipesCount && (e.pipes = e.pipes[0]), t.emit("unpipe", this, r), this)
        }, u.prototype.on = function(t, e) {
            var r = F.prototype.on.call(this, t, e);
            if ("data" === t) this._readableState.flowing !== !1 && this.resume();
            else if ("readable" === t) {
                var n = this._readableState;
                n.endEmitted || n.readableListening || (n.readableListening = n.needReadable = !0, n.emittedReadable = !1, n.reading ? n.length && y(this) : C(w, this))
            }
            return r
        }, u.prototype.addListener = u.prototype.on, u.prototype.resume = function() {
            var t = this._readableState;
            return t.flowing || (q("resume"), t.flowing = !0, E(this, t)), this
        }, u.prototype.pause = function() {
            return q("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (q("pause"), this._readableState.flowing = !1, this.emit("pause")), this
        }, u.prototype.wrap = function(t) {
            var e = this._readableState,
                r = !1,
                n = this;
            t.on("end", function() {
                if (q("wrapped end"), e.decoder && !e.ended) {
                    var t = e.decoder.end();
                    t && t.length && n.push(t)
                }
                n.push(null)
            }), t.on("data", function(i) {
                if (q("wrapped data"), e.decoder && (i = e.decoder.write(i)), (!e.objectMode || null !== i && void 0 !== i) && (e.objectMode || i && i.length)) {
                    var o = n.push(i);
                    o || (r = !0, t.pause())
                }
            });
            for (var i in t) void 0 === this[i] && "function" == typeof t[i] && (this[i] = function(e) {
                return function() {
                    return t[e].apply(t, arguments)
                }
            }(i));
            for (var o = 0; o < W.length; o++) t.on(W[o], n.emit.bind(n, W[o]));
            return n._read = function(e) {
                q("wrapped _read", e), r && (r = !1, t.resume())
            }, n
        }, u._fromList = B
    }).call(e, function() {
        return this
    }(), r(5))
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function r(t, r, n, i) {
            if ("function" != typeof t) throw new TypeError('"callback" argument must be a function');
            var o, s, a = arguments.length;
            switch (a) {
                case 0:
                case 1:
                    return e.nextTick(t);
                case 2:
                    return e.nextTick(function() {
                        t.call(null, r)
                    });
                case 3:
                    return e.nextTick(function() {
                        t.call(null, r, n)
                    });
                case 4:
                    return e.nextTick(function() {
                        t.call(null, r, n, i)
                    });
                default:
                    for (o = new Array(a - 1), s = 0; s < o.length;) o[s++] = arguments[s];
                    return e.nextTick(function() {
                        t.apply(null, o)
                    })
            }
        }!e.version || 0 === e.version.indexOf("v0.") || 0 === e.version.indexOf("v1.") && 0 !== e.version.indexOf("v1.8.") ? t.exports = r : t.exports = e.nextTick
    }).call(e, r(5))
}, function(t, e, r) {
    t.exports = r(2).EventEmitter
}, function(t, e, r) {
    function n(t, e) {
        for (var r in t) e[r] = t[r]
    }

    function i(t, e, r) {
        return s(t, e, r)
    }
    var o = r(144),
        s = o.Buffer;
    s.from && s.alloc && s.allocUnsafe && s.allocUnsafeSlow ? t.exports = o : (n(o, e), e.Buffer = i), n(s, i), i.from = function(t, e, r) {
        if ("number" == typeof t) throw new TypeError("Argument must not be a number");
        return s(t, e, r)
    }, i.alloc = function(t, e, r) {
        if ("number" != typeof t) throw new TypeError("Argument must be a number");
        var n = s(t);
        return void 0 !== e ? "string" == typeof r ? n.fill(e, r) : n.fill(e) : n.fill(0), n
    }, i.allocUnsafe = function(t) {
        if ("number" != typeof t) throw new TypeError("Argument must be a number");
        return s(t)
    }, i.allocUnsafeSlow = function(t) {
        if ("number" != typeof t) throw new TypeError("Argument must be a number");
        return o.SlowBuffer(t)
    }
}, function(t, e, r) {
    (function(t) {
        "use strict";

        function n() {
            try {
                var t = new Uint8Array(1);
                return t.__proto__ = {
                    __proto__: Uint8Array.prototype,
                    foo: function() {
                        return 42
                    }
                }, 42 === t.foo()
            } catch (t) {
                return !1
            }
        }

        function i(e) {
            if (e > Z) throw new RangeError("Invalid typed array length");
            var r = new Uint8Array(e);
            return r.__proto__ = t.prototype, r
        }

        function t(t, e, r) {
            if ("number" == typeof t) {
                if ("string" == typeof e) throw new Error("If encoding is specified then the first argument must be a string");
                return u(t)
            }
            return o(t, e, r)
        }

        function o(t, e, r) {
            if ("number" == typeof t) throw new TypeError('"value" argument must not be a number');
            return W(t) ? h(t, e, r) : "string" == typeof t ? f(t, e) : l(t)
        }

        function s(t) {
            if ("number" != typeof t) throw new TypeError('"size" argument must be a number');
            if (t < 0) throw new RangeError('"size" argument must not be negative')
        }

        function a(t, e, r) {
            return s(t), t <= 0 ? i(t) : void 0 !== e ? "string" == typeof r ? i(t).fill(e, r) : i(t).fill(e) : i(t)
        }

        function u(t) {
            return s(t), i(t < 0 ? 0 : 0 | p(t))
        }

        function f(e, r) {
            if ("string" == typeof r && "" !== r || (r = "utf8"), !t.isEncoding(r)) throw new TypeError('"encoding" must be a valid string encoding');
            var n = 0 | v(e, r),
                o = i(n),
                s = o.write(e, r);
            return s !== n && (o = o.slice(0, s)), o
        }

        function c(t) {
            for (var e = t.length < 0 ? 0 : 0 | p(t.length), r = i(e), n = 0; n < e; n += 1) r[n] = 255 & t[n];
            return r
        }

        function h(e, r, n) {
            if (r < 0 || e.byteLength < r) throw new RangeError("'offset' is out of bounds");
            if (e.byteLength < r + (n || 0)) throw new RangeError("'length' is out of bounds");
            var i;
            return i = void 0 === r && void 0 === n ? new Uint8Array(e) : void 0 === n ? new Uint8Array(e, r) : new Uint8Array(e, r, n), i.__proto__ = t.prototype, i
        }

        function l(e) {
            if (t.isBuffer(e)) {
                var r = 0 | p(e.length),
                    n = i(r);
                return 0 === n.length ? n : (e.copy(n, 0, 0, r), n)
            }
            if (e) {
                if (Y(e) || "length" in e) return "number" != typeof e.length || G(e.length) ? i(0) : c(e);
                if ("Buffer" === e.type && Array.isArray(e.data)) return c(e.data)
            }
            throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")
        }

        function p(t) {
            if (t >= Z) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + Z.toString(16) + " bytes");
            return 0 | t
        }

        function d(e) {
            return +e != e && (e = 0), t.alloc(+e)
        }

        function v(e, r) {
            if (t.isBuffer(e)) return e.length;
            if (Y(e) || W(e)) return e.byteLength;
            "string" != typeof e && (e = "" + e);
            var n = e.length;
            if (0 === n) return 0;
            for (var i = !1;;) switch (r) {
                case "ascii":
                case "latin1":
                case "binary":
                    return n;
                case "utf8":
                case "utf-8":
                case void 0:
                    return M(e).length;
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return 2 * n;
                case "hex":
                    return n >>> 1;
                case "base64":
                    return V(e).length;
                default:
                    if (i) return M(e).length;
                    r = ("" + r).toLowerCase(), i = !0
            }
        }

        function y(t, e, r) {
            var n = !1;
            if ((void 0 === e || e < 0) && (e = 0), e > this.length) return "";
            if ((void 0 === r || r > this.length) && (r = this.length), r <= 0) return "";
            if (r >>>= 0, e >>>= 0, r <= e) return "";
            for (t || (t = "utf8");;) switch (t) {
                case "hex":
                    return j(this, e, r);
                case "utf8":
                case "utf-8":
                    return x(this, e, r);
                case "ascii":
                    return I(this, e, r);
                case "latin1":
                case "binary":
                    return O(this, e, r);
                case "base64":
                    return S(this, e, r);
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return C(this, e, r);
                default:
                    if (n) throw new TypeError("Unknown encoding: " + t);
                    t = (t + "").toLowerCase(), n = !0
            }
        }

        function g(t, e, r) {
            var n = t[e];
            t[e] = t[r], t[r] = n
        }

        function _(e, r, n, i, o) {
            if (0 === e.length) return -1;
            if ("string" == typeof n ? (i = n, n = 0) : n > 2147483647 ? n = 2147483647 : n < -2147483648 && (n = -2147483648), n = +n, G(n) && (n = o ? 0 : e.length - 1), n < 0 && (n = e.length + n), n >= e.length) {
                if (o) return -1;
                n = e.length - 1
            } else if (n < 0) {
                if (!o) return -1;
                n = 0
            }
            if ("string" == typeof r && (r = t.from(r, i)), t.isBuffer(r)) return 0 === r.length ? -1 : m(e, r, n, i, o);
            if ("number" == typeof r) return r &= 255, "function" == typeof Uint8Array.prototype.indexOf ? o ? Uint8Array.prototype.indexOf.call(e, r, n) : Uint8Array.prototype.lastIndexOf.call(e, r, n) : m(e, [r], n, i, o);
            throw new TypeError("val must be string, number or Buffer")
        }

        function m(t, e, r, n, i) {
            function o(t, e) {
                return 1 === s ? t[e] : t.readUInt16BE(e * s)
            }
            var s = 1,
                a = t.length,
                u = e.length;
            if (void 0 !== n && (n = String(n).toLowerCase(), "ucs2" === n || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
                if (t.length < 2 || e.length < 2) return -1;
                s = 2, a /= 2, u /= 2, r /= 2
            }
            var f;
            if (i) {
                var c = -1;
                for (f = r; f < a; f++)
                    if (o(t, f) === o(e, c === -1 ? 0 : f - c)) {
                        if (c === -1 && (c = f), f - c + 1 === u) return c * s
                    } else c !== -1 && (f -= f - c), c = -1
            } else
                for (r + u > a && (r = a - u), f = r; f >= 0; f--) {
                    for (var h = !0, l = 0; l < u; l++)
                        if (o(t, f + l) !== o(e, l)) {
                            h = !1;
                            break
                        }
                    if (h) return f
                }
            return -1
        }

        function b(t, e, r, n) {
            r = Number(r) || 0;
            var i = t.length - r;
            n ? (n = Number(n), n > i && (n = i)) : n = i;
            var o = e.length;
            if (o % 2 !== 0) throw new TypeError("Invalid hex string");
            n > o / 2 && (n = o / 2);
            for (var s = 0; s < n; ++s) {
                var a = parseInt(e.substr(2 * s, 2), 16);
                if (G(a)) return s;
                t[r + s] = a
            }
            return s
        }

        function w(t, e, r, n) {
            return H(M(e, t.length - r), t, r, n)
        }

        function E(t, e, r, n) {
            return H(q(e), t, r, n)
        }

        function k(t, e, r, n) {
            return E(t, e, r, n)
        }

        function T(t, e, r, n) {
            return H(V(e), t, r, n)
        }

        function B(t, e, r, n) {
            return H(z(e, t.length - r), t, r, n)
        }

        function S(t, e, r) {
            return 0 === e && r === t.length ? $.fromByteArray(t) : $.fromByteArray(t.slice(e, r))
        }

        function x(t, e, r) {
            r = Math.min(t.length, r);
            for (var n = [], i = e; i < r;) {
                var o = t[i],
                    s = null,
                    a = o > 239 ? 4 : o > 223 ? 3 : o > 191 ? 2 : 1;
                if (i + a <= r) {
                    var u, f, c, h;
                    switch (a) {
                        case 1:
                            o < 128 && (s = o);
                            break;
                        case 2:
                            u = t[i + 1], 128 === (192 & u) && (h = (31 & o) << 6 | 63 & u, h > 127 && (s = h));
                            break;
                        case 3:
                            u = t[i + 1], f = t[i + 2], 128 === (192 & u) && 128 === (192 & f) && (h = (15 & o) << 12 | (63 & u) << 6 | 63 & f, h > 2047 && (h < 55296 || h > 57343) && (s = h));
                            break;
                        case 4:
                            u = t[i + 1], f = t[i + 2], c = t[i + 3], 128 === (192 & u) && 128 === (192 & f) && 128 === (192 & c) && (h = (15 & o) << 18 | (63 & u) << 12 | (63 & f) << 6 | 63 & c, h > 65535 && h < 1114112 && (s = h))
                    }
                }
                null === s ? (s = 65533, a = 1) : s > 65535 && (s -= 65536, n.push(s >>> 10 & 1023 | 55296), s = 56320 | 1023 & s), n.push(s), i += a
            }
            return A(n)
        }

        function A(t) {
            var e = t.length;
            if (e <= K) return String.fromCharCode.apply(String, t);
            for (var r = "", n = 0; n < e;) r += String.fromCharCode.apply(String, t.slice(n, n += K));
            return r
        }

        function I(t, e, r) {
            var n = "";
            r = Math.min(t.length, r);
            for (var i = e; i < r; ++i) n += String.fromCharCode(127 & t[i]);
            return n
        }

        function O(t, e, r) {
            var n = "";
            r = Math.min(t.length, r);
            for (var i = e; i < r; ++i) n += String.fromCharCode(t[i]);
            return n
        }

        function j(t, e, r) {
            var n = t.length;
            (!e || e < 0) && (e = 0), (!r || r < 0 || r > n) && (r = n);
            for (var i = "", o = e; o < r; ++o) i += N(t[o]);
            return i
        }

        function C(t, e, r) {
            for (var n = t.slice(e, r), i = "", o = 0; o < n.length; o += 2) i += String.fromCharCode(n[o] + 256 * n[o + 1]);
            return i
        }

        function R(t, e, r) {
            if (t % 1 !== 0 || t < 0) throw new RangeError("offset is not uint");
            if (t + e > r) throw new RangeError("Trying to access beyond buffer length")
        }

        function L(e, r, n, i, o, s) {
            if (!t.isBuffer(e)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (r > o || r < s) throw new RangeError('"value" argument is out of bounds');
            if (n + i > e.length) throw new RangeError("Index out of range")
        }

        function U(t, e, r, n, i, o) {
            if (r + n > t.length) throw new RangeError("Index out of range");
            if (r < 0) throw new RangeError("Index out of range")
        }

        function F(t, e, r, n, i) {
            return e = +e, r >>>= 0, i || U(t, e, r, 4, 3.4028234663852886e38, -3.4028234663852886e38), X.write(t, e, r, n, 23, 4), r + 4
        }

        function P(t, e, r, n, i) {
            return e = +e, r >>>= 0, i || U(t, e, r, 8, 1.7976931348623157e308, -1.7976931348623157e308), X.write(t, e, r, n, 52, 8), r + 8
        }

        function D(t) {
            if (t = t.trim().replace(Q, ""), t.length < 2) return "";
            for (; t.length % 4 !== 0;) t += "=";
            return t
        }

        function N(t) {
            return t < 16 ? "0" + t.toString(16) : t.toString(16)
        }

        function M(t, e) {
            e = e || 1 / 0;
            for (var r, n = t.length, i = null, o = [], s = 0; s < n; ++s) {
                if (r = t.charCodeAt(s), r > 55295 && r < 57344) {
                    if (!i) {
                        if (r > 56319) {
                            (e -= 3) > -1 && o.push(239, 191, 189);
                            continue
                        }
                        if (s + 1 === n) {
                            (e -= 3) > -1 && o.push(239, 191, 189);
                            continue
                        }
                        i = r;
                        continue
                    }
                    if (r < 56320) {
                        (e -= 3) > -1 && o.push(239, 191, 189), i = r;
                        continue
                    }
                    r = (i - 55296 << 10 | r - 56320) + 65536
                } else i && (e -= 3) > -1 && o.push(239, 191, 189);
                if (i = null, r < 128) {
                    if ((e -= 1) < 0) break;
                    o.push(r)
                } else if (r < 2048) {
                    if ((e -= 2) < 0) break;
                    o.push(r >> 6 | 192, 63 & r | 128)
                } else if (r < 65536) {
                    if ((e -= 3) < 0) break;
                    o.push(r >> 12 | 224, r >> 6 & 63 | 128, 63 & r | 128)
                } else {
                    if (!(r < 1114112)) throw new Error("Invalid code point");
                    if ((e -= 4) < 0) break;
                    o.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, 63 & r | 128)
                }
            }
            return o
        }

        function q(t) {
            for (var e = [], r = 0; r < t.length; ++r) e.push(255 & t.charCodeAt(r));
            return e
        }

        function z(t, e) {
            for (var r, n, i, o = [], s = 0; s < t.length && !((e -= 2) < 0); ++s) r = t.charCodeAt(s), n = r >> 8, i = r % 256, o.push(i), o.push(n);
            return o
        }

        function V(t) {
            return $.toByteArray(D(t))
        }

        function H(t, e, r, n) {
            for (var i = 0; i < n && !(i + r >= e.length || i >= t.length); ++i) e[i + r] = t[i];
            return i
        }

        function W(t) {
            return t instanceof ArrayBuffer || null != t && null != t.constructor && "ArrayBuffer" === t.constructor.name && "number" == typeof t.byteLength
        }

        function Y(t) {
            return "function" == typeof ArrayBuffer.isView && ArrayBuffer.isView(t)
        }

        function G(t) {
            return t !== t
        }
        var $ = r(124),
            X = r(125);
        e.Buffer = t, e.SlowBuffer = d, e.INSPECT_MAX_BYTES = 50;
        var Z = 2147483647;
        e.kMaxLength = Z, t.TYPED_ARRAY_SUPPORT = n(), t.TYPED_ARRAY_SUPPORT || "undefined" == typeof console || "function" != typeof console.error || console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."), "undefined" != typeof Symbol && Symbol.species && t[Symbol.species] === t && Object.defineProperty(t, Symbol.species, {
            value: null,
            configurable: !0,
            enumerable: !1,
            writable: !1
        }), t.poolSize = 8192, t.from = function(t, e, r) {
            return o(t, e, r)
        }, t.prototype.__proto__ = Uint8Array.prototype, t.__proto__ = Uint8Array, t.alloc = function(t, e, r) {
            return a(t, e, r)
        }, t.allocUnsafe = function(t) {
            return u(t)
        }, t.allocUnsafeSlow = function(t) {
            return u(t)
        }, t.isBuffer = function(t) {
            return null != t && t._isBuffer === !0
        }, t.compare = function(e, r) {
            if (!t.isBuffer(e) || !t.isBuffer(r)) throw new TypeError("Arguments must be Buffers");
            if (e === r) return 0;
            for (var n = e.length, i = r.length, o = 0, s = Math.min(n, i); o < s; ++o)
                if (e[o] !== r[o]) {
                    n = e[o], i = r[o];
                    break
                }
            return n < i ? -1 : i < n ? 1 : 0
        }, t.isEncoding = function(t) {
            switch (String(t).toLowerCase()) {
                case "hex":
                case "utf8":
                case "utf-8":
                case "ascii":
                case "latin1":
                case "binary":
                case "base64":
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return !0;
                default:
                    return !1
            }
        }, t.concat = function(e, r) {
            if (!Array.isArray(e)) throw new TypeError('"list" argument must be an Array of Buffers');
            if (0 === e.length) return t.alloc(0);
            var n;
            if (void 0 === r)
                for (r = 0, n = 0; n < e.length; ++n) r += e[n].length;
            var i = t.allocUnsafe(r),
                o = 0;
            for (n = 0; n < e.length; ++n) {
                var s = e[n];
                if (!t.isBuffer(s)) throw new TypeError('"list" argument must be an Array of Buffers');
                s.copy(i, o), o += s.length
            }
            return i
        }, t.byteLength = v, t.prototype._isBuffer = !0, t.prototype.swap16 = function() {
            var t = this.length;
            if (t % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
            for (var e = 0; e < t; e += 2) g(this, e, e + 1);
            return this
        }, t.prototype.swap32 = function() {
            var t = this.length;
            if (t % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
            for (var e = 0; e < t; e += 4) g(this, e, e + 3), g(this, e + 1, e + 2);
            return this
        }, t.prototype.swap64 = function() {
            var t = this.length;
            if (t % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
            for (var e = 0; e < t; e += 8) g(this, e, e + 7), g(this, e + 1, e + 6), g(this, e + 2, e + 5), g(this, e + 3, e + 4);
            return this
        }, t.prototype.toString = function() {
            var t = this.length;
            return 0 === t ? "" : 0 === arguments.length ? x(this, 0, t) : y.apply(this, arguments)
        }, t.prototype.equals = function(e) {
            if (!t.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
            return this === e || 0 === t.compare(this, e)
        }, t.prototype.inspect = function() {
            var t = "",
                r = e.INSPECT_MAX_BYTES;
            return this.length > 0 && (t = this.toString("hex", 0, r).match(/.{2}/g).join(" "), this.length > r && (t += " ... ")), "<Buffer " + t + ">"
        }, t.prototype.compare = function(e, r, n, i, o) {
            if (!t.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
            if (void 0 === r && (r = 0), void 0 === n && (n = e ? e.length : 0), void 0 === i && (i = 0), void 0 === o && (o = this.length), r < 0 || n > e.length || i < 0 || o > this.length) throw new RangeError("out of range index");
            if (i >= o && r >= n) return 0;
            if (i >= o) return -1;
            if (r >= n) return 1;
            if (r >>>= 0, n >>>= 0, i >>>= 0, o >>>= 0, this === e) return 0;
            for (var s = o - i, a = n - r, u = Math.min(s, a), f = this.slice(i, o), c = e.slice(r, n), h = 0; h < u; ++h)
                if (f[h] !== c[h]) {
                    s = f[h], a = c[h];
                    break
                }
            return s < a ? -1 : a < s ? 1 : 0
        }, t.prototype.includes = function(t, e, r) {
            return this.indexOf(t, e, r) !== -1
        }, t.prototype.indexOf = function(t, e, r) {
            return _(this, t, e, r, !0)
        }, t.prototype.lastIndexOf = function(t, e, r) {
            return _(this, t, e, r, !1)
        }, t.prototype.write = function(t, e, r, n) {
            if (void 0 === e) n = "utf8", r = this.length, e = 0;
            else if (void 0 === r && "string" == typeof e) n = e, r = this.length, e = 0;
            else {
                if (!isFinite(e)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                e >>>= 0, isFinite(r) ? (r >>>= 0, void 0 === n && (n = "utf8")) : (n = r, r = void 0)
            }
            var i = this.length - e;
            if ((void 0 === r || r > i) && (r = i), t.length > 0 && (r < 0 || e < 0) || e > this.length) throw new RangeError("Attempt to write outside buffer bounds");
            n || (n = "utf8");
            for (var o = !1;;) switch (n) {
                case "hex":
                    return b(this, t, e, r);
                case "utf8":
                case "utf-8":
                    return w(this, t, e, r);
                case "ascii":
                    return E(this, t, e, r);
                case "latin1":
                case "binary":
                    return k(this, t, e, r);
                case "base64":
                    return T(this, t, e, r);
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                    return B(this, t, e, r);
                default:
                    if (o) throw new TypeError("Unknown encoding: " + n);
                    n = ("" + n).toLowerCase(), o = !0
            }
        }, t.prototype.toJSON = function() {
            return {
                type: "Buffer",
                data: Array.prototype.slice.call(this._arr || this, 0)
            }
        };
        var K = 4096;
        t.prototype.slice = function(e, r) {
            var n = this.length;
            e = ~~e, r = void 0 === r ? n : ~~r, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), r < 0 ? (r += n, r < 0 && (r = 0)) : r > n && (r = n), r < e && (r = e);
            var i = this.subarray(e, r);
            return i.__proto__ = t.prototype, i
        }, t.prototype.readUIntLE = function(t, e, r) {
            t >>>= 0, e >>>= 0, r || R(t, e, this.length);
            for (var n = this[t], i = 1, o = 0; ++o < e && (i *= 256);) n += this[t + o] * i;
            return n
        }, t.prototype.readUIntBE = function(t, e, r) {
            t >>>= 0, e >>>= 0, r || R(t, e, this.length);
            for (var n = this[t + --e], i = 1; e > 0 && (i *= 256);) n += this[t + --e] * i;
            return n
        }, t.prototype.readUInt8 = function(t, e) {
            return t >>>= 0, e || R(t, 1, this.length), this[t]
        }, t.prototype.readUInt16LE = function(t, e) {
            return t >>>= 0, e || R(t, 2, this.length), this[t] | this[t + 1] << 8
        }, t.prototype.readUInt16BE = function(t, e) {
            return t >>>= 0, e || R(t, 2, this.length), this[t] << 8 | this[t + 1]
        }, t.prototype.readUInt32LE = function(t, e) {
            return t >>>= 0, e || R(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3]
        }, t.prototype.readUInt32BE = function(t, e) {
            return t >>>= 0, e || R(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3])
        }, t.prototype.readIntLE = function(t, e, r) {
            t >>>= 0, e >>>= 0, r || R(t, e, this.length);
            for (var n = this[t], i = 1, o = 0; ++o < e && (i *= 256);) n += this[t + o] * i;
            return i *= 128, n >= i && (n -= Math.pow(2, 8 * e)), n
        }, t.prototype.readIntBE = function(t, e, r) {
            t >>>= 0, e >>>= 0, r || R(t, e, this.length);
            for (var n = e, i = 1, o = this[t + --n]; n > 0 && (i *= 256);) o += this[t + --n] * i;
            return i *= 128, o >= i && (o -= Math.pow(2, 8 * e)), o
        }, t.prototype.readInt8 = function(t, e) {
            return t >>>= 0, e || R(t, 1, this.length), 128 & this[t] ? (255 - this[t] + 1) * -1 : this[t]
        }, t.prototype.readInt16LE = function(t, e) {
            t >>>= 0, e || R(t, 2, this.length);
            var r = this[t] | this[t + 1] << 8;
            return 32768 & r ? 4294901760 | r : r
        }, t.prototype.readInt16BE = function(t, e) {
            t >>>= 0, e || R(t, 2, this.length);
            var r = this[t + 1] | this[t] << 8;
            return 32768 & r ? 4294901760 | r : r
        }, t.prototype.readInt32LE = function(t, e) {
            return t >>>= 0, e || R(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24
        }, t.prototype.readInt32BE = function(t, e) {
            return t >>>= 0, e || R(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]
        }, t.prototype.readFloatLE = function(t, e) {
            return t >>>= 0, e || R(t, 4, this.length), X.read(this, t, !0, 23, 4)
        }, t.prototype.readFloatBE = function(t, e) {
            return t >>>= 0, e || R(t, 4, this.length), X.read(this, t, !1, 23, 4)
        }, t.prototype.readDoubleLE = function(t, e) {
            return t >>>= 0, e || R(t, 8, this.length), X.read(this, t, !0, 52, 8)
        }, t.prototype.readDoubleBE = function(t, e) {
            return t >>>= 0, e || R(t, 8, this.length), X.read(this, t, !1, 52, 8)
        }, t.prototype.writeUIntLE = function(t, e, r, n) {
            if (t = +t, e >>>= 0, r >>>= 0, !n) {
                var i = Math.pow(2, 8 * r) - 1;
                L(this, t, e, r, i, 0)
            }
            var o = 1,
                s = 0;
            for (this[e] = 255 & t; ++s < r && (o *= 256);) this[e + s] = t / o & 255;
            return e + r
        }, t.prototype.writeUIntBE = function(t, e, r, n) {
            if (t = +t, e >>>= 0, r >>>= 0, !n) {
                var i = Math.pow(2, 8 * r) - 1;
                L(this, t, e, r, i, 0)
            }
            var o = r - 1,
                s = 1;
            for (this[e + o] = 255 & t; --o >= 0 && (s *= 256);) this[e + o] = t / s & 255;
            return e + r
        }, t.prototype.writeUInt8 = function(t, e, r) {
            return t = +t, e >>>= 0, r || L(this, t, e, 1, 255, 0), this[e] = 255 & t, e + 1
        }, t.prototype.writeUInt16LE = function(t, e, r) {
            return t = +t, e >>>= 0, r || L(this, t, e, 2, 65535, 0), this[e] = 255 & t, this[e + 1] = t >>> 8, e + 2
        }, t.prototype.writeUInt16BE = function(t, e, r) {
            return t = +t, e >>>= 0, r || L(this, t, e, 2, 65535, 0), this[e] = t >>> 8, this[e + 1] = 255 & t, e + 2
        }, t.prototype.writeUInt32LE = function(t, e, r) {
            return t = +t, e >>>= 0, r || L(this, t, e, 4, 4294967295, 0), this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = 255 & t, e + 4
        }, t.prototype.writeUInt32BE = function(t, e, r) {
            return t = +t, e >>>= 0, r || L(this, t, e, 4, 4294967295, 0), this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t, e + 4
        }, t.prototype.writeIntLE = function(t, e, r, n) {
            if (t = +t, e >>>= 0, !n) {
                var i = Math.pow(2, 8 * r - 1);
                L(this, t, e, r, i - 1, -i)
            }
            var o = 0,
                s = 1,
                a = 0;
            for (this[e] = 255 & t; ++o < r && (s *= 256);) t < 0 && 0 === a && 0 !== this[e + o - 1] && (a = 1), this[e + o] = (t / s >> 0) - a & 255;
            return e + r
        }, t.prototype.writeIntBE = function(t, e, r, n) {
            if (t = +t, e >>>= 0, !n) {
                var i = Math.pow(2, 8 * r - 1);
                L(this, t, e, r, i - 1, -i)
            }
            var o = r - 1,
                s = 1,
                a = 0;
            for (this[e + o] = 255 & t; --o >= 0 && (s *= 256);) t < 0 && 0 === a && 0 !== this[e + o + 1] && (a = 1), this[e + o] = (t / s >> 0) - a & 255;
            return e + r
        }, t.prototype.writeInt8 = function(t, e, r) {
            return t = +t, e >>>= 0, r || L(this, t, e, 1, 127, -128), t < 0 && (t = 255 + t + 1), this[e] = 255 & t, e + 1
        }, t.prototype.writeInt16LE = function(t, e, r) {
            return t = +t, e >>>= 0, r || L(this, t, e, 2, 32767, -32768), this[e] = 255 & t, this[e + 1] = t >>> 8, e + 2
        }, t.prototype.writeInt16BE = function(t, e, r) {
            return t = +t, e >>>= 0, r || L(this, t, e, 2, 32767, -32768), this[e] = t >>> 8, this[e + 1] = 255 & t, e + 2
        }, t.prototype.writeInt32LE = function(t, e, r) {
            return t = +t, e >>>= 0, r || L(this, t, e, 4, 2147483647, -2147483648), this[e] = 255 & t, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24, e + 4
        }, t.prototype.writeInt32BE = function(t, e, r) {
            return t = +t, e >>>= 0, r || L(this, t, e, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t, e + 4
        }, t.prototype.writeFloatLE = function(t, e, r) {
            return F(this, t, e, !0, r)
        }, t.prototype.writeFloatBE = function(t, e, r) {
            return F(this, t, e, !1, r)
        }, t.prototype.writeDoubleLE = function(t, e, r) {
            return P(this, t, e, !0, r)
        }, t.prototype.writeDoubleBE = function(t, e, r) {
            return P(this, t, e, !1, r)
        }, t.prototype.copy = function(t, e, r, n) {
            if (r || (r = 0), n || 0 === n || (n = this.length), e >= t.length && (e = t.length), e || (e = 0), n > 0 && n < r && (n = r), n === r) return 0;
            if (0 === t.length || 0 === this.length) return 0;
            if (e < 0) throw new RangeError("targetStart out of bounds");
            if (r < 0 || r >= this.length) throw new RangeError("sourceStart out of bounds");
            if (n < 0) throw new RangeError("sourceEnd out of bounds");
            n > this.length && (n = this.length), t.length - e < n - r && (n = t.length - e + r);
            var i, o = n - r;
            if (this === t && r < e && e < n)
                for (i = o - 1; i >= 0; --i) t[i + e] = this[i + r];
            else if (o < 1e3)
                for (i = 0; i < o; ++i) t[i + e] = this[i + r];
            else Uint8Array.prototype.set.call(t, this.subarray(r, r + o), e);
            return o
        }, t.prototype.fill = function(e, r, n, i) {
            if ("string" == typeof e) {
                if ("string" == typeof r ? (i = r, r = 0, n = this.length) : "string" == typeof n && (i = n, n = this.length), 1 === e.length) {
                    var o = e.charCodeAt(0);
                    o < 256 && (e = o)
                }
                if (void 0 !== i && "string" != typeof i) throw new TypeError("encoding must be a string");
                if ("string" == typeof i && !t.isEncoding(i)) throw new TypeError("Unknown encoding: " + i)
            } else "number" == typeof e && (e &= 255);
            if (r < 0 || this.length < r || this.length < n) throw new RangeError("Out of range index");
            if (n <= r) return this;
            r >>>= 0, n = void 0 === n ? this.length : n >>> 0, e || (e = 0);
            var s;
            if ("number" == typeof e)
                for (s = r; s < n; ++s) this[s] = e;
            else {
                var a = t.isBuffer(e) ? e : new t(e, i),
                    u = a.length;
                for (s = 0; s < n - r; ++s) this[s + r] = a[s % u]
            }
            return this
        };
        var Q = /[^+\/0-9A-Za-z-_]/g
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(t) {
        function r(t) {
            return Array.isArray ? Array.isArray(t) : "[object Array]" === y(t)
        }

        function n(t) {
            return "boolean" == typeof t
        }

        function i(t) {
            return null === t
        }

        function o(t) {
            return null == t
        }

        function s(t) {
            return "number" == typeof t
        }

        function a(t) {
            return "string" == typeof t
        }

        function u(t) {
            return "symbol" == typeof t
        }

        function f(t) {
            return void 0 === t
        }

        function c(t) {
            return "[object RegExp]" === y(t)
        }

        function h(t) {
            return "object" == typeof t && null !== t
        }

        function l(t) {
            return "[object Date]" === y(t)
        }

        function p(t) {
            return "[object Error]" === y(t) || t instanceof Error
        }

        function d(t) {
            return "function" == typeof t
        }

        function v(t) {
            return null === t || "boolean" == typeof t || "number" == typeof t || "string" == typeof t || "symbol" == typeof t || "undefined" == typeof t
        }

        function y(t) {
            return Object.prototype.toString.call(t)
        }
        e.isArray = r, e.isBoolean = n, e.isNull = i, e.isNullOrUndefined = o, e.isNumber = s, e.isString = a, e.isSymbol = u, e.isUndefined = f, e.isRegExp = c, e.isObject = h, e.isDate = l, e.isError = p, e.isFunction = d, e.isPrimitive = v, e.isBuffer = t.isBuffer
    }).call(e, r(123).Buffer)
}, 119, function(t, e, r) {
    "use strict";

    function n(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }

    function i(t, e, r) {
        t.copy(e, r)
    }
    var o = r(143).Buffer;
    t.exports = function() {
        function t() {
            n(this, t), this.head = null, this.tail = null, this.length = 0
        }
        return t.prototype.push = function(t) {
            var e = {
                data: t,
                next: null
            };
            this.length > 0 ? this.tail.next = e : this.head = e, this.tail = e, ++this.length
        }, t.prototype.unshift = function(t) {
            var e = {
                data: t,
                next: this.head
            };
            0 === this.length && (this.tail = e), this.head = e, ++this.length
        }, t.prototype.shift = function() {
            if (0 !== this.length) {
                var t = this.head.data;
                return 1 === this.length ? this.head = this.tail = null : this.head = this.head.next, --this.length, t
            }
        }, t.prototype.clear = function() {
            this.head = this.tail = null, this.length = 0
        }, t.prototype.join = function(t) {
            if (0 === this.length) return "";
            for (var e = this.head, r = "" + e.data; e = e.next;) r += t + e.data;
            return r
        }, t.prototype.concat = function(t) {
            if (0 === this.length) return o.alloc(0);
            if (1 === this.length) return this.head.data;
            for (var e = o.allocUnsafe(t >>> 0), r = this.head, n = 0; r;) i(r.data, e, n), n += r.data.length, r = r.next;
            return e
        }, t
    }()
}, function(t, e, r) {
    "use strict";

    function n(t, e) {
        var r = this,
            n = this._readableState && this._readableState.destroyed,
            i = this._writableState && this._writableState.destroyed;
        return n || i ? void(e ? e(t) : !t || this._writableState && this._writableState.errorEmitted || s(o, this, t)) : (this._readableState && (this._readableState.destroyed = !0), this._writableState && (this._writableState.destroyed = !0), void this._destroy(t || null, function(t) {
            !e && t ? (s(o, r, t), r._writableState && (r._writableState.errorEmitted = !0)) : e && e(t)
        }))
    }

    function i() {
        this._readableState && (this._readableState.destroyed = !1, this._readableState.reading = !1, this._readableState.ended = !1, this._readableState.endEmitted = !1), this._writableState && (this._writableState.destroyed = !1, this._writableState.ended = !1, this._writableState.ending = !1, this._writableState.finished = !1, this._writableState.errorEmitted = !1)
    }

    function o(t, e) {
        t.emit("error", e)
    }
    var s = r(141);
    t.exports = {
        destroy: n,
        undestroy: i
    }
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return this instanceof n ? (f.call(this, t), c.call(this, t), t && t.readable === !1 && (this.readable = !1), t && t.writable === !1 && (this.writable = !1), this.allowHalfOpen = !0, t && t.allowHalfOpen === !1 && (this.allowHalfOpen = !1), void this.once("end", i)) : new n(t)
    }

    function i() {
        this.allowHalfOpen || this._writableState.ended || s(o, this)
    }

    function o(t) {
        t.end()
    }
    var s = r(141),
        a = Object.keys || function(t) {
            var e = [];
            for (var r in t) e.push(r);
            return e
        };
    t.exports = n;
    var u = r(145);
    u.inherits = r(133);
    var f = r(140),
        c = r(150);
    u.inherits(n, f);
    for (var h = a(c.prototype), l = 0; l < h.length; l++) {
        var p = h[l];
        n.prototype[p] || (n.prototype[p] = c.prototype[p])
    }
    Object.defineProperty(n.prototype, "destroyed", {
        get: function() {
            return void 0 !== this._readableState && void 0 !== this._writableState && (this._readableState.destroyed && this._writableState.destroyed)
        },
        set: function(t) {
            void 0 !== this._readableState && void 0 !== this._writableState && (this._readableState.destroyed = t, this._writableState.destroyed = t)
        }
    }), n.prototype._destroy = function(t, e) {
        this.push(null), this.end(), s(e, t)
    }
}, function(t, e, r) {
    (function(e, n, i) {
        "use strict";

        function o(t) {
            var e = this;
            this.next = null, this.entry = null, this.finish = function() {
                x(e, t)
            }
        }

        function s(t) {
            return L.from(t)
        }

        function a(t) {
            return L.isBuffer(t) || t instanceof U
        }

        function u() {}

        function f(t, e) {
            I = I || r(149), t = t || {}, this.objectMode = !!t.objectMode, e instanceof I && (this.objectMode = this.objectMode || !!t.writableObjectMode);
            var n = t.highWaterMark,
                i = this.objectMode ? 16 : 16384;
            this.highWaterMark = n || 0 === n ? n : i, this.highWaterMark = Math.floor(this.highWaterMark), this.finalCalled = !1, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1, this.destroyed = !1;
            var s = t.decodeStrings === !1;
            this.decodeStrings = !s, this.defaultEncoding = t.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(t) {
                _(e, t)
            }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new o(this)
        }

        function c(t) {
            return I = I || r(149), P.call(c, this) || this instanceof I ? (this._writableState = new f(t, this), this.writable = !0, t && ("function" == typeof t.write && (this._write = t.write), "function" == typeof t.writev && (this._writev = t.writev), "function" == typeof t.destroy && (this._destroy = t.destroy), "function" == typeof t.final && (this._final = t.final)), void R.call(this)) : new c(t)
        }

        function h(t, e) {
            var r = new Error("write after end");
            t.emit("error", r), A(e, r)
        }

        function l(t, e, r, n) {
            var i = !0,
                o = !1;
            return null === r ? o = new TypeError("May not write null values to stream") : "string" == typeof r || void 0 === r || e.objectMode || (o = new TypeError("Invalid non-string/buffer chunk")), o && (t.emit("error", o), A(n, o), i = !1), i
        }

        function p(t, e, r) {
            return t.objectMode || t.decodeStrings === !1 || "string" != typeof e || (e = L.from(e, r)), e
        }

        function d(t, e, r, n, i, o) {
            if (!r) {
                var s = p(e, n, i);
                n !== s && (r = !0, i = "buffer", n = s)
            }
            var a = e.objectMode ? 1 : n.length;
            e.length += a;
            var u = e.length < e.highWaterMark;
            if (u || (e.needDrain = !0), e.writing || e.corked) {
                var f = e.lastBufferedRequest;
                e.lastBufferedRequest = {
                    chunk: n,
                    encoding: i,
                    isBuf: r,
                    callback: o,
                    next: null
                }, f ? f.next = e.lastBufferedRequest : e.bufferedRequest = e.lastBufferedRequest, e.bufferedRequestCount += 1
            } else v(t, e, !1, a, n, i, o);
            return u
        }

        function v(t, e, r, n, i, o, s) {
            e.writelen = n, e.writecb = s, e.writing = !0, e.sync = !0, r ? t._writev(i, e.onwrite) : t._write(i, o, e.onwrite), e.sync = !1
        }

        function y(t, e, r, n, i) {
            --e.pendingcb, r ? (A(i, n), A(B, t, e), t._writableState.errorEmitted = !0, t.emit("error", n)) : (i(n), t._writableState.errorEmitted = !0, t.emit("error", n), B(t, e))
        }

        function g(t) {
            t.writing = !1, t.writecb = null, t.length -= t.writelen, t.writelen = 0
        }

        function _(t, e) {
            var r = t._writableState,
                n = r.sync,
                i = r.writecb;
            if (g(r), e) y(t, r, n, e, i);
            else {
                var o = E(r);
                o || r.corked || r.bufferProcessing || !r.bufferedRequest || w(t, r), n ? O(m, t, r, o, i) : m(t, r, o, i)
            }
        }

        function m(t, e, r, n) {
            r || b(t, e), e.pendingcb--, n(), B(t, e)
        }

        function b(t, e) {
            0 === e.length && e.needDrain && (e.needDrain = !1, t.emit("drain"))
        }

        function w(t, e) {
            e.bufferProcessing = !0;
            var r = e.bufferedRequest;
            if (t._writev && r && r.next) {
                var n = e.bufferedRequestCount,
                    i = new Array(n),
                    s = e.corkedRequestsFree;
                s.entry = r;
                for (var a = 0, u = !0; r;) i[a] = r, r.isBuf || (u = !1), r = r.next, a += 1;
                i.allBuffers = u, v(t, e, !0, e.length, i, "", s.finish), e.pendingcb++, e.lastBufferedRequest = null, s.next ? (e.corkedRequestsFree = s.next, s.next = null) : e.corkedRequestsFree = new o(e)
            } else {
                for (; r;) {
                    var f = r.chunk,
                        c = r.encoding,
                        h = r.callback,
                        l = e.objectMode ? 1 : f.length;
                    if (v(t, e, !1, l, f, c, h), r = r.next, e.writing) break
                }
                null === r && (e.lastBufferedRequest = null)
            }
            e.bufferedRequestCount = 0, e.bufferedRequest = r, e.bufferProcessing = !1
        }

        function E(t) {
            return t.ending && 0 === t.length && null === t.bufferedRequest && !t.finished && !t.writing
        }

        function k(t, e) {
            t._final(function(r) {
                e.pendingcb--, r && t.emit("error", r), e.prefinished = !0, t.emit("prefinish"), B(t, e)
            })
        }

        function T(t, e) {
            e.prefinished || e.finalCalled || ("function" == typeof t._final ? (e.pendingcb++, e.finalCalled = !0, A(k, t, e)) : (e.prefinished = !0, t.emit("prefinish")))
        }

        function B(t, e) {
            var r = E(e);
            return r && (T(t, e), 0 === e.pendingcb && (e.finished = !0, t.emit("finish"))), r
        }

        function S(t, e, r) {
            e.ending = !0, B(t, e), r && (e.finished ? A(r) : t.once("finish", r)), e.ended = !0, t.writable = !1
        }

        function x(t, e, r) {
            var n = t.entry;
            for (t.entry = null; n;) {
                var i = n.callback;
                e.pendingcb--, i(r), n = n.next
            }
            e.corkedRequestsFree ? e.corkedRequestsFree.next = t : e.corkedRequestsFree = t
        }
        var A = r(141);
        t.exports = c;
        var I, O = !e.browser && ["v0.10", "v0.9."].indexOf(e.version.slice(0, 5)) > -1 ? n : A;
        c.WritableState = f;
        var j = r(145);
        j.inherits = r(133);
        var C = {
                deprecate: r(151)
            },
            R = r(142),
            L = r(143).Buffer,
            U = i.Uint8Array || function() {},
            F = r(148);
        j.inherits(c, R), f.prototype.getBuffer = function() {
                for (var t = this.bufferedRequest, e = []; t;) e.push(t), t = t.next;
                return e
            },
            function() {
                try {
                    Object.defineProperty(f.prototype, "buffer", {
                        get: C.deprecate(function() {
                            return this.getBuffer()
                        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
                    })
                } catch (t) {}
            }();
        var P;
        "function" == typeof Symbol && Symbol.hasInstance && "function" == typeof Function.prototype[Symbol.hasInstance] ? (P = Function.prototype[Symbol.hasInstance], Object.defineProperty(c, Symbol.hasInstance, {
            value: function(t) {
                return !!P.call(this, t) || t && t._writableState instanceof f
            }
        })) : P = function(t) {
            return t instanceof this
        }, c.prototype.pipe = function() {
            this.emit("error", new Error("Cannot pipe, not readable"))
        }, c.prototype.write = function(t, e, r) {
            var n = this._writableState,
                i = !1,
                o = a(t) && !n.objectMode;
            return o && !L.isBuffer(t) && (t = s(t)), "function" == typeof e && (r = e, e = null), o ? e = "buffer" : e || (e = n.defaultEncoding), "function" != typeof r && (r = u), n.ended ? h(this, r) : (o || l(this, n, t, r)) && (n.pendingcb++, i = d(this, n, o, t, e, r)), i
        }, c.prototype.cork = function() {
            var t = this._writableState;
            t.corked++
        }, c.prototype.uncork = function() {
            var t = this._writableState;
            t.corked && (t.corked--, t.writing || t.corked || t.finished || t.bufferProcessing || !t.bufferedRequest || w(this, t))
        }, c.prototype.setDefaultEncoding = function(t) {
            if ("string" == typeof t && (t = t.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((t + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + t);
            return this._writableState.defaultEncoding = t, this
        }, c.prototype._write = function(t, e, r) {
            r(new Error("_write() is not implemented"))
        }, c.prototype._writev = null, c.prototype.end = function(t, e, r) {
            var n = this._writableState;
            "function" == typeof t ? (r = t, t = null, e = null) : "function" == typeof e && (r = e, e = null), null !== t && void 0 !== t && this.write(t, e), n.corked && (n.corked = 1, this.uncork()), n.ending || n.finished || S(this, n, r)
        }, Object.defineProperty(c.prototype, "destroyed", {
            get: function() {
                return void 0 !== this._writableState && this._writableState.destroyed
            },
            set: function(t) {
                this._writableState && (this._writableState.destroyed = t)
            }
        }), c.prototype.destroy = F.destroy, c.prototype._undestroy = F.undestroy, c.prototype._destroy = function(t, e) {
            this.end(), e(t)
        }
    }).call(e, r(5), r(10).setImmediate, function() {
        return this
    }())
}, function(t, e) {
    (function(e) {
        function r(t, e) {
            function r() {
                if (!i) {
                    if (n("throwDeprecation")) throw new Error(e);
                    n("traceDeprecation") ? console.trace(e) : console.warn(e), i = !0
                }
                return t.apply(this, arguments)
            }
            if (n("noDeprecation")) return t;
            var i = !1;
            return r
        }

        function n(t) {
            try {
                if (!e.localStorage) return !1
            } catch (t) {
                return !1
            }
            var r = e.localStorage[t];
            return null != r && "true" === String(r).toLowerCase()
        }
        t.exports = r
    }).call(e, function() {
        return this
    }())
}, function(t, e, r) {
    "use strict";

    function n(t) {
        if (!t) return "utf8";
        for (var e;;) switch (t) {
            case "utf8":
            case "utf-8":
                return "utf8";
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return "utf16le";
            case "latin1":
            case "binary":
                return "latin1";
            case "base64":
            case "ascii":
            case "hex":
                return t;
            default:
                if (e) return;
                t = ("" + t).toLowerCase(), e = !0
        }
    }

    function i(t) {
        var e = n(t);
        if ("string" != typeof e && (_.isEncoding === m || !m(t))) throw new Error("Unknown encoding: " + t);
        return e || t
    }

    function o(t) {
        this.encoding = i(t);
        var e;
        switch (this.encoding) {
            case "utf16le":
                this.text = l, this.end = p, e = 4;
                break;
            case "utf8":
                this.fillLast = f, e = 4;
                break;
            case "base64":
                this.text = d, this.end = v, e = 3;
                break;
            default:
                return this.write = y, void(this.end = g)
        }
        this.lastNeed = 0, this.lastTotal = 0, this.lastChar = _.allocUnsafe(e)
    }

    function s(t) {
        return t <= 127 ? 0 : t >> 5 === 6 ? 2 : t >> 4 === 14 ? 3 : t >> 3 === 30 ? 4 : -1
    }

    function a(t, e, r) {
        var n = e.length - 1;
        if (n < r) return 0;
        var i = s(e[n]);
        return i >= 0 ? (i > 0 && (t.lastNeed = i - 1), i) : --n < r ? 0 : (i = s(e[n]), i >= 0 ? (i > 0 && (t.lastNeed = i - 2), i) : --n < r ? 0 : (i = s(e[n]), i >= 0 ? (i > 0 && (2 === i ? i = 0 : t.lastNeed = i - 3), i) : 0))
    }

    function u(t, e, r) {
        if (128 !== (192 & e[0])) return t.lastNeed = 0, "ï¿½".repeat(r);
        if (t.lastNeed > 1 && e.length > 1) {
            if (128 !== (192 & e[1])) return t.lastNeed = 1, "ï¿½".repeat(r + 1);
            if (t.lastNeed > 2 && e.length > 2 && 128 !== (192 & e[2])) return t.lastNeed = 2, "ï¿½".repeat(r + 2)
        }
    }

    function f(t) {
        var e = this.lastTotal - this.lastNeed,
            r = u(this, t, e);
        return void 0 !== r ? r : this.lastNeed <= t.length ? (t.copy(this.lastChar, e, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal)) : (t.copy(this.lastChar, e, 0, t.length), void(this.lastNeed -= t.length))
    }

    function c(t, e) {
        var r = a(this, t, e);
        if (!this.lastNeed) return t.toString("utf8", e);
        this.lastTotal = r;
        var n = t.length - (r - this.lastNeed);
        return t.copy(this.lastChar, 0, n), t.toString("utf8", e, n)
    }

    function h(t) {
        var e = t && t.length ? this.write(t) : "";
        return this.lastNeed ? e + "ï¿½".repeat(this.lastTotal - this.lastNeed) : e
    }

    function l(t, e) {
        if ((t.length - e) % 2 === 0) {
            var r = t.toString("utf16le", e);
            if (r) {
                var n = r.charCodeAt(r.length - 1);
                if (n >= 55296 && n <= 56319) return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = t[t.length - 2], this.lastChar[1] = t[t.length - 1], r.slice(0, -1)
            }
            return r
        }
        return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = t[t.length - 1], t.toString("utf16le", e, t.length - 1)
    }

    function p(t) {
        var e = t && t.length ? this.write(t) : "";
        if (this.lastNeed) {
            var r = this.lastTotal - this.lastNeed;
            return e + this.lastChar.toString("utf16le", 0, r)
        }
        return e
    }

    function d(t, e) {
        var r = (t.length - e) % 3;
        return 0 === r ? t.toString("base64", e) : (this.lastNeed = 3 - r, this.lastTotal = 3, 1 === r ? this.lastChar[0] = t[t.length - 1] : (this.lastChar[0] = t[t.length - 2], this.lastChar[1] = t[t.length - 1]), t.toString("base64", e, t.length - r))
    }

    function v(t) {
        var e = t && t.length ? this.write(t) : "";
        return this.lastNeed ? e + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : e
    }

    function y(t) {
        return t.toString(this.encoding)
    }

    function g(t) {
        return t && t.length ? this.write(t) : ""
    }
    var _ = r(143).Buffer,
        m = _.isEncoding || function(t) {
            switch (t = "" + t, t && t.toLowerCase()) {
                case "hex":
                case "utf8":
                case "utf-8":
                case "ascii":
                case "binary":
                case "base64":
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                case "raw":
                    return !0;
                default:
                    return !1
            }
        };
    e.StringDecoder = o, o.prototype.write = function(t) {
        if (0 === t.length) return "";
        var e, r;
        if (this.lastNeed) {
            if (e = this.fillLast(t), void 0 === e) return "";
            r = this.lastNeed, this.lastNeed = 0
        } else r = 0;
        return r < t.length ? e ? e + this.text(t, r) : this.text(t, r) : e || ""
    }, o.prototype.end = h, o.prototype.text = c, o.prototype.fillLast = function(t) {
        return this.lastNeed <= t.length ? (t.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal)) : (t.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, t.length), void(this.lastNeed -= t.length))
    }
}, function(t, e, r) {
    "use strict";

    function n(t) {
        this.afterTransform = function(e, r) {
            return i(t, e, r)
        }, this.needTransform = !1, this.transforming = !1, this.writecb = null, this.writechunk = null, this.writeencoding = null
    }

    function i(t, e, r) {
        var n = t._transformState;
        n.transforming = !1;
        var i = n.writecb;
        if (!i) return t.emit("error", new Error("write callback called multiple times"));
        n.writechunk = null, n.writecb = null, null !== r && void 0 !== r && t.push(r), i(e);
        var o = t._readableState;
        o.reading = !1, (o.needReadable || o.length < o.highWaterMark) && t._read(o.highWaterMark)
    }

    function o(t) {
        if (!(this instanceof o)) return new o(t);
        a.call(this, t), this._transformState = new n(this);
        var e = this;
        this._readableState.needReadable = !0, this._readableState.sync = !1, t && ("function" == typeof t.transform && (this._transform = t.transform), "function" == typeof t.flush && (this._flush = t.flush)), this.once("prefinish", function() {
            "function" == typeof this._flush ? this._flush(function(t, r) {
                s(e, t, r)
            }) : s(e)
        })
    }

    function s(t, e, r) {
        if (e) return t.emit("error", e);
        null !== r && void 0 !== r && t.push(r);
        var n = t._writableState,
            i = t._transformState;
        if (n.length) throw new Error("Calling transform done when ws.length != 0");
        if (i.transforming) throw new Error("Calling transform done when still transforming");
        return t.push(null)
    }
    t.exports = o;
    var a = r(149),
        u = r(145);
    u.inherits = r(133), u.inherits(o, a), o.prototype.push = function(t, e) {
        return this._transformState.needTransform = !1, a.prototype.push.call(this, t, e)
    }, o.prototype._transform = function(t, e, r) {
        throw new Error("_transform() is not implemented")
    }, o.prototype._write = function(t, e, r) {
        var n = this._transformState;
        if (n.writecb = r, n.writechunk = t, n.writeencoding = e, !n.transforming) {
            var i = this._readableState;
            (n.needTransform || i.needReadable || i.length < i.highWaterMark) && this._read(i.highWaterMark)
        }
    }, o.prototype._read = function(t) {
        var e = this._transformState;
        null !== e.writechunk && e.writecb && !e.transforming ? (e.transforming = !0, this._transform(e.writechunk, e.writeencoding, e.afterTransform)) : e.needTransform = !0
    }, o.prototype._destroy = function(t, e) {
        var r = this;
        a.prototype._destroy.call(this, t, function(t) {
            e(t), r.emit("close")
        })
    }
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return this instanceof n ? void i.call(this, t) : new n(t)
    }
    t.exports = n;
    var i = r(153),
        o = r(145);
    o.inherits = r(133), o.inherits(n, i), n.prototype._transform = function(t, e, r) {
        r(null, t)
    }
}, function(t, e, r) {
    t.exports = r(150)
}, function(t, e, r) {
    t.exports = r(149)
}, function(t, e, r) {
    t.exports = r(139).Transform
}, function(t, e, r) {
    t.exports = r(139).PassThrough
}, function(t, e, r) {
    var e = t.exports = function(t) {
        t = t.toLowerCase();
        var r = e[t];
        if (!r) throw new Error(t + " is not supported (we accept pull requests)");
        return new r
    };
    e.sha = r(160), e.sha1 = r(162), e.sha224 = r(163), e.sha256 = r(164), e.sha384 = r(165), e.sha512 = r(166)
}, function(t, e, r) {
    (function(e) {
        function n() {
            this.init(), this._w = c, u.call(this, 64, 56)
        }

        function i(t) {
            return t << 5 | t >>> 27
        }

        function o(t) {
            return t << 30 | t >>> 2
        }

        function s(t, e, r, n) {
            return 0 === t ? e & r | ~e & n : 2 === t ? e & r | e & n | r & n : e ^ r ^ n
        }
        var a = r(133),
            u = r(161),
            f = [1518500249, 1859775393, -1894007588, -899497514],
            c = new Array(80);
        a(n, u), n.prototype.init = function() {
            return this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878, this._e = 3285377520, this
        }, n.prototype._update = function(t) {
            for (var e = this._w, r = 0 | this._a, n = 0 | this._b, a = 0 | this._c, u = 0 | this._d, c = 0 | this._e, h = 0; h < 16; ++h) e[h] = t.readInt32BE(4 * h);
            for (; h < 80; ++h) e[h] = e[h - 3] ^ e[h - 8] ^ e[h - 14] ^ e[h - 16];
            for (var l = 0; l < 80; ++l) {
                var p = ~~(l / 20),
                    d = i(r) + s(p, n, a, u) + c + e[l] + f[p] | 0;
                c = u, u = a, a = o(n), n = r, r = d
            }
            this._a = r + this._a | 0, this._b = n + this._b | 0, this._c = a + this._c | 0, this._d = u + this._d | 0, this._e = c + this._e | 0
        }, n.prototype._hash = function() {
            var t = new e(20);
            return t.writeInt32BE(0 | this._a, 0), t.writeInt32BE(0 | this._b, 4), t.writeInt32BE(0 | this._c, 8), t.writeInt32BE(0 | this._d, 12), t.writeInt32BE(0 | this._e, 16), t
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        function r(t, r) {
            this._block = new e(t), this._finalSize = r, this._blockSize = t, this._len = 0, this._s = 0
        }
        r.prototype.update = function(t, r) {
            "string" == typeof t && (r = r || "utf8", t = new e(t, r));
            for (var n = this._len += t.length, i = this._s || 0, o = 0, s = this._block; i < n;) {
                for (var a = Math.min(t.length, o + this._blockSize - i % this._blockSize), u = a - o, f = 0; f < u; f++) s[i % this._blockSize + f] = t[f + o];
                i += u, o += u, i % this._blockSize === 0 && this._update(s)
            }
            return this._s = i, this
        }, r.prototype.digest = function(t) {
            var e = 8 * this._len;
            this._block[this._len % this._blockSize] = 128, this._block.fill(0, this._len % this._blockSize + 1), e % (8 * this._blockSize) >= 8 * this._finalSize && (this._update(this._block), this._block.fill(0)), this._block.writeInt32BE(e, this._blockSize - 4);
            var r = this._update(this._block) || this._hash();
            return t ? r.toString(t) : r
        }, r.prototype._update = function() {
            throw new Error("_update must be implemented by subclass")
        }, t.exports = r
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        function n() {
            this.init(), this._w = h, f.call(this, 64, 56)
        }

        function i(t) {
            return t << 1 | t >>> 31
        }

        function o(t) {
            return t << 5 | t >>> 27
        }

        function s(t) {
            return t << 30 | t >>> 2
        }

        function a(t, e, r, n) {
            return 0 === t ? e & r | ~e & n : 2 === t ? e & r | e & n | r & n : e ^ r ^ n
        }
        var u = r(133),
            f = r(161),
            c = [1518500249, 1859775393, -1894007588, -899497514],
            h = new Array(80);
        u(n, f), n.prototype.init = function() {
            return this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878, this._e = 3285377520, this
        }, n.prototype._update = function(t) {
            for (var e = this._w, r = 0 | this._a, n = 0 | this._b, u = 0 | this._c, f = 0 | this._d, h = 0 | this._e, l = 0; l < 16; ++l) e[l] = t.readInt32BE(4 * l);
            for (; l < 80; ++l) e[l] = i(e[l - 3] ^ e[l - 8] ^ e[l - 14] ^ e[l - 16]);
            for (var p = 0; p < 80; ++p) {
                var d = ~~(p / 20),
                    v = o(r) + a(d, n, u, f) + h + e[p] + c[d] | 0;
                h = f, f = u, u = s(n), n = r, r = v
            }
            this._a = r + this._a | 0, this._b = n + this._b | 0, this._c = u + this._c | 0, this._d = f + this._d | 0, this._e = h + this._e | 0
        }, n.prototype._hash = function() {
            var t = new e(20);
            return t.writeInt32BE(0 | this._a, 0), t.writeInt32BE(0 | this._b, 4), t.writeInt32BE(0 | this._c, 8), t.writeInt32BE(0 | this._d, 12), t.writeInt32BE(0 | this._e, 16), t
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        function n() {
            this.init(), this._w = a, s.call(this, 64, 56)
        }
        var i = r(133),
            o = r(164),
            s = r(161),
            a = new Array(64);
        i(n, o), n.prototype.init = function() {
            return this._a = 3238371032, this._b = 914150663, this._c = 812702999, this._d = 4144912697, this._e = 4290775857, this._f = 1750603025, this._g = 1694076839, this._h = 3204075428, this
        }, n.prototype._hash = function() {
            var t = new e(28);
            return t.writeInt32BE(this._a, 0), t.writeInt32BE(this._b, 4), t.writeInt32BE(this._c, 8), t.writeInt32BE(this._d, 12), t.writeInt32BE(this._e, 16), t.writeInt32BE(this._f, 20), t.writeInt32BE(this._g, 24), t
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        function n() {
            this.init(), this._w = p, h.call(this, 64, 56)
        }

        function i(t, e, r) {
            return r ^ t & (e ^ r)
        }

        function o(t, e, r) {
            return t & e | r & (t | e)
        }

        function s(t) {
            return (t >>> 2 | t << 30) ^ (t >>> 13 | t << 19) ^ (t >>> 22 | t << 10)
        }

        function a(t) {
            return (t >>> 6 | t << 26) ^ (t >>> 11 | t << 21) ^ (t >>> 25 | t << 7)
        }

        function u(t) {
            return (t >>> 7 | t << 25) ^ (t >>> 18 | t << 14) ^ t >>> 3
        }

        function f(t) {
            return (t >>> 17 | t << 15) ^ (t >>> 19 | t << 13) ^ t >>> 10
        }
        var c = r(133),
            h = r(161),
            l = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298],
            p = new Array(64);
        c(n, h), n.prototype.init = function() {
            return this._a = 1779033703, this._b = 3144134277, this._c = 1013904242, this._d = 2773480762, this._e = 1359893119, this._f = 2600822924, this._g = 528734635, this._h = 1541459225, this
        }, n.prototype._update = function(t) {
            for (var e = this._w, r = 0 | this._a, n = 0 | this._b, c = 0 | this._c, h = 0 | this._d, p = 0 | this._e, d = 0 | this._f, v = 0 | this._g, y = 0 | this._h, g = 0; g < 16; ++g) e[g] = t.readInt32BE(4 * g);
            for (; g < 64; ++g) e[g] = f(e[g - 2]) + e[g - 7] + u(e[g - 15]) + e[g - 16] | 0;
            for (var _ = 0; _ < 64; ++_) {
                var m = y + a(p) + i(p, d, v) + l[_] + e[_] | 0,
                    b = s(r) + o(r, n, c) | 0;
                y = v, v = d, d = p, p = h + m | 0, h = c, c = n, n = r, r = m + b | 0
            }
            this._a = r + this._a | 0, this._b = n + this._b | 0, this._c = c + this._c | 0, this._d = h + this._d | 0, this._e = p + this._e | 0, this._f = d + this._f | 0, this._g = v + this._g | 0, this._h = y + this._h | 0
        }, n.prototype._hash = function() {
            var t = new e(32);
            return t.writeInt32BE(this._a, 0), t.writeInt32BE(this._b, 4), t.writeInt32BE(this._c, 8), t.writeInt32BE(this._d, 12), t.writeInt32BE(this._e, 16), t.writeInt32BE(this._f, 20), t.writeInt32BE(this._g, 24), t.writeInt32BE(this._h, 28), t
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        function n() {
            this.init(), this._w = a, s.call(this, 128, 112)
        }
        var i = r(133),
            o = r(166),
            s = r(161),
            a = new Array(160);
        i(n, o), n.prototype.init = function() {
            return this._ah = 3418070365, this._bh = 1654270250, this._ch = 2438529370, this._dh = 355462360, this._eh = 1731405415, this._fh = 2394180231, this._gh = 3675008525, this._hh = 1203062813, this._al = 3238371032, this._bl = 914150663, this._cl = 812702999, this._dl = 4144912697, this._el = 4290775857, this._fl = 1750603025, this._gl = 1694076839, this._hl = 3204075428, this
        }, n.prototype._hash = function() {
            function t(t, e, n) {
                r.writeInt32BE(t, n), r.writeInt32BE(e, n + 4)
            }
            var r = new e(48);
            return t(this._ah, this._al, 0), t(this._bh, this._bl, 8), t(this._ch, this._cl, 16), t(this._dh, this._dl, 24), t(this._eh, this._el, 32), t(this._fh, this._fl, 40), r
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        function n() {
            this.init(), this._w = y, d.call(this, 128, 112)
        }

        function i(t, e, r) {
            return r ^ t & (e ^ r)
        }

        function o(t, e, r) {
            return t & e | r & (t | e)
        }

        function s(t, e) {
            return (t >>> 28 | e << 4) ^ (e >>> 2 | t << 30) ^ (e >>> 7 | t << 25)
        }

        function a(t, e) {
            return (t >>> 14 | e << 18) ^ (t >>> 18 | e << 14) ^ (e >>> 9 | t << 23)
        }

        function u(t, e) {
            return (t >>> 1 | e << 31) ^ (t >>> 8 | e << 24) ^ t >>> 7
        }

        function f(t, e) {
            return (t >>> 1 | e << 31) ^ (t >>> 8 | e << 24) ^ (t >>> 7 | e << 25)
        }

        function c(t, e) {
            return (t >>> 19 | e << 13) ^ (e >>> 29 | t << 3) ^ t >>> 6
        }

        function h(t, e) {
            return (t >>> 19 | e << 13) ^ (e >>> 29 | t << 3) ^ (t >>> 6 | e << 26)
        }

        function l(t, e) {
            return t >>> 0 < e >>> 0 ? 1 : 0
        }
        var p = r(133),
            d = r(161),
            v = [1116352408, 3609767458, 1899447441, 602891725, 3049323471, 3964484399, 3921009573, 2173295548, 961987163, 4081628472, 1508970993, 3053834265, 2453635748, 2937671579, 2870763221, 3664609560, 3624381080, 2734883394, 310598401, 1164996542, 607225278, 1323610764, 1426881987, 3590304994, 1925078388, 4068182383, 2162078206, 991336113, 2614888103, 633803317, 3248222580, 3479774868, 3835390401, 2666613458, 4022224774, 944711139, 264347078, 2341262773, 604807628, 2007800933, 770255983, 1495990901, 1249150122, 1856431235, 1555081692, 3175218132, 1996064986, 2198950837, 2554220882, 3999719339, 2821834349, 766784016, 2952996808, 2566594879, 3210313671, 3203337956, 3336571891, 1034457026, 3584528711, 2466948901, 113926993, 3758326383, 338241895, 168717936, 666307205, 1188179964, 773529912, 1546045734, 1294757372, 1522805485, 1396182291, 2643833823, 1695183700, 2343527390, 1986661051, 1014477480, 2177026350, 1206759142, 2456956037, 344077627, 2730485921, 1290863460, 2820302411, 3158454273, 3259730800, 3505952657, 3345764771, 106217008, 3516065817, 3606008344, 3600352804, 1432725776, 4094571909, 1467031594, 275423344, 851169720, 430227734, 3100823752, 506948616, 1363258195, 659060556, 3750685593, 883997877, 3785050280, 958139571, 3318307427, 1322822218, 3812723403, 1537002063, 2003034995, 1747873779, 3602036899, 1955562222, 1575990012, 2024104815, 1125592928, 2227730452, 2716904306, 2361852424, 442776044, 2428436474, 593698344, 2756734187, 3733110249, 3204031479, 2999351573, 3329325298, 3815920427, 3391569614, 3928383900, 3515267271, 566280711, 3940187606, 3454069534, 4118630271, 4000239992, 116418474, 1914138554, 174292421, 2731055270, 289380356, 3203993006, 460393269, 320620315, 685471733, 587496836, 852142971, 1086792851, 1017036298, 365543100, 1126000580, 2618297676, 1288033470, 3409855158, 1501505948, 4234509866, 1607167915, 987167468, 1816402316, 1246189591],
            y = new Array(160);
        p(n, d), n.prototype.init = function() {
            return this._ah = 1779033703, this._bh = 3144134277, this._ch = 1013904242, this._dh = 2773480762, this._eh = 1359893119, this._fh = 2600822924, this._gh = 528734635, this._hh = 1541459225, this._al = 4089235720, this._bl = 2227873595, this._cl = 4271175723, this._dl = 1595750129, this._el = 2917565137, this._fl = 725511199, this._gl = 4215389547, this._hl = 327033209, this
        }, n.prototype._update = function(t) {
            for (var e = this._w, r = 0 | this._ah, n = 0 | this._bh, p = 0 | this._ch, d = 0 | this._dh, y = 0 | this._eh, g = 0 | this._fh, _ = 0 | this._gh, m = 0 | this._hh, b = 0 | this._al, w = 0 | this._bl, E = 0 | this._cl, k = 0 | this._dl, T = 0 | this._el, B = 0 | this._fl, S = 0 | this._gl, x = 0 | this._hl, A = 0; A < 32; A += 2) e[A] = t.readInt32BE(4 * A), e[A + 1] = t.readInt32BE(4 * A + 4);
            for (; A < 160; A += 2) {
                var I = e[A - 30],
                    O = e[A - 30 + 1],
                    j = u(I, O),
                    C = f(O, I);
                I = e[A - 4], O = e[A - 4 + 1];
                var R = c(I, O),
                    L = h(O, I),
                    U = e[A - 14],
                    F = e[A - 14 + 1],
                    P = e[A - 32],
                    D = e[A - 32 + 1],
                    N = C + F | 0,
                    M = j + U + l(N, C) | 0;
                N = N + L | 0, M = M + R + l(N, L) | 0, N = N + D | 0, M = M + P + l(N, D) | 0, e[A] = M, e[A + 1] = N
            }
            for (var q = 0; q < 160; q += 2) {
                M = e[q], N = e[q + 1];
                var z = o(r, n, p),
                    V = o(b, w, E),
                    H = s(r, b),
                    W = s(b, r),
                    Y = a(y, T),
                    G = a(T, y),
                    $ = v[q],
                    X = v[q + 1],
                    Z = i(y, g, _),
                    K = i(T, B, S),
                    Q = x + G | 0,
                    J = m + Y + l(Q, x) | 0;
                Q = Q + K | 0, J = J + Z + l(Q, K) | 0, Q = Q + X | 0, J = J + $ + l(Q, X) | 0, Q = Q + N | 0, J = J + M + l(Q, N) | 0;
                var tt = W + V | 0,
                    et = H + z + l(tt, W) | 0;
                m = _, x = S, _ = g, S = B, g = y, B = T, T = k + Q | 0, y = d + J + l(T, k) | 0, d = p, k = E, p = n, E = w, n = r, w = b, b = Q + tt | 0, r = J + et + l(b, Q) | 0
            }
            this._al = this._al + b | 0, this._bl = this._bl + w | 0, this._cl = this._cl + E | 0, this._dl = this._dl + k | 0, this._el = this._el + T | 0, this._fl = this._fl + B | 0, this._gl = this._gl + S | 0, this._hl = this._hl + x | 0, this._ah = this._ah + r + l(this._al, b) | 0, this._bh = this._bh + n + l(this._bl, w) | 0, this._ch = this._ch + p + l(this._cl, E) | 0, this._dh = this._dh + d + l(this._dl, k) | 0, this._eh = this._eh + y + l(this._el, T) | 0, this._fh = this._fh + g + l(this._fl, B) | 0, this._gh = this._gh + _ + l(this._gl, S) | 0, this._hh = this._hh + m + l(this._hl, x) | 0
        }, n.prototype._hash = function() {
            function t(t, e, n) {
                r.writeInt32BE(t, n), r.writeInt32BE(e, n + 4)
            }
            var r = new e(64);
            return t(this._ah, this._al, 0), t(this._bh, this._bl, 8), t(this._ch, this._cl, 16), t(this._dh, this._dl, 24), t(this._eh, this._el, 32), t(this._fh, this._fl, 40), t(this._gh, this._gl, 48), t(this._hh, this._hl, 56), r
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    function n(t) {
        o.call(this), this.hashMode = "string" == typeof t, this.hashMode ? this[t] = this._finalOrDigest : this.final = this._finalOrDigest, this._final && (this.__final = this._final, this._final = null), this._decoder = null, this._encoding = null
    }
    var i = r(143).Buffer,
        o = r(138).Transform,
        s = r(168).StringDecoder,
        a = r(133);
    a(n, o), n.prototype.update = function(t, e, r) {
        "string" == typeof t && (t = i.from(t, e));
        var n = this._update(t);
        return this.hashMode ? this : (r && (n = this._toString(n, r)), n)
    }, n.prototype.setAutoPadding = function() {}, n.prototype.getAuthTag = function() {
        throw new Error("trying to get auth tag in unsupported state")
    }, n.prototype.setAuthTag = function() {
        throw new Error("trying to set auth tag in unsupported state")
    }, n.prototype.setAAD = function() {
        throw new Error("trying to set aad in unsupported state")
    }, n.prototype._transform = function(t, e, r) {
        var n;
        try {
            this.hashMode ? this._update(t) : this.push(this._update(t))
        } catch (t) {
            n = t
        } finally {
            r(n)
        }
    }, n.prototype._flush = function(t) {
        var e;
        try {
            this.push(this.__final())
        } catch (t) {
            e = t
        }
        t(e)
    }, n.prototype._finalOrDigest = function(t) {
        var e = this.__final() || i.alloc(0);
        return t && (e = this._toString(e, t, !0)), e
    }, n.prototype._toString = function(t, e, r) {
        if (this._decoder || (this._decoder = new s(e), this._encoding = e), this._encoding !== e) throw new Error("can't switch encodings");
        var n = this._decoder.write(t);
        return r && (n += this._decoder.end()), n
    }, t.exports = n
}, function(t, e, r) {
    function n(t) {
        if (t && !u(t)) throw new Error("Unknown encoding: " + t)
    }

    function i(t) {
        return t.toString(this.encoding)
    }

    function o(t) {
        this.charReceived = t.length % 2, this.charLength = this.charReceived ? 2 : 0
    }

    function s(t) {
        this.charReceived = t.length % 3, this.charLength = this.charReceived ? 3 : 0
    }
    var a = r(144).Buffer,
        u = a.isEncoding || function(t) {
            switch (t && t.toLowerCase()) {
                case "hex":
                case "utf8":
                case "utf-8":
                case "ascii":
                case "binary":
                case "base64":
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                case "raw":
                    return !0;
                default:
                    return !1
            }
        },
        f = e.StringDecoder = function(t) {
            switch (this.encoding = (t || "utf8").toLowerCase().replace(/[-_]/, ""), n(t), this.encoding) {
                case "utf8":
                    this.surrogateSize = 3;
                    break;
                case "ucs2":
                case "utf16le":
                    this.surrogateSize = 2, this.detectIncompleteChar = o;
                    break;
                case "base64":
                    this.surrogateSize = 3, this.detectIncompleteChar = s;
                    break;
                default:
                    return void(this.write = i)
            }
            this.charBuffer = new a(6), this.charReceived = 0, this.charLength = 0
        };
    f.prototype.write = function(t) {
        for (var e = ""; this.charLength;) {
            var r = t.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : t.length;
            if (t.copy(this.charBuffer, this.charReceived, 0, r), this.charReceived += r, this.charReceived < this.charLength) return "";
            t = t.slice(r, t.length), e = this.charBuffer.slice(0, this.charLength).toString(this.encoding);
            var n = e.charCodeAt(e.length - 1);
            if (!(n >= 55296 && n <= 56319)) {
                if (this.charReceived = this.charLength = 0, 0 === t.length) return e;
                break
            }
            this.charLength += this.surrogateSize, e = ""
        }
        this.detectIncompleteChar(t);
        var i = t.length;
        this.charLength && (t.copy(this.charBuffer, 0, t.length - this.charReceived, i), i -= this.charReceived), e += t.toString(this.encoding, 0, i);
        var i = e.length - 1,
            n = e.charCodeAt(i);
        if (n >= 55296 && n <= 56319) {
            var o = this.surrogateSize;
            return this.charLength += o, this.charReceived += o, this.charBuffer.copy(this.charBuffer, o, 0, o), t.copy(this.charBuffer, 0, 0, o), e.substring(0, i)
        }
        return e
    }, f.prototype.detectIncompleteChar = function(t) {
        for (var e = t.length >= 3 ? 3 : t.length; e > 0; e--) {
            var r = t[t.length - e];
            if (1 == e && r >> 5 == 6) {
                this.charLength = 2;
                break
            }
            if (e <= 2 && r >> 4 == 14) {
                this.charLength = 3;
                break
            }
            if (e <= 3 && r >> 3 == 30) {
                this.charLength = 4;
                break
            }
        }
        this.charReceived = e
    }, f.prototype.end = function(t) {
        var e = "";
        if (t && t.length && (e = this.write(t)), this.charReceived) {
            var r = this.charReceived,
                n = this.charBuffer,
                i = this.encoding;
            e += n.slice(0, r).toString(i)
        }
        return e
    }
}, function(t, e, r) {
    "use strict";

    function n(t, e) {
        s.call(this, "digest"), "string" == typeof e && (e = a.from(e));
        var r = "sha512" === t || "sha384" === t ? 128 : 64;
        if (this._alg = t, this._key = e, e.length > r) {
            var n = "rmd160" === t ? new f : c(t);
            e = n.update(e).digest()
        } else e.length < r && (e = a.concat([e, h], r));
        for (var i = this._ipad = a.allocUnsafe(r), o = this._opad = a.allocUnsafe(r), u = 0; u < r; u++) i[u] = 54 ^ e[u], o[u] = 92 ^ e[u];
        this._hash = "rmd160" === t ? new f : c(t), this._hash.update(i)
    }
    var i = r(133),
        o = r(170),
        s = r(167),
        a = r(143).Buffer,
        u = r(134),
        f = r(136),
        c = r(159),
        h = a.alloc(128);
    i(n, s), n.prototype._update = function(t) {
        this._hash.update(t)
    }, n.prototype._final = function() {
        var t = this._hash.digest(),
            e = "rmd160" === this._alg ? new f : c(this._alg);
        return e.update(this._opad).update(t).digest()
    }, t.exports = function(t, e) {
        return t = t.toLowerCase(), "rmd160" === t || "ripemd160" === t ? new n("rmd160", e) : "md5" === t ? new o(u, e) : new n(t, e)
    }
}, function(t, e, r) {
    "use strict";

    function n(t, e) {
        s.call(this, "digest"), "string" == typeof e && (e = o.from(e)), this._alg = t, this._key = e, e.length > u ? e = t(e) : e.length < u && (e = o.concat([e, a], u));
        for (var r = this._ipad = o.allocUnsafe(u), n = this._opad = o.allocUnsafe(u), i = 0; i < u; i++) r[i] = 54 ^ e[i], n[i] = 92 ^ e[i];
        this._hash = [r]
    }
    var i = r(133),
        o = r(143).Buffer,
        s = r(167),
        a = o.alloc(128),
        u = 64;
    i(n, s), n.prototype._update = function(t) {
        this._hash.push(t)
    }, n.prototype._final = function() {
        var t = this._alg(o.concat(this._hash));
        return this._alg(o.concat([this._opad, t]))
    }, t.exports = n
}, function(t, e, r) {
    var n = r(172),
        i = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    t.exports = n(i)
}, function(t, e, r) {
    var n = r(143).Buffer;
    t.exports = function(t) {
        function e(e) {
            if (0 === e.length) return "";
            for (var r = [0], n = 0; n < e.length; ++n) {
                for (var i = 0, o = e[n]; i < r.length; ++i) o += r[i] << 8, r[i] = o % s, o = o / s | 0;
                for (; o > 0;) r.push(o % s), o = o / s | 0
            }
            for (var a = "", u = 0; 0 === e[u] && u < e.length - 1; ++u) a += t[0];
            for (var f = r.length - 1; f >= 0; --f) a += t[r[f]];
            return a
        }

        function r(t) {
            if (0 === t.length) return n.allocUnsafe(0);
            for (var e = [0], r = 0; r < t.length; r++) {
                var i = o[t[r]];
                if (void 0 === i) return;
                for (var u = 0, f = i; u < e.length; ++u) f += e[u] * s, e[u] = 255 & f, f >>= 8;
                for (; f > 0;) e.push(255 & f), f >>= 8
            }
            for (var c = 0; t[c] === a && c < t.length - 1; ++c) e.push(0);
            return n.from(e.reverse())
        }

        function i(t) {
            var e = r(t);
            if (e) return e;
            throw new Error("Non-base" + s + " character")
        }
        for (var o = {}, s = t.length, a = t.charAt(0), u = 0; u < t.length; u++) {
            var f = t.charAt(u);
            if (void 0 !== o[f]) throw new TypeError(f + " is ambiguous");
            o[f] = u
        }
        return {
            encode: e,
            decodeUnsafe: r,
            decode: i
        }
    }
}, function(t, e, r) {
    (function(t) {
        "use strict";

        function n(t) {
            return t && t.__esModule ? t : {
                default: t
            }
        }

        function i(t, e, r) {
            var n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : f();
            return s(t, e, n, r)
        }

        function o(t, e, r, n, i) {
            return s(t, e, r, n, i).message
        }

        function s(e, r, n, i, o) {
            if (e = S(e), !e) throw new TypeError("private_key is required");
            if (r = x(r), !r) throw new TypeError("public_key is required");
            if (n = A(n), !n) throw new TypeError("nonce is required");
            if (!t.isBuffer(i)) {
                if ("string" != typeof i) throw new TypeError("message should be buffer or string");
                i = new t(i, "binary")
            }
            if (o && "number" != typeof o) throw new TypeError("checksum should be a number");
            var s = e.get_shared_secret(r),
                f = new p.default(p.default.DEFAULT_CAPACITY, p.default.LITTLE_ENDIAN);
            f.writeUint64(n), f.append(s.toString("binary"), "binary"), f = new t(f.copy(0, f.offset).toBinary(), "binary");
            var c = k.default.sha512(f),
                h = c.slice(32, 48),
                l = c.slice(0, 32),
                d = k.default.sha256(c);
            d = d.slice(0, 4);
            var v = p.default.fromBinary(d.toString("binary"), p.default.DEFAULT_CAPACITY, p.default.LITTLE_ENDIAN);
            if (d = v.readUint32(), o) {
                if (d !== o) throw new Error("Invalid key");
                i = a(i, l, h)
            } else i = u(i, l, h);
            return {
                nonce: n,
                message: i,
                checksum: d
            }
        }

        function a(e, r, n) {
            (0, g.default)(e, "Missing cipher text"), e = I(e);
            var i = v.default.createDecipheriv("aes-256-cbc", r, n);
            return e = t.concat([i.update(e), i.final()])
        }

        function u(e, r, n) {
            (0, g.default)(e, "Missing plain text"), e = I(e);
            var i = v.default.createCipheriv("aes-256-cbc", r, n);
            return e = t.concat([i.update(e), i.final()])
        }

        function f() {
            if (null === B) {
                var t = h.default.randomUint8Array(2);
                B = parseInt(t[0] << 8 | t[1], 10)
            }
            var e = T.fromNumber(Date.now()),
                r = ++B % 65535;
            return e = e.shiftLeft(16).or(T.fromNumber(r)), e.toString()
        }
        Object.defineProperty(e, "__esModule", {
            value: !0
        }), e.encrypt = i, e.decrypt = o;
        var c = r(174),
            h = n(c),
            l = r(176),
            p = n(l),
            d = r(179),
            v = n(d),
            y = r(127),
            g = n(y),
            _ = r(199),
            m = n(_),
            b = r(209),
            w = n(b),
            E = r(131),
            k = n(E),
            T = p.default.Long,
            B = null,
            S = function(t) {
                return t ? t.d ? t : w.default.fromWif(t) : t
            },
            x = function(t) {
                return t ? t.Q ? t : m.default.fromString(t) : t
            },
            A = function(t) {
                return t ? T.isLong(t) ? t : T.fromString(t) : t
            },
            I = function(e) {
                return e ? t.isBuffer(e) ? e : new t(e, "binary") : e
            }
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    var n, i;
    (function(o, s) {
        ! function(a) {
            "use strict";

            function u(t, e) {
                if (e = e || {
                        type: "Array"
                    }, "undefined" != typeof o && "number" == typeof o.pid) return f(t, e);
                var r = window.crypto || window.msCrypto;
                if (!r) throw new Error("Your browser does not support window.crypto.");
                return c(t, e)
            }

            function f(t, e) {
                var n = r(175),
                    i = n.randomBytes(t);
                switch (e.type) {
                    case "Array":
                        return [].slice.call(i);
                    case "Buffer":
                        return i;
                    case "Uint8Array":
                        for (var o = new Uint8Array(t), s = 0; s < t; ++s) o[s] = i.readUInt8(s);
                        return o;
                    default:
                        throw new Error(e.type + " is unsupported.")
                }
            }

            function c(t, e) {
                var r = new Uint8Array(t),
                    n = window.crypto || window.msCrypto;
                switch (n.getRandomValues(r), e.type) {
                    case "Array":
                        return [].slice.call(r);
                    case "Buffer":
                        try {
                            new s(1)
                        } catch (t) {
                            throw new Error("Buffer not supported in this environment. Use Node.js or Browserify for browser support.")
                        }
                        return new s(r);
                    case "Uint8Array":
                        return r;
                    default:
                        throw new Error(e.type + " is unsupported.")
                }
            }
            n = [], i = function() {
                return u
            }.apply(e, n), !(void 0 !== i && (t.exports = i)), u.randomArray = function(t) {
                return u(t, {
                    type: "Array"
                })
            }, u.randomUint8Array = function(t) {
                return u(t, {
                    type: "Uint8Array"
                })
            }, u.randomBuffer = function(t) {
                return u(t, {
                    type: "Buffer"
                })
            }
        }(this)
    }).call(e, r(5), r(123).Buffer)
}, 119, function(t, e, r) {
    var n, i, o;
    (function(t) {
        ! function(s, a) {
            r(177).amd ? (i = [r(178)], n = a, o = "function" == typeof n ? n.apply(e, i) : n, !(void 0 !== o && (t.exports = o))) : "object" == typeof t && t && t.exports ? t.exports = function() {
                var t;
                try {
                    t = r(178)
                } catch (t) {}
                return a(t)
            }() : (s.dcodeIO = s.dcodeIO || {}).ByteBuffer = a(s.dcodeIO.Long)
        }(this, function(t) {
            "use strict";

            function e(t) {
                var e = 0;
                return function() {
                    return e < t.length ? t.charCodeAt(e++) : null
                }
            }

            function r() {
                var t = [],
                    e = [];
                return function() {
                    return 0 === arguments.length ? e.join("") + u.apply(String, t) : (t.length + arguments.length > 1024 && (e.push(u.apply(String, t)), t.length = 0), void Array.prototype.push.apply(t, arguments))
                }
            }

            function n(t, e, r, n, i) {
                var o, s, a = 8 * i - n - 1,
                    u = (1 << a) - 1,
                    f = u >> 1,
                    c = -7,
                    h = r ? i - 1 : 0,
                    l = r ? -1 : 1,
                    p = t[e + h];
                for (h += l, o = p & (1 << -c) - 1, p >>= -c, c += a; c > 0; o = 256 * o + t[e + h], h += l, c -= 8);
                for (s = o & (1 << -c) - 1, o >>= -c, c += n; c > 0; s = 256 * s + t[e + h], h += l, c -= 8);
                if (0 === o) o = 1 - f;
                else {
                    if (o === u) return s ? NaN : (p ? -1 : 1) * (1 / 0);
                    s += Math.pow(2, n), o -= f
                }
                return (p ? -1 : 1) * s * Math.pow(2, o - n)
            }

            function i(t, e, r, n, i, o) {
                var s, a, u, f = 8 * o - i - 1,
                    c = (1 << f) - 1,
                    h = c >> 1,
                    l = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                    p = n ? 0 : o - 1,
                    d = n ? 1 : -1,
                    v = e < 0 || 0 === e && 1 / e < 0 ? 1 : 0;
                for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (a = isNaN(e) ? 1 : 0, s = c) : (s = Math.floor(Math.log(e) / Math.LN2), e * (u = Math.pow(2, -s)) < 1 && (s--, u *= 2), e += s + h >= 1 ? l / u : l * Math.pow(2, 1 - h), e * u >= 2 && (s++, u /= 2), s + h >= c ? (a = 0, s = c) : s + h >= 1 ? (a = (e * u - 1) * Math.pow(2, i), s += h) : (a = e * Math.pow(2, h - 1) * Math.pow(2, i), s = 0)); i >= 8; t[r + p] = 255 & a, p += d, a /= 256, i -= 8);
                for (s = s << i | a, f += i; f > 0; t[r + p] = 255 & s, p += d, s /= 256, f -= 8);
                t[r + p - d] |= 128 * v
            }
            var o = function(t, e, r) {
                if ("undefined" == typeof t && (t = o.DEFAULT_CAPACITY), "undefined" == typeof e && (e = o.DEFAULT_ENDIAN), "undefined" == typeof r && (r = o.DEFAULT_NOASSERT), !r) {
                    if (t |= 0, t < 0) throw RangeError("Illegal capacity");
                    e = !!e, r = !!r
                }
                this.buffer = 0 === t ? a : new ArrayBuffer(t), this.view = 0 === t ? null : new Uint8Array(this.buffer), this.offset = 0, this.markedOffset = -1, this.limit = t, this.littleEndian = e, this.noAssert = r
            };
            o.VERSION = "5.0.1", o.LITTLE_ENDIAN = !0, o.BIG_ENDIAN = !1, o.DEFAULT_CAPACITY = 16, o.DEFAULT_ENDIAN = o.BIG_ENDIAN, o.DEFAULT_NOASSERT = !1, o.Long = t || null;
            var s = o.prototype;
            s.__isByteBuffer__, Object.defineProperty(s, "__isByteBuffer__", {
                value: !0,
                enumerable: !1,
                configurable: !1
            });
            var a = new ArrayBuffer(0),
                u = String.fromCharCode;
            o.accessor = function() {
                return Uint8Array
            }, o.allocate = function(t, e, r) {
                return new o(t, e, r)
            }, o.concat = function(t, e, r, n) {
                "boolean" != typeof e && "string" == typeof e || (n = r, r = e, e = void 0);
                for (var i, s = 0, a = 0, u = t.length; a < u; ++a) o.isByteBuffer(t[a]) || (t[a] = o.wrap(t[a], e)), i = t[a].limit - t[a].offset, i > 0 && (s += i);
                if (0 === s) return new o(0, r, n);
                var f, c = new o(s, r, n);
                for (a = 0; a < u;) f = t[a++], i = f.limit - f.offset, i <= 0 || (c.view.set(f.view.subarray(f.offset, f.limit), c.offset), c.offset += i);
                return c.limit = c.offset, c.offset = 0, c
            }, o.isByteBuffer = function(t) {
                return (t && t.__isByteBuffer__) === !0
            }, o.type = function() {
                return ArrayBuffer
            }, o.wrap = function(t, e, r, n) {
                if ("string" != typeof e && (n = r, r = e, e = void 0), "string" == typeof t) switch ("undefined" == typeof e && (e = "utf8"), e) {
                    case "base64":
                        return o.fromBase64(t, r);
                    case "hex":
                        return o.fromHex(t, r);
                    case "binary":
                        return o.fromBinary(t, r);
                    case "utf8":
                        return o.fromUTF8(t, r);
                    case "debug":
                        return o.fromDebug(t, r);
                    default:
                        throw Error("Unsupported encoding: " + e)
                }
                if (null === t || "object" != typeof t) throw TypeError("Illegal buffer");
                var i;
                if (o.isByteBuffer(t)) return i = s.clone.call(t), i.markedOffset = -1, i;
                if (t instanceof Uint8Array) i = new o(0, r, n), t.length > 0 && (i.buffer = t.buffer, i.offset = t.byteOffset, i.limit = t.byteOffset + t.byteLength, i.view = new Uint8Array(t.buffer));
                else if (t instanceof ArrayBuffer) i = new o(0, r, n), t.byteLength > 0 && (i.buffer = t, i.offset = 0, i.limit = t.byteLength, i.view = t.byteLength > 0 ? new Uint8Array(t) : null);
                else {
                    if ("[object Array]" !== Object.prototype.toString.call(t)) throw TypeError("Illegal buffer");
                    i = new o(t.length, r, n), i.limit = t.length;
                    for (var a = 0; a < t.length; ++a) i.view[a] = t[a]
                }
                return i
            }, s.writeBitSet = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if (!(t instanceof Array)) throw TypeError("Illegal BitSet: Not an array");
                    if ("number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength)
                }
                var n, i = e,
                    o = t.length,
                    s = o >> 3,
                    a = 0;
                for (e += this.writeVarint32(o, e); s--;) n = 1 & !!t[a++] | (1 & !!t[a++]) << 1 | (1 & !!t[a++]) << 2 | (1 & !!t[a++]) << 3 | (1 & !!t[a++]) << 4 | (1 & !!t[a++]) << 5 | (1 & !!t[a++]) << 6 | (1 & !!t[a++]) << 7, this.writeByte(n, e++);
                if (a < o) {
                    var u = 0;
                    for (n = 0; a < o;) n |= (1 & !!t[a++]) << u++;
                    this.writeByte(n, e++)
                }
                return r ? (this.offset = e, this) : e - i
            }, s.readBitSet = function(t) {
                var e = "undefined" == typeof t;
                e && (t = this.offset);
                var r, n = this.readVarint32(t),
                    i = n.value,
                    o = i >> 3,
                    s = 0,
                    a = [];
                for (t += n.length; o--;) r = this.readByte(t++), a[s++] = !!(1 & r), a[s++] = !!(2 & r), a[s++] = !!(4 & r), a[s++] = !!(8 & r), a[s++] = !!(16 & r), a[s++] = !!(32 & r), a[s++] = !!(64 & r), a[s++] = !!(128 & r);
                if (s < i) {
                    var u = 0;
                    for (r = this.readByte(t++); s < i;) a[s++] = !!(r >> u++ & 1)
                }
                return e && (this.offset = t), a
            }, s.readBytes = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + t > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+" + t + ") <= " + this.buffer.byteLength)
                }
                var n = this.slice(e, e + t);
                return r && (this.offset += t), n
            }, s.writeBytes = s.append, s.writeInt8 = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal value: " + t + " (not an integer)");
                    if (t |= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength)
                }
                e += 1;
                var n = this.buffer.byteLength;
                return e > n && this.resize((n *= 2) > e ? n : e), e -= 1, this.view[e] = t, r && (this.offset += 1), this
            }, s.writeByte = s.writeInt8, s.readInt8 = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength)
                }
                var r = this.view[t];
                return 128 === (128 & r) && (r = -(255 - r + 1)), e && (this.offset += 1), r
            }, s.readByte = s.readInt8, s.writeUint8 = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal value: " + t + " (not an integer)");
                    if (t >>>= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength)
                }
                e += 1;
                var n = this.buffer.byteLength;
                return e > n && this.resize((n *= 2) > e ? n : e), e -= 1, this.view[e] = t, r && (this.offset += 1), this
            }, s.writeUInt8 = s.writeUint8, s.readUint8 = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength)
                }
                var r = this.view[t];
                return e && (this.offset += 1), r
            }, s.readUInt8 = s.readUint8, s.writeInt16 = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal value: " + t + " (not an integer)");
                    if (t |= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength)
                }
                e += 2;
                var n = this.buffer.byteLength;
                return e > n && this.resize((n *= 2) > e ? n : e), e -= 2, this.littleEndian ? (this.view[e + 1] = (65280 & t) >>> 8, this.view[e] = 255 & t) : (this.view[e] = (65280 & t) >>> 8, this.view[e + 1] = 255 & t), r && (this.offset += 2), this
            }, s.writeShort = s.writeInt16, s.readInt16 = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 2 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+2) <= " + this.buffer.byteLength)
                }
                var r = 0;
                return this.littleEndian ? (r = this.view[t], r |= this.view[t + 1] << 8) : (r = this.view[t] << 8, r |= this.view[t + 1]), 32768 === (32768 & r) && (r = -(65535 - r + 1)), e && (this.offset += 2), r
            }, s.readShort = s.readInt16, s.writeUint16 = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal value: " + t + " (not an integer)");
                    if (t >>>= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength)
                }
                e += 2;
                var n = this.buffer.byteLength;
                return e > n && this.resize((n *= 2) > e ? n : e), e -= 2, this.littleEndian ? (this.view[e + 1] = (65280 & t) >>> 8, this.view[e] = 255 & t) : (this.view[e] = (65280 & t) >>> 8, this.view[e + 1] = 255 & t), r && (this.offset += 2), this
            }, s.writeUInt16 = s.writeUint16, s.readUint16 = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 2 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+2) <= " + this.buffer.byteLength)
                }
                var r = 0;
                return this.littleEndian ? (r = this.view[t], r |= this.view[t + 1] << 8) : (r = this.view[t] << 8, r |= this.view[t + 1]), e && (this.offset += 2), r
            }, s.readUInt16 = s.readUint16, s.writeInt32 = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal value: " + t + " (not an integer)");
                    if (t |= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength)
                }
                e += 4;
                var n = this.buffer.byteLength;
                return e > n && this.resize((n *= 2) > e ? n : e), e -= 4, this.littleEndian ? (this.view[e + 3] = t >>> 24 & 255, this.view[e + 2] = t >>> 16 & 255, this.view[e + 1] = t >>> 8 & 255, this.view[e] = 255 & t) : (this.view[e] = t >>> 24 & 255, this.view[e + 1] = t >>> 16 & 255, this.view[e + 2] = t >>> 8 & 255, this.view[e + 3] = 255 & t), r && (this.offset += 4), this
            }, s.writeInt = s.writeInt32, s.readInt32 = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+4) <= " + this.buffer.byteLength)
                }
                var r = 0;
                return this.littleEndian ? (r = this.view[t + 2] << 16, r |= this.view[t + 1] << 8, r |= this.view[t], r += this.view[t + 3] << 24 >>> 0) : (r = this.view[t + 1] << 16, r |= this.view[t + 2] << 8, r |= this.view[t + 3], r += this.view[t] << 24 >>> 0), r |= 0, e && (this.offset += 4), r
            }, s.readInt = s.readInt32, s.writeUint32 = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal value: " + t + " (not an integer)");
                    if (t >>>= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength)
                }
                e += 4;
                var n = this.buffer.byteLength;
                return e > n && this.resize((n *= 2) > e ? n : e), e -= 4, this.littleEndian ? (this.view[e + 3] = t >>> 24 & 255, this.view[e + 2] = t >>> 16 & 255, this.view[e + 1] = t >>> 8 & 255, this.view[e] = 255 & t) : (this.view[e] = t >>> 24 & 255, this.view[e + 1] = t >>> 16 & 255, this.view[e + 2] = t >>> 8 & 255, this.view[e + 3] = 255 & t), r && (this.offset += 4), this
            }, s.writeUInt32 = s.writeUint32, s.readUint32 = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+4) <= " + this.buffer.byteLength)
                }
                var r = 0;
                return this.littleEndian ? (r = this.view[t + 2] << 16, r |= this.view[t + 1] << 8, r |= this.view[t], r += this.view[t + 3] << 24 >>> 0) : (r = this.view[t + 1] << 16, r |= this.view[t + 2] << 8, r |= this.view[t + 3], r += this.view[t] << 24 >>> 0), e && (this.offset += 4), r
            }, s.readUInt32 = s.readUint32, t && (s.writeInt64 = function(e, r) {
                var n = "undefined" == typeof r;
                if (n && (r = this.offset), !this.noAssert) {
                    if ("number" == typeof e) e = t.fromNumber(e);
                    else if ("string" == typeof e) e = t.fromString(e);
                    else if (!(e && e instanceof t)) throw TypeError("Illegal value: " + e + " (not an integer or Long)");
                    if ("number" != typeof r || r % 1 !== 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
                    if (r >>>= 0, r < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength)
                }
                "number" == typeof e ? e = t.fromNumber(e) : "string" == typeof e && (e = t.fromString(e)), r += 8;
                var i = this.buffer.byteLength;
                r > i && this.resize((i *= 2) > r ? i : r), r -= 8;
                var o = e.low,
                    s = e.high;
                return this.littleEndian ? (this.view[r + 3] = o >>> 24 & 255, this.view[r + 2] = o >>> 16 & 255, this.view[r + 1] = o >>> 8 & 255, this.view[r] = 255 & o, r += 4, this.view[r + 3] = s >>> 24 & 255, this.view[r + 2] = s >>> 16 & 255, this.view[r + 1] = s >>> 8 & 255, this.view[r] = 255 & s) : (this.view[r] = s >>> 24 & 255, this.view[r + 1] = s >>> 16 & 255, this.view[r + 2] = s >>> 8 & 255, this.view[r + 3] = 255 & s, r += 4, this.view[r] = o >>> 24 & 255, this.view[r + 1] = o >>> 16 & 255, this.view[r + 2] = o >>> 8 & 255, this.view[r + 3] = 255 & o), n && (this.offset += 8), this
            }, s.writeLong = s.writeInt64, s.readInt64 = function(e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+8) <= " + this.buffer.byteLength)
                }
                var n = 0,
                    i = 0;
                this.littleEndian ? (n = this.view[e + 2] << 16, n |= this.view[e + 1] << 8, n |= this.view[e], n += this.view[e + 3] << 24 >>> 0, e += 4, i = this.view[e + 2] << 16, i |= this.view[e + 1] << 8, i |= this.view[e], i += this.view[e + 3] << 24 >>> 0) : (i = this.view[e + 1] << 16, i |= this.view[e + 2] << 8, i |= this.view[e + 3], i += this.view[e] << 24 >>> 0, e += 4, n = this.view[e + 1] << 16, n |= this.view[e + 2] << 8, n |= this.view[e + 3], n += this.view[e] << 24 >>> 0);
                var o = new t(n, i, !1);
                return r && (this.offset += 8), o
            }, s.readLong = s.readInt64, s.writeUint64 = function(e, r) {
                var n = "undefined" == typeof r;
                if (n && (r = this.offset), !this.noAssert) {
                    if ("number" == typeof e) e = t.fromNumber(e);
                    else if ("string" == typeof e) e = t.fromString(e);
                    else if (!(e && e instanceof t)) throw TypeError("Illegal value: " + e + " (not an integer or Long)");
                    if ("number" != typeof r || r % 1 !== 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
                    if (r >>>= 0, r < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength)
                }
                "number" == typeof e ? e = t.fromNumber(e) : "string" == typeof e && (e = t.fromString(e)), r += 8;
                var i = this.buffer.byteLength;
                r > i && this.resize((i *= 2) > r ? i : r), r -= 8;
                var o = e.low,
                    s = e.high;
                return this.littleEndian ? (this.view[r + 3] = o >>> 24 & 255, this.view[r + 2] = o >>> 16 & 255, this.view[r + 1] = o >>> 8 & 255, this.view[r] = 255 & o, r += 4, this.view[r + 3] = s >>> 24 & 255, this.view[r + 2] = s >>> 16 & 255, this.view[r + 1] = s >>> 8 & 255, this.view[r] = 255 & s) : (this.view[r] = s >>> 24 & 255, this.view[r + 1] = s >>> 16 & 255, this.view[r + 2] = s >>> 8 & 255, this.view[r + 3] = 255 & s, r += 4, this.view[r] = o >>> 24 & 255, this.view[r + 1] = o >>> 16 & 255, this.view[r + 2] = o >>> 8 & 255, this.view[r + 3] = 255 & o), n && (this.offset += 8), this
            }, s.writeUInt64 = s.writeUint64, s.readUint64 = function(e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+8) <= " + this.buffer.byteLength)
                }
                var n = 0,
                    i = 0;
                this.littleEndian ? (n = this.view[e + 2] << 16, n |= this.view[e + 1] << 8, n |= this.view[e], n += this.view[e + 3] << 24 >>> 0, e += 4, i = this.view[e + 2] << 16, i |= this.view[e + 1] << 8, i |= this.view[e], i += this.view[e + 3] << 24 >>> 0) : (i = this.view[e + 1] << 16, i |= this.view[e + 2] << 8, i |= this.view[e + 3], i += this.view[e] << 24 >>> 0, e += 4, n = this.view[e + 1] << 16, n |= this.view[e + 2] << 8, n |= this.view[e + 3], n += this.view[e] << 24 >>> 0);
                var o = new t(n, i, !0);
                return r && (this.offset += 8), o
            }, s.readUInt64 = s.readUint64), s.writeFloat32 = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof t) throw TypeError("Illegal value: " + t + " (not a number)");
                    if ("number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength)
                }
                e += 4;
                var n = this.buffer.byteLength;
                return e > n && this.resize((n *= 2) > e ? n : e), e -= 4, i(this.view, t, e, this.littleEndian, 23, 4), r && (this.offset += 4), this
            }, s.writeFloat = s.writeFloat32, s.readFloat32 = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+4) <= " + this.buffer.byteLength)
                }
                var r = n(this.view, t, this.littleEndian, 23, 4);
                return e && (this.offset += 4), r
            }, s.readFloat = s.readFloat32, s.writeFloat64 = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof t) throw TypeError("Illegal value: " + t + " (not a number)");
                    if ("number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength)
                }
                e += 8;
                var n = this.buffer.byteLength;
                return e > n && this.resize((n *= 2) > e ? n : e), e -= 8, i(this.view, t, e, this.littleEndian, 52, 8), r && (this.offset += 8), this
            }, s.writeDouble = s.writeFloat64, s.readFloat64 = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 8 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+8) <= " + this.buffer.byteLength)
                }
                var r = n(this.view, t, this.littleEndian, 52, 8);
                return e && (this.offset += 8), r
            }, s.readDouble = s.readFloat64, o.MAX_VARINT32_BYTES = 5, o.calculateVarint32 = function(t) {
                return t >>>= 0, t < 128 ? 1 : t < 16384 ? 2 : t < 1 << 21 ? 3 : t < 1 << 28 ? 4 : 5
            }, o.zigZagEncode32 = function(t) {
                return ((t |= 0) << 1 ^ t >> 31) >>> 0
            }, o.zigZagDecode32 = function(t) {
                return t >>> 1 ^ -(1 & t) | 0
            }, s.writeVarint32 = function(t, e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal value: " + t + " (not an integer)");
                    if (t |= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+0) <= " + this.buffer.byteLength)
                }
                var n, i = o.calculateVarint32(t);
                e += i;
                var s = this.buffer.byteLength;
                for (e > s && this.resize((s *= 2) > e ? s : e), e -= i, t >>>= 0; t >= 128;) n = 127 & t | 128, this.view[e++] = n, t >>>= 7;
                return this.view[e++] = t, r ? (this.offset = e, this) : i
            }, s.writeVarint32ZigZag = function(t, e) {
                return this.writeVarint32(o.zigZagEncode32(t), e)
            }, s.readVarint32 = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength)
                }
                var r, n = 0,
                    i = 0;
                do {
                    if (!this.noAssert && t > this.limit) {
                        var o = Error("Truncated");
                        throw o.truncated = !0, o
                    }
                    r = this.view[t++], n < 5 && (i |= (127 & r) << 7 * n), ++n
                } while (0 !== (128 & r));
                return i |= 0, e ? (this.offset = t, i) : {
                    value: i,
                    length: n
                }
            }, s.readVarint32ZigZag = function(t) {
                var e = this.readVarint32(t);
                return "object" == typeof e ? e.value = o.zigZagDecode32(e.value) : e = o.zigZagDecode32(e), e
            }, t && (o.MAX_VARINT64_BYTES = 10, o.calculateVarint64 = function(e) {
                "number" == typeof e ? e = t.fromNumber(e) : "string" == typeof e && (e = t.fromString(e));
                var r = e.toInt() >>> 0,
                    n = e.shiftRightUnsigned(28).toInt() >>> 0,
                    i = e.shiftRightUnsigned(56).toInt() >>> 0;
                return 0 == i ? 0 == n ? r < 16384 ? r < 128 ? 1 : 2 : r < 1 << 21 ? 3 : 4 : n < 16384 ? n < 128 ? 5 : 6 : n < 1 << 21 ? 7 : 8 : i < 128 ? 9 : 10
            }, o.zigZagEncode64 = function(e) {
                return "number" == typeof e ? e = t.fromNumber(e, !1) : "string" == typeof e ? e = t.fromString(e, !1) : e.unsigned !== !1 && (e = e.toSigned()), e.shiftLeft(1).xor(e.shiftRight(63)).toUnsigned()
            }, o.zigZagDecode64 = function(e) {
                return "number" == typeof e ? e = t.fromNumber(e, !1) : "string" == typeof e ? e = t.fromString(e, !1) : e.unsigned !== !1 && (e = e.toSigned()), e.shiftRightUnsigned(1).xor(e.and(t.ONE).toSigned().negate()).toSigned()
            }, s.writeVarint64 = function(e, r) {
                var n = "undefined" == typeof r;
                if (n && (r = this.offset), !this.noAssert) {
                    if ("number" == typeof e) e = t.fromNumber(e);
                    else if ("string" == typeof e) e = t.fromString(e);
                    else if (!(e && e instanceof t)) throw TypeError("Illegal value: " + e + " (not an integer or Long)");
                    if ("number" != typeof r || r % 1 !== 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
                    if (r >>>= 0, r < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength)
                }
                "number" == typeof e ? e = t.fromNumber(e, !1) : "string" == typeof e ? e = t.fromString(e, !1) : e.unsigned !== !1 && (e = e.toSigned());
                var i = o.calculateVarint64(e),
                    s = e.toInt() >>> 0,
                    a = e.shiftRightUnsigned(28).toInt() >>> 0,
                    u = e.shiftRightUnsigned(56).toInt() >>> 0;
                r += i;
                var f = this.buffer.byteLength;
                switch (r > f && this.resize((f *= 2) > r ? f : r), r -= i, i) {
                    case 10:
                        this.view[r + 9] = u >>> 7 & 1;
                    case 9:
                        this.view[r + 8] = 9 !== i ? 128 | u : 127 & u;
                    case 8:
                        this.view[r + 7] = 8 !== i ? a >>> 21 | 128 : a >>> 21 & 127;
                    case 7:
                        this.view[r + 6] = 7 !== i ? a >>> 14 | 128 : a >>> 14 & 127;
                    case 6:
                        this.view[r + 5] = 6 !== i ? a >>> 7 | 128 : a >>> 7 & 127;
                    case 5:
                        this.view[r + 4] = 5 !== i ? 128 | a : 127 & a;
                    case 4:
                        this.view[r + 3] = 4 !== i ? s >>> 21 | 128 : s >>> 21 & 127;
                    case 3:
                        this.view[r + 2] = 3 !== i ? s >>> 14 | 128 : s >>> 14 & 127;
                    case 2:
                        this.view[r + 1] = 2 !== i ? s >>> 7 | 128 : s >>> 7 & 127;
                    case 1:
                        this.view[r] = 1 !== i ? 128 | s : 127 & s
                }
                return n ? (this.offset += i, this) : i
            }, s.writeVarint64ZigZag = function(t, e) {
                return this.writeVarint64(o.zigZagEncode64(t), e)
            }, s.readVarint64 = function(e) {
                var r = "undefined" == typeof e;
                if (r && (e = this.offset), !this.noAssert) {
                    if ("number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: " + e + " (not an integer)");
                    if (e >>>= 0, e < 0 || e + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + e + " (+1) <= " + this.buffer.byteLength)
                }
                var n = e,
                    i = 0,
                    o = 0,
                    s = 0,
                    a = 0;
                if (a = this.view[e++], i = 127 & a, 128 & a && (a = this.view[e++], i |= (127 & a) << 7, (128 & a || this.noAssert && "undefined" == typeof a) && (a = this.view[e++], i |= (127 & a) << 14, (128 & a || this.noAssert && "undefined" == typeof a) && (a = this.view[e++], i |= (127 & a) << 21, (128 & a || this.noAssert && "undefined" == typeof a) && (a = this.view[e++], o = 127 & a, (128 & a || this.noAssert && "undefined" == typeof a) && (a = this.view[e++], o |= (127 & a) << 7, (128 & a || this.noAssert && "undefined" == typeof a) && (a = this.view[e++], o |= (127 & a) << 14, (128 & a || this.noAssert && "undefined" == typeof a) && (a = this.view[e++], o |= (127 & a) << 21, (128 & a || this.noAssert && "undefined" == typeof a) && (a = this.view[e++], s = 127 & a, (128 & a || this.noAssert && "undefined" == typeof a) && (a = this.view[e++], s |= (127 & a) << 7, 128 & a || this.noAssert && "undefined" == typeof a)))))))))) throw Error("Buffer overrun");
                var u = t.fromBits(i | o << 28, o >>> 4 | s << 24, !1);
                return r ? (this.offset = e, u) : {
                    value: u,
                    length: e - n
                }
            }, s.readVarint64ZigZag = function(e) {
                var r = this.readVarint64(e);
                return r && r.value instanceof t ? r.value = o.zigZagDecode64(r.value) : r = o.zigZagDecode64(r), r
            }), s.writeCString = function(t, r) {
                var n = "undefined" == typeof r;
                n && (r = this.offset);
                var i, o = t.length;
                if (!this.noAssert) {
                    if ("string" != typeof t) throw TypeError("Illegal str: Not a string");
                    for (i = 0; i < o; ++i)
                        if (0 === t.charCodeAt(i)) throw RangeError("Illegal str: Contains NULL-characters");
                    if ("number" != typeof r || r % 1 !== 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
                    if (r >>>= 0, r < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength)
                }
                o = c.calculateUTF16asUTF8(e(t))[1], r += o + 1;
                var s = this.buffer.byteLength;
                return r > s && this.resize((s *= 2) > r ? s : r), r -= o + 1, c.encodeUTF16toUTF8(e(t), function(t) {
                    this.view[r++] = t
                }.bind(this)), this.view[r++] = 0, n ? (this.offset = r, this) : o
            }, s.readCString = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength)
                }
                var n, i = t,
                    o = -1;
                return c.decodeUTF8toUTF16(function() {
                    if (0 === o) return null;
                    if (t >= this.limit) throw RangeError("Illegal range: Truncated data, " + t + " < " + this.limit);
                    return o = this.view[t++], 0 === o ? null : o
                }.bind(this), n = r(), !0), e ? (this.offset = t, n()) : {
                    string: n(),
                    length: t - i
                }
            }, s.writeIString = function(t, r) {
                var n = "undefined" == typeof r;
                if (n && (r = this.offset), !this.noAssert) {
                    if ("string" != typeof t) throw TypeError("Illegal str: Not a string");
                    if ("number" != typeof r || r % 1 !== 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
                    if (r >>>= 0, r < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength)
                }
                var i, o = r;
                i = c.calculateUTF16asUTF8(e(t), this.noAssert)[1], r += 4 + i;
                var s = this.buffer.byteLength;
                if (r > s && this.resize((s *= 2) > r ? s : r), r -= 4 + i, this.littleEndian ? (this.view[r + 3] = i >>> 24 & 255, this.view[r + 2] = i >>> 16 & 255, this.view[r + 1] = i >>> 8 & 255, this.view[r] = 255 & i) : (this.view[r] = i >>> 24 & 255, this.view[r + 1] = i >>> 16 & 255, this.view[r + 2] = i >>> 8 & 255, this.view[r + 3] = 255 & i), r += 4, c.encodeUTF16toUTF8(e(t), function(t) {
                        this.view[r++] = t
                    }.bind(this)), r !== o + 4 + i) throw RangeError("Illegal range: Truncated data, " + r + " == " + (r + 4 + i));
                return n ? (this.offset = r, this) : r - o
            }, s.readIString = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 4 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+4) <= " + this.buffer.byteLength)
                }
                var r = t,
                    n = this.readUint32(t),
                    i = this.readUTF8String(n, o.METRICS_BYTES, t += 4);
                return t += i.length, e ? (this.offset = t, i.string) : {
                    string: i.string,
                    length: t - r
                }
            }, o.METRICS_CHARS = "c", o.METRICS_BYTES = "b", s.writeUTF8String = function(t, r) {
                var n = "undefined" == typeof r;
                if (n && (r = this.offset), !this.noAssert) {
                    if ("number" != typeof r || r % 1 !== 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
                    if (r >>>= 0, r < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength)
                }
                var i, o = r;
                i = c.calculateUTF16asUTF8(e(t))[1], r += i;
                var s = this.buffer.byteLength;
                return r > s && this.resize((s *= 2) > r ? s : r), r -= i, c.encodeUTF16toUTF8(e(t), function(t) {
                    this.view[r++] = t
                }.bind(this)), n ? (this.offset = r, this) : r - o
            }, s.writeString = s.writeUTF8String, o.calculateUTF8Chars = function(t) {
                return c.calculateUTF16asUTF8(e(t))[0]
            }, o.calculateUTF8Bytes = function(t) {
                return c.calculateUTF16asUTF8(e(t))[1]
            }, o.calculateString = o.calculateUTF8Bytes, s.readUTF8String = function(t, e, n) {
                "number" == typeof e && (n = e, e = void 0);
                var i = "undefined" == typeof n;
                if (i && (n = this.offset), "undefined" == typeof e && (e = o.METRICS_CHARS), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal length: " + t + " (not an integer)");
                    if (t |= 0, "number" != typeof n || n % 1 !== 0) throw TypeError("Illegal offset: " + n + " (not an integer)");
                    if (n >>>= 0, n < 0 || n + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + n + " (+0) <= " + this.buffer.byteLength)
                }
                var s, a = 0,
                    u = n;
                if (e === o.METRICS_CHARS) {
                    if (s = r(), c.decodeUTF8(function() {
                            return a < t && n < this.limit ? this.view[n++] : null
                        }.bind(this), function(t) {
                            ++a, c.UTF8toUTF16(t, s)
                        }), a !== t) throw RangeError("Illegal range: Truncated data, " + a + " == " + t);
                    return i ? (this.offset = n, s()) : {
                        string: s(),
                        length: n - u
                    }
                }
                if (e === o.METRICS_BYTES) {
                    if (!this.noAssert) {
                        if ("number" != typeof n || n % 1 !== 0) throw TypeError("Illegal offset: " + n + " (not an integer)");
                        if (n >>>= 0, n < 0 || n + t > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + n + " (+" + t + ") <= " + this.buffer.byteLength)
                    }
                    var f = n + t;
                    if (c.decodeUTF8toUTF16(function() {
                            return n < f ? this.view[n++] : null
                        }.bind(this), s = r(), this.noAssert), n !== f) throw RangeError("Illegal range: Truncated data, " + n + " == " + f);
                    return i ? (this.offset = n, s()) : {
                        string: s(),
                        length: n - u
                    }
                }
                throw TypeError("Unsupported metrics: " + e)
            }, s.readString = s.readUTF8String, s.writeVString = function(t, r) {
                var n = "undefined" == typeof r;
                if (n && (r = this.offset), !this.noAssert) {
                    if ("string" != typeof t) throw TypeError("Illegal str: Not a string");
                    if ("number" != typeof r || r % 1 !== 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
                    if (r >>>= 0, r < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength)
                }
                var i, s, a = r;
                i = c.calculateUTF16asUTF8(e(t), this.noAssert)[1], s = o.calculateVarint32(i), r += s + i;
                var u = this.buffer.byteLength;
                if (r > u && this.resize((u *= 2) > r ? u : r), r -= s + i, r += this.writeVarint32(i, r), c.encodeUTF16toUTF8(e(t), function(t) {
                        this.view[r++] = t
                    }.bind(this)), r !== a + i + s) throw RangeError("Illegal range: Truncated data, " + r + " == " + (r + i + s));
                return n ? (this.offset = r, this) : r - a
            }, s.readVString = function(t) {
                var e = "undefined" == typeof t;
                if (e && (t = this.offset), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 1 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+1) <= " + this.buffer.byteLength)
                }
                var r = t,
                    n = this.readVarint32(t),
                    i = this.readUTF8String(n.value, o.METRICS_BYTES, t += n.length);
                return t += i.length, e ? (this.offset = t, i.string) : {
                    string: i.string,
                    length: t - r
                }
            }, s.append = function(t, e, r) {
                "number" != typeof e && "string" == typeof e || (r = e, e = void 0);
                var n = "undefined" == typeof r;
                if (n && (r = this.offset), !this.noAssert) {
                    if ("number" != typeof r || r % 1 !== 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
                    if (r >>>= 0, r < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength)
                }
                t instanceof o || (t = o.wrap(t, e));
                var i = t.limit - t.offset;
                if (i <= 0) return this;
                r += i;
                var s = this.buffer.byteLength;
                return r > s && this.resize((s *= 2) > r ? s : r), r -= i, this.view.set(t.view.subarray(t.offset, t.limit), r), t.offset += i, n && (this.offset += i), this
            }, s.appendTo = function(t, e) {
                return t.append(this, e), this
            }, s.assert = function(t) {
                return this.noAssert = !t, this
            }, s.capacity = function() {
                return this.buffer.byteLength
            }, s.clear = function() {
                return this.offset = 0, this.limit = this.buffer.byteLength, this.markedOffset = -1, this
            }, s.clone = function(t) {
                var e = new o(0, this.littleEndian, this.noAssert);
                return t ? (e.buffer = new ArrayBuffer(this.buffer.byteLength), e.view = new Uint8Array(e.buffer)) : (e.buffer = this.buffer, e.view = this.view), e.offset = this.offset, e.markedOffset = this.markedOffset, e.limit = this.limit, e
            }, s.compact = function(t, e) {
                if ("undefined" == typeof t && (t = this.offset), "undefined" == typeof e && (e = this.limit), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
                    if (t >>>= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal end: Not an integer");
                    if (e >>>= 0, t < 0 || t > e || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength)
                }
                if (0 === t && e === this.buffer.byteLength) return this;
                var r = e - t;
                if (0 === r) return this.buffer = a, this.view = null, this.markedOffset >= 0 && (this.markedOffset -= t), this.offset = 0, this.limit = 0, this;
                var n = new ArrayBuffer(r),
                    i = new Uint8Array(n);
                return i.set(this.view.subarray(t, e)), this.buffer = n, this.view = i, this.markedOffset >= 0 && (this.markedOffset -= t), this.offset = 0, this.limit = r, this
            }, s.copy = function(t, e) {
                if ("undefined" == typeof t && (t = this.offset), "undefined" == typeof e && (e = this.limit), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
                    if (t >>>= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal end: Not an integer");
                    if (e >>>= 0, t < 0 || t > e || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength)
                }
                if (t === e) return new o(0, this.littleEndian, this.noAssert);
                var r = e - t,
                    n = new o(r, this.littleEndian, this.noAssert);
                return n.offset = 0, n.limit = r, n.markedOffset >= 0 && (n.markedOffset -= t), this.copyTo(n, 0, t, e), n
            }, s.copyTo = function(t, e, r, n) {
                var i, s;
                if (!this.noAssert && !o.isByteBuffer(t)) throw TypeError("Illegal target: Not a ByteBuffer");
                if (e = (s = "undefined" == typeof e) ? t.offset : 0 | e, r = (i = "undefined" == typeof r) ? this.offset : 0 | r, n = "undefined" == typeof n ? this.limit : 0 | n, e < 0 || e > t.buffer.byteLength) throw RangeError("Illegal target range: 0 <= " + e + " <= " + t.buffer.byteLength);
                if (r < 0 || n > this.buffer.byteLength) throw RangeError("Illegal source range: 0 <= " + r + " <= " + this.buffer.byteLength);
                var a = n - r;
                return 0 === a ? t : (t.ensureCapacity(e + a), t.view.set(this.view.subarray(r, n), e), i && (this.offset += a), s && (t.offset += a), this)
            }, s.ensureCapacity = function(t) {
                var e = this.buffer.byteLength;
                return e < t ? this.resize((e *= 2) > t ? e : t) : this
            }, s.fill = function(t, e, r) {
                var n = "undefined" == typeof e;
                if (n && (e = this.offset), "string" == typeof t && t.length > 0 && (t = t.charCodeAt(0)), "undefined" == typeof e && (e = this.offset), "undefined" == typeof r && (r = this.limit), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal value: " + t + " (not an integer)");
                    if (t |= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
                    if (e >>>= 0, "number" != typeof r || r % 1 !== 0) throw TypeError("Illegal end: Not an integer");
                    if (r >>>= 0, e < 0 || e > r || r > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + e + " <= " + r + " <= " + this.buffer.byteLength)
                }
                if (e >= r) return this;
                for (; e < r;) this.view[e++] = t;
                return n && (this.offset = e), this
            }, s.flip = function() {
                return this.limit = this.offset, this.offset = 0, this
            }, s.mark = function(t) {
                if (t = "undefined" == typeof t ? this.offset : t, !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal offset: " + t + " (not an integer)");
                    if (t >>>= 0, t < 0 || t + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + t + " (+0) <= " + this.buffer.byteLength)
                }
                return this.markedOffset = t, this
            }, s.order = function(t) {
                if (!this.noAssert && "boolean" != typeof t) throw TypeError("Illegal littleEndian: Not a boolean");
                return this.littleEndian = !!t, this
            }, s.LE = function(t) {
                return this.littleEndian = "undefined" == typeof t || !!t, this
            }, s.BE = function(t) {
                return this.littleEndian = "undefined" != typeof t && !t, this
            }, s.prepend = function(t, e, r) {
                "number" != typeof e && "string" == typeof e || (r = e, e = void 0);
                var n = "undefined" == typeof r;
                if (n && (r = this.offset), !this.noAssert) {
                    if ("number" != typeof r || r % 1 !== 0) throw TypeError("Illegal offset: " + r + " (not an integer)");
                    if (r >>>= 0, r < 0 || r + 0 > this.buffer.byteLength) throw RangeError("Illegal offset: 0 <= " + r + " (+0) <= " + this.buffer.byteLength)
                }
                t instanceof o || (t = o.wrap(t, e));
                var i = t.limit - t.offset;
                if (i <= 0) return this;
                var s = i - r;
                if (s > 0) {
                    var a = new ArrayBuffer(this.buffer.byteLength + s),
                        u = new Uint8Array(a);
                    u.set(this.view.subarray(r, this.buffer.byteLength), i), this.buffer = a, this.view = u, this.offset += s, this.markedOffset >= 0 && (this.markedOffset += s), this.limit += s, r += s
                } else {
                    new Uint8Array(this.buffer)
                }
                return this.view.set(t.view.subarray(t.offset, t.limit), r - i), t.offset = t.limit, n && (this.offset -= i), this
            }, s.prependTo = function(t, e) {
                return t.prepend(this, e), this
            }, s.printDebug = function(t) {
                "function" != typeof t && (t = console.log.bind(console)), t(this.toString() + "\n-------------------------------------------------------------------\n" + this.toDebug(!0))
            }, s.remaining = function() {
                return this.limit - this.offset
            }, s.reset = function() {
                return this.markedOffset >= 0 ? (this.offset = this.markedOffset, this.markedOffset = -1) : this.offset = 0, this
            }, s.resize = function(t) {
                if (!this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal capacity: " + t + " (not an integer)");
                    if (t |= 0, t < 0) throw RangeError("Illegal capacity: 0 <= " + t)
                }
                if (this.buffer.byteLength < t) {
                    var e = new ArrayBuffer(t),
                        r = new Uint8Array(e);
                    r.set(this.view), this.buffer = e, this.view = r
                }
                return this
            }, s.reverse = function(t, e) {
                if ("undefined" == typeof t && (t = this.offset), "undefined" == typeof e && (e = this.limit), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
                    if (t >>>= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal end: Not an integer");
                    if (e >>>= 0, t < 0 || t > e || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength)
                }
                return t === e ? this : (Array.prototype.reverse.call(this.view.subarray(t, e)), this)
            }, s.skip = function(t) {
                if (!this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal length: " + t + " (not an integer)");
                    t |= 0
                }
                var e = this.offset + t;
                if (!this.noAssert && (e < 0 || e > this.buffer.byteLength)) throw RangeError("Illegal length: 0 <= " + this.offset + " + " + t + " <= " + this.buffer.byteLength);
                return this.offset = e, this
            }, s.slice = function(t, e) {
                if ("undefined" == typeof t && (t = this.offset), "undefined" == typeof e && (e = this.limit), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
                    if (t >>>= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal end: Not an integer");
                    if (e >>>= 0, t < 0 || t > e || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength)
                }
                var r = this.clone();
                return r.offset = t, r.limit = e, r
            }, s.toBuffer = function(t) {
                var e = this.offset,
                    r = this.limit;
                if (!this.noAssert) {
                    if ("number" != typeof e || e % 1 !== 0) throw TypeError("Illegal offset: Not an integer");
                    if (e >>>= 0, "number" != typeof r || r % 1 !== 0) throw TypeError("Illegal limit: Not an integer");
                    if (r >>>= 0, e < 0 || e > r || r > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + e + " <= " + r + " <= " + this.buffer.byteLength)
                }
                if (!t && 0 === e && r === this.buffer.byteLength) return this.buffer;
                if (e === r) return a;
                var n = new ArrayBuffer(r - e);
                return new Uint8Array(n).set(new Uint8Array(this.buffer).subarray(e, r), 0), n
            }, s.toArrayBuffer = s.toBuffer, s.toString = function(t, e, r) {
                if ("undefined" == typeof t) return "ByteBufferAB(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",limit=" + this.limit + ",capacity=" + this.capacity() + ")";
                switch ("number" == typeof t && (t = "utf8", e = t, r = e), t) {
                    case "utf8":
                        return this.toUTF8(e, r);
                    case "base64":
                        return this.toBase64(e, r);
                    case "hex":
                        return this.toHex(e, r);
                    case "binary":
                        return this.toBinary(e, r);
                    case "debug":
                        return this.toDebug();
                    case "columns":
                        return this.toColumns();
                    default:
                        throw Error("Unsupported encoding: " + t)
                }
            };
            var f = function() {
                for (var t = {}, e = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47], r = [], n = 0, i = e.length; n < i; ++n) r[e[n]] = n;
                return t.encode = function(t, r) {
                    for (var n, i; null !== (n = t());) r(e[n >> 2 & 63]), i = (3 & n) << 4, null !== (n = t()) ? (i |= n >> 4 & 15, r(e[63 & (i | n >> 4 & 15)]), i = (15 & n) << 2, null !== (n = t()) ? (r(e[63 & (i | n >> 6 & 3)]), r(e[63 & n])) : (r(e[63 & i]), r(61))) : (r(e[63 & i]), r(61), r(61))
                }, t.decode = function(t, e) {
                    function n(t) {
                        throw Error("Illegal character code: " + t)
                    }
                    for (var i, o, s; null !== (i = t());)
                        if (o = r[i], "undefined" == typeof o && n(i), null !== (i = t()) && (s = r[i], "undefined" == typeof s && n(i), e(o << 2 >>> 0 | (48 & s) >> 4), null !== (i = t()))) {
                            if (o = r[i], "undefined" == typeof o) {
                                if (61 === i) break;
                                n(i)
                            }
                            if (e((15 & s) << 4 >>> 0 | (60 & o) >> 2), null !== (i = t())) {
                                if (s = r[i], "undefined" == typeof s) {
                                    if (61 === i) break;
                                    n(i)
                                }
                                e((3 & o) << 6 >>> 0 | s)
                            }
                        }
                }, t.test = function(t) {
                    return /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(t)
                }, t
            }();
            s.toBase64 = function(t, e) {
                if ("undefined" == typeof t && (t = this.offset), "undefined" == typeof e && (e = this.limit), t |= 0, e |= 0, t < 0 || e > this.capacity || t > e) throw RangeError("begin, end");
                var n;
                return f.encode(function() {
                    return t < e ? this.view[t++] : null
                }.bind(this), n = r()), n()
            }, o.fromBase64 = function(t, r) {
                if ("string" != typeof t) throw TypeError("str");
                var n = new o(t.length / 4 * 3, r),
                    i = 0;
                return f.decode(e(t), function(t) {
                    n.view[i++] = t
                }), n.limit = i, n
            }, o.btoa = function(t) {
                return o.fromBinary(t).toBase64()
            }, o.atob = function(t) {
                return o.fromBase64(t).toBinary()
            }, s.toBinary = function(t, e) {
                if ("undefined" == typeof t && (t = this.offset), "undefined" == typeof e && (e = this.limit), t |= 0, e |= 0, t < 0 || e > this.capacity() || t > e) throw RangeError("begin, end");
                if (t === e) return "";
                for (var r = [], n = []; t < e;) r.push(this.view[t++]), r.length >= 1024 && (n.push(String.fromCharCode.apply(String, r)), r = []);
                return n.join("") + String.fromCharCode.apply(String, r)
            }, o.fromBinary = function(t, e) {
                if ("string" != typeof t) throw TypeError("str");
                for (var r, n = 0, i = t.length, s = new o(i, e); n < i;) {
                    if (r = t.charCodeAt(n), r > 255) throw RangeError("illegal char code: " + r);
                    s.view[n++] = r
                }
                return s.limit = i, s
            }, s.toDebug = function(t) {
                for (var e, r = -1, n = this.buffer.byteLength, i = "", o = "", s = ""; r < n;) {
                    if (r !== -1 && (e = this.view[r], i += e < 16 ? "0" + e.toString(16).toUpperCase() : e.toString(16).toUpperCase(), t && (o += e > 32 && e < 127 ? String.fromCharCode(e) : ".")), ++r, t && r > 0 && r % 16 === 0 && r !== n) {
                        for (; i.length < 51;) i += " ";
                        s += i + o + "\n", i = o = ""
                    }
                    i += r === this.offset && r === this.limit ? r === this.markedOffset ? "!" : "|" : r === this.offset ? r === this.markedOffset ? "[" : "<" : r === this.limit ? r === this.markedOffset ? "]" : ">" : r === this.markedOffset ? "'" : t || 0 !== r && r !== n ? " " : ""
                }
                if (t && " " !== i) {
                    for (; i.length < 51;) i += " ";
                    s += i + o + "\n"
                }
                return t ? s : i
            }, o.fromDebug = function(t, e, r) {
                for (var n, i, s = t.length, a = new o((s + 1) / 3 | 0, e, r), u = 0, f = 0, c = !1, h = !1, l = !1, p = !1, d = !1; u < s;) {
                    switch (n = t.charAt(u++)) {
                        case "!":
                            if (!r) {
                                if (h || l || p) {
                                    d = !0;
                                    break
                                }
                                h = l = p = !0
                            }
                            a.offset = a.markedOffset = a.limit = f, c = !1;
                            break;
                        case "|":
                            if (!r) {
                                if (h || p) {
                                    d = !0;
                                    break
                                }
                                h = p = !0
                            }
                            a.offset = a.limit = f, c = !1;
                            break;
                        case "[":
                            if (!r) {
                                if (h || l) {
                                    d = !0;
                                    break
                                }
                                h = l = !0
                            }
                            a.offset = a.markedOffset = f, c = !1;
                            break;
                        case "<":
                            if (!r) {
                                if (h) {
                                    d = !0;
                                    break
                                }
                                h = !0
                            }
                            a.offset = f, c = !1;
                            break;
                        case "]":
                            if (!r) {
                                if (p || l) {
                                    d = !0;
                                    break
                                }
                                p = l = !0
                            }
                            a.limit = a.markedOffset = f, c = !1;
                            break;
                        case ">":
                            if (!r) {
                                if (p) {
                                    d = !0;
                                    break
                                }
                                p = !0
                            }
                            a.limit = f, c = !1;
                            break;
                        case "'":
                            if (!r) {
                                if (l) {
                                    d = !0;
                                    break
                                }
                                l = !0
                            }
                            a.markedOffset = f, c = !1;
                            break;
                        case " ":
                            c = !1;
                            break;
                        default:
                            if (!r && c) {
                                d = !0;
                                break
                            }
                            if (i = parseInt(n + t.charAt(u++), 16), !r && (isNaN(i) || i < 0 || i > 255)) throw TypeError("Illegal str: Not a debug encoded string");
                            a.view[f++] = i, c = !0
                    }
                    if (d) throw TypeError("Illegal str: Invalid symbol at " + u)
                }
                if (!r) {
                    if (!h || !p) throw TypeError("Illegal str: Missing offset or limit");
                    if (f < a.buffer.byteLength) throw TypeError("Illegal str: Not a debug encoded string (is it hex?) " + f + " < " + s)
                }
                return a
            }, s.toHex = function(t, e) {
                if (t = "undefined" == typeof t ? this.offset : t, e = "undefined" == typeof e ? this.limit : e, !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
                    if (t >>>= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal end: Not an integer");
                    if (e >>>= 0, t < 0 || t > e || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength)
                }
                for (var r, n = new Array(e - t); t < e;) r = this.view[t++], r < 16 ? n.push("0", r.toString(16)) : n.push(r.toString(16));
                return n.join("")
            }, o.fromHex = function(t, e, r) {
                if (!r) {
                    if ("string" != typeof t) throw TypeError("Illegal str: Not a string");
                    if (t.length % 2 !== 0) throw TypeError("Illegal str: Length not a multiple of 2")
                }
                for (var n, i = t.length, s = new o(i / 2 | 0, e), a = 0, u = 0; a < i; a += 2) {
                    if (n = parseInt(t.substring(a, a + 2), 16), !r && (!isFinite(n) || n < 0 || n > 255)) throw TypeError("Illegal str: Contains non-hex characters");
                    s.view[u++] = n
                }
                return s.limit = u, s
            };
            var c = function() {
                var t = {};
                return t.MAX_CODEPOINT = 1114111, t.encodeUTF8 = function(t, e) {
                    var r = null;
                    for ("number" == typeof t && (r = t, t = function() {
                            return null
                        }); null !== r || null !== (r = t());) r < 128 ? e(127 & r) : r < 2048 ? (e(r >> 6 & 31 | 192), e(63 & r | 128)) : r < 65536 ? (e(r >> 12 & 15 | 224), e(r >> 6 & 63 | 128), e(63 & r | 128)) : (e(r >> 18 & 7 | 240), e(r >> 12 & 63 | 128), e(r >> 6 & 63 | 128), e(63 & r | 128)), r = null
                }, t.decodeUTF8 = function(t, e) {
                    for (var r, n, i, o, s = function(t) {
                            t = t.slice(0, t.indexOf(null));
                            var e = Error(t.toString());
                            throw e.name = "TruncatedError", e.bytes = t, e
                        }; null !== (r = t());)
                        if (0 === (128 & r)) e(r);
                        else if (192 === (224 & r)) null === (n = t()) && s([r, n]), e((31 & r) << 6 | 63 & n);
                    else if (224 === (240 & r))(null === (n = t()) || null === (i = t())) && s([r, n, i]), e((15 & r) << 12 | (63 & n) << 6 | 63 & i);
                    else {
                        if (240 !== (248 & r)) throw RangeError("Illegal starting byte: " + r);
                        (null === (n = t()) || null === (i = t()) || null === (o = t())) && s([r, n, i, o]), e((7 & r) << 18 | (63 & n) << 12 | (63 & i) << 6 | 63 & o)
                    }
                }, t.UTF16toUTF8 = function(t, e) {
                    for (var r, n = null;;) {
                        if (null === (r = null !== n ? n : t())) break;
                        r >= 55296 && r <= 57343 && null !== (n = t()) && n >= 56320 && n <= 57343 ? (e(1024 * (r - 55296) + n - 56320 + 65536), n = null) : e(r)
                    }
                    null !== n && e(n)
                }, t.UTF8toUTF16 = function(t, e) {
                    var r = null;
                    for ("number" == typeof t && (r = t, t = function() {
                            return null
                        }); null !== r || null !== (r = t());) r <= 65535 ? e(r) : (r -= 65536, e((r >> 10) + 55296), e(r % 1024 + 56320)), r = null
                }, t.encodeUTF16toUTF8 = function(e, r) {
                    t.UTF16toUTF8(e, function(e) {
                        t.encodeUTF8(e, r)
                    })
                }, t.decodeUTF8toUTF16 = function(e, r) {
                    t.decodeUTF8(e, function(e) {
                        t.UTF8toUTF16(e, r)
                    })
                }, t.calculateCodePoint = function(t) {
                    return t < 128 ? 1 : t < 2048 ? 2 : t < 65536 ? 3 : 4
                }, t.calculateUTF8 = function(t) {
                    for (var e, r = 0; null !== (e = t());) r += e < 128 ? 1 : e < 2048 ? 2 : e < 65536 ? 3 : 4;
                    return r
                }, t.calculateUTF16asUTF8 = function(e) {
                    var r = 0,
                        n = 0;
                    return t.UTF16toUTF8(e, function(t) {
                        ++r, n += t < 128 ? 1 : t < 2048 ? 2 : t < 65536 ? 3 : 4
                    }), [r, n]
                }, t
            }();
            return s.toUTF8 = function(t, e) {
                if ("undefined" == typeof t && (t = this.offset), "undefined" == typeof e && (e = this.limit), !this.noAssert) {
                    if ("number" != typeof t || t % 1 !== 0) throw TypeError("Illegal begin: Not an integer");
                    if (t >>>= 0, "number" != typeof e || e % 1 !== 0) throw TypeError("Illegal end: Not an integer");
                    if (e >>>= 0, t < 0 || t > e || e > this.buffer.byteLength) throw RangeError("Illegal range: 0 <= " + t + " <= " + e + " <= " + this.buffer.byteLength)
                }
                var n;
                try {
                    c.decodeUTF8toUTF16(function() {
                        return t < e ? this.view[t++] : null
                    }.bind(this), n = r())
                } catch (r) {
                    if (t !== e) throw RangeError("Illegal range: Truncated data, " + t + " != " + e)
                }
                return n()
            }, o.fromUTF8 = function(t, r, n) {
                if (!n && "string" != typeof t) throw TypeError("Illegal str: Not a string");
                var i = new o(c.calculateUTF16asUTF8(e(t), !0)[1], r, n),
                    s = 0;
                return c.encodeUTF16toUTF8(e(t), function(t) {
                    i.view[s++] = t
                }), i.limit = s, i
            }, o
        })
    }).call(e, r(64)(t))
}, function(t, e) {
    t.exports = function() {
        throw new Error("define cannot be used indirect")
    }
}, function(t, e, r) {
    var n, i, o;
    (function(t) {
        ! function(s, a) {
            r(177).amd ? (i = [], n = a, o = "function" == typeof n ? n.apply(e, i) : n, !(void 0 !== o && (t.exports = o))) : "object" == typeof t && t && t.exports ? t.exports = a() : (s.dcodeIO = s.dcodeIO || {}).Long = a()
        }(this, function() {
            "use strict";

            function t(t, e, r) {
                this.low = 0 | t, this.high = 0 | e, this.unsigned = !!r
            }

            function e(t) {
                return (t && t.__isLong__) === !0
            }

            function r(t, e) {
                var r, n, o;
                return e ? (t >>>= 0, (o = 0 <= t && t < 256) && (n = u[t]) ? n : (r = i(t, (0 | t) < 0 ? -1 : 0, !0), o && (u[t] = r), r)) : (t |= 0, (o = -128 <= t && t < 128) && (n = a[t]) ? n : (r = i(t, t < 0 ? -1 : 0, !1), o && (a[t] = r), r))
            }

            function n(t, e) {
                if (isNaN(t) || !isFinite(t)) return e ? y : v;
                if (e) {
                    if (t < 0) return y;
                    if (t >= l) return w
                } else {
                    if (t <= -p) return E;
                    if (t + 1 >= p) return b
                }
                return t < 0 ? n(-t, e).neg() : i(t % h | 0, t / h | 0, e)
            }

            function i(e, r, n) {
                return new t(e, r, n)
            }

            function o(t, e, r) {
                if (0 === t.length) throw Error("empty string");
                if ("NaN" === t || "Infinity" === t || "+Infinity" === t || "-Infinity" === t) return v;
                if ("number" == typeof e ? (r = e, e = !1) : e = !!e, r = r || 10, r < 2 || 36 < r) throw RangeError("radix");
                var i;
                if ((i = t.indexOf("-")) > 0) throw Error("interior hyphen");
                if (0 === i) return o(t.substring(1), e, r).neg();
                for (var s = n(f(r, 8)), a = v, u = 0; u < t.length; u += 8) {
                    var c = Math.min(8, t.length - u),
                        h = parseInt(t.substring(u, u + c), r);
                    if (c < 8) {
                        var l = n(f(r, c));
                        a = a.mul(l).add(n(h))
                    } else a = a.mul(s), a = a.add(n(h))
                }
                return a.unsigned = e, a
            }

            function s(e) {
                return e instanceof t ? e : "number" == typeof e ? n(e) : "string" == typeof e ? o(e) : i(e.low, e.high, e.unsigned)
            }
            t.prototype.__isLong__, Object.defineProperty(t.prototype, "__isLong__", {
                value: !0,
                enumerable: !1,
                configurable: !1
            }), t.isLong = e;
            var a = {},
                u = {};
            t.fromInt = r, t.fromNumber = n, t.fromBits = i;
            var f = Math.pow;
            t.fromString = o, t.fromValue = s;
            var c = 1 << 24,
                h = 4294967296,
                l = 0x10000000000000000,
                p = l / 2,
                d = r(c),
                v = r(0);
            t.ZERO = v;
            var y = r(0, !0);
            t.UZERO = y;
            var g = r(1);
            t.ONE = g;
            var _ = r(1, !0);
            t.UONE = _;
            var m = r(-1);
            t.NEG_ONE = m;
            var b = i(-1, 2147483647, !1);
            t.MAX_VALUE = b;
            var w = i(-1, -1, !0);
            t.MAX_UNSIGNED_VALUE = w;
            var E = i(0, -2147483648, !1);
            t.MIN_VALUE = E;
            var k = t.prototype;
            return k.toInt = function() {
                return this.unsigned ? this.low >>> 0 : this.low
            }, k.toNumber = function() {
                return this.unsigned ? (this.high >>> 0) * h + (this.low >>> 0) : this.high * h + (this.low >>> 0)
            }, k.toString = function(t) {
                if (t = t || 10, t < 2 || 36 < t) throw RangeError("radix");
                if (this.isZero()) return "0";
                if (this.isNegative()) {
                    if (this.eq(E)) {
                        var e = n(t),
                            r = this.div(e),
                            i = r.mul(e).sub(this);
                        return r.toString(t) + i.toInt().toString(t)
                    }
                    return "-" + this.neg().toString(t)
                }
                for (var o = n(f(t, 6), this.unsigned), s = this, a = "";;) {
                    var u = s.div(o),
                        c = s.sub(u.mul(o)).toInt() >>> 0,
                        h = c.toString(t);
                    if (s = u, s.isZero()) return h + a;
                    for (; h.length < 6;) h = "0" + h;
                    a = "" + h + a
                }
            }, k.getHighBits = function() {
                return this.high
            }, k.getHighBitsUnsigned = function() {
                return this.high >>> 0
            }, k.getLowBits = function() {
                return this.low
            }, k.getLowBitsUnsigned = function() {
                return this.low >>> 0
            }, k.getNumBitsAbs = function() {
                if (this.isNegative()) return this.eq(E) ? 64 : this.neg().getNumBitsAbs();
                for (var t = 0 != this.high ? this.high : this.low, e = 31; e > 0 && 0 == (t & 1 << e); e--);
                return 0 != this.high ? e + 33 : e + 1
            }, k.isZero = function() {
                return 0 === this.high && 0 === this.low
            }, k.isNegative = function() {
                return !this.unsigned && this.high < 0
            }, k.isPositive = function() {
                return this.unsigned || this.high >= 0
            }, k.isOdd = function() {
                return 1 === (1 & this.low)
            }, k.isEven = function() {
                return 0 === (1 & this.low)
            }, k.equals = function(t) {
                return e(t) || (t = s(t)), (this.unsigned === t.unsigned || this.high >>> 31 !== 1 || t.high >>> 31 !== 1) && (this.high === t.high && this.low === t.low)
            }, k.eq = k.equals, k.notEquals = function(t) {
                return !this.eq(t)
            }, k.neq = k.notEquals, k.lessThan = function(t) {
                return this.comp(t) < 0
            }, k.lt = k.lessThan, k.lessThanOrEqual = function(t) {
                return this.comp(t) <= 0
            }, k.lte = k.lessThanOrEqual, k.greaterThan = function(t) {
                return this.comp(t) > 0
            }, k.gt = k.greaterThan, k.greaterThanOrEqual = function(t) {
                return this.comp(t) >= 0
            }, k.gte = k.greaterThanOrEqual, k.compare = function(t) {
                if (e(t) || (t = s(t)), this.eq(t)) return 0;
                var r = this.isNegative(),
                    n = t.isNegative();
                return r && !n ? -1 : !r && n ? 1 : this.unsigned ? t.high >>> 0 > this.high >>> 0 || t.high === this.high && t.low >>> 0 > this.low >>> 0 ? -1 : 1 : this.sub(t).isNegative() ? -1 : 1
            }, k.comp = k.compare, k.negate = function() {
                return !this.unsigned && this.eq(E) ? E : this.not().add(g)
            }, k.neg = k.negate, k.add = function(t) {
                e(t) || (t = s(t));
                var r = this.high >>> 16,
                    n = 65535 & this.high,
                    o = this.low >>> 16,
                    a = 65535 & this.low,
                    u = t.high >>> 16,
                    f = 65535 & t.high,
                    c = t.low >>> 16,
                    h = 65535 & t.low,
                    l = 0,
                    p = 0,
                    d = 0,
                    v = 0;
                return v += a + h, d += v >>> 16, v &= 65535, d += o + c, p += d >>> 16, d &= 65535, p += n + f, l += p >>> 16, p &= 65535, l += r + u, l &= 65535, i(d << 16 | v, l << 16 | p, this.unsigned)
            }, k.subtract = function(t) {
                return e(t) || (t = s(t)), this.add(t.neg())
            }, k.sub = k.subtract, k.multiply = function(t) {
                if (this.isZero()) return v;
                if (e(t) || (t = s(t)), t.isZero()) return v;
                if (this.eq(E)) return t.isOdd() ? E : v;
                if (t.eq(E)) return this.isOdd() ? E : v;
                if (this.isNegative()) return t.isNegative() ? this.neg().mul(t.neg()) : this.neg().mul(t).neg();
                if (t.isNegative()) return this.mul(t.neg()).neg();
                if (this.lt(d) && t.lt(d)) return n(this.toNumber() * t.toNumber(), this.unsigned);
                var r = this.high >>> 16,
                    o = 65535 & this.high,
                    a = this.low >>> 16,
                    u = 65535 & this.low,
                    f = t.high >>> 16,
                    c = 65535 & t.high,
                    h = t.low >>> 16,
                    l = 65535 & t.low,
                    p = 0,
                    y = 0,
                    g = 0,
                    _ = 0;
                return _ += u * l, g += _ >>> 16, _ &= 65535, g += a * l, y += g >>> 16, g &= 65535, g += u * h, y += g >>> 16, g &= 65535, y += o * l, p += y >>> 16, y &= 65535, y += a * h, p += y >>> 16, y &= 65535, y += u * c, p += y >>> 16, y &= 65535, p += r * l + o * h + a * c + u * f, p &= 65535, i(g << 16 | _, p << 16 | y, this.unsigned)
            }, k.mul = k.multiply, k.divide = function(t) {
                if (e(t) || (t = s(t)), t.isZero()) throw Error("division by zero");
                if (this.isZero()) return this.unsigned ? y : v;
                var r, i, o;
                if (this.unsigned) {
                    if (t.unsigned || (t = t.toUnsigned()), t.gt(this)) return y;
                    if (t.gt(this.shru(1))) return _;
                    o = y
                } else {
                    if (this.eq(E)) {
                        if (t.eq(g) || t.eq(m)) return E;
                        if (t.eq(E)) return g;
                        var a = this.shr(1);
                        return r = a.div(t).shl(1), r.eq(v) ? t.isNegative() ? g : m : (i = this.sub(t.mul(r)), o = r.add(i.div(t)))
                    }
                    if (t.eq(E)) return this.unsigned ? y : v;
                    if (this.isNegative()) return t.isNegative() ? this.neg().div(t.neg()) : this.neg().div(t).neg();
                    if (t.isNegative()) return this.div(t.neg()).neg();
                    o = v
                }
                for (i = this; i.gte(t);) {
                    r = Math.max(1, Math.floor(i.toNumber() / t.toNumber()));
                    for (var u = Math.ceil(Math.log(r) / Math.LN2), c = u <= 48 ? 1 : f(2, u - 48), h = n(r), l = h.mul(t); l.isNegative() || l.gt(i);) r -= c, h = n(r, this.unsigned), l = h.mul(t);
                    h.isZero() && (h = g), o = o.add(h), i = i.sub(l)
                }
                return o
            }, k.div = k.divide, k.modulo = function(t) {
                return e(t) || (t = s(t)), this.sub(this.div(t).mul(t))
            }, k.mod = k.modulo, k.not = function() {
                return i(~this.low, ~this.high, this.unsigned)
            }, k.and = function(t) {
                return e(t) || (t = s(t)), i(this.low & t.low, this.high & t.high, this.unsigned)
            }, k.or = function(t) {
                return e(t) || (t = s(t)), i(this.low | t.low, this.high | t.high, this.unsigned)
            }, k.xor = function(t) {
                return e(t) || (t = s(t)), i(this.low ^ t.low, this.high ^ t.high, this.unsigned)
            }, k.shiftLeft = function(t) {
                return e(t) && (t = t.toInt()), 0 === (t &= 63) ? this : t < 32 ? i(this.low << t, this.high << t | this.low >>> 32 - t, this.unsigned) : i(0, this.low << t - 32, this.unsigned)
            }, k.shl = k.shiftLeft, k.shiftRight = function(t) {
                return e(t) && (t = t.toInt()), 0 === (t &= 63) ? this : t < 32 ? i(this.low >>> t | this.high << 32 - t, this.high >> t, this.unsigned) : i(this.high >> t - 32, this.high >= 0 ? 0 : -1, this.unsigned)
            }, k.shr = k.shiftRight, k.shiftRightUnsigned = function(t) {
                if (e(t) && (t = t.toInt()), t &= 63, 0 === t) return this;
                var r = this.high;
                if (t < 32) {
                    var n = this.low;
                    return i(n >>> t | r << 32 - t, r >>> t, this.unsigned)
                }
                return 32 === t ? i(r, 0, this.unsigned) : i(r >>> t - 32, 0, this.unsigned)
            }, k.shru = k.shiftRightUnsigned, k.toSigned = function() {
                return this.unsigned ? i(this.low, this.high, !1) : this
            }, k.toUnsigned = function() {
                return this.unsigned ? this : i(this.low, this.high, !0)
            }, k.toBytes = function(t) {
                return t ? this.toBytesLE() : this.toBytesBE()
            }, k.toBytesLE = function() {
                var t = this.high,
                    e = this.low;
                return [255 & e, e >>> 8 & 255, e >>> 16 & 255, e >>> 24 & 255, 255 & t, t >>> 8 & 255, t >>> 16 & 255, t >>> 24 & 255]
            }, k.toBytesBE = function() {
                var t = this.high,
                    e = this.low;
                return [t >>> 24 & 255, t >>> 16 & 255, t >>> 8 & 255, 255 & t, e >>> 24 & 255, e >>> 16 & 255, e >>> 8 & 255, 255 & e]
            }, t
        })
    }).call(e, r(64)(t))
}, function(t, e, r) {
    function n() {
        return Object.keys(s)
    }
    var i = r(180),
        o = r(198),
        s = r(190);
    e.createCipher = e.Cipher = i.createCipher, e.createCipheriv = e.Cipheriv = i.createCipheriv, e.createDecipher = e.Decipher = o.createDecipher, e.createDecipheriv = e.Decipheriv = o.createDecipheriv, e.listCiphers = e.getCiphers = n
}, function(t, e, r) {
    function n(t, e, r) {
        h.call(this), this._cache = new i, this._cipher = new l.AES(e), this._prev = f.from(r), this._mode = t, this._autopadding = !0
    }

    function i() {
        this.cache = f.allocUnsafe(0)
    }

    function o(t, e, r) {
        var i = a[t.toLowerCase()];
        if (!i) throw new TypeError("invalid suite type");
        if ("string" == typeof e && (e = f.from(e)), e.length !== i.key / 8) throw new TypeError("invalid key length " + e.length);
        if ("string" == typeof r && (r = f.from(r)), r.length !== i.iv) throw new TypeError("invalid iv length " + r.length);
        return "stream" === i.type ? new c(i.module, e, r) : "auth" === i.type ? new u(i.module, e, r) : new n(i.module, e, r)
    }

    function s(t, e) {
        var r = a[t.toLowerCase()];
        if (!r) throw new TypeError("invalid suite type");
        var n = p(e, !1, r.key, r.iv);
        return o(t, n.key, n.iv)
    }
    var a = r(181),
        u = r(191),
        f = r(143).Buffer,
        c = r(194),
        h = r(167),
        l = r(192),
        p = r(195),
        d = r(133);
    d(n, h), n.prototype._update = function(t) {
        this._cache.add(t);
        for (var e, r, n = []; e = this._cache.get();) r = this._mode.encrypt(this, e), n.push(r);
        return f.concat(n)
    };
    var v = f.alloc(16, 16);
    n.prototype._final = function() {
        var t = this._cache.flush();
        if (this._autopadding) return t = this._mode.encrypt(this, t), this._cipher.scrub(), t;
        if (!t.equals(v)) throw this._cipher.scrub(), new Error("data not multiple of block length")
    }, n.prototype.setAutoPadding = function(t) {
        return this._autopadding = !!t, this
    }, i.prototype.add = function(t) {
        this.cache = f.concat([this.cache, t])
    }, i.prototype.get = function() {
        if (this.cache.length > 15) {
            var t = this.cache.slice(0, 16);
            return this.cache = this.cache.slice(16), t
        }
        return null
    }, i.prototype.flush = function() {
        for (var t = 16 - this.cache.length, e = f.allocUnsafe(t), r = -1; ++r < t;) e.writeUInt8(t, r);
        return f.concat([this.cache, e])
    }, e.createCipheriv = o, e.createCipher = s
}, function(t, e, r) {
    var n = {
            ECB: r(182),
            CBC: r(183),
            CFB: r(185),
            CFB8: r(186),
            CFB1: r(187),
            OFB: r(188),
            CTR: r(189),
            GCM: r(189)
        },
        i = r(190);
    for (var o in i) i[o].module = n[i[o].mode];
    t.exports = i
}, function(t, e) {
    e.encrypt = function(t, e) {
        return t._cipher.encryptBlock(e)
    }, e.decrypt = function(t, e) {
        return t._cipher.decryptBlock(e)
    }
}, function(t, e, r) {
    var n = r(184);
    e.encrypt = function(t, e) {
        var r = n(e, t._prev);
        return t._prev = t._cipher.encryptBlock(r), t._prev
    }, e.decrypt = function(t, e) {
        var r = t._prev;
        t._prev = e;
        var i = t._cipher.decryptBlock(e);
        return n(i, r)
    }
}, function(t, e, r) {
    (function(e) {
        t.exports = function(t, r) {
            for (var n = Math.min(t.length, r.length), i = new e(n), o = 0; o < n; ++o) i[o] = t[o] ^ r[o];
            return i
        }
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    function n(t, e, r) {
        var n = e.length,
            s = o(e, t._cache);
        return t._cache = t._cache.slice(n), t._prev = i.concat([t._prev, r ? e : s]), s
    }
    var i = r(143).Buffer,
        o = r(184);
    e.encrypt = function(t, e, r) {
        for (var o, s = i.allocUnsafe(0); e.length;) {
            if (0 === t._cache.length && (t._cache = t._cipher.encryptBlock(t._prev), t._prev = i.allocUnsafe(0)), !(t._cache.length <= e.length)) {
                s = i.concat([s, n(t, e, r)]);
                break
            }
            o = t._cache.length, s = i.concat([s, n(t, e.slice(0, o), r)]), e = e.slice(o)
        }
        return s
    }
}, function(t, e, r) {
    (function(t) {
        function r(e, r, n) {
            var i = e._cipher.encryptBlock(e._prev),
                o = i[0] ^ r;
            return e._prev = t.concat([e._prev.slice(1), t.from([n ? r : o])]), o
        }
        e.encrypt = function(e, n, i) {
            for (var o = n.length, s = t.allocUnsafe(o), a = -1; ++a < o;) s[a] = r(e, n[a], i);
            return s
        }
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    function n(t, e, r) {
        for (var n, o, s, a = -1, u = 8, f = 0; ++a < u;) n = t._cipher.encryptBlock(t._prev), o = e & 1 << 7 - a ? 128 : 0, s = n[0] ^ o, f += (128 & s) >> a % 8, t._prev = i(t._prev, r ? o : s);
        return f
    }

    function i(t, e) {
        var r = t.length,
            n = -1,
            i = o.allocUnsafe(t.length);
        for (t = o.concat([t, o.from([e])]); ++n < r;) i[n] = t[n] << 1 | t[n + 1] >> 7;
        return i
    }
    var o = r(143).Buffer;
    e.encrypt = function(t, e, r) {
        for (var i = e.length, s = o.allocUnsafe(i), a = -1; ++a < i;) s[a] = n(t, e[a], r);
        return s
    }
}, function(t, e, r) {
    (function(t) {
        function n(t) {
            return t._prev = t._cipher.encryptBlock(t._prev), t._prev
        }
        var i = r(184);
        e.encrypt = function(e, r) {
            for (; e._cache.length < r.length;) e._cache = t.concat([e._cache, n(e)]);
            var o = e._cache.slice(0, r.length);
            return e._cache = e._cache.slice(r.length), i(r, o)
        }
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(t) {
        function n(t) {
            for (var e, r = t.length; r--;) {
                if (e = t.readUInt8(r), 255 !== e) {
                    e++, t.writeUInt8(e, r);
                    break
                }
                t.writeUInt8(0, r)
            }
        }

        function i(t) {
            var e = t._cipher.encryptBlockRaw(t._prev);
            return n(t._prev), e
        }
        var o = r(184),
            s = 16;
        e.encrypt = function(e, r) {
            var n = Math.ceil(r.length / s),
                a = e._cache.length;
            e._cache = t.concat([e._cache, t.allocUnsafe(n * s)]);
            for (var u = 0; u < n; u++) {
                var f = i(e),
                    c = a + u * s;
                e._cache.writeUInt32BE(f[0], c + 0), e._cache.writeUInt32BE(f[1], c + 4), e._cache.writeUInt32BE(f[2], c + 8), e._cache.writeUInt32BE(f[3], c + 12)
            }
            var h = e._cache.slice(0, r.length);
            return e._cache = e._cache.slice(r.length), o(r, h)
        }
    }).call(e, r(123).Buffer)
}, function(t, e) {
    t.exports = {
        "aes-128-ecb": {
            cipher: "AES",
            key: 128,
            iv: 0,
            mode: "ECB",
            type: "block"
        },
        "aes-192-ecb": {
            cipher: "AES",
            key: 192,
            iv: 0,
            mode: "ECB",
            type: "block"
        },
        "aes-256-ecb": {
            cipher: "AES",
            key: 256,
            iv: 0,
            mode: "ECB",
            type: "block"
        },
        "aes-128-cbc": {
            cipher: "AES",
            key: 128,
            iv: 16,
            mode: "CBC",
            type: "block"
        },
        "aes-192-cbc": {
            cipher: "AES",
            key: 192,
            iv: 16,
            mode: "CBC",
            type: "block"
        },
        "aes-256-cbc": {
            cipher: "AES",
            key: 256,
            iv: 16,
            mode: "CBC",
            type: "block"
        },
        aes128: {
            cipher: "AES",
            key: 128,
            iv: 16,
            mode: "CBC",
            type: "block"
        },
        aes192: {
            cipher: "AES",
            key: 192,
            iv: 16,
            mode: "CBC",
            type: "block"
        },
        aes256: {
            cipher: "AES",
            key: 256,
            iv: 16,
            mode: "CBC",
            type: "block"
        },
        "aes-128-cfb": {
            cipher: "AES",
            key: 128,
            iv: 16,
            mode: "CFB",
            type: "stream"
        },
        "aes-192-cfb": {
            cipher: "AES",
            key: 192,
            iv: 16,
            mode: "CFB",
            type: "stream"
        },
        "aes-256-cfb": {
            cipher: "AES",
            key: 256,
            iv: 16,
            mode: "CFB",
            type: "stream"
        },
        "aes-128-cfb8": {
            cipher: "AES",
            key: 128,
            iv: 16,
            mode: "CFB8",
            type: "stream"
        },
        "aes-192-cfb8": {
            cipher: "AES",
            key: 192,
            iv: 16,
            mode: "CFB8",
            type: "stream"
        },
        "aes-256-cfb8": {
            cipher: "AES",
            key: 256,
            iv: 16,
            mode: "CFB8",
            type: "stream"
        },
        "aes-128-cfb1": {
            cipher: "AES",
            key: 128,
            iv: 16,
            mode: "CFB1",
            type: "stream"
        },
        "aes-192-cfb1": {
            cipher: "AES",
            key: 192,
            iv: 16,
            mode: "CFB1",
            type: "stream"
        },
        "aes-256-cfb1": {
            cipher: "AES",
            key: 256,
            iv: 16,
            mode: "CFB1",
            type: "stream"
        },
        "aes-128-ofb": {
            cipher: "AES",
            key: 128,
            iv: 16,
            mode: "OFB",
            type: "stream"
        },
        "aes-192-ofb": {
            cipher: "AES",
            key: 192,
            iv: 16,
            mode: "OFB",
            type: "stream"
        },
        "aes-256-ofb": {
            cipher: "AES",
            key: 256,
            iv: 16,
            mode: "OFB",
            type: "stream"
        },
        "aes-128-ctr": {
            cipher: "AES",
            key: 128,
            iv: 16,
            mode: "CTR",
            type: "stream"
        },
        "aes-192-ctr": {
            cipher: "AES",
            key: 192,
            iv: 16,
            mode: "CTR",
            type: "stream"
        },
        "aes-256-ctr": {
            cipher: "AES",
            key: 256,
            iv: 16,
            mode: "CTR",
            type: "stream"
        },
        "aes-128-gcm": {
            cipher: "AES",
            key: 128,
            iv: 12,
            mode: "GCM",
            type: "auth"
        },
        "aes-192-gcm": {
            cipher: "AES",
            key: 192,
            iv: 12,
            mode: "GCM",
            type: "auth"
        },
        "aes-256-gcm": {
            cipher: "AES",
            key: 256,
            iv: 12,
            mode: "GCM",
            type: "auth"
        }
    }
}, function(t, e, r) {
    function n(t, e) {
        var r = 0;
        t.length !== e.length && r++;
        for (var n = Math.min(t.length, e.length), i = 0; i < n; ++i) r += t[i] ^ e[i];
        return r
    }

    function i(t, e, r, n) {
        a.call(this), this._finID = s.concat([r, s.from([0, 0, 0, 1])]), r = s.concat([r, s.from([0, 0, 0, 2])]), this._cipher = new o.AES(e), this._prev = s.from(r), this._cache = s.allocUnsafe(0), this._secCache = s.allocUnsafe(0), this._decrypt = n, this._alen = 0, this._len = 0, this._mode = t;
        var i = s.alloc(4, 0);
        this._ghash = new f(this._cipher.encryptBlock(i)), this._authTag = null, this._called = !1
    }
    var o = r(192),
        s = r(143).Buffer,
        a = r(167),
        u = r(133),
        f = r(193),
        c = r(184);
    u(i, a), i.prototype._update = function(t) {
        if (!this._called && this._alen) {
            var e = 16 - this._alen % 16;
            e < 16 && (e = s.alloc(e, 0), this._ghash.update(e))
        }
        this._called = !0;
        var r = this._mode.encrypt(this, t);
        return this._decrypt ? this._ghash.update(t) : this._ghash.update(r), this._len += t.length, r
    }, i.prototype._final = function() {
        if (this._decrypt && !this._authTag) throw new Error("Unsupported state or unable to authenticate data");
        var t = c(this._ghash.final(8 * this._alen, 8 * this._len), this._cipher.encryptBlock(this._finID));
        if (this._decrypt && n(t, this._authTag)) throw new Error("Unsupported state or unable to authenticate data");
        this._authTag = t, this._cipher.scrub()
    }, i.prototype.getAuthTag = function() {
        if (this._decrypt || !s.isBuffer(this._authTag)) throw new Error("Attempting to get auth tag in unsupported state");
        return this._authTag
    }, i.prototype.setAuthTag = function(t) {
        if (!this._decrypt) throw new Error("Attempting to set auth tag in unsupported state");
        this._authTag = t
    }, i.prototype.setAAD = function(t) {
        if (this._called) throw new Error("Attempting to set AAD in unsupported state");
        this._ghash.update(t), this._alen += t.length
    }, t.exports = i
}, function(t, e, r) {
    function n(t) {
        a.isBuffer(t) || (t = a.from(t));
        for (var e = t.length / 4 | 0, r = new Array(e), n = 0; n < e; n++) r[n] = t.readUInt32BE(4 * n);
        return r
    }

    function i(t) {
        for (var e = 0; e < t.length; t++) t[e] = 0
    }

    function o(t, e, r, n, i) {
        for (var o, s, a, u, f = r[0], c = r[1], h = r[2], l = r[3], p = t[0] ^ e[0], d = t[1] ^ e[1], v = t[2] ^ e[2], y = t[3] ^ e[3], g = 4, _ = 1; _ < i; _++) o = f[p >>> 24] ^ c[d >>> 16 & 255] ^ h[v >>> 8 & 255] ^ l[255 & y] ^ e[g++], s = f[d >>> 24] ^ c[v >>> 16 & 255] ^ h[y >>> 8 & 255] ^ l[255 & p] ^ e[g++], a = f[v >>> 24] ^ c[y >>> 16 & 255] ^ h[p >>> 8 & 255] ^ l[255 & d] ^ e[g++], u = f[y >>> 24] ^ c[p >>> 16 & 255] ^ h[d >>> 8 & 255] ^ l[255 & v] ^ e[g++], p = o, d = s, v = a, y = u;
        return o = (n[p >>> 24] << 24 | n[d >>> 16 & 255] << 16 | n[v >>> 8 & 255] << 8 | n[255 & y]) ^ e[g++], s = (n[d >>> 24] << 24 | n[v >>> 16 & 255] << 16 | n[y >>> 8 & 255] << 8 | n[255 & p]) ^ e[g++], a = (n[v >>> 24] << 24 | n[y >>> 16 & 255] << 16 | n[p >>> 8 & 255] << 8 | n[255 & d]) ^ e[g++], u = (n[y >>> 24] << 24 | n[p >>> 16 & 255] << 16 | n[d >>> 8 & 255] << 8 | n[255 & v]) ^ e[g++], o >>>= 0, s >>>= 0, a >>>= 0, u >>>= 0, [o, s, a, u]
    }

    function s(t) {
        this._key = n(t), this._reset()
    }
    var a = r(143).Buffer,
        u = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
        f = function() {
            for (var t = new Array(256), e = 0; e < 256; e++) e < 128 ? t[e] = e << 1 : t[e] = e << 1 ^ 283;
            for (var r = [], n = [], i = [
                    [],
                    [],
                    [],
                    []
                ], o = [
                    [],
                    [],
                    [],
                    []
                ], s = 0, a = 0, u = 0; u < 256; ++u) {
                var f = a ^ a << 1 ^ a << 2 ^ a << 3 ^ a << 4;
                f = f >>> 8 ^ 255 & f ^ 99, r[s] = f, n[f] = s;
                var c = t[s],
                    h = t[c],
                    l = t[h],
                    p = 257 * t[f] ^ 16843008 * f;
                i[0][s] = p << 24 | p >>> 8, i[1][s] = p << 16 | p >>> 16, i[2][s] = p << 8 | p >>> 24, i[3][s] = p, p = 16843009 * l ^ 65537 * h ^ 257 * c ^ 16843008 * s, o[0][f] = p << 24 | p >>> 8, o[1][f] = p << 16 | p >>> 16, o[2][f] = p << 8 | p >>> 24, o[3][f] = p, 0 === s ? s = a = 1 : (s = c ^ t[t[t[l ^ c]]], a ^= t[t[a]])
            }
            return {
                SBOX: r,
                INV_SBOX: n,
                SUB_MIX: i,
                INV_SUB_MIX: o
            }
        }();
    s.blockSize = 16, s.keySize = 32, s.prototype.blockSize = s.blockSize, s.prototype.keySize = s.keySize,
        s.prototype._reset = function() {
            for (var t = this._key, e = t.length, r = e + 6, n = 4 * (r + 1), i = [], o = 0; o < e; o++) i[o] = t[o];
            for (o = e; o < n; o++) {
                var s = i[o - 1];
                o % e === 0 ? (s = s << 8 | s >>> 24, s = f.SBOX[s >>> 24] << 24 | f.SBOX[s >>> 16 & 255] << 16 | f.SBOX[s >>> 8 & 255] << 8 | f.SBOX[255 & s], s ^= u[o / e | 0] << 24) : e > 6 && o % e === 4 && (s = f.SBOX[s >>> 24] << 24 | f.SBOX[s >>> 16 & 255] << 16 | f.SBOX[s >>> 8 & 255] << 8 | f.SBOX[255 & s]), i[o] = i[o - e] ^ s
            }
            for (var a = [], c = 0; c < n; c++) {
                var h = n - c,
                    l = i[h - (c % 4 ? 0 : 4)];
                c < 4 || h <= 4 ? a[c] = l : a[c] = f.INV_SUB_MIX[0][f.SBOX[l >>> 24]] ^ f.INV_SUB_MIX[1][f.SBOX[l >>> 16 & 255]] ^ f.INV_SUB_MIX[2][f.SBOX[l >>> 8 & 255]] ^ f.INV_SUB_MIX[3][f.SBOX[255 & l]]
            }
            this._nRounds = r, this._keySchedule = i, this._invKeySchedule = a
        }, s.prototype.encryptBlockRaw = function(t) {
            return t = n(t), o(t, this._keySchedule, f.SUB_MIX, f.SBOX, this._nRounds)
        }, s.prototype.encryptBlock = function(t) {
            var e = this.encryptBlockRaw(t),
                r = a.allocUnsafe(16);
            return r.writeUInt32BE(e[0], 0), r.writeUInt32BE(e[1], 4), r.writeUInt32BE(e[2], 8), r.writeUInt32BE(e[3], 12), r
        }, s.prototype.decryptBlock = function(t) {
            t = n(t);
            var e = t[1];
            t[1] = t[3], t[3] = e;
            var r = o(t, this._invKeySchedule, f.INV_SUB_MIX, f.INV_SBOX, this._nRounds),
                i = a.allocUnsafe(16);
            return i.writeUInt32BE(r[0], 0), i.writeUInt32BE(r[3], 4), i.writeUInt32BE(r[2], 8), i.writeUInt32BE(r[1], 12), i
        }, s.prototype.scrub = function() {
            i(this._keySchedule), i(this._invKeySchedule), i(this._key)
        }, t.exports.AES = s
}, function(t, e, r) {
    function n(t) {
        return [t.readUInt32BE(0), t.readUInt32BE(4), t.readUInt32BE(8), t.readUInt32BE(12)]
    }

    function i(t) {
        var e = s.allocUnsafe(16);
        return e.writeUInt32BE(t[0] >>> 0, 0), e.writeUInt32BE(t[1] >>> 0, 4), e.writeUInt32BE(t[2] >>> 0, 8), e.writeUInt32BE(t[3] >>> 0, 12), e
    }

    function o(t) {
        this.h = t, this.state = s.alloc(16, 0), this.cache = s.allocUnsafe(0)
    }
    var s = r(143).Buffer,
        a = s.alloc(16, 0);
    o.prototype.ghash = function(t) {
        for (var e = -1; ++e < t.length;) this.state[e] ^= t[e];
        this._multiply()
    }, o.prototype._multiply = function() {
        for (var t, e, r, o = n(this.h), s = [0, 0, 0, 0], a = -1; ++a < 128;) {
            for (e = 0 !== (this.state[~~(a / 8)] & 1 << 7 - a % 8), e && (s[0] ^= o[0], s[1] ^= o[1], s[2] ^= o[2], s[3] ^= o[3]), r = 0 !== (1 & o[3]), t = 3; t > 0; t--) o[t] = o[t] >>> 1 | (1 & o[t - 1]) << 31;
            o[0] = o[0] >>> 1, r && (o[0] = o[0] ^ 225 << 24)
        }
        this.state = i(s)
    }, o.prototype.update = function(t) {
        this.cache = s.concat([this.cache, t]);
        for (var e; this.cache.length >= 16;) e = this.cache.slice(0, 16), this.cache = this.cache.slice(16), this.ghash(e)
    }, o.prototype.final = function(t, e) {
        return this.cache.length && this.ghash(s.concat([this.cache, a], 16)), this.ghash(i([0, t, 0, e])), this.state
    }, t.exports = o
}, function(t, e, r) {
    function n(t, e, r, n) {
        s.call(this), this._cipher = new i.AES(e), this._prev = o.from(r), this._cache = o.allocUnsafe(0), this._secCache = o.allocUnsafe(0), this._decrypt = n, this._mode = t
    }
    var i = r(192),
        o = r(143).Buffer,
        s = r(167),
        a = r(133);
    a(n, s), n.prototype._update = function(t) {
        return this._mode.encrypt(this, t, this._decrypt)
    }, n.prototype._final = function() {
        this._cipher.scrub()
    }, t.exports = n
}, function(t, e, r) {
    function n(t, e, r, n) {
        if (i.isBuffer(t) || (t = i.from(t, "binary")), e && (i.isBuffer(e) || (e = i.from(e, "binary")), 8 !== e.length)) throw new RangeError("salt should be Buffer with 8 byte length");
        for (var s = r / 8, a = i.alloc(s), u = i.alloc(n || 0), f = i.alloc(0); s > 0 || n > 0;) {
            var c = new o;
            c.update(f), c.update(t), e && c.update(e), f = c.digest();
            var h = 0;
            if (s > 0) {
                var l = a.length - s;
                h = Math.min(s, f.length), f.copy(a, l, 0, h), s -= h
            }
            if (h < f.length && n > 0) {
                var p = u.length - n,
                    d = Math.min(n, f.length - h);
                f.copy(u, p, h, h + d), n -= d
            }
        }
        return f.fill(0), {
            key: a,
            iv: u
        }
    }
    var i = r(143).Buffer,
        o = r(196);
    t.exports = n
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n() {
            c.call(this, 64), this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878
        }

        function i(t, e) {
            return t << e | t >>> 32 - e
        }

        function o(t, e, r, n, o, s, a) {
            return i(t + (e & r | ~e & n) + o + s | 0, a) + e | 0
        }

        function s(t, e, r, n, o, s, a) {
            return i(t + (e & n | r & ~n) + o + s | 0, a) + e | 0
        }

        function a(t, e, r, n, o, s, a) {
            return i(t + (e ^ r ^ n) + o + s | 0, a) + e | 0
        }

        function u(t, e, r, n, o, s, a) {
            return i(t + (r ^ (e | ~n)) + o + s | 0, a) + e | 0
        }
        var f = r(133),
            c = r(197),
            h = new Array(16);
        f(n, c), n.prototype._update = function() {
            for (var t = h, e = 0; e < 16; ++e) t[e] = this._block.readInt32LE(4 * e);
            var r = this._a,
                n = this._b,
                i = this._c,
                f = this._d;
            r = o(r, n, i, f, t[0], 3614090360, 7), f = o(f, r, n, i, t[1], 3905402710, 12), i = o(i, f, r, n, t[2], 606105819, 17), n = o(n, i, f, r, t[3], 3250441966, 22), r = o(r, n, i, f, t[4], 4118548399, 7), f = o(f, r, n, i, t[5], 1200080426, 12), i = o(i, f, r, n, t[6], 2821735955, 17), n = o(n, i, f, r, t[7], 4249261313, 22), r = o(r, n, i, f, t[8], 1770035416, 7), f = o(f, r, n, i, t[9], 2336552879, 12), i = o(i, f, r, n, t[10], 4294925233, 17), n = o(n, i, f, r, t[11], 2304563134, 22), r = o(r, n, i, f, t[12], 1804603682, 7), f = o(f, r, n, i, t[13], 4254626195, 12), i = o(i, f, r, n, t[14], 2792965006, 17), n = o(n, i, f, r, t[15], 1236535329, 22), r = s(r, n, i, f, t[1], 4129170786, 5), f = s(f, r, n, i, t[6], 3225465664, 9), i = s(i, f, r, n, t[11], 643717713, 14), n = s(n, i, f, r, t[0], 3921069994, 20), r = s(r, n, i, f, t[5], 3593408605, 5), f = s(f, r, n, i, t[10], 38016083, 9), i = s(i, f, r, n, t[15], 3634488961, 14), n = s(n, i, f, r, t[4], 3889429448, 20), r = s(r, n, i, f, t[9], 568446438, 5), f = s(f, r, n, i, t[14], 3275163606, 9), i = s(i, f, r, n, t[3], 4107603335, 14), n = s(n, i, f, r, t[8], 1163531501, 20), r = s(r, n, i, f, t[13], 2850285829, 5), f = s(f, r, n, i, t[2], 4243563512, 9), i = s(i, f, r, n, t[7], 1735328473, 14), n = s(n, i, f, r, t[12], 2368359562, 20), r = a(r, n, i, f, t[5], 4294588738, 4), f = a(f, r, n, i, t[8], 2272392833, 11), i = a(i, f, r, n, t[11], 1839030562, 16), n = a(n, i, f, r, t[14], 4259657740, 23), r = a(r, n, i, f, t[1], 2763975236, 4), f = a(f, r, n, i, t[4], 1272893353, 11), i = a(i, f, r, n, t[7], 4139469664, 16), n = a(n, i, f, r, t[10], 3200236656, 23), r = a(r, n, i, f, t[13], 681279174, 4), f = a(f, r, n, i, t[0], 3936430074, 11), i = a(i, f, r, n, t[3], 3572445317, 16), n = a(n, i, f, r, t[6], 76029189, 23), r = a(r, n, i, f, t[9], 3654602809, 4), f = a(f, r, n, i, t[12], 3873151461, 11), i = a(i, f, r, n, t[15], 530742520, 16), n = a(n, i, f, r, t[2], 3299628645, 23), r = u(r, n, i, f, t[0], 4096336452, 6), f = u(f, r, n, i, t[7], 1126891415, 10), i = u(i, f, r, n, t[14], 2878612391, 15), n = u(n, i, f, r, t[5], 4237533241, 21), r = u(r, n, i, f, t[12], 1700485571, 6), f = u(f, r, n, i, t[3], 2399980690, 10), i = u(i, f, r, n, t[10], 4293915773, 15), n = u(n, i, f, r, t[1], 2240044497, 21), r = u(r, n, i, f, t[8], 1873313359, 6), f = u(f, r, n, i, t[15], 4264355552, 10), i = u(i, f, r, n, t[6], 2734768916, 15), n = u(n, i, f, r, t[13], 1309151649, 21), r = u(r, n, i, f, t[4], 4149444226, 6), f = u(f, r, n, i, t[11], 3174756917, 10), i = u(i, f, r, n, t[2], 718787259, 15), n = u(n, i, f, r, t[9], 3951481745, 21), this._a = this._a + r | 0, this._b = this._b + n | 0, this._c = this._c + i | 0, this._d = this._d + f | 0
        }, n.prototype._digest = function() {
            this._block[this._blockOffset++] = 128, this._blockOffset > 56 && (this._block.fill(0, this._blockOffset, 64), this._update(), this._blockOffset = 0), this._block.fill(0, this._blockOffset, 56), this._block.writeUInt32LE(this._length[0], 56), this._block.writeUInt32LE(this._length[1], 60), this._update();
            var t = new e(16);
            return t.writeInt32LE(this._a, 0), t.writeInt32LE(this._b, 4), t.writeInt32LE(this._c, 8), t.writeInt32LE(this._d, 12), t
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    "use strict";

    function n(t, e) {
        if (!o.isBuffer(t) && "string" != typeof t) throw new TypeError(e + " must be a string or a buffer")
    }

    function i(t) {
        s.call(this), this._block = o.allocUnsafe(t), this._blockSize = t, this._blockOffset = 0, this._length = [0, 0, 0, 0], this._finalized = !1
    }
    var o = r(143).Buffer,
        s = r(138).Transform,
        a = r(133);
    a(i, s), i.prototype._transform = function(t, e, r) {
        var n = null;
        try {
            this.update(t, e)
        } catch (t) {
            n = t
        }
        r(n)
    }, i.prototype._flush = function(t) {
        var e = null;
        try {
            this.push(this.digest())
        } catch (t) {
            e = t
        }
        t(e)
    }, i.prototype.update = function(t, e) {
        if (n(t, "Data"), this._finalized) throw new Error("Digest already called");
        o.isBuffer(t) || (t = o.from(t, e));
        for (var r = this._block, i = 0; this._blockOffset + t.length - i >= this._blockSize;) {
            for (var s = this._blockOffset; s < this._blockSize;) r[s++] = t[i++];
            this._update(), this._blockOffset = 0
        }
        for (; i < t.length;) r[this._blockOffset++] = t[i++];
        for (var a = 0, u = 8 * t.length; u > 0; ++a) this._length[a] += u, u = this._length[a] / 4294967296 | 0, u > 0 && (this._length[a] -= 4294967296 * u);
        return this
    }, i.prototype._update = function() {
        throw new Error("_update is not implemented")
    }, i.prototype.digest = function(t) {
        if (this._finalized) throw new Error("Digest already called");
        this._finalized = !0;
        var e = this._digest();
        void 0 !== t && (e = e.toString(t)), this._block.fill(0), this._blockOffset = 0;
        for (var r = 0; r < 4; ++r) this._length[r] = 0;
        return e
    }, i.prototype._digest = function() {
        throw new Error("_digest is not implemented")
    }, t.exports = i
}, function(t, e, r) {
    function n(t, e, r) {
        l.call(this), this._cache = new i, this._last = void 0, this._cipher = new p.AES(e), this._prev = f.from(r), this._mode = t, this._autopadding = !0
    }

    function i() {
        this.cache = f.allocUnsafe(0)
    }

    function o(t) {
        for (var e = t[15], r = -1; ++r < e;)
            if (t[r + (16 - e)] !== e) throw new Error("unable to decrypt data");
        if (16 !== e) return t.slice(0, 16 - e)
    }

    function s(t, e, r) {
        var i = c[t.toLowerCase()];
        if (!i) throw new TypeError("invalid suite type");
        if ("string" == typeof r && (r = f.from(r)), r.length !== i.iv) throw new TypeError("invalid iv length " + r.length);
        if ("string" == typeof e && (e = f.from(e)), e.length !== i.key / 8) throw new TypeError("invalid key length " + e.length);
        return "stream" === i.type ? new h(i.module, e, r, !0) : "auth" === i.type ? new u(i.module, e, r, !0) : new n(i.module, e, r)
    }

    function a(t, e) {
        var r = c[t.toLowerCase()];
        if (!r) throw new TypeError("invalid suite type");
        var n = d(e, !1, r.key, r.iv);
        return s(t, n.key, n.iv)
    }
    var u = r(191),
        f = r(143).Buffer,
        c = r(181),
        h = r(194),
        l = r(167),
        p = r(192),
        d = r(195),
        v = r(133);
    v(n, l), n.prototype._update = function(t) {
        this._cache.add(t);
        for (var e, r, n = []; e = this._cache.get(this._autopadding);) r = this._mode.decrypt(this, e), n.push(r);
        return f.concat(n)
    }, n.prototype._final = function() {
        var t = this._cache.flush();
        if (this._autopadding) return o(this._mode.decrypt(this, t));
        if (t) throw new Error("data not multiple of block length")
    }, n.prototype.setAutoPadding = function(t) {
        return this._autopadding = !!t, this
    }, i.prototype.add = function(t) {
        this.cache = f.concat([this.cache, t])
    }, i.prototype.get = function(t) {
        var e;
        if (t) {
            if (this.cache.length > 16) return e = this.cache.slice(0, 16), this.cache = this.cache.slice(16), e
        } else if (this.cache.length >= 16) return e = this.cache.slice(0, 16), this.cache = this.cache.slice(16), e;
        return null
    }, i.prototype.flush = function() {
        if (this.cache.length) return this.cache
    }, e.createDecipher = a, e.createDecipheriv = s
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n(t, e) {
            if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
        }
        var i = function() {
                function t(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                    }
                }
                return function(e, r, n) {
                    return r && t(e.prototype, r), n && t(e, n), e
                }
            }(),
            o = r(200),
            s = r(204),
            a = s.getCurveByName("secp256k1");
        o = r(200);
        var u = r(171),
            f = r(131),
            c = r(42),
            h = r(127),
            l = a.G,
            p = a.n,
            d = function() {
                function t(e) {
                    n(this, t), this.Q = e
                }
                return i(t, [{
                    key: "toBuffer",
                    value: function() {
                        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.Q.compressed;
                        return this.Q.getEncoded(t)
                    }
                }, {
                    key: "toUncompressed",
                    value: function() {
                        var e = this.Q.getEncoded(!1),
                            r = s.Point.decodeFrom(a, e);
                        return t.fromPoint(r)
                    }
                }, {
                    key: "toBlockchainAddress",
                    value: function() {
                        var t = this.toBuffer(),
                            e = f.sha512(t);
                        return f.ripemd160(e)
                    }
                }, {
                    key: "toString",
                    value: function() {
                        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : c.get("address_prefix");
                        return this.toPublicKeyString(t)
                    }
                }, {
                    key: "toPublicKeyString",
                    value: function() {
                        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : c.get("address_prefix");
                        if (this.pubdata) return t + this.pubdata;
                        var r = this.toBuffer(),
                            n = f.ripemd160(r),
                            i = e.concat([r, n.slice(0, 4)]);
                        return this.pubdata = u.encode(i), t + this.pubdata
                    }
                }, {
                    key: "toAddressString",
                    value: function() {
                        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : c.get("address_prefix"),
                            r = this.toBuffer(),
                            n = f.sha512(r),
                            i = f.ripemd160(n),
                            o = f.ripemd160(i);
                        return i = e.concat([i, o.slice(0, 4)]), t + u.encode(i)
                    }
                }, {
                    key: "toPtsAddy",
                    value: function() {
                        var t = this.toBuffer(),
                            r = f.sha256(t),
                            n = f.ripemd160(r);
                        n = e.concat([new e([56]), n]);
                        var i = f.sha256(n);
                        return i = f.sha256(i), n = e.concat([n, i.slice(0, 4)]), u.encode(n)
                    }
                }, {
                    key: "child",
                    value: function(r) {
                        h(e.isBuffer(r), "Buffer required: offset"), h.equal(r.length, 32, "offset length"), r = e.concat([this.toBuffer(), r]), r = f.sha256(r);
                        var n = o.fromBuffer(r);
                        if (n.compareTo(p) >= 0) throw new Error("Child offset went out of bounds, try again");
                        var i = l.multiply(n),
                            s = this.Q.add(i);
                        if (a.isInfinity(s)) throw new Error("Child offset derived to an invalid key, try again");
                        return t.fromPoint(s)
                    }
                }, {
                    key: "toHex",
                    value: function() {
                        return this.toBuffer().toString("hex")
                    }
                }], [{
                    key: "fromBinary",
                    value: function(r) {
                        return t.fromBuffer(new e(r, "binary"))
                    }
                }, {
                    key: "fromBuffer",
                    value: function(e) {
                        return new t(s.Point.decodeFrom(a, e))
                    }
                }, {
                    key: "fromPoint",
                    value: function(e) {
                        return new t(e)
                    }
                }, {
                    key: "fromString",
                    value: function(e) {
                        var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : c.get("address_prefix");
                        try {
                            return t.fromStringOrThrow(e, r)
                        } catch (t) {
                            return null
                        }
                    }
                }, {
                    key: "fromStringOrThrow",
                    value: function(r) {
                        var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : c.get("address_prefix"),
                            i = r.slice(0, n.length);
                        h.equal(n, i, "Expecting key to begin with " + n + ", instead got " + i), r = r.slice(n.length), r = new e(u.decode(r), "binary");
                        var o = r.slice(-4);
                        r = r.slice(0, -4);
                        var s = f.ripemd160(r);
                        return s = s.slice(0, 4), h.deepEqual(o, s, "Checksum did not match"), t.fromBuffer(r)
                    }
                }, {
                    key: "fromHex",
                    value: function(r) {
                        return t.fromBuffer(new e(r, "hex"))
                    }
                }, {
                    key: "fromStringHex",
                    value: function(r) {
                        return t.fromString(new e(r, "hex"))
                    }
                }]), t
            }();
        t.exports = d
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    var n = r(201);
    r(203), t.exports = n
}, function(t, e, r) {
    function n(t, e, r) {
        return this instanceof n ? void(null != t && ("number" == typeof t ? this.fromNumber(t, e, r) : null == e && "string" != typeof t ? this.fromString(t, 256) : this.fromString(t, e))) : new n(t, e, r)
    }

    function i(t, e, r, n, i, o) {
        for (; --o >= 0;) {
            var s = e * this[t++] + r[n] + i;
            i = Math.floor(s / 67108864), r[n++] = 67108863 & s
        }
        return i
    }

    function o(t) {
        return oe.charAt(t)
    }

    function s(t, e) {
        var r = se[t.charCodeAt(e)];
        return null == r ? -1 : r
    }

    function a(t) {
        for (var e = this.t - 1; e >= 0; --e) t[e] = this[e];
        t.t = this.t, t.s = this.s
    }

    function u(t) {
        this.t = 1, this.s = t < 0 ? -1 : 0, t > 0 ? this[0] = t : t < -1 ? this[0] = t + ee : this.t = 0
    }

    function f(t) {
        var e = new n;
        return e.fromInt(t), e
    }

    function c(t, e) {
        var r, i = this;
        if (16 == e) r = 4;
        else if (8 == e) r = 3;
        else if (256 == e) r = 8;
        else if (2 == e) r = 1;
        else if (32 == e) r = 5;
        else {
            if (4 != e) return void i.fromRadix(t, e);
            r = 2
        }
        i.t = 0, i.s = 0;
        for (var o = t.length, a = !1, u = 0; --o >= 0;) {
            var f = 8 == r ? 255 & t[o] : s(t, o);
            f < 0 ? "-" == t.charAt(o) && (a = !0) : (a = !1, 0 == u ? i[i.t++] = f : u + r > i.DB ? (i[i.t - 1] |= (f & (1 << i.DB - u) - 1) << u, i[i.t++] = f >> i.DB - u) : i[i.t - 1] |= f << u, u += r, u >= i.DB && (u -= i.DB))
        }
        8 == r && 0 != (128 & t[0]) && (i.s = -1, u > 0 && (i[i.t - 1] |= (1 << i.DB - u) - 1 << u)), i.clamp(), a && n.ZERO.subTo(i, i)
    }

    function h() {
        for (var t = this.s & this.DM; this.t > 0 && this[this.t - 1] == t;) --this.t
    }

    function l(t) {
        var e = this;
        if (e.s < 0) return "-" + e.negate().toString(t);
        var r;
        if (16 == t) r = 4;
        else if (8 == t) r = 3;
        else if (2 == t) r = 1;
        else if (32 == t) r = 5;
        else {
            if (4 != t) return e.toRadix(t);
            r = 2
        }
        var n, i = (1 << r) - 1,
            s = !1,
            a = "",
            u = e.t,
            f = e.DB - u * e.DB % r;
        if (u-- > 0)
            for (f < e.DB && (n = e[u] >> f) > 0 && (s = !0, a = o(n)); u >= 0;) f < r ? (n = (e[u] & (1 << f) - 1) << r - f, n |= e[--u] >> (f += e.DB - r)) : (n = e[u] >> (f -= r) & i, f <= 0 && (f += e.DB, --u)), n > 0 && (s = !0), s && (a += o(n));
        return s ? a : "0"
    }

    function p() {
        var t = new n;
        return n.ZERO.subTo(this, t), t
    }

    function d() {
        return this.s < 0 ? this.negate() : this
    }

    function v(t) {
        var e = this.s - t.s;
        if (0 != e) return e;
        var r = this.t;
        if (e = r - t.t, 0 != e) return this.s < 0 ? -e : e;
        for (; --r >= 0;)
            if (0 != (e = this[r] - t[r])) return e;
        return 0
    }

    function y(t) {
        var e, r = 1;
        return 0 != (e = t >>> 16) && (t = e, r += 16), 0 != (e = t >> 8) && (t = e, r += 8), 0 != (e = t >> 4) && (t = e, r += 4), 0 != (e = t >> 2) && (t = e, r += 2), 0 != (e = t >> 1) && (t = e, r += 1), r
    }

    function g() {
        return this.t <= 0 ? 0 : this.DB * (this.t - 1) + y(this[this.t - 1] ^ this.s & this.DM)
    }

    function _() {
        return this.bitLength() >> 3
    }

    function m(t, e) {
        var r;
        for (r = this.t - 1; r >= 0; --r) e[r + t] = this[r];
        for (r = t - 1; r >= 0; --r) e[r] = 0;
        e.t = this.t + t, e.s = this.s
    }

    function b(t, e) {
        for (var r = t; r < this.t; ++r) e[r - t] = this[r];
        e.t = Math.max(this.t - t, 0), e.s = this.s
    }

    function w(t, e) {
        var r, n = this,
            i = t % n.DB,
            o = n.DB - i,
            s = (1 << o) - 1,
            a = Math.floor(t / n.DB),
            u = n.s << i & n.DM;
        for (r = n.t - 1; r >= 0; --r) e[r + a + 1] = n[r] >> o | u, u = (n[r] & s) << i;
        for (r = a - 1; r >= 0; --r) e[r] = 0;
        e[a] = u, e.t = n.t + a + 1, e.s = n.s, e.clamp()
    }

    function E(t, e) {
        var r = this;
        e.s = r.s;
        var n = Math.floor(t / r.DB);
        if (n >= r.t) return void(e.t = 0);
        var i = t % r.DB,
            o = r.DB - i,
            s = (1 << i) - 1;
        e[0] = r[n] >> i;
        for (var a = n + 1; a < r.t; ++a) e[a - n - 1] |= (r[a] & s) << o, e[a - n] = r[a] >> i;
        i > 0 && (e[r.t - n - 1] |= (r.s & s) << o), e.t = r.t - n, e.clamp()
    }

    function k(t, e) {
        for (var r = this, n = 0, i = 0, o = Math.min(t.t, r.t); n < o;) i += r[n] - t[n], e[n++] = i & r.DM, i >>= r.DB;
        if (t.t < r.t) {
            for (i -= t.s; n < r.t;) i += r[n], e[n++] = i & r.DM, i >>= r.DB;
            i += r.s
        } else {
            for (i += r.s; n < t.t;) i -= t[n], e[n++] = i & r.DM, i >>= r.DB;
            i -= t.s
        }
        e.s = i < 0 ? -1 : 0, i < -1 ? e[n++] = r.DV + i : i > 0 && (e[n++] = i), e.t = n, e.clamp()
    }

    function T(t, e) {
        var r = this.abs(),
            i = t.abs(),
            o = r.t;
        for (e.t = o + i.t; --o >= 0;) e[o] = 0;
        for (o = 0; o < i.t; ++o) e[o + r.t] = r.am(0, i[o], e, o, 0, r.t);
        e.s = 0, e.clamp(), this.s != t.s && n.ZERO.subTo(e, e)
    }

    function B(t) {
        for (var e = this.abs(), r = t.t = 2 * e.t; --r >= 0;) t[r] = 0;
        for (r = 0; r < e.t - 1; ++r) {
            var n = e.am(r, e[r], t, 2 * r, 0, 1);
            (t[r + e.t] += e.am(r + 1, 2 * e[r], t, 2 * r + 1, n, e.t - r - 1)) >= e.DV && (t[r + e.t] -= e.DV, t[r + e.t + 1] = 1)
        }
        t.t > 0 && (t[t.t - 1] += e.am(r, e[r], t, 2 * r, 0, 1)), t.s = 0, t.clamp()
    }

    function S(t, e, r) {
        var i = this,
            o = t.abs();
        if (!(o.t <= 0)) {
            var s = i.abs();
            if (s.t < o.t) return null != e && e.fromInt(0), void(null != r && i.copyTo(r));
            null == r && (r = new n);
            var a = new n,
                u = i.s,
                f = t.s,
                c = i.DB - y(o[o.t - 1]);
            c > 0 ? (o.lShiftTo(c, a), s.lShiftTo(c, r)) : (o.copyTo(a), s.copyTo(r));
            var h = a.t,
                l = a[h - 1];
            if (0 != l) {
                var p = l * (1 << i.F1) + (h > 1 ? a[h - 2] >> i.F2 : 0),
                    d = i.FV / p,
                    v = (1 << i.F1) / p,
                    g = 1 << i.F2,
                    _ = r.t,
                    m = _ - h,
                    b = null == e ? new n : e;
                for (a.dlShiftTo(m, b), r.compareTo(b) >= 0 && (r[r.t++] = 1, r.subTo(b, r)), n.ONE.dlShiftTo(h, b), b.subTo(a, a); a.t < h;) a[a.t++] = 0;
                for (; --m >= 0;) {
                    var w = r[--_] == l ? i.DM : Math.floor(r[_] * d + (r[_ - 1] + g) * v);
                    if ((r[_] += a.am(0, w, r, m, 0, h)) < w)
                        for (a.dlShiftTo(m, b), r.subTo(b, r); r[_] < --w;) r.subTo(b, r)
                }
                null != e && (r.drShiftTo(h, e), u != f && n.ZERO.subTo(e, e)), r.t = h, r.clamp(), c > 0 && r.rShiftTo(c, r), u < 0 && n.ZERO.subTo(r, r)
            }
        }
    }

    function x(t) {
        var e = new n;
        return this.abs().divRemTo(t, null, e), this.s < 0 && e.compareTo(n.ZERO) > 0 && t.subTo(e, e), e
    }

    function A(t) {
        this.m = t
    }

    function I(t) {
        return t.s < 0 || t.compareTo(this.m) >= 0 ? t.mod(this.m) : t
    }

    function O(t) {
        return t
    }

    function j(t) {
        t.divRemTo(this.m, null, t)
    }

    function C(t, e, r) {
        t.multiplyTo(e, r), this.reduce(r)
    }

    function R(t, e) {
        t.squareTo(e), this.reduce(e)
    }

    function L() {
        if (this.t < 1) return 0;
        var t = this[0];
        if (0 == (1 & t)) return 0;
        var e = 3 & t;
        return e = e * (2 - (15 & t) * e) & 15, e = e * (2 - (255 & t) * e) & 255, e = e * (2 - ((65535 & t) * e & 65535)) & 65535, e = e * (2 - t * e % this.DV) % this.DV, e > 0 ? this.DV - e : -e
    }

    function U(t) {
        this.m = t, this.mp = t.invDigit(), this.mpl = 32767 & this.mp, this.mph = this.mp >> 15, this.um = (1 << t.DB - 15) - 1, this.mt2 = 2 * t.t
    }

    function F(t) {
        var e = new n;
        return t.abs().dlShiftTo(this.m.t, e), e.divRemTo(this.m, null, e), t.s < 0 && e.compareTo(n.ZERO) > 0 && this.m.subTo(e, e), e
    }

    function P(t) {
        var e = new n;
        return t.copyTo(e), this.reduce(e), e
    }

    function D(t) {
        for (; t.t <= this.mt2;) t[t.t++] = 0;
        for (var e = 0; e < this.m.t; ++e) {
            var r = 32767 & t[e],
                n = r * this.mpl + ((r * this.mph + (t[e] >> 15) * this.mpl & this.um) << 15) & t.DM;
            for (r = e + this.m.t, t[r] += this.m.am(0, n, t, e, 0, this.m.t); t[r] >= t.DV;) t[r] -= t.DV, t[++r]++
        }
        t.clamp(), t.drShiftTo(this.m.t, t), t.compareTo(this.m) >= 0 && t.subTo(this.m, t)
    }

    function N(t, e) {
        t.squareTo(e), this.reduce(e)
    }

    function M(t, e, r) {
        t.multiplyTo(e, r), this.reduce(r)
    }

    function q() {
        return 0 == (this.t > 0 ? 1 & this[0] : this.s)
    }

    function z(t, e) {
        if (t > 4294967295 || t < 1) return n.ONE;
        var r = new n,
            i = new n,
            o = e.convert(this),
            s = y(t) - 1;
        for (o.copyTo(r); --s >= 0;)
            if (e.sqrTo(r, i), (t & 1 << s) > 0) e.mulTo(i, o, r);
            else {
                var a = r;
                r = i, i = a
            }
        return e.revert(r)
    }

    function V(t, e) {
        var r;
        return r = t < 256 || e.isEven() ? new A(e) : new U(e), this.exp(t, r)
    }

    function H() {
        var t = new n;
        return this.copyTo(t), t
    }

    function W() {
        if (this.s < 0) {
            if (1 == this.t) return this[0] - this.DV;
            if (0 == this.t) return -1
        } else {
            if (1 == this.t) return this[0];
            if (0 == this.t) return 0
        }
        return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0]
    }

    function Y() {
        return 0 == this.t ? this.s : this[0] << 24 >> 24
    }

    function G() {
        return 0 == this.t ? this.s : this[0] << 16 >> 16
    }

    function $(t) {
        return Math.floor(Math.LN2 * this.DB / Math.log(t))
    }

    function X() {
        return this.s < 0 ? -1 : this.t <= 0 || 1 == this.t && this[0] <= 0 ? 0 : 1
    }

    function Z(t) {
        if (null == t && (t = 10), 0 == this.signum() || t < 2 || t > 36) return "0";
        var e = this.chunkSize(t),
            r = Math.pow(t, e),
            i = f(r),
            o = new n,
            s = new n,
            a = "";
        for (this.divRemTo(i, o, s); o.signum() > 0;) a = (r + s.intValue()).toString(t).substr(1) + a, o.divRemTo(i, o, s);
        return s.intValue().toString(t) + a
    }

    function K(t, e) {
        var r = this;
        r.fromInt(0), null == e && (e = 10);
        for (var i = r.chunkSize(e), o = Math.pow(e, i), a = !1, u = 0, f = 0, c = 0; c < t.length; ++c) {
            var h = s(t, c);
            h < 0 ? "-" == t.charAt(c) && 0 == r.signum() && (a = !0) : (f = e * f + h, ++u >= i && (r.dMultiply(o), r.dAddOffset(f, 0), u = 0, f = 0))
        }
        u > 0 && (r.dMultiply(Math.pow(e, u)), r.dAddOffset(f, 0)), a && n.ZERO.subTo(r, r)
    }

    function Q(t, e, r) {
        var i = this;
        if ("number" == typeof e)
            if (t < 2) i.fromInt(1);
            else
                for (i.fromNumber(t, r), i.testBit(t - 1) || i.bitwiseTo(n.ONE.shiftLeft(t - 1), st, i), i.isEven() && i.dAddOffset(1, 0); !i.isProbablePrime(e);) i.dAddOffset(2, 0), i.bitLength() > t && i.subTo(n.ONE.shiftLeft(t - 1), i);
        else {
            var o = new Array,
                s = 7 & t;
            o.length = (t >> 3) + 1, e.nextBytes(o), s > 0 ? o[0] &= (1 << s) - 1 : o[0] = 0, i.fromString(o, 256)
        }
    }

    function J() {
        var t = this,
            e = t.t,
            r = new Array;
        r[0] = t.s;
        var n, i = t.DB - e * t.DB % 8,
            o = 0;
        if (e-- > 0)
            for (i < t.DB && (n = t[e] >> i) != (t.s & t.DM) >> i && (r[o++] = n | t.s << t.DB - i); e >= 0;) i < 8 ? (n = (t[e] & (1 << i) - 1) << 8 - i, n |= t[--e] >> (i += t.DB - 8)) : (n = t[e] >> (i -= 8) & 255, i <= 0 && (i += t.DB, --e)), 0 != (128 & n) && (n |= -256), 0 === o && (128 & t.s) != (128 & n) && ++o, (o > 0 || n != t.s) && (r[o++] = n);
        return r
    }

    function tt(t) {
        return 0 == this.compareTo(t)
    }

    function et(t) {
        return this.compareTo(t) < 0 ? this : t
    }

    function rt(t) {
        return this.compareTo(t) > 0 ? this : t
    }

    function nt(t, e, r) {
        var n, i, o = this,
            s = Math.min(t.t, o.t);
        for (n = 0; n < s; ++n) r[n] = e(o[n], t[n]);
        if (t.t < o.t) {
            for (i = t.s & o.DM, n = s; n < o.t; ++n) r[n] = e(o[n], i);
            r.t = o.t
        } else {
            for (i = o.s & o.DM, n = s; n < t.t; ++n) r[n] = e(i, t[n]);
            r.t = t.t
        }
        r.s = e(o.s, t.s), r.clamp()
    }

    function it(t, e) {
        return t & e
    }

    function ot(t) {
        var e = new n;
        return this.bitwiseTo(t, it, e), e
    }

    function st(t, e) {
        return t | e
    }

    function at(t) {
        var e = new n;
        return this.bitwiseTo(t, st, e), e
    }

    function ut(t, e) {
        return t ^ e
    }

    function ft(t) {
        var e = new n;
        return this.bitwiseTo(t, ut, e), e
    }

    function ct(t, e) {
        return t & ~e
    }

    function ht(t) {
        var e = new n;
        return this.bitwiseTo(t, ct, e), e
    }

    function lt() {
        for (var t = new n, e = 0; e < this.t; ++e) t[e] = this.DM & ~this[e];
        return t.t = this.t, t.s = ~this.s, t
    }

    function pt(t) {
        var e = new n;
        return t < 0 ? this.rShiftTo(-t, e) : this.lShiftTo(t, e), e
    }

    function dt(t) {
        var e = new n;
        return t < 0 ? this.lShiftTo(-t, e) : this.rShiftTo(t, e), e
    }

    function vt(t) {
        if (0 == t) return -1;
        var e = 0;
        return 0 == (65535 & t) && (t >>= 16, e += 16), 0 == (255 & t) && (t >>= 8, e += 8), 0 == (15 & t) && (t >>= 4, e += 4), 0 == (3 & t) && (t >>= 2, e += 2), 0 == (1 & t) && ++e, e
    }

    function yt() {
        for (var t = 0; t < this.t; ++t)
            if (0 != this[t]) return t * this.DB + vt(this[t]);
        return this.s < 0 ? this.t * this.DB : -1
    }

    function gt(t) {
        for (var e = 0; 0 != t;) t &= t - 1, ++e;
        return e
    }

    function _t() {
        for (var t = 0, e = this.s & this.DM, r = 0; r < this.t; ++r) t += gt(this[r] ^ e);
        return t
    }

    function mt(t) {
        var e = Math.floor(t / this.DB);
        return e >= this.t ? 0 != this.s : 0 != (this[e] & 1 << t % this.DB)
    }

    function bt(t, e) {
        var r = n.ONE.shiftLeft(t);
        return this.bitwiseTo(r, e, r), r
    }

    function wt(t) {
        return this.changeBit(t, st)
    }

    function Et(t) {
        return this.changeBit(t, ct)
    }

    function kt(t) {
        return this.changeBit(t, ut)
    }

    function Tt(t, e) {
        for (var r = this, n = 0, i = 0, o = Math.min(t.t, r.t); n < o;) i += r[n] + t[n], e[n++] = i & r.DM, i >>= r.DB;
        if (t.t < r.t) {
            for (i += t.s; n < r.t;) i += r[n], e[n++] = i & r.DM, i >>= r.DB;
            i += r.s
        } else {
            for (i += r.s; n < t.t;) i += t[n], e[n++] = i & r.DM, i >>= r.DB;
            i += t.s
        }
        e.s = i < 0 ? -1 : 0, i > 0 ? e[n++] = i : i < -1 && (e[n++] = r.DV + i), e.t = n, e.clamp()
    }

    function Bt(t) {
        var e = new n;
        return this.addTo(t, e), e
    }

    function St(t) {
        var e = new n;
        return this.subTo(t, e), e
    }

    function xt(t) {
        var e = new n;
        return this.multiplyTo(t, e), e
    }

    function At() {
        var t = new n;
        return this.squareTo(t), t
    }

    function It(t) {
        var e = new n;
        return this.divRemTo(t, e, null), e
    }

    function Ot(t) {
        var e = new n;
        return this.divRemTo(t, null, e), e
    }

    function jt(t) {
        var e = new n,
            r = new n;
        return this.divRemTo(t, e, r), new Array(e, r)
    }

    function Ct(t) {
        this[this.t] = this.am(0, t - 1, this, 0, 0, this.t), ++this.t, this.clamp()
    }

    function Rt(t, e) {
        if (0 != t) {
            for (; this.t <= e;) this[this.t++] = 0;
            for (this[e] += t; this[e] >= this.DV;) this[e] -= this.DV, ++e >= this.t && (this[this.t++] = 0), ++this[e]
        }
    }

    function Lt() {}

    function Ut(t) {
        return t
    }

    function Ft(t, e, r) {
        t.multiplyTo(e, r)
    }

    function Pt(t, e) {
        t.squareTo(e)
    }

    function Dt(t) {
        return this.exp(t, new Lt)
    }

    function Nt(t, e, r) {
        var n = Math.min(this.t + t.t, e);
        for (r.s = 0, r.t = n; n > 0;) r[--n] = 0;
        var i;
        for (i = r.t - this.t; n < i; ++n) r[n + this.t] = this.am(0, t[n], r, n, 0, this.t);
        for (i = Math.min(t.t, e); n < i; ++n) this.am(0, t[n], r, n, 0, e - n);
        r.clamp()
    }

    function Mt(t, e, r) {
        --e;
        var n = r.t = this.t + t.t - e;
        for (r.s = 0; --n >= 0;) r[n] = 0;
        for (n = Math.max(e - this.t, 0); n < t.t; ++n) r[this.t + n - e] = this.am(e - n, t[n], r, 0, 0, this.t + n - e);
        r.clamp(), r.drShiftTo(1, r)
    }

    function qt(t) {
        this.r2 = new n, this.q3 = new n, n.ONE.dlShiftTo(2 * t.t, this.r2), this.mu = this.r2.divide(t), this.m = t
    }

    function zt(t) {
        if (t.s < 0 || t.t > 2 * this.m.t) return t.mod(this.m);
        if (t.compareTo(this.m) < 0) return t;
        var e = new n;
        return t.copyTo(e), this.reduce(e), e
    }

    function Vt(t) {
        return t
    }

    function Ht(t) {
        var e = this;
        for (t.drShiftTo(e.m.t - 1, e.r2), t.t > e.m.t + 1 && (t.t = e.m.t + 1, t.clamp()), e.mu.multiplyUpperTo(e.r2, e.m.t + 1, e.q3), e.m.multiplyLowerTo(e.q3, e.m.t + 1, e.r2); t.compareTo(e.r2) < 0;) t.dAddOffset(1, e.m.t + 1);
        for (t.subTo(e.r2, t); t.compareTo(e.m) >= 0;) t.subTo(e.m, t)
    }

    function Wt(t, e) {
        t.squareTo(e), this.reduce(e)
    }

    function Yt(t, e, r) {
        t.multiplyTo(e, r), this.reduce(r)
    }

    function Gt(t, e) {
        var r, i, o = t.bitLength(),
            s = f(1);
        if (o <= 0) return s;
        r = o < 18 ? 1 : o < 48 ? 3 : o < 144 ? 4 : o < 768 ? 5 : 6, i = o < 8 ? new A(e) : e.isEven() ? new qt(e) : new U(e);
        var a = new Array,
            u = 3,
            c = r - 1,
            h = (1 << r) - 1;
        if (a[1] = i.convert(this), r > 1) {
            var l = new n;
            for (i.sqrTo(a[1], l); u <= h;) a[u] = new n, i.mulTo(l, a[u - 2], a[u]), u += 2
        }
        var p, d, v = t.t - 1,
            g = !0,
            _ = new n;
        for (o = y(t[v]) - 1; v >= 0;) {
            for (o >= c ? p = t[v] >> o - c & h : (p = (t[v] & (1 << o + 1) - 1) << c - o, v > 0 && (p |= t[v - 1] >> this.DB + o - c)), u = r; 0 == (1 & p);) p >>= 1, --u;
            if ((o -= u) < 0 && (o += this.DB, --v), g) a[p].copyTo(s), g = !1;
            else {
                for (; u > 1;) i.sqrTo(s, _), i.sqrTo(_, s), u -= 2;
                u > 0 ? i.sqrTo(s, _) : (d = s, s = _, _ = d), i.mulTo(_, a[p], s)
            }
            for (; v >= 0 && 0 == (t[v] & 1 << o);) i.sqrTo(s, _), d = s, s = _, _ = d, --o < 0 && (o = this.DB - 1, --v)
        }
        return i.revert(s)
    }

    function $t(t) {
        var e = this.s < 0 ? this.negate() : this.clone(),
            r = t.s < 0 ? t.negate() : t.clone();
        if (e.compareTo(r) < 0) {
            var n = e;
            e = r, r = n
        }
        var i = e.getLowestSetBit(),
            o = r.getLowestSetBit();
        if (o < 0) return e;
        for (i < o && (o = i), o > 0 && (e.rShiftTo(o, e), r.rShiftTo(o, r)); e.signum() > 0;)(i = e.getLowestSetBit()) > 0 && e.rShiftTo(i, e), (i = r.getLowestSetBit()) > 0 && r.rShiftTo(i, r), e.compareTo(r) >= 0 ? (e.subTo(r, e), e.rShiftTo(1, e)) : (r.subTo(e, r), r.rShiftTo(1, r));
        return o > 0 && r.lShiftTo(o, r), r
    }

    function Xt(t) {
        if (t <= 0) return 0;
        var e = this.DV % t,
            r = this.s < 0 ? t - 1 : 0;
        if (this.t > 0)
            if (0 == e) r = this[0] % t;
            else
                for (var n = this.t - 1; n >= 0; --n) r = (e * r + this[n]) % t;
        return r
    }

    function Zt(t) {
        var e = t.isEven();
        if (0 === this.signum()) throw new Error("division by zero");
        if (this.isEven() && e || 0 == t.signum()) return n.ZERO;
        for (var r = t.clone(), i = this.clone(), o = f(1), s = f(0), a = f(0), u = f(1); 0 != r.signum();) {
            for (; r.isEven();) r.rShiftTo(1, r), e ? (o.isEven() && s.isEven() || (o.addTo(this, o), s.subTo(t, s)), o.rShiftTo(1, o)) : s.isEven() || s.subTo(t, s), s.rShiftTo(1, s);
            for (; i.isEven();) i.rShiftTo(1, i), e ? (a.isEven() && u.isEven() || (a.addTo(this, a), u.subTo(t, u)), a.rShiftTo(1, a)) : u.isEven() || u.subTo(t, u), u.rShiftTo(1, u);
            r.compareTo(i) >= 0 ? (r.subTo(i, r), e && o.subTo(a, o), s.subTo(u, s)) : (i.subTo(r, i), e && a.subTo(o, a), u.subTo(s, u))
        }
        if (0 != i.compareTo(n.ONE)) return n.ZERO;
        for (; u.compareTo(t) >= 0;) u.subTo(t, u);
        for (; u.signum() < 0;) u.addTo(t, u);
        return u
    }

    function Kt(t) {
        var e, r = this.abs();
        if (1 == r.t && r[0] <= ae[ae.length - 1]) {
            for (e = 0; e < ae.length; ++e)
                if (r[0] == ae[e]) return !0;
            return !1
        }
        if (r.isEven()) return !1;
        for (e = 1; e < ae.length;) {
            for (var n = ae[e], i = e + 1; i < ae.length && n < ue;) n *= ae[i++];
            for (n = r.modInt(n); e < i;)
                if (n % ae[e++] == 0) return !1
        }
        return r.millerRabin(t)
    }

    function Qt(t) {
        var e = this.subtract(n.ONE),
            r = e.getLowestSetBit();
        if (r <= 0) return !1;
        var i = e.shiftRight(r);
        t = t + 1 >> 1, t > ae.length && (t = ae.length);
        for (var o, s = new n(null), a = [], u = 0; u < t; ++u) {
            for (; o = ae[Math.floor(Math.random() * ae.length)], a.indexOf(o) != -1;);
            a.push(o), s.fromInt(o);
            var f = s.modPow(i, this);
            if (0 != f.compareTo(n.ONE) && 0 != f.compareTo(e)) {
                for (var o = 1; o++ < r && 0 != f.compareTo(e);)
                    if (f = f.modPowInt(2, this), 0 == f.compareTo(n.ONE)) return !1;
                if (0 != f.compareTo(e)) return !1
            }
        }
        return !0
    }
    var Jt = n.prototype;
    Jt.__bigi = r(202).version, n.isBigInteger = function(t, e) {
        return t && t.__bigi && (!e || t.__bigi === Jt.__bigi)
    };
    var te;
    n.prototype.am = i, te = 26, n.prototype.DB = te, n.prototype.DM = (1 << te) - 1;
    var ee = n.prototype.DV = 1 << te,
        re = 52;
    n.prototype.FV = Math.pow(2, re), n.prototype.F1 = re - te, n.prototype.F2 = 2 * te - re;
    var ne, ie, oe = "0123456789abcdefghijklmnopqrstuvwxyz",
        se = new Array;
    for (ne = "0".charCodeAt(0), ie = 0; ie <= 9; ++ie) se[ne++] = ie;
    for (ne = "a".charCodeAt(0), ie = 10; ie < 36; ++ie) se[ne++] = ie;
    for (ne = "A".charCodeAt(0), ie = 10; ie < 36; ++ie) se[ne++] = ie;
    A.prototype.convert = I, A.prototype.revert = O, A.prototype.reduce = j, A.prototype.mulTo = C, A.prototype.sqrTo = R, U.prototype.convert = F, U.prototype.revert = P, U.prototype.reduce = D, U.prototype.mulTo = M, U.prototype.sqrTo = N, Jt.copyTo = a, Jt.fromInt = u, Jt.fromString = c, Jt.clamp = h, Jt.dlShiftTo = m, Jt.drShiftTo = b, Jt.lShiftTo = w, Jt.rShiftTo = E, Jt.subTo = k, Jt.multiplyTo = T, Jt.squareTo = B, Jt.divRemTo = S, Jt.invDigit = L, Jt.isEven = q, Jt.exp = z, Jt.toString = l, Jt.negate = p, Jt.abs = d, Jt.compareTo = v, Jt.bitLength = g, Jt.byteLength = _, Jt.mod = x, Jt.modPowInt = V, Lt.prototype.convert = Ut, Lt.prototype.revert = Ut, Lt.prototype.mulTo = Ft, Lt.prototype.sqrTo = Pt, qt.prototype.convert = zt, qt.prototype.revert = Vt, qt.prototype.reduce = Ht, qt.prototype.mulTo = Yt, qt.prototype.sqrTo = Wt;
    var ae = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997],
        ue = (1 << 26) / ae[ae.length - 1];
    Jt.chunkSize = $, Jt.toRadix = Z, Jt.fromRadix = K, Jt.fromNumber = Q, Jt.bitwiseTo = nt, Jt.changeBit = bt, Jt.addTo = Tt, Jt.dMultiply = Ct, Jt.dAddOffset = Rt, Jt.multiplyLowerTo = Nt, Jt.multiplyUpperTo = Mt, Jt.modInt = Xt, Jt.millerRabin = Qt, Jt.clone = H, Jt.intValue = W, Jt.byteValue = Y, Jt.shortValue = G, Jt.signum = X, Jt.toByteArray = J, Jt.equals = tt, Jt.min = et, Jt.max = rt, Jt.and = ot, Jt.or = at, Jt.xor = ft, Jt.andNot = ht, Jt.not = lt, Jt.shiftLeft = pt, Jt.shiftRight = dt, Jt.getLowestSetBit = yt, Jt.bitCount = _t, Jt.testBit = mt, Jt.setBit = wt, Jt.clearBit = Et, Jt.flipBit = kt, Jt.add = Bt, Jt.subtract = St, Jt.multiply = xt, Jt.divide = It, Jt.remainder = Ot, Jt.divideAndRemainder = jt, Jt.modPow = Gt, Jt.modInverse = Zt, Jt.pow = Dt, Jt.gcd = $t, Jt.isProbablePrime = Kt, Jt.square = At, n.ZERO = f(0), n.ONE = f(1), n.valueOf = f, t.exports = n
}, function(t, e) {
    t.exports = {
        name: "bigi",
        version: "1.4.2",
        description: "Big integers.",
        keywords: ["cryptography", "math", "bitcoin", "arbitrary", "precision", "arithmetic", "big", "integer", "int", "number", "biginteger", "bigint", "bignumber", "decimal", "float"],
        devDependencies: {
            coveralls: "^2.11.2",
            istanbul: "^0.3.5",
            jshint: "^2.5.1",
            mocha: "^2.1.0",
            mochify: "^2.1.0"
        },
        repository: {
            url: "https://github.com/cryptocoinjs/bigi",
            type: "git"
        },
        main: "./lib/index.js",
        scripts: {
            "browser-test": "./node_modules/.bin/mochify --wd -R spec",
            test: "./node_modules/.bin/_mocha -- test/*.js",
            jshint: "./node_modules/.bin/jshint --config jshint.json lib/*.js ; true",
            unit: "./node_modules/.bin/mocha",
            coverage: "./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- --reporter list test/*.js",
            coveralls: "npm run-script coverage && node ./node_modules/.bin/coveralls < coverage/lcov.info"
        },
        dependencies: {},
        testling: {
            files: "test/*.js",
            harness: "mocha",
            browsers: ["ie/9..latest", "firefox/latest", "chrome/latest", "safari/6.0..latest", "iphone/6.0..latest", "android-browser/4.2..latest"]
        }
    }
}, function(t, e, r) {
    (function(t) {
        var e = r(127),
            n = r(201);
        n.fromByteArrayUnsigned = function(t) {
            return new n(128 & t[0] ? [0].concat(t) : t)
        }, n.prototype.toByteArrayUnsigned = function() {
            var t = this.toByteArray();
            return 0 === t[0] ? t.slice(1) : t
        }, n.fromDERInteger = function(t) {
            return new n(t)
        }, n.prototype.toDERInteger = n.prototype.toByteArray, n.fromBuffer = function(t) {
            if (128 & t[0]) {
                var e = Array.prototype.slice.call(t);
                return new n([0].concat(e))
            }
            return new n(t)
        }, n.fromHex = function(t) {
            return "" === t ? n.ZERO : (e.equal(t, t.match(/^[A-Fa-f0-9]+/), "Invalid hex string"), e.equal(t.length % 2, 0, "Incomplete hex"), new n(t, 16))
        }, n.prototype.toBuffer = function(e) {
            for (var r = this.toByteArrayUnsigned(), n = [], i = e - r.length; n.length < i;) n.push(0);
            return new t(n.concat(r))
        }, n.prototype.toHex = function(t) {
            return this.toBuffer(t).toString("hex")
        }
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    var n = r(205),
        i = r(206),
        o = r(207);
    t.exports = {
        Curve: i,
        Point: n,
        getCurveByName: o
    }
}, function(t, e, r) {
    (function(e) {
        function n(t, e, r, n) {
            i.notStrictEqual(n, void 0, "Missing Z coordinate"), this.curve = t, this.x = e, this.y = r, this.z = n, this._zInv = null, this.compressed = !0
        }
        var i = r(127),
            o = r(200),
            s = o.valueOf(3);
        Object.defineProperty(n.prototype, "zInv", {
            get: function() {
                return null === this._zInv && (this._zInv = this.z.modInverse(this.curve.p)), this._zInv
            }
        }), Object.defineProperty(n.prototype, "affineX", {
            get: function() {
                return this.x.multiply(this.zInv).mod(this.curve.p)
            }
        }), Object.defineProperty(n.prototype, "affineY", {
            get: function() {
                return this.y.multiply(this.zInv).mod(this.curve.p)
            }
        }), n.fromAffine = function(t, e, r) {
            return new n(t, e, r, o.ONE)
        }, n.prototype.equals = function(t) {
            if (t === this) return !0;
            if (this.curve.isInfinity(this)) return this.curve.isInfinity(t);
            if (this.curve.isInfinity(t)) return this.curve.isInfinity(this);
            var e = t.y.multiply(this.z).subtract(this.y.multiply(t.z)).mod(this.curve.p);
            if (0 !== e.signum()) return !1;
            var r = t.x.multiply(this.z).subtract(this.x.multiply(t.z)).mod(this.curve.p);
            return 0 === r.signum()
        }, n.prototype.negate = function() {
            var t = this.curve.p.subtract(this.y);
            return new n(this.curve, this.x, t, this.z)
        }, n.prototype.add = function(t) {
            if (this.curve.isInfinity(this)) return t;
            if (this.curve.isInfinity(t)) return this;
            var e = this.x,
                r = this.y,
                i = t.x,
                o = t.y,
                a = o.multiply(this.z).subtract(r.multiply(t.z)).mod(this.curve.p),
                u = i.multiply(this.z).subtract(e.multiply(t.z)).mod(this.curve.p);
            if (0 === u.signum()) return 0 === a.signum() ? this.twice() : this.curve.infinity;
            var f = u.square(),
                c = f.multiply(u),
                h = e.multiply(f),
                l = a.square().multiply(this.z),
                p = l.subtract(h.shiftLeft(1)).multiply(t.z).subtract(c).multiply(u).mod(this.curve.p),
                d = h.multiply(s).multiply(a).subtract(r.multiply(c)).subtract(l.multiply(a)).multiply(t.z).add(a.multiply(c)).mod(this.curve.p),
                v = c.multiply(this.z).multiply(t.z).mod(this.curve.p);
            return new n(this.curve, p, d, v)
        }, n.prototype.twice = function() {
            if (this.curve.isInfinity(this)) return this;
            if (0 === this.y.signum()) return this.curve.infinity;
            var t = this.x,
                e = this.y,
                r = e.multiply(this.z).mod(this.curve.p),
                i = r.multiply(e).mod(this.curve.p),
                o = this.curve.a,
                a = t.square().multiply(s);
            0 !== o.signum() && (a = a.add(this.z.square().multiply(o))), a = a.mod(this.curve.p);
            var u = a.square().subtract(t.shiftLeft(3).multiply(i)).shiftLeft(1).multiply(r).mod(this.curve.p),
                f = a.multiply(s).multiply(t).subtract(i.shiftLeft(1)).shiftLeft(2).multiply(i).subtract(a.pow(3)).mod(this.curve.p),
                c = r.pow(3).shiftLeft(3).mod(this.curve.p);
            return new n(this.curve, u, f, c)
        }, n.prototype.multiply = function(t) {
            if (this.curve.isInfinity(this)) return this;
            if (0 === t.signum()) return this.curve.infinity;
            for (var e = t, r = e.multiply(s), n = this.negate(), i = this, o = r.bitLength() - 2; o > 0; --o) {
                var a = r.testBit(o),
                    u = e.testBit(o);
                i = i.twice(), a !== u && (i = i.add(a ? this : n))
            }
            return i
        }, n.prototype.multiplyTwo = function(t, e, r) {
            for (var n = Math.max(t.bitLength(), r.bitLength()) - 1, i = this.curve.infinity, o = this.add(e); n >= 0;) {
                var s = t.testBit(n),
                    a = r.testBit(n);
                i = i.twice(), s ? i = a ? i.add(o) : i.add(this) : a && (i = i.add(e)), --n
            }
            return i
        }, n.prototype.getEncoded = function(t) {
            if (null == t && (t = this.compressed), this.curve.isInfinity(this)) return new e("00", "hex");
            var r, n = this.affineX,
                i = this.affineY,
                o = this.curve.pLength;
            return t ? (r = new e(1 + o), r.writeUInt8(i.isEven() ? 2 : 3, 0)) : (r = new e(1 + o + o), r.writeUInt8(4, 0), i.toBuffer(o).copy(r, 1 + o)), n.toBuffer(o).copy(r, 1), r
        }, n.decodeFrom = function(t, e) {
            var r, s = e.readUInt8(0),
                a = 4 !== s,
                u = Math.floor((t.p.bitLength() + 7) / 8),
                f = o.fromBuffer(e.slice(1, 1 + u));
            if (a) {
                i.equal(e.length, u + 1, "Invalid sequence length"), i(2 === s || 3 === s, "Invalid sequence tag");
                var c = 3 === s;
                r = t.pointFromX(c, f)
            } else {
                i.equal(e.length, 1 + u + u, "Invalid sequence length");
                var h = o.fromBuffer(e.slice(1 + u));
                r = n.fromAffine(t, f, h)
            }
            return r.compressed = a, r
        }, n.prototype.toString = function() {
            return this.curve.isInfinity(this) ? "(INFINITY)" : "(" + this.affineX.toString() + "," + this.affineY.toString() + ")"
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    function n(t, e, r, n, i, a, u) {
        this.p = t, this.a = e, this.b = r, this.G = s.fromAffine(this, n, i), this.n = a, this.h = u, this.infinity = new s(this, null, null, o.ZERO), this.pOverFour = t.add(o.ONE).shiftRight(2), this.pLength = Math.floor((this.p.bitLength() + 7) / 8)
    }
    var i = r(127),
        o = r(200),
        s = r(205);
    n.prototype.pointFromX = function(t, e) {
        var r = e.pow(3).add(this.a.multiply(e)).add(this.b).mod(this.p),
            n = r.modPow(this.pOverFour, this.p),
            i = n;
        return n.isEven() ^ !t && (i = this.p.subtract(i)), s.fromAffine(this, e, i)
    }, n.prototype.isInfinity = function(t) {
        return t === this.infinity || 0 === t.z.signum() && 0 !== t.y.signum()
    }, n.prototype.isOnCurve = function(t) {
        if (this.isInfinity(t)) return !0;
        var e = t.affineX,
            r = t.affineY,
            n = this.a,
            i = this.b,
            o = this.p;
        if (e.signum() < 0 || e.compareTo(o) >= 0) return !1;
        if (r.signum() < 0 || r.compareTo(o) >= 0) return !1;
        var s = r.square().mod(o),
            a = e.pow(3).add(n.multiply(e)).add(i).mod(o);
        return s.equals(a)
    }, n.prototype.validate = function(t) {
        i(!this.isInfinity(t), "Point is at infinity"), i(this.isOnCurve(t), "Point is not on the curve");
        var e = t.multiply(this.n);
        return i(this.isInfinity(e), "Point is not a scalar multiple of G"), !0
    }, t.exports = n
}, function(t, e, r) {
    function n(t) {
        var e = o[t];
        if (!e) return null;
        var r = new i(e.p, 16),
            n = new i(e.a, 16),
            a = new i(e.b, 16),
            u = new i(e.n, 16),
            f = new i(e.h, 16),
            c = new i(e.Gx, 16),
            h = new i(e.Gy, 16);
        return new s(r, n, a, c, h, u, f)
    }
    var i = r(200),
        o = r(208),
        s = r(206);
    t.exports = n
}, function(t, e) {
    t.exports = {
        secp128r1: {
            p: "fffffffdffffffffffffffffffffffff",
            a: "fffffffdfffffffffffffffffffffffc",
            b: "e87579c11079f43dd824993c2cee5ed3",
            n: "fffffffe0000000075a30d1b9038a115",
            h: "01",
            Gx: "161ff7528b899b2d0c28607ca52c5b86",
            Gy: "cf5ac8395bafeb13c02da292dded7a83"
        },
        secp160k1: {
            p: "fffffffffffffffffffffffffffffffeffffac73",
            a: "00",
            b: "07",
            n: "0100000000000000000001b8fa16dfab9aca16b6b3",
            h: "01",
            Gx: "3b4c382ce37aa192a4019e763036f4f5dd4d7ebb",
            Gy: "938cf935318fdced6bc28286531733c3f03c4fee"
        },
        secp160r1: {
            p: "ffffffffffffffffffffffffffffffff7fffffff",
            a: "ffffffffffffffffffffffffffffffff7ffffffc",
            b: "1c97befc54bd7a8b65acf89f81d4d4adc565fa45",
            n: "0100000000000000000001f4c8f927aed3ca752257",
            h: "01",
            Gx: "4a96b5688ef573284664698968c38bb913cbfc82",
            Gy: "23a628553168947d59dcc912042351377ac5fb32"
        },
        secp192k1: {
            p: "fffffffffffffffffffffffffffffffffffffffeffffee37",
            a: "00",
            b: "03",
            n: "fffffffffffffffffffffffe26f2fc170f69466a74defd8d",
            h: "01",
            Gx: "db4ff10ec057e9ae26b07d0280b7f4341da5d1b1eae06c7d",
            Gy: "9b2f2f6d9c5628a7844163d015be86344082aa88d95e2f9d"
        },
        secp192r1: {
            p: "fffffffffffffffffffffffffffffffeffffffffffffffff",
            a: "fffffffffffffffffffffffffffffffefffffffffffffffc",
            b: "64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1",
            n: "ffffffffffffffffffffffff99def836146bc9b1b4d22831",
            h: "01",
            Gx: "188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012",
            Gy: "07192b95ffc8da78631011ed6b24cdd573f977a11e794811"
        },
        secp256k1: {
            p: "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
            a: "00",
            b: "07",
            n: "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
            h: "01",
            Gx: "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            Gy: "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
        },
        secp256r1: {
            p: "ffffffff00000001000000000000000000000000ffffffffffffffffffffffff",
            a: "ffffffff00000001000000000000000000000000fffffffffffffffffffffffc",
            b: "5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b",
            n: "ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551",
            h: "01",
            Gx: "6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296",
            Gy: "4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"
        }
    }
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n(t, e) {
            if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
        }
        var i = function() {
                function t(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                    }
                }
                return function(e, r, n) {
                    return r && t(e.prototype, r), n && t(e, n), e
                }
            }(),
            o = r(204),
            s = o.Point,
            a = o.getCurveByName("secp256k1"),
            u = r(200),
            f = r(171),
            c = r(127),
            h = r(131),
            l = r(199),
            p = (a.G, a.n),
            d = function() {
                function t(e) {
                    n(this, t), this.d = e
                }
                return i(t, [{
                    key: "toWif",
                    value: function() {
                        var t = this.toBuffer();
                        t = e.concat([new e([128]), t]);
                        var r = h.sha256(t);
                        r = h.sha256(r), r = r.slice(0, 4);
                        var n = e.concat([t, r]);
                        return f.encode(n)
                    }
                }, {
                    key: "toString",
                    value: function() {
                        return this.toWif()
                    }
                }, {
                    key: "toPublicKeyPoint",
                    value: function() {
                        var t;
                        return t = a.G.multiply(this.d)
                    }
                }, {
                    key: "toPublic",
                    value: function() {
                        return this.public_key ? this.public_key : this.public_key = l.fromPoint(this.toPublicKeyPoint())
                    }
                }, {
                    key: "toBuffer",
                    value: function() {
                        return this.d.toBuffer(32)
                    }
                }, {
                    key: "get_shared_secret",
                    value: function(t) {
                        t = v(t);
                        var e = t.toUncompressed().toBuffer(),
                            r = s.fromAffine(a, u.fromBuffer(e.slice(1, 33)), u.fromBuffer(e.slice(33, 65))),
                            n = this.toBuffer(),
                            i = r.multiply(u.fromBuffer(n)),
                            o = i.affineX.toBuffer({
                                size: 32
                            });
                        return h.sha512(o)
                    }
                }, {
                    key: "child",
                    value: function(r) {
                        r = e.concat([this.toPublicKey().toBuffer(), r]), r = h.sha256(r);
                        var n = u.fromBuffer(r);
                        if (n.compareTo(p) >= 0) throw new Error("Child offset went out of bounds, try again");
                        var i = this.d.add(n);
                        if (0 === i.signum()) throw new Error("Child offset derived to an invalid key, try again");
                        return new t(i)
                    }
                }, {
                    key: "toHex",
                    value: function() {
                        return this.toBuffer().toString("hex")
                    }
                }, {
                    key: "toPublicKey",
                    value: function() {
                        return this.toPublic()
                    }
                }], [{
                    key: "fromBuffer",
                    value: function(r) {
                        if (!e.isBuffer(r)) throw new Error("Expecting paramter to be a Buffer type");
                        if (32 !== r.length && console.log("WARN: Expecting 32 bytes, instead got " + r.length + ", stack trace:", (new Error).stack), 0 === r.length) throw new Error("Empty buffer");
                        return new t(u.fromBuffer(r))
                    }
                }, {
                    key: "fromSeed",
                    value: function(e) {
                        if ("string" != typeof e) throw new Error("seed must be of type string");
                        return t.fromBuffer(h.sha256(e))
                    }
                }, {
                    key: "isWif",
                    value: function(t) {
                        try {
                            return this.fromWif(t), !0
                        } catch (t) {
                            return !1
                        }
                    }
                }, {
                    key: "fromWif",
                    value: function(r) {
                        var n = new e(f.decode(r)),
                            i = n.readUInt8(0);
                        c.equal(128, i, "Expected version 128, instead got " + i);
                        var o = n.slice(0, -4),
                            s = n.slice(-4),
                            a = h.sha256(o);
                        if (a = h.sha256(a), a = a.slice(0, 4), s.toString() !== a.toString()) throw new Error("Invalid WIF key (checksum miss-match)");
                        return o = o.slice(1), t.fromBuffer(o)
                    }
                }, {
                    key: "fromHex",
                    value: function(r) {
                        return t.fromBuffer(new e(r, "hex"))
                    }
                }]), t
            }();
        t.exports = d;
        var v = function(t) {
            return null == t ? t : t.Q ? t : l.fromStringOrThrow(t)
        }
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n(t, e) {
            if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
        }
        var i = function() {
                function t(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                    }
                }
                return function(e, r, n) {
                    return r && t(e.prototype, r), n && t(e, n), e
                }
            }(),
            o = r(211),
            s = r(131),
            a = r(204).getCurveByName("secp256k1"),
            u = r(127),
            f = r(200),
            c = r(199),
            h = r(209),
            l = function() {
                function t(e, r, i) {
                    n(this, t), this.r = e, this.s = r, this.i = i, u.equal(null != this.r, !0, "Missing parameter"), u.equal(null != this.s, !0, "Missing parameter"), u.equal(null != this.i, !0, "Missing parameter")
                }
                return i(t, [{
                    key: "toBuffer",
                    value: function() {
                        var t;
                        return t = new e(65), t.writeUInt8(this.i, 0), this.r.toBuffer(32).copy(t, 1), this.s.toBuffer(32).copy(t, 33), t
                    }
                }, {
                    key: "recoverPublicKeyFromBuffer",
                    value: function(t) {
                        return this.recoverPublicKey(s.sha256(t))
                    }
                }, {
                    key: "recoverPublicKey",
                    value: function(t) {
                        var e = void 0,
                            r = void 0,
                            n = void 0;
                        return r = f.fromBuffer(t), n = this.i, n -= 27, n &= 3, e = o.recoverPubKey(a, r, this, n), c.fromPoint(e)
                    }
                }, {
                    key: "verifyBuffer",
                    value: function(t, e) {
                        var r = s.sha256(t);
                        return this.verifyHash(r, e)
                    }
                }, {
                    key: "verifyHash",
                    value: function(t, e) {
                        return u.equal(t.length, 32, "A SHA 256 should be 32 bytes long, instead got " + t.length), o.verify(a, t, {
                            r: this.r,
                            s: this.s
                        }, e.Q)
                    }
                }, {
                    key: "toHex",
                    value: function() {
                        return this.toBuffer().toString("hex")
                    }
                }, {
                    key: "verifyHex",
                    value: function(t, r) {
                        var n;
                        return n = new e(t, "hex"), this.verifyBuffer(n, r)
                    }
                }], [{
                    key: "fromBuffer",
                    value: function(e) {
                        var r, n, i;
                        return u.equal(e.length, 65, "Invalid signature length"), r = e.readUInt8(0), u.equal(r - 27, r - 27 & 7, "Invalid signature parameter"), n = f.fromBuffer(e.slice(1, 33)), i = f.fromBuffer(e.slice(33)), new t(n, i, r)
                    }
                }, {
                    key: "signBuffer",
                    value: function(e, r) {
                        var n = s.sha256(e);
                        return t.signBufferSha256(n, r)
                    }
                }, {
                    key: "signBufferSha256",
                    value: function(r, n) {
                        if (32 !== r.length || !e.isBuffer(r)) throw new Error("buf_sha256: 32 byte buffer requred");
                        n = p(n), u(n, "private_key required");
                        var i, s, c, h, l, d, v;
                        for (h = null, v = 0, s = f.fromBuffer(r);;) {
                            if (c = o.sign(a, r, n.d, v++), i = c.toDER(), l = i[3], d = i[5 + l], 32 === l && 32 === d) {
                                h = o.calcPubKeyRecoveryParam(a, s, c, n.toPublicKey().Q), h += 4, h += 27;
                                break
                            }
                            v % 10 === 0 && console.log("WARN: " + v + " attempts to find canonical signature")
                        }
                        return new t(c.r, c.s, h)
                    }
                }, {
                    key: "sign",
                    value: function(r, n) {
                        return t.signBuffer(new e(r), n)
                    }
                }, {
                    key: "fromHex",
                    value: function(r) {
                        return t.fromBuffer(new e(r, "hex"))
                    }
                }, {
                    key: "signHex",
                    value: function(r, n) {
                        var i;
                        return i = new e(r, "hex"), t.signBuffer(i, n)
                    }
                }]), t
            }(),
            p = function(t) {
                return t ? t.d ? t : h.fromWif(t) : t
            };
        t.exports = l
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n(t, r, n, i, o) {
            h("Buffer", r), h(l, n), o && (r = c.sha256(e.concat([r, new e(o)]))), f.equal(r.length, 32, "Hash must be 256 bit");
            var s = n.toBuffer(32),
                a = new e(32),
                u = new e(32);
            u.fill(1), a.fill(0), a = c.HmacSHA256(e.concat([u, new e([0]), s, r]), a), u = c.HmacSHA256(u, a), a = c.HmacSHA256(e.concat([u, new e([1]), s, r]), a), u = c.HmacSHA256(u, a), u = c.HmacSHA256(u, a);
            for (var p = l.fromBuffer(u); p.signum() <= 0 || p.compareTo(t.n) >= 0 || !i(p);) a = c.HmacSHA256(e.concat([u, new e([0])]), a), u = c.HmacSHA256(u, a), u = c.HmacSHA256(u, a), p = l.fromBuffer(u);
            return p
        }

        function i(t, e, r, i) {
            var o, s, a = l.fromBuffer(e),
                u = t.n,
                f = t.G,
                c = (n(t, e, r, function(e) {
                    var n = f.multiply(e);
                    return !t.isInfinity(n) && (o = n.affineX.mod(u), 0 !== o.signum() && (s = e.modInverse(u).multiply(a.add(r.multiply(o))).mod(u), 0 !== s.signum()))
                }, i), u.shiftRight(1));
            return s.compareTo(c) > 0 && (s = u.subtract(s)), new p(o, s)
        }

        function o(t, e, r, n) {
            var i = t.n,
                o = t.G,
                s = r.r,
                a = r.s;
            if (s.signum() <= 0 || s.compareTo(i) >= 0) return !1;
            if (a.signum() <= 0 || a.compareTo(i) >= 0) return !1;
            var u = a.modInverse(i),
                f = e.multiply(u).mod(i),
                c = s.multiply(u).mod(i),
                h = o.multiplyTwo(f, n, c);
            if (t.isInfinity(h)) return !1;
            var l = h.affineX,
                p = l.mod(i);
            return p.equals(s)
        }

        function s(t, e, r, n) {
            var i = l.fromBuffer(e);
            return o(t, i, r, n)
        }

        function a(t, e, r, n) {
            f.strictEqual(3 & n, n, "Recovery param is more than two bits");
            var i = t.n,
                o = t.G,
                s = r.r,
                a = r.s;
            f(s.signum() > 0 && s.compareTo(i) < 0, "Invalid r value"), f(a.signum() > 0 && a.compareTo(i) < 0, "Invalid s value");
            var u = 1 & n,
                c = n >> 1,
                h = c ? s.add(i) : s,
                l = t.pointFromX(u, h),
                p = l.multiply(i);
            f(t.isInfinity(p), "nR is not a valid curve point");
            var d = e.negate().mod(i),
                v = s.modInverse(i),
                y = l.multiplyTwo(a, o, d).multiply(v);
            return t.validate(y), y
        }

        function u(t, e, r, n) {
            for (var i = 0; i < 4; i++) {
                var o = a(t, e, r, i);
                if (o.equals(n)) return i
            }
            throw new Error("Unable to find valid recovery factor")
        }
        var f = r(127),
            c = r(131),
            h = r(212),
            l = r(200),
            p = r(213);
        t.exports = {
            calcPubKeyRecoveryParam: u,
            deterministicGenerateK: n,
            recoverPubKey: a,
            sign: i,
            verify: s,
            verifyRaw: o
        }
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function r(t) {
            var e = t.toString().match(/function (.*?)\(/);
            return e ? e[1] : null
        }
        t.exports = function(t, n) {
            switch (t) {
                case "Array":
                    if (Array.isArray(n)) return;
                    break;
                case "Boolean":
                    if ("boolean" == typeof n) return;
                    break;
                case "Buffer":
                    if (e.isBuffer(n)) return;
                    break;
                case "Number":
                    if ("number" == typeof n) return;
                    break;
                case "String":
                    if ("string" == typeof n) return;
                    break;
                default:
                    if (r(n.constructor) === r(t)) return
            }
            throw new TypeError("Expected " + (r(t) || t) + ", got " + n)
        }
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n(t, e) {
            o(s, t), o(s, e), this.r = t, this.s = e
        }
        var i = r(127),
            o = r(212),
            s = r(200);
        n.parseCompact = function(t) {
            i.equal(t.length, 65, "Invalid signature length");
            var e = t.readUInt8(0) - 27;
            i.equal(e, 7 & e, "Invalid signature parameter");
            var r = !!(4 & e);
            e &= 3;
            var o = s.fromBuffer(t.slice(1, 33)),
                a = s.fromBuffer(t.slice(33));
            return {
                compressed: r,
                i: e,
                signature: new n(o, a)
            }
        }, n.fromDER = function(t) {
            i.equal(t.readUInt8(0), 48, "Not a DER sequence"), i.equal(t.readUInt8(1), t.length - 2, "Invalid sequence length"), i.equal(t.readUInt8(2), 2, "Expected a DER integer");
            var e = t.readUInt8(3);
            i(e > 0, "R length is zero");
            var r = 4 + e;
            i.equal(t.readUInt8(r), 2, "Expected a DER integer (2)");
            var o = t.readUInt8(r + 1);
            i(o > 0, "S length is zero");
            var a = t.slice(4, r),
                u = t.slice(r + 2);
            r += 2 + o, e > 1 && 0 === a.readUInt8(0) && i(128 & a.readUInt8(1), "R value excessively padded"), o > 1 && 0 === u.readUInt8(0) && i(128 & u.readUInt8(1), "S value excessively padded"), i.equal(r, t.length, "Invalid DER encoding");
            var f = s.fromDERInteger(a),
                c = s.fromDERInteger(u);
            return i(f.signum() >= 0, "R value is negative"), i(c.signum() >= 0, "S value is negative"), new n(f, c)
        }, n.parseScriptSignature = function(t) {
            var e = t.readUInt8(t.length - 1),
                r = e & -129;
            return i(r > 0 && r < 4, "Invalid hashType"), {
                signature: n.fromDER(t.slice(0, -1)),
                hashType: e
            }
        }, n.prototype.toCompact = function(t, r) {
            r && (t += 4), t += 27;
            var n = new e(65);
            return n.writeUInt8(t, 0), this.r.toBuffer(32).copy(n, 1), this.s.toBuffer(32).copy(n, 33), n
        }, n.prototype.toDER = function() {
            var t = this.r.toDERInteger(),
                r = this.s.toDERInteger(),
                n = [];
            return n.push(2, t.length), n = n.concat(t), n.push(2, r.length), n = n.concat(r), n.unshift(48, n.length), new e(n)
        }, n.prototype.toScriptSignature = function(t) {
            var r = new e(1);
            return r.writeUInt8(t, 0), e.concat([this.toDER(), r])
        }, t.exports = n
    }).call(e, r(123).Buffer)
}, function(t, e) {
    "use strict";

    function r(t) {
        if ("string" != typeof t) throw new Error("string required for brain_key");
        return t = t.trim(), t.split(/[\t\n\v\f\r ]+/).join(" ")
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    }), e.normalize = r
}, function(t, e, r) {
    (function(e) {
        "use strict";
        var n = r(209),
            i = r(131),
            o = r(174),
            s = 250,
            a = 0,
            u = 0,
            f = o.randomBuffer(101);
        t.exports = {
            addEntropy: function() {
                u++;
                for (var t = arguments.length, e = Array(t), r = 0; r < t; r++) e[r] = arguments[r];
                var n = !0,
                    i = !1,
                    o = void 0;
                try {
                    for (var s, c = e[Symbol.iterator](); !(n = (s = c.next()).done); n = !0) {
                        var h = s.value,
                            l = a++ % 101,
                            p = f[l] += h;
                        p > 9007199254740991 && (f[l] = 0)
                    }
                } catch (t) {
                    i = !0, o = t
                } finally {
                    try {
                        !n && c.return && c.return()
                    } finally {
                        if (i) throw o
                    }
                }
            },
            random32ByteBuffer: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.browserEntropy();
                if ("string" != typeof t) throw new Error("string required for entropy");
                if (t.length < 32) throw new Error("expecting at least 32 bytes of entropy");
                for (var r = Date.now(); Date.now() - r < s;) t = i.sha256(t);
                var n = [];
                return n.push(t), n.push(o.randomBuffer(32)), i.sha256(e.concat(n))
            },
            get_random_key: function(t) {
                return n.fromBuffer(this.random32ByteBuffer(t))
            },
            browserEntropy: function() {
                var t = Array(f).join();
                try {
                    t += (new Date).toString() + " " + window.screen.height + " " + window.screen.width + " " + window.screen.colorDepth + "  " + window.screen.availHeight + " " + window.screen.availWidth + " " + window.screen.pixelDepth + navigator.language + " " + window.location + " " + window.history.length;
                    for (var r, n = 0; n < navigator.mimeTypes.length; n++) r = navigator.mimeTypes[n], t += r.description + " " + r.type + " " + r.suffixes + " ";
                    console.log("INFO\tbrowserEntropy gathered", u, "events")
                } catch (e) {
                    t += i.sha256((new Date).toString())
                }
                var o = new e(t);
                return t += o.toString("binary") + " " + (new Date).toString()
            }
        }
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    "use strict";
    t.exports = {
        Serializer: r(217),
        fp: r(219),
        types: r(220),
        ops: r(225),
        template: r(226),
        number_utils: r(221)
    }
}, function(t, e, r) {
    (function(e, n) {
        "use strict";

        function i(t, e) {
            if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
        }
        var o = function() {
                function t(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                    }
                }
                return function(e, r, n) {
                    return r && t(e.prototype, r), n && t(e, n), e
                }
            }(),
            s = r(176),
            a = r(218),
            u = e.env.npm_config__graphene_serializer_hex_dump,
            f = function() {
                function t(e, r) {
                    i(this, t), this.operation_name = e, this.types = r, this.types && (this.keys = Object.keys(this.types)), t.printDebug = !0
                }
                return o(t, [{
                    key: "fromByteBuffer",
                    value: function(e) {
                        var r = {},
                            n = null;
                        try {
                            for (var n, i = this.keys, o = 0; o < i.length; o++) {
                                n = i[o];
                                var s = this.types[n];
                                try {
                                    if (u)
                                        if (s.operation_name) console.error(s.operation_name);
                                        else {
                                            var f = e.offset;
                                            s.fromByteBuffer(e);
                                            var c = e.offset;
                                            e.offset = f;
                                            var h = e.copy(f, c);
                                            console.error(this.operation_name + "." + n + "\t", h.toHex())
                                        }
                                    r[n] = s.fromByteBuffer(e)
                                } catch (r) {
                                    throw t.printDebug && (console.error("Error reading " + this.operation_name + "." + n + " in data:"), e.printDebug()), r
                                }
                            }
                        } catch (t) {
                            a.throw(this.operation_name + "." + n, t)
                        }
                        return r
                    }
                }, {
                    key: "appendByteBuffer",
                    value: function(t, e) {
                        var r = null;
                        try {
                            for (var r, n = this.keys, i = 0; i < n.length; i++) {
                                r = n[i];
                                var o = this.types[r];
                                o.appendByteBuffer(t, e[r])
                            }
                        } catch (t) {
                            try {
                                a.throw(this.operation_name + "." + r + " = " + JSON.stringify(e[r]), t)
                            } catch (n) {
                                a.throw(this.operation_name + "." + r + " = " + e[r], t)
                            }
                        }
                    }
                }, {
                    key: "fromObject",
                    value: function(t) {
                        var e = {},
                            r = null;
                        try {
                            for (var r, n = this.keys, i = 0; i < n.length; i++) {
                                r = n[i];
                                var o = this.types[r],
                                    s = t[r],
                                    u = o.fromObject(s);
                                e[r] = u
                            }
                        } catch (t) {
                            a.throw(this.operation_name + "." + r, t)
                        }
                        return e
                    }
                }, {
                    key: "toObject",
                    value: function() {
                        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
                            e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {
                                use_default: !1,
                                annotate: !1
                            },
                            r = {},
                            n = null;
                        try {
                            if (!this.types) return r;
                            for (var n, i = this.keys, o = 0; o < i.length; o++) {
                                n = i[o];
                                var f = this.types[n],
                                    c = f.toObject("undefined" != typeof t && null !== t ? t[n] : void 0, e);
                                if (r[n] = c, u) {
                                    var h = new s(s.DEFAULT_CAPACITY, s.LITTLE_ENDIAN),
                                        l = "undefined" != typeof t && null !== t;
                                    if (l) {
                                        var p = t[n];
                                        p && f.appendByteBuffer(h, p)
                                    }
                                    h = h.copy(0, h.offset), console.error(this.operation_name + "." + n, h.toHex())
                                }
                            }
                        } catch (t) {
                            a.throw(this.operation_name + "." + n, t)
                        }
                        return r
                    }
                }, {
                    key: "compare",
                    value: function(t, e) {
                        var r = this.keys[0],
                            i = this.types[r],
                            o = t[r],
                            s = e[r];
                        if (i.compare) return i.compare(o, s);
                        if ("number" == typeof o && "number" == typeof s) return o - s;
                        var a = void 0;
                        n.isBuffer(o) && n.isBuffer(s) && (a = "hex");
                        var u = o.toString(a),
                            f = s.toString(a);
                        return u > f ? 1 : u < f ? -1 : 0
                    }
                }, {
                    key: "fromHex",
                    value: function(t) {
                        var e = s.fromHex(t, s.LITTLE_ENDIAN);
                        return this.fromByteBuffer(e)
                    }
                }, {
                    key: "fromBuffer",
                    value: function(t) {
                        var e = s.fromBinary(t.toString("binary"), s.LITTLE_ENDIAN);
                        return this.fromByteBuffer(e)
                    }
                }, {
                    key: "toHex",
                    value: function(t) {
                        var e = this.toByteBuffer(t);
                        return e.toHex()
                    }
                }, {
                    key: "toByteBuffer",
                    value: function(t) {
                        var e = new s(s.DEFAULT_CAPACITY, s.LITTLE_ENDIAN);
                        return this.appendByteBuffer(e, t), e.copy(0, e.offset)
                    }
                }, {
                    key: "toBuffer",
                    value: function(t) {
                        return new n(this.toByteBuffer(t).toBinary(), "binary")
                    }
                }]), t
            }();
        t.exports = f
    }).call(e, r(5), r(123).Buffer)
}, function(t, e) {
    "use strict";

    function r(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    var n = function() {
            function t(t, e) {
                for (var r = 0; r < e.length; r++) {
                    var n = e[r];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                }
            }
            return function(e, r, n) {
                return r && t(e.prototype, r), n && t(e, n), e
            }
        }(),
        i = function() {
            function t(e, n) {
                r(this, t), this.message = e, ("undefined" != typeof n && null !== n ? n.message : void 0) && (this.message = "cause\t" + n.message + "\t" + this.message);
                var i = "";
                ("undefined" != typeof n && null !== n ? n.stack : void 0) && (i = "caused by\n\t" + n.stack + "\t" + i), this.stack = this.message + "\n" + i
            }
            return n(t, null, [{
                key: "throw",
                value: function(t, e) {
                    var r = t;
                    throw ("undefined" != typeof e && null !== e ? e.message : void 0) && (r += "\t cause: " + e.message + " "), ("undefined" != typeof e && null !== e ? e.stack : void 0) && (r += "\n stack: " + e.stack + " "), new Error(r)
                }
            }]), t
        }();
    t.exports = i
}, function(t, e, r) {
    (function(e) {
        "use strict";

        function n(t, e) {
            if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
        }
        var i = function() {
                function t(t, e) {
                    for (var r = 0; r < e.length; r++) {
                        var n = e[r];
                        n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                    }
                }
                return function(e, r, n) {
                    return r && t(e.prototype, r), n && t(e, n), e
                }
            }(),
            o = r(121),
            s = function() {
                function t() {
                    n(this, t)
                }
                return i(t, null, [{
                    key: "fixed_data",
                    value: function(t, r, n) {
                        if (t) {
                            if (!n) {
                                var i = t.copy(t.offset, t.offset + r);
                                return t.skip(r), new e(i.toBinary(), "binary")
                            }
                            var o = n.slice(0, r).toString("binary");
                            for (t.append(o, "binary"); r-- > o.length;) t.writeUint8(0)
                        }
                    }
                }, {
                    key: "public_key",
                    value: function(e, r) {
                        if (e) {
                            if (r) {
                                var n = r.toBuffer();
                                return void e.append(n.toString("binary"), "binary")
                            }
                            return n = t.fixed_data(e, 33), o.PublicKey.fromBuffer(n)
                        }
                    }
                }, {
                    key: "ripemd160",
                    value: function(e, r) {
                        if (e) return r ? void t.fixed_data(e, 20, r) : t.fixed_data(e, 20)
                    }
                }, {
                    key: "time_point_sec",
                    value: function(t, e) {
                        return e ? (e = Math.ceil(e / 1e3), void t.writeInt32(e)) : (e = t.readInt32(), new Date(1e3 * e))
                    }
                }]), t
            }();
        t.exports = s
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(e, n) {
        "use strict";
        var i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
                return typeof t
            } : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
            },
            o = function() {
                function t(t, e) {
                    var r = [],
                        n = !0,
                        i = !1,
                        o = void 0;
                    try {
                        for (var s, a = t[Symbol.iterator](); !(n = (s = a.next()).done) && (r.push(s.value), !e || r.length !== e); n = !0);
                    } catch (t) {
                        i = !0, o = t
                    } finally {
                        try {
                            !n && a.return && a.return()
                        } finally {
                            if (i) throw o
                        }
                    }
                    return r
                }
                return function(e, r) {
                    if (Array.isArray(e)) return e;
                    if (Symbol.iterator in Object(e)) return t(e, r);
                    throw new TypeError("Invalid attempt to destructure non-iterable instance")
                }
            }(),
            s = r(121),
            a = r(221),
            u = r(222),
            f = r(224),
            c = r(219),
            h = r(223),
            l = {};
        t.exports = l;
        var p = e.env.npm_config__graphene_serializer_hex_dump;
        l.asset = {
            fromByteBuffer: function(t) {
                var e = t.readInt64(),
                    r = t.readUint8(),
                    i = t.copy(t.offset, t.offset + 7),
                    o = new n(i.toBinary(), "binary").toString().replace(/\x00/g, "");
                t.skip(7);
                var s = (0, a.fromImpliedDecimal)(e, r);
                return s + " " + o
            },
            appendByteBuffer: function(t, e) {
                if (e = e.trim(), !/^[0-9]+\.?[0-9]* [A-Za-z0-9]+$/.test(e)) throw new Error("Expecting amount like '99.000 SYMBOL', instead got '" + e + "'");
                var r = e.split(" "),
                    n = o(r, 2),
                    i = n[0],
                    s = n[1];
                if (s.length > 6) throw new Error("Symbols are not longer than 6 characters " + s + "-" + s.length);
                t.writeInt64(u.to_long(i.replace(".", "")));
                var a = i.indexOf("."),
                    f = a === -1 ? 0 : i.length - a - 1;
                t.writeUint8(f), t.append(s.toUpperCase(), "binary");
                for (var c = 0; c < 7 - s.length; c++) t.writeUint8(0)
            },
            fromObject: function(t) {
                return t
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? "0.000 STEEM" : t
            }
        }, l.uint8 = {
            fromByteBuffer: function(t) {
                return t.readUint8()
            },
            appendByteBuffer: function(t, e) {
                u.require_range(0, 255, e, "uint8 " + e), t.writeUint8(e)
            },
            fromObject: function(t) {
                return u.require_range(0, 255, t, "uint8 " + t), t
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? 0 : (u.require_range(0, 255, t, "uint8 " + t), parseInt(t))
            }
        }, l.uint16 = {
            fromByteBuffer: function(t) {
                return t.readUint16()
            },
            appendByteBuffer: function(t, e) {
                u.require_range(0, 65535, e, "uint16 " + e), t.writeUint16(e)
            },
            fromObject: function(t) {
                return u.require_range(0, 65535, t, "uint16 " + t), t
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? 0 : (u.require_range(0, 65535, t, "uint16 " + t), parseInt(t))
            }
        }, l.uint32 = {
            fromByteBuffer: function(t) {
                return t.readUint32()
            },
            appendByteBuffer: function(t, e) {
                u.require_range(0, 4294967295, e, "uint32 " + e), t.writeUint32(e)
            },
            fromObject: function(t) {
                return u.require_range(0, 4294967295, t, "uint32 " + t), t
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? 0 : (u.require_range(0, 4294967295, t, "uint32 " + t), parseInt(t))
            }
        };
        var d = -1 * Math.pow(2, 31),
            v = Math.pow(2, 31) - 1;
        l.varint32 = {
            fromByteBuffer: function(t) {
                return t.readVarint32()
            },
            appendByteBuffer: function(t, e) {
                u.require_range(d, v, e, "uint32 " + e), t.writeVarint32(e)
            },
            fromObject: function(t) {
                return u.require_range(d, v, t, "uint32 " + t), t
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? 0 : (u.require_range(d, v, t, "uint32 " + t), parseInt(t))
            }
        }, l.int16 = {
            fromByteBuffer: function(t) {
                return t.readInt16()
            },
            appendByteBuffer: function(t, e) {
                t.writeInt16(e)
            },
            fromObject: function(t) {
                return t
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? 0 : parseInt(t)
            }
        }, l.int64 = {
            fromByteBuffer: function(t) {
                return t.readInt64()
            },
            appendByteBuffer: function(t, e) {
                u.required(e), t.writeInt64(u.to_long(e))
            },
            fromObject: function(t) {
                return u.required(t), u.to_long(t)
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? "0" : (u.required(t), u.to_long(t).toString())
            }
        }, l.uint64 = {
            fromByteBuffer: function(t) {
                return t.readUint64()
            },
            appendByteBuffer: function(t, e) {
                t.writeUint64(u.to_long(u.unsigned(e)))
            },
            fromObject: function(t) {
                return u.to_long(u.unsigned(t))
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? "0" : u.to_long(t).toString()
            }
        }, l.string = {
            fromByteBuffer: function(t) {
                return new n(t.readVString(), "utf8")
            },
            appendByteBuffer: function(t, e) {
                u.required(e), t.writeVString(e.toString())
            },
            fromObject: function(t) {
                return u.required(t), new n(t, "utf8")
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? "" : t.toString("utf8")
            }
        }, l.string_binary = {
            fromByteBuffer: function(t) {
                var e, r = t.readVarint32();
                return e = t.copy(t.offset, t.offset + r), t.skip(r), new n(e.toBinary(), "binary")
            },
            appendByteBuffer: function(t, e) {
                t.writeVarint32(e.length), t.append(e.toString("binary"), "binary")
            },
            fromObject: function(t) {
                return u.required(t), new n(t)
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? "" : t.toString()
            }
        }, l.bytes = function(t) {
            return {
                fromByteBuffer: function(e) {
                    if (void 0 === t) {
                        var r, i = e.readVarint32();
                        return r = e.copy(e.offset, e.offset + i), e.skip(i), new n(r.toBinary(), "binary")
                    }
                    return r = e.copy(e.offset, e.offset + t), e.skip(t), new n(r.toBinary(), "binary")
                },
                appendByteBuffer: function(e, r) {
                    u.required(r), "string" == typeof r && (r = new n(r, "hex")), void 0 === t && e.writeVarint32(r.length), e.append(r.toString("binary"), "binary")
                },
                fromObject: function(t) {
                    return u.required(t), n.isBuffer(t) ? t : new n(t, "hex")
                },
                toObject: function(e) {
                    var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                    if (r.use_default && void 0 === e) {
                        var n = function(t) {
                            return new Array(t).join("00")
                        };
                        return n(t)
                    }
                    return u.required(e), e.toString("hex")
                }
            }
        }, l.bool = {
            fromByteBuffer: function(t) {
                return 1 === t.readUint8()
            },
            appendByteBuffer: function(t, e) {
                t.writeUint8(JSON.parse(e) ? 1 : 0)
            },
            fromObject: function(t) {
                return !!JSON.parse(t)
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return (!e.use_default || void 0 !== t) && !!JSON.parse(t)
            }
        }, l.void = {
            fromByteBuffer: function(t) {
                throw new Error("(void) undefined type")
            },
            appendByteBuffer: function(t, e) {
                throw new Error("(void) undefined type")
            },
            fromObject: function(t) {
                throw new Error("(void) undefined type")
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                if (!e.use_default || void 0 !== t) throw new Error("(void) undefined type")
            }
        }, l.array = function(t) {
            return {
                fromByteBuffer: function(e) {
                    var r = e.readVarint32();
                    p && console.log("varint32 size = " + r.toString(16));
                    for (var n = [], i = 0; 0 < r ? i < r : i > r; 0 < r ? i++ : i++) n.push(t.fromByteBuffer(e));
                    return m(n, t)
                },
                appendByteBuffer: function(e, r) {
                    u.required(r), r = m(r, t), e.writeVarint32(r.length);
                    for (var n, i = 0; i < r.length; i++) n = r[i], t.appendByteBuffer(e, n)
                },
                fromObject: function(e) {
                    u.required(e), e = m(e, t);
                    for (var r, n = [], i = 0; i < e.length; i++) r = e[i], n.push(t.fromObject(r));
                    return n
                },
                toObject: function(e) {
                    var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                    if (r.use_default && void 0 === e) return [t.toObject(e, r)];
                    u.required(e), e = m(e, t);
                    for (var n, i = [], o = 0; o < e.length; o++) n = e[o], i.push(t.toObject(n, r));
                    return i
                }
            }
        }, l.time_point_sec = {
            fromByteBuffer: function(t) {
                return t.readUint32()
            },
            appendByteBuffer: function(t, e) {
                "number" != typeof e && (e = l.time_point_sec.fromObject(e)), t.writeUint32(e)
            },
            fromObject: function(t) {
                if (u.required(t), "number" == typeof t) return t;
                if (t.getTime) return Math.floor(t.getTime() / 1e3);
                if ("string" != typeof t) throw new Error("Unknown date type: " + t);
                return "string" != typeof t || /Z$/.test(t) || (t += "Z"), Math.floor(new Date(t).getTime() / 1e3)
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                if (e.use_default && void 0 === t) return new Date(0).toISOString().split(".")[0];
                if (u.required(t), "string" == typeof t) return t;
                if (t.getTime) return t.toISOString().split(".")[0];
                var r = parseInt(t);
                return u.require_range(0, 4294967295, r, "uint32 " + t),
                    new Date(1e3 * r).toISOString().split(".")[0]
            }
        }, l.set = function(t) {
            return {
                validate: function(e) {
                    for (var r, n = {}, o = 0; o < e.length; o++) {
                        r = e[o];
                        var s;
                        if (s = "undefined" == typeof r ? "undefined" : i(r), ["string", "number"].indexOf(s) >= 0) {
                            if (void 0 !== n[r]) throw new Error("duplicate (set)");
                            n[r] = !0
                        }
                    }
                    return m(e, t)
                },
                fromByteBuffer: function(e) {
                    var r = e.readVarint32();
                    return p && console.log("varint32 size = " + r.toString(16)), this.validate(function() {
                        for (var n = [], i = 0; 0 < r ? i < r : i > r; 0 < r ? i++ : i++) n.push(t.fromByteBuffer(e));
                        return n
                    }())
                },
                appendByteBuffer: function(e, r) {
                    r || (r = []), e.writeVarint32(r.length);
                    for (var n, i = this.validate(r), o = 0; o < i.length; o++) n = i[o], t.appendByteBuffer(e, n)
                },
                fromObject: function(e) {
                    return e || (e = []), this.validate(function() {
                        for (var r, n = [], i = 0; i < e.length; i++) r = e[i], n.push(t.fromObject(r));
                        return n
                    }())
                },
                toObject: function(e) {
                    var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                    return r.use_default && void 0 === e ? [t.toObject(e, r)] : (e || (e = []), this.validate(function() {
                        for (var n, i = [], o = 0; o < e.length; o++) n = e[o], i.push(t.toObject(n, r));
                        return i
                    }()))
                }
            }
        }, l.fixed_array = function(t, e) {
            return {
                fromByteBuffer: function(r) {
                    var n, i, o, s;
                    for (s = [], n = i = 0, o = t; i < o; n = i += 1) s.push(e.fromByteBuffer(r));
                    return m(s, e)
                },
                appendByteBuffer: function(r, n) {
                    var i, o, s;
                    for (0 !== t && (u.required(n), n = m(n, e)), i = o = 0, s = t; o < s; i = o += 1) e.appendByteBuffer(r, n[i])
                },
                fromObject: function(r) {
                    var n, i, o, s;
                    for (0 !== t && u.required(r), s = [], n = i = 0, o = t; i < o; n = i += 1) s.push(e.fromObject(r[n]));
                    return s
                },
                toObject: function(r, n) {
                    var i, o, s, a, f, c, h;
                    if (null == n && (n = {}), n.use_default && void 0 === r) {
                        for (c = [], i = o = 0, a = t; o < a; i = o += 1) c.push(e.toObject(void 0, n));
                        return c
                    }
                    for (0 !== t && u.required(r), h = [], i = s = 0, f = t; s < f; i = s += 1) h.push(e.toObject(r[i], n));
                    return h
                }
            }
        };
        var y = function(t, e) {
            return u.required(t, "reserved_spaces"), u.required(e, "object_type"), {
                fromByteBuffer: function(t) {
                    return t.readVarint32()
                },
                appendByteBuffer: function(r, n) {
                    u.required(n), void 0 !== n.resolve && (n = n.resolve), /^[0-9]+\.[0-9]+\.[0-9]+$/.test(n) && (n = u.get_instance(t, e, n)), r.writeVarint32(u.to_number(n))
                },
                fromObject: function(r) {
                    return u.required(r), void 0 !== r.resolve && (r = r.resolve), u.is_digits(r) ? u.to_number(r) : u.get_instance(t, e, r)
                },
                toObject: function(r) {
                    var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                        i = h.object_type[e];
                    return n.use_default && void 0 === r ? t + "." + i + ".0" : (u.required(r), void 0 !== r.resolve && (r = r.resolve), /^[0-9]+\.[0-9]+\.[0-9]+$/.test(r) && (r = u.get_instance(t, e, r)), t + "." + i + "." + r)
                }
            }
        };
        l.protocol_id_type = function(t) {
            return u.required(t, "name"), y(h.reserved_spaces.protocol_ids, t)
        }, l.object_id_type = {
            fromByteBuffer: function(t) {
                return f.fromByteBuffer(t)
            },
            appendByteBuffer: function(t, e) {
                u.required(e), void 0 !== e.resolve && (e = e.resolve), e = f.fromString(e), e.appendByteBuffer(t)
            },
            fromObject: function(t) {
                return u.required(t), void 0 !== t.resolve && (t = t.resolve), f.fromString(t)
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? "0.0.0" : (u.required(t), void 0 !== t.resolve && (t = t.resolve), t = f.fromString(t), t.toString())
            }
        }, l.vote_id = {
            TYPE: 255,
            ID: 4294967040,
            fromByteBuffer: function(t) {
                var e = t.readUint32();
                return {
                    type: e & this.TYPE,
                    id: e & this.ID
                }
            },
            appendByteBuffer: function(t, e) {
                u.required(e), "string" === e && (e = l.vote_id.fromObject(e));
                var r = e.id << 8 | e.type;
                t.writeUint32(r)
            },
            fromObject: function(t) {
                if (u.required(t, "(type vote_id)"), "object" === ("undefined" == typeof t ? "undefined" : i(t))) return u.required(t.type, "type"), u.required(t.id, "id"), t;
                u.require_test(/^[0-9]+:[0-9]+$/, t, "vote_id format " + t);
                var e = t.split(":"),
                    r = o(e, 2),
                    n = r[0],
                    s = r[1];
                return u.require_range(0, 255, n, "vote type " + t), u.require_range(0, 16777215, s, "vote id " + t), {
                    type: n,
                    id: s
                }
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? "0:0" : (u.required(t), "string" == typeof t && (t = l.vote_id.fromObject(t)), t.type + ":" + t.id)
            },
            compare: function(t, e) {
                return "object" !== ("undefined" == typeof t ? "undefined" : i(t)) && (t = l.vote_id.fromObject(t)), "object" !== ("undefined" == typeof e ? "undefined" : i(e)) && (e = l.vote_id.fromObject(e)), parseInt(t.id) - parseInt(e.id)
            }
        }, l.optional = function(t) {
            return u.required(t, "st_operation"), {
                fromByteBuffer: function(e) {
                    if (1 === e.readUint8()) return t.fromByteBuffer(e)
                },
                appendByteBuffer: function(e, r) {
                    null !== r && void 0 !== r ? (e.writeUint8(1), t.appendByteBuffer(e, r)) : e.writeUint8(0)
                },
                fromObject: function(e) {
                    if (void 0 !== e) return t.fromObject(e)
                },
                toObject: function(e) {
                    var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                        n = function() {
                            return r.use_default || void 0 !== e ? t.toObject(e, r) : void 0
                        }();
                    return r.annotate && ("object" === ("undefined" == typeof n ? "undefined" : i(n)) ? n.__optional = "parent is optional" : n = {
                        __optional: n
                    }), n
                }
            }
        }, l.static_variant = function(t) {
            return {
                nosort: !0,
                st_operations: t,
                opTypeId: function(t) {
                    var e = 0,
                        r = void 0;
                    if ("number" == typeof t) r = t;
                    else {
                        var n = !0,
                            i = !1,
                            o = void 0;
                        try {
                            for (var s, a = this.st_operations[Symbol.iterator](); !(n = (s = a.next()).done); n = !0) {
                                var u = s.value;
                                if (u.operation_name === t) {
                                    r = e;
                                    break
                                }
                                e++
                            }
                        } catch (t) {
                            i = !0, o = t
                        } finally {
                            try {
                                !n && a.return && a.return()
                            } finally {
                                if (i) throw o
                            }
                        }
                    }
                    return r
                },
                fromByteBuffer: function(t) {
                    var e = t.readVarint32(),
                        r = this.st_operations[e];
                    return p && console.error("static_variant id 0x" + e.toString(16) + " (" + e + ")"), u.required(r, "operation " + e), [e, r.fromByteBuffer(t)]
                },
                appendByteBuffer: function(t, e) {
                    u.required(e);
                    var r = this.opTypeId(e[0]),
                        n = this.st_operations[r];
                    u.required(n, "operation " + r), t.writeVarint32(r), n.appendByteBuffer(t, e[1])
                },
                fromObject: function(t) {
                    u.required(t);
                    var e = this.opTypeId(t[0]),
                        r = this.st_operations[e];
                    return u.required(r, "operation " + e), [e, r.fromObject(t[1])]
                },
                toObject: function(t) {
                    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                    if (e.use_default && void 0 === t) return [this.st_operations[0].operation_name, this.st_operations[0].toObject(void 0, e)];
                    u.required(t);
                    var r = this.opTypeId(t[0]),
                        n = this.st_operations[r];
                    return u.required(n, "operation " + r), [n.operation_name, n.toObject(t[1], e)]
                },
                compare: function(t, e) {
                    return g(this.opTypeId(t[0]), this.opTypeId(e[0]))
                }
            }
        }, l.map = function(t, e) {
            return {
                validate: function(e) {
                    if (!Array.isArray(e)) throw new Error("expecting array");
                    for (var r, n = {}, o = 0; o < e.length; o++) {
                        r = e[o];
                        var s;
                        if (2 !== r.length) throw new Error("expecting two elements");
                        if (s = i(r[0]), ["number", "string"].indexOf(s) >= 0) {
                            if (void 0 !== n[r[0]]) throw new Error("duplicate (map)");
                            n[r[0]] = !0
                        }
                    }
                    return m(e, t)
                },
                fromByteBuffer: function(r) {
                    for (var n = [], i = r.readVarint32(), o = 0; 0 < i ? o < i : o > i; 0 < i ? o++ : o++) n.push([t.fromByteBuffer(r), e.fromByteBuffer(r)]);
                    return this.validate(n)
                },
                appendByteBuffer: function(r, n) {
                    this.validate(n), r.writeVarint32(n.length);
                    for (var i, o = 0; o < n.length; o++) i = n[o], t.appendByteBuffer(r, i[0]), e.appendByteBuffer(r, i[1])
                },
                fromObject: function(r) {
                    u.required(r);
                    for (var n, i = [], o = 0; o < r.length; o++) n = r[o], i.push([t.fromObject(n[0]), e.fromObject(n[1])]);
                    return this.validate(i)
                },
                toObject: function(r) {
                    var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                    if (n.use_default && void 0 === r) return [
                        [t.toObject(void 0, n), e.toObject(void 0, n)]
                    ];
                    u.required(r), r = this.validate(r);
                    for (var i, o = [], s = 0; s < r.length; s++) i = r[s], o.push([t.toObject(i[0], n), e.toObject(i[1], n)]);
                    return o
                }
            }
        }, l.public_key = {
            toPublic: function(t) {
                return void 0 !== t.resolve && (t = t.resolve), null == t ? t : t.Q ? t : s.PublicKey.fromStringOrThrow(t)
            },
            fromByteBuffer: function(t) {
                return c.public_key(t)
            },
            appendByteBuffer: function(t, e) {
                u.required(e), c.public_key(t, l.public_key.toPublic(e))
            },
            fromObject: function(t) {
                return u.required(t), t.Q ? t : l.public_key.toPublic(t)
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? s.ecc_config.get("address_prefix") + "859gxfnXyUriMgUeThh1fWv3oqcpLFyHa3TfFYC4PK2HqhToVM" : (u.required(t), t.toString())
            },
            compare: function(t, e) {
                return 1 * g(t.toString(), e.toString())
            }
        }, l.address = {
            _to_address: function(t) {
                return u.required(t), t.addy ? t : s.Address.fromString(t)
            },
            fromByteBuffer: function(t) {
                return new s.Address(c.ripemd160(t))
            },
            appendByteBuffer: function(t, e) {
                c.ripemd160(t, l.address._to_address(e).toBuffer())
            },
            fromObject: function(t) {
                return l.address._to_address(t)
            },
            toObject: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return e.use_default && void 0 === t ? s.ecc_config.get("address_prefix") + "664KmHxSuQyDsfwo4WEJvWpzg1QKdg67S" : l.address._to_address(t).toString()
            },
            compare: function(t, e) {
                return -1 * g(t.toString(), e.toString())
            }
        };
        var g = function(t, e) {
                return t > e ? 1 : t < e ? -1 : 0
            },
            _ = function(t) {
                return Array.isArray(t) ? t[0] : t
            },
            m = function(t, e) {
                return e.nosort ? t : e.compare ? t.sort(function(t, r) {
                    return e.compare(_(t), _(r))
                }) : t.sort(function(t, e) {
                    return "number" == typeof _(t) && "number" == typeof _(e) ? _(t) - _(e) : n.isBuffer(_(t)) && n.isBuffer(_(e)) ? g(_(t).toString("hex"), _(e).toString("hex")) : g(_(t).toString(), _(e).toString())
                })
            }
    }).call(e, r(5), r(123).Buffer)
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }

    function i(t, e) {
        "number" == typeof t ? ((0, f.default)(t <= 9007199254740991, "overflow"), t = "" + t) : t.toString && (t = t.toString()), (0, f.default)("string" == typeof t, "number should be an actual number or string: " + ("undefined" == typeof t ? "undefined" : a(t))), t = t.trim(), (0, f.default)(/^[0-9]*\.?[0-9]*$/.test(t), "Invalid decimal number " + t);
        var r = t.split("."),
            n = s(r, 2),
            i = n[0],
            o = void 0 === i ? "" : i,
            u = n[1],
            c = void 0 === u ? "" : u,
            h = e - c.length;
        (0, f.default)(h >= 0, "Too many decimal digits in " + t + " to create an implied decimal of " + e);
        for (var l = 0; l < h; l++) c += "0";
        for (;
            "0" === o.charAt(0);) o = o.substring(1);
        return o + c
    }

    function o(t, e) {
        for ("number" == typeof t ? ((0, f.default)(t <= 9007199254740991, "overflow"), t = "" + t) : t.toString && (t = t.toString()); t.length < e + 1;) t = "0" + t;
        var r = t.substring(t.length - e);
        return t.substring(0, t.length - e) + (r ? "." + r : "")
    }
    Object.defineProperty(e, "__esModule", {
        value: !0
    });
    var s = function() {
            function t(t, e) {
                var r = [],
                    n = !0,
                    i = !1,
                    o = void 0;
                try {
                    for (var s, a = t[Symbol.iterator](); !(n = (s = a.next()).done) && (r.push(s.value), !e || r.length !== e); n = !0);
                } catch (t) {
                    i = !0, o = t
                } finally {
                    try {
                        !n && a.return && a.return()
                    } finally {
                        if (i) throw o
                    }
                }
                return r
            }
            return function(e, r) {
                if (Array.isArray(e)) return e;
                if (Symbol.iterator in Object(e)) return t(e, r);
                throw new TypeError("Invalid attempt to destructure non-iterable instance")
            }
        }(),
        a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
        } : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        };
    e.toImpliedDecimal = i, e.fromImpliedDecimal = o;
    var u = r(127),
        f = n(u)
}, function(t, e, r) {
    "use strict";
    var n, i, o, s, a, u, f, c, h, l, p, d, v, y, g, _ = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
        } : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        },
        m = r(176).Long,
        b = r(223),
        w = 9007199254740991,
        E = -9007199254740991;
    t.exports = n = {
        is_empty: i = function(t) {
            return null === t || void 0 === t
        },
        required: function(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
            if (i(t)) throw new Error("value required " + e + " " + t);
            return t
        },
        require_long: function(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
            if (!m.isLong(t)) throw new Error("Long value required " + e + " " + t);
            return t
        },
        string: function(t) {
            if (i(t)) return t;
            if ("string" != typeof t) throw new Error("string required: " + t);
            return t
        },
        number: function(t) {
            if (i(t)) return t;
            if ("number" != typeof t) throw new Error("number required: " + t);
            return t
        },
        whole_number: function(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
            if (i(t)) return t;
            if (/\./.test(t)) throw new Error("whole number required " + e + " " + t);
            return t
        },
        unsigned: function(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
            if (i(t)) return t;
            if (/-/.test(t)) throw new Error("unsigned required " + e + " " + t);
            return t
        },
        is_digits: o = function(t) {
            return "numeric" == typeof t || /^[0-9]+$/.test(t)
        },
        to_number: s = function(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
            if (i(t)) return t;
            n.no_overflow53(t, e);
            var r = function() {
                return "number" == typeof t ? t : parseInt(t)
            }();
            return r
        },
        to_long: function(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
            return i(t) ? t : m.isLong(t) ? t : (n.no_overflow64(t, e), "number" == typeof t && (t = "" + t), m.fromString(t))
        },
        to_string: function(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
            if (i(t)) return t;
            if ("string" == typeof t) return t;
            if ("number" == typeof t) return n.no_overflow53(t, e), "" + t;
            if (m.isLong(t)) return t.toString();
            throw "unsupported type " + e + ": (" + ("undefined" == typeof t ? "undefined" : _(t)) + ") " + t
        },
        require_test: function(t, e) {
            var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "";
            if (i(e)) return e;
            if (!t.test(e)) throw new Error("unmatched " + t + " " + r + " " + e);
            return e
        },
        require_match: a = function(t, e) {
            var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "";
            if (i(e)) return e;
            var n = e.match(t);
            if (null === n) throw new Error("unmatched " + t + " " + r + " " + e);
            return n
        },
        require_range: function(t, e, r) {
            var n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : "";
            if (i(r)) return r;
            s(r);
            if (r < t || r > e) throw new Error("out of range " + r + " " + n + " " + r);
            return r
        },
        require_object_type: f = function() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1,
                e = arguments[1],
                r = arguments[2],
                n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : "";
            if (i(r)) return r;
            var o = b.object_type[e];
            if (!o) throw new Error("Unknown object type: " + e + ", " + n + ", " + r);
            var s = new RegExp(t + "." + o + ".[0-9]+$");
            if (!s.test(r)) throw new Error("Expecting " + e + " in format " + (t + "." + o + ".[0-9]+ ") + ("instead of " + r + " " + n + " " + r));
            return r
        },
        get_instance: c = function(t, e, r, n) {
            return i(r) ? r : (f(t, e, r, n), s(r.split(".")[2]))
        },
        require_relative_type: h = function(t, e, r) {
            return f(0, t, e, r), e
        },
        get_relative_instance: l = function(t, e, r) {
            return i(e) ? e : (f(0, t, e, r), s(e.split(".")[2]))
        },
        require_protocol_type: p = function(t, e, r) {
            return f(1, t, e, r), e
        },
        get_protocol_instance: d = function(t, e, r) {
            return i(e) ? e : (f(1, t, e, r), s(e.split(".")[2]))
        },
        get_protocol_type: v = function(t, e) {
            if (i(t)) return t;
            u(t, e);
            var r = t.split(".");
            return s(r[1])
        },
        get_protocol_type_name: function(t, e) {
            if (i(t)) return t;
            var r = v(t, e);
            return Object.keys(b.object_type)[r]
        },
        require_implementation_type: y = function(t, e, r) {
            return f(2, t, e, r), e
        },
        get_implementation_instance: g = function(t, e, r) {
            return i(e) ? e : (f(2, t, e, r), s(e.split(".")[2]))
        },
        no_overflow53: function(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
            if ("number" != typeof t) {
                if ("string" != typeof t) {
                    if (m.isLong(t)) return void n.no_overflow53(t.toInt(), e);
                    throw "unsupported type " + e + ": (" + ("undefined" == typeof t ? "undefined" : _(t)) + ") " + t
                }
                parseInt(t);
                if (t > w || t < E) throw new Error("overflow " + e + " " + t)
            } else if (t > w || t < E) throw new Error("overflow " + e + " " + t)
        },
        no_overflow64: function(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
            if (!m.isLong(t)) {
                if (void 0 !== t.t && void 0 !== t.s) return void n.no_overflow64(t.toString(), e);
                if ("string" != typeof t) {
                    if ("number" != typeof t) throw "unsupported type " + e + ": (" + ("undefined" == typeof t ? "undefined" : _(t)) + ") " + t;
                    if (t > w || t < E) throw new Error("overflow " + e + " " + t)
                } else {
                    for (t = t.replace(/^0+/, "");
                        /0$/.test(t);) t = t.substring(0, t.length - 1);
                    /\.$/.test(t) && (t = t.substring(0, t.length - 1)), "" === t && (t = "0");
                    var r = m.fromString(t).toString();
                    if (r !== t.trim()) throw new Error("overflow " + e + " " + t)
                }
            }
        }
    }
}, function(t, e) {
    "use strict";
    var r;
    t.exports = r = {}, r.reserved_spaces = {
        relative_protocol_ids: 0,
        protocol_ids: 1,
        implementation_ids: 2
    }, r.operations = {
        vote: 0,
        comment: 1,
        transfer: 2,
        transfer_to_vesting: 3,
        withdraw_vesting: 4,
        limit_order_create: 5,
        limit_order_cancel: 6,
        feed_publish: 7,
        convert: 8,
        account_create: 9,
        account_update: 10,
        witness_update: 11,
        account_witness_vote: 12,
        account_witness_proxy: 13,
        pow: 14,
        custom: 15,
        report_over_production: 16,
        delete_comment: 17,
        custom_json: 18,
        comment_options: 19,
        set_withdraw_vesting_route: 20,
        limit_order_create2: 21,
        challenge_authority: 22,
        prove_authority: 23,
        request_account_recovery: 24,
        recover_account: 25,
        change_recovery_account: 26,
        escrow_transfer: 27,
        escrow_dispute: 28,
        escrow_release: 29,
        pow2: 30,
        escrow_approve: 31,
        transfer_to_savings: 32,
        transfer_from_savings: 33,
        cancel_transfer_from_savings: 34,
        custom_binary: 35,
        decline_voting_rights: 36,
        reset_account: 37,
        set_reset_account: 38,
        claim_reward_balance: 39,
        delegate_vesting_shares: 40,
        account_create_with_delegation: 41,
        fill_convert_request: 42,
        author_reward: 43,
        curation_reward: 44,
        comment_reward: 45,
        liquidity_reward: 46,
        interest: 47,
        fill_vesting_withdraw: 48,
        fill_order: 49,
        shutdown_witness: 50,
        fill_transfer_from_savings: 51,
        hardfork: 52,
        comment_payout_update: 53,
        return_vesting_delegation: 54,
        comment_benefactor_reward: 55
    }, r.object_type = {
        null: 0,
        base: 1
    }
}, function(t, e, r) {
    "use strict";

    function n(t, e) {
        if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
    }
    var i = function() {
            function t(t, e) {
                for (var r = 0; r < e.length; r++) {
                    var n = e[r];
                    n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(t, n.key, n)
                }
            }
            return function(e, r, n) {
                return r && t(e.prototype, r), n && t(e, n), e
            }
        }(),
        o = r(176).Long,
        s = r(222),
        a = o.fromNumber(Math.pow(2, 48) - 1),
        u = function() {
            function t(e, r, i) {
                n(this, t), this.space = e, this.type = r, this.instance = i;
                var o = this.instance.toString(),
                    a = this.space + "." + this.type + "." + o;
                if (!s.is_digits(o)) throw new("Invalid object id " + a)
            }
            return i(t, [{
                key: "toLong",
                value: function() {
                    return o.fromNumber(this.space).shiftLeft(56).or(o.fromNumber(this.type).shiftLeft(48).or(this.instance))
                }
            }, {
                key: "appendByteBuffer",
                value: function(t) {
                    return t.writeUint64(this.toLong())
                }
            }, {
                key: "toString",
                value: function() {
                    return this.space + "." + this.type + "." + this.instance.toString()
                }
            }], [{
                key: "fromString",
                value: function(e) {
                    if (void 0 !== e.space && void 0 !== e.type && void 0 !== e.instance) return e;
                    var r = s.require_match(/^([0-9]+)\.([0-9]+)\.([0-9]+)$/, s.required(e, "object_id"), "object_id");
                    return new t(parseInt(r[1]), parseInt(r[2]), o.fromString(r[3]))
                }
            }, {
                key: "fromLong",
                value: function(e) {
                    var r = e.shiftRight(56).toInt(),
                        n = 255 & e.shiftRight(48).toInt(),
                        i = e.and(a);
                    return new t(r, n, i)
                }
            }, {
                key: "fromByteBuffer",
                value: function(e) {
                    return t.fromLong(e.readUint64())
                }
            }]), t
        }();
    t.exports = u
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }
    var i = r(220),
        o = n(i),
        s = r(217),
        a = n(s),
        u = o.default.uint16,
        f = o.default.uint32,
        c = o.default.int16,
        h = o.default.uint64,
        l = o.default.string,
        p = o.default.string_binary,
        d = o.default.bytes,
        v = o.default.bool,
        y = o.default.array,
        g = o.default.static_variant,
        _ = o.default.map,
        m = o.default.set,
        b = o.default.public_key,
        w = o.default.time_point_sec,
        E = o.default.optional,
        k = o.default.asset,
        T = o.default.void,
        B = o.default.void,
        S = o.default.void,
        x = g();
    t.exports.operation = x;
    var A = function(e, r) {
            var n = new a.default(e, r);
            return t.exports[e] = n
        },
        I = new A("beneficiaries", {
            account: l,
            weight: u
        }),
        O = new A(0, {
            beneficiaries: m(I)
        }),
        j = new A("signed_transaction", {
            ref_block_num: u,
            ref_block_prefix: f,
            expiration: w,
            operations: y(x),
            extensions: m(T),
            signatures: y(d(65))
        }),
        C = (new A("signed_block", {
            previous: d(20),
            timestamp: w,
            witness: l,
            transaction_merkle_root: d(20),
            extensions: m(g([T, S, B])),
            witness_signature: d(65),
            transactions: y(j)
        }), new A("block_header", {
            previous: d(20),
            timestamp: w,
            witness: l,
            transaction_merkle_root: d(20),
            extensions: m(g([T, S, B]))
        }), new A("signed_block_header", {
            previous: d(20),
            timestamp: w,
            witness: l,
            transaction_merkle_root: d(20),
            extensions: m(g([T, S, B])),
            witness_signature: d(65)
        })),
        R = new A("vote", {
            voter: l,
            author: l,
            permlink: l,
            weight: c
        }),
        L = new A("comment", {
            parent_author: l,
            parent_permlink: l,
            author: l,
            permlink: l,
            title: l,
            body: l,
            json_metadata: l
        }),
        U = new A("transfer", {
            from: l,
            to: l,
            amount: k,
            memo: l
        }),
        F = new A("transfer_to_vesting", {
            from: l,
            to: l,
            amount: k
        }),
        P = new A("withdraw_vesting", {
            account: l,
            vesting_shares: k
        }),
        D = new A("limit_order_create", {
            owner: l,
            orderid: f,
            amount_to_sell: k,
            min_to_receive: k,
            fill_or_kill: v,
            expiration: w
        }),
        N = new A("limit_order_cancel", {
            owner: l,
            orderid: f
        }),
        M = new A("price", {
            base: k,
            quote: k
        }),
        q = new A("feed_publish", {
            publisher: l,
            exchange_rate: M
        }),
        z = new A("convert", {
            owner: l,
            requestid: f,
            amount: k
        }),
        V = new A("authority", {
            weight_threshold: f,
            account_auths: _(l, u),
            key_auths: _(b, u)
        }),
        H = new A("account_create", {
            fee: k,
            creator: l,
            new_account_name: l,
            owner: V,
            active: V,
            posting: V,
            memo_key: b,
            json_metadata: l
        }),
        W = new A("account_update", {
            account: l,
            owner: E(V),
            active: E(V),
            posting: E(V),
            memo_key: b,
            json_metadata: l
        }),
        Y = new A("chain_properties", {
            account_creation_fee: k,
            maximum_block_size: f,
            sbd_interest_rate: u
        }),
        G = new A("witness_update", {
            owner: l,
            url: l,
            block_signing_key: b,
            props: Y,
            fee: k
        }),
        $ = new A("account_witness_vote", {
            account: l,
            witness: l,
            approve: v
        }),
        X = new A("account_witness_proxy", {
            account: l,
            proxy: l
        }),
        Z = new A("pow", {
            worker: b,
            input: d(32),
            signature: d(65),
            work: d(32)
        }),
        K = new A("custom", {
            required_auths: m(l),
            id: u,
            data: d()
        }),
        Q = new A("report_over_production", {
            reporter: l,
            first_block: C,
            second_block: C
        }),
        J = new A("delete_comment", {
            author: l,
            permlink: l
        }),
        tt = new A("custom_json", {
            required_auths: m(l),
            required_posting_auths: m(l),
            id: l,
            json: l
        }),
        et = new A("comment_options", {
            author: l,
            permlink: l,
            max_accepted_payout: k,
            percent_steem_dollars: u,
            allow_votes: v,
            allow_curation_rewards: v,
            extensions: m(g([O]))
        }),
        rt = new A("set_withdraw_vesting_route", {
            from_account: l,
            to_account: l,
            percent: u,
            auto_vest: v
        }),
        nt = new A("limit_order_create2", {
            owner: l,
            orderid: f,
            amount_to_sell: k,
            exchange_rate: M,
            fill_or_kill: v,
            expiration: w
        }),
        it = new A("challenge_authority", {
            challenger: l,
            challenged: l,
            require_owner: v
        }),
        ot = new A("prove_authority", {
            challenged: l,
            require_owner: v
        }),
        st = new A("request_account_recovery", {
            recovery_account: l,
            account_to_recover: l,
            new_owner_authority: V,
            extensions: m(T)
        }),
        at = new A("recover_account", {
            account_to_recover: l,
            new_owner_authority: V,
            recent_owner_authority: V,
            extensions: m(T)
        }),
        ut = new A("change_recovery_account", {
            account_to_recover: l,
            new_recovery_account: l,
            extensions: m(T)
        }),
        ft = new A("escrow_transfer", {
            from: l,
            to: l,
            sbd_amount: k,
            steem_amount: k,
            escrow_id: f,
            agent: l,
            fee: k,
            json_meta: l,
            ratification_deadline: w,
            escrow_expiration: w
        }),
        ct = new A("escrow_dispute", {
            from: l,
            to: l,
            agent: l,
            who: l,
            escrow_id: f
        }),
        ht = new A("escrow_release", {
            from: l,
            to: l,
            agent: l,
            who: l,
            receiver: l,
            escrow_id: f,
            sbd_amount: k,
            steem_amount: k
        }),
        lt = new A("pow2_input", {
            worker_account: l,
            prev_block: d(20),
            nonce: h
        }),
        pt = new A("pow2", {
            input: lt,
            pow_summary: f
        }),
        dt = new A("equihash_proof", {
            n: f,
            k: f,
            seed: d(32),
            inputs: y(f)
        }),
        vt = (new A("equihash_pow", {
            input: lt,
            proof: dt,
            prev_block: d(20),
            pow_summary: f
        }), new A("escrow_approve", {
            from: l,
            to: l,
            agent: l,
            who: l,
            escrow_id: f,
            approve: v
        })),
        yt = new A("transfer_to_savings", {
            from: l,
            to: l,
            amount: k,
            memo: l
        }),
        gt = new A("transfer_from_savings", {
            from: l,
            request_id: f,
            to: l,
            amount: k,
            memo: l
        }),
        _t = new A("cancel_transfer_from_savings", {
            from: l,
            request_id: f
        }),
        mt = new A("custom_binary", {
            required_owner_auths: m(l),
            required_active_auths: m(l),
            required_posting_auths: m(l),
            required_auths: y(V),
            id: l,
            data: d()
        }),
        bt = new A("decline_voting_rights", {
            account: l,
            decline: v
        }),
        wt = new A("reset_account", {
            reset_account: l,
            account_to_reset: l,
            new_owner_authority: V
        }),
        Et = new A("set_reset_account", {
            account: l,
            current_reset_account: l,
            reset_account: l
        }),
        kt = new A("claim_reward_balance", {
            account: l,
            reward_steem: k,
            reward_sbd: k,
            reward_vests: k
        }),
        Tt = new A("delegate_vesting_shares", {
            delegator: l,
            delegatee: l,
            vesting_shares: k
        }),
        Bt = new A("account_create_with_delegation", {
            fee: k,
            delegation: k,
            creator: l,
            new_account_name: l,
            owner: V,
            active: V,
            posting: V,
            memo_key: b,
            json_metadata: l,
            extensions: m(T)
        }),
        St = new A("fill_convert_request", {
            owner: l,
            requestid: f,
            amount_in: k,
            amount_out: k
        }),
        xt = new A("author_reward", {
            author: l,
            permlink: l,
            sbd_payout: k,
            steem_payout: k,
            vesting_payout: k
        }),
        At = new A("curation_reward", {
            curator: l,
            reward: k,
            comment_author: l,
            comment_permlink: l
        }),
        It = new A("comment_reward", {
            author: l,
            permlink: l,
            payout: k
        }),
        Ot = new A("liquidity_reward", {
            owner: l,
            payout: k
        }),
        jt = new A("interest", {
            owner: l,
            interest: k
        }),
        Ct = new A("fill_vesting_withdraw", {
            from_account: l,
            to_account: l,
            withdrawn: k,
            deposited: k
        }),
        Rt = new A("fill_order", {
            current_owner: l,
            current_orderid: f,
            current_pays: k,
            open_owner: l,
            open_orderid: f,
            open_pays: k
        }),
        Lt = new A("shutdown_witness", {
            owner: l
        }),
        Ut = new A("fill_transfer_from_savings", {
            from: l,
            to: l,
            amount: k,
            request_id: f,
            memo: l
        }),
        Ft = new A("hardfork", {
            hardfork_id: f
        }),
        Pt = new A("comment_payout_update", {
            author: l,
            permlink: l
        }),
        Dt = new A("return_vesting_delegation", {
            account: l,
            vesting_shares: k
        }),
        Nt = new A("comment_benefactor_reward", {
            benefactor: l,
            author: l,
            permlink: l,
            reward: k
        });
    x.st_operations = [R, L, U, F, P, D, N, q, z, H, W, G, $, X, Z, K, Q, J, tt, et, rt, nt, it, ot, st, at, ut, ft, ct, ht, pt, vt, yt, gt, _t, mt, bt, wt, Et, kt, Tt, Bt, St, xt, At, It, Ot, jt, Ct, Rt, Lt, Ut, Ft, Pt, Dt, Nt];
    new A("transaction", {
        ref_block_num: u,
        ref_block_prefix: f,
        expiration: w,
        operations: y(x),
        extensions: m(T)
    }), new A("encrypted_memo", {
        from: b,
        to: b,
        nonce: h,
        check: f,
        encrypted: p
    })
}, function(t, e) {
    "use strict";
    t.exports = function(t) {
        var e = t.toObject(void 0, {
            use_default: !0,
            annotate: !0
        });
        console.error(JSON.stringify(e, null, 4)), e = t.toObject(void 0, {
            use_default: !0,
            annotate: !1
        }), console.error(JSON.stringify(e))
    }
}, function(t, e, r) {
    (function(e) {
        "use strict";
        var n = r(200),
            i = r(171),
            o = r(204),
            s = o.Point,
            a = o.getCurveByName("secp256k1"),
            u = r(42),
            f = r(225),
            c = r(210),
            h = r(209),
            l = r(199),
            p = r(131),
            d = {},
            v = f.transaction,
            y = f.signed_transaction;
        d.verify = function(t, e, r) {
            var n = !1,
                i = [];
            for (var o in r) i.push(o);
            var s = this.generateKeys(t, e, i);
            return i.forEach(function(t) {
                r[t][0][0] === s[t] && (n = !0)
            }), n
        }, d.generateKeys = function(t, r, o) {
            var f = {};
            return o.forEach(function(o) {
                var c = t + o + r,
                    h = c.trim().split(/[\t\n\v\f\r ]+/).join(" "),
                    l = p.sha256(h),
                    d = n.fromBuffer(l),
                    v = a.G.multiply(d),
                    y = new s(v.curve, v.x, v.y, v.z),
                    g = y.getEncoded(v.compressed),
                    _ = p.ripemd160(g),
                    m = e.concat([g, _.slice(0, 4)]);
                f[o] = u.get("address_prefix") + i.encode(m)
            }), f
        }, d.getPrivateKeys = function(t, e) {
            var r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : ["owner", "active", "posting", "memo"],
                n = {};
            return r.forEach(function(r) {
                n[r] = this.toWif(t, e, r), n[r + "Pubkey"] = this.wifToPublic(n[r])
            }.bind(this)), n
        }, d.isWif = function(t) {
            var r = !1;
            try {
                var n = new e(i.decode(t)),
                    o = n.slice(0, -4),
                    s = n.slice(-4),
                    a = p.sha256(o);
                a = p.sha256(a), a = a.slice(0, 4), s.toString() == a.toString() && (r = !0)
            } catch (t) {}
            return r
        }, d.toWif = function(t, r, n) {
            var o = t + n + r,
                s = o.trim().split(/[\t\n\v\f\r ]+/).join(" "),
                a = p.sha256(s),
                u = e.concat([new e([128]), a]),
                f = p.sha256(u);
            f = p.sha256(f), f = f.slice(0, 4);
            var c = e.concat([u, f]);
            return i.encode(c)
        }, d.wifIsValid = function(t, e) {
            return this.wifToPublic(t) == e
        }, d.wifToPublic = function(t) {
            var e = h.fromWif(t);
            return e = e.toPublic().toString()
        }, d.isPubkey = function(t, e) {
            return null != l.fromString(t, e)
        }, d.signTransaction = function(t, r) {
            var n = [];
            t.signatures && (n = [].concat(t.signatures));
            var i = new e(u.get("chain_id"), "hex"),
                o = v.toBuffer(t);
            for (var s in r) {
                var a = c.signBuffer(e.concat([i, o]), r[s]);
                n.push(a.toBuffer())
            }
            return y.toObject(Object.assign(t, {
                signatures: n
            }))
        }, t.exports = d
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    (function(n) {
        "use strict";

        function i(t) {
            return t && t.__esModule ? t : {
                default: t
            }
        }
        var o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
                return typeof t
            } : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
            },
            s = r(3),
            a = i(s),
            u = r(87),
            f = i(u),
            c = r(229),
            h = i(c),
            l = r(230),
            p = i(l),
            d = r(266),
            v = i(d),
            y = r(1),
            g = i(y),
            _ = r(227),
            m = i(_),
            b = r(120),
            w = (0, f.default)("steem:broadcast"),
            E = function() {},
            k = (0, p.default)(g.default),
            T = {};
        T.send = function(t, e, r) {
            var n = T._prepareTransaction(t).then(function(t) {
                return w("Signing transaction (transaction, transaction.operations)", t, t.operations), a.default.join(t, m.default.signTransaction(t, e))
            }).spread(function(t, e) {
                return w("Broadcasting transaction (transaction, transaction.operations)", t, t.operations), g.default.broadcastTransactionSynchronousAsync(e).then(function(t) {
                    return Object.assign({}, t, e)
                })
            });
            n.nodeify(r || E)
        }, T._prepareTransaction = function(t) {
            var e = g.default.getDynamicGlobalPropertiesAsync();
            return e.then(function(e) {
                var r = new Date(e.time + "Z"),
                    i = e.head_block_number - 3 & 65535;
                return g.default.getBlockAsync(e.head_block_number - 2).then(function(e) {
                    var o = e.previous;
                    return Object.assign({
                        ref_block_num: i,
                        ref_block_prefix: new n(o, "hex").readUInt32LE(4),
                        expiration: new Date(r.getTime() + 6e4)
                    }, t)
                })
            })
        }, v.default.forEach(function(t) {
            var e = (0, b.camelCase)(t.operation),
                r = t.params || [],
                n = r.indexOf("parent_permlink") !== -1 && r.indexOf("parent_permlink") !== -1;
            T[e + "With"] = function(r, i, o) {
                w('Sending operation "' + e + '" with', {
                    options: i,
                    callback: o
                });
                var s = {};
                return t.roles && t.roles.length && (s[t.roles[0]] = r), T.send({
                    extensions: [],
                    operations: [
                        [t.operation, Object.assign({}, i, null != i.json_metadata ? {
                            json_metadata: B(i.json_metadata)
                        } : {}, n && null == i.permlink ? {
                            permlink: k.commentPermlink(i.parent_author, i.parent_permlink)
                        } : {})]
                    ]
                }, s, o)
            }, T[e] = function(t) {
                for (var n = arguments.length, i = Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++) i[o - 1] = arguments[o];
                w('Parsing operation "' + e + '" with', {
                    args: i
                });
                var s = r.reduce(function(t, e, r) {
                        return t[e] = i[r], t
                    }, {}),
                    a = i[r.length];
                return T[e + "With"](t, s, a)
            }
        });
        var B = function(t) {
            return "object" === ("undefined" == typeof t ? "undefined" : o(t)) ? JSON.stringify(t) : t
        };
        (0, h.default)(T), a.default.promisifyAll(T), e = t.exports = T
    }).call(e, r(123).Buffer)
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }
    var i = function() {
            function t(t, e) {
                var r = [],
                    n = !0,
                    i = !1,
                    o = void 0;
                try {
                    for (var s, a = t[Symbol.iterator](); !(n = (s = a.next()).done) && (r.push(s.value), !e || r.length !== e); n = !0);
                } catch (t) {
                    i = !0, o = t
                } finally {
                    try {
                        !n && a.return && a.return()
                    } finally {
                        if (i) throw o
                    }
                }
                return r
            }
            return function(e, r) {
                if (Array.isArray(e)) return e;
                if (Symbol.iterator in Object(e)) return t(e, r);
                throw new TypeError("Invalid attempt to destructure non-iterable instance")
            }
        }(),
        o = r(1),
        s = n(o);
    e = t.exports = function(t) {
        t.addAccountAuth = function(e, r) {
            var n = e.signingKey,
                o = e.username,
                a = e.authorizedUsername,
                u = e.role,
                f = void 0 === u ? "posting" : u,
                c = e.weight;
            s.default.getAccounts([o], function(e, o) {
                var s = i(o, 1),
                    u = s[0];
                if (e) return r(new Error(e), null);
                if (!u) return r(new Error("Invalid account name"), null);
                var h = u[f],
                    l = h.account_auths.map(function(t) {
                        return t[0]
                    }),
                    p = l.indexOf(a) !== -1;
                if (p) return r(null, null);
                c = c || u[f].weight_threshold, h.account_auths.push([a, c]);
                var d = "owner" === f ? h : void 0,
                    v = "active" === f ? h : void 0,
                    y = "posting" === f ? h : void 0;
                t.accountUpdate(n, u.name, d, v, y, u.memo_key, u.json_metadata, r)
            })
        }, t.removeAccountAuth = function(e, r) {
            var n = e.signingKey,
                o = e.username,
                a = e.authorizedUsername,
                u = e.role,
                f = void 0 === u ? "posting" : u;
            s.default.getAccounts([o], function(e, o) {
                var s = i(o, 1),
                    u = s[0];
                if (e) return r(new Error(e), null);
                if (!u) return r(new Error("Invalid account name"), null);
                for (var c = u[f], h = c.account_auths.length, l = 0; l < h; l++) {
                    var p = c.account_auths[l];
                    if (p[0] === a) {
                        c.account_auths.splice(l, 1);
                        break
                    }
                }
                if (h === c.account_auths.length) return r(null, null);
                var d = "owner" === f ? c : void 0,
                    v = "active" === f ? c : void 0,
                    y = "posting" === f ? c : void 0;
                t.accountUpdate(n, u.name, d, v, y, u.memo_key, u.json_metadata, r)
            })
        }, t.addKeyAuth = function(e, r) {
            var n = e.signingKey,
                o = e.username,
                a = e.authorizedKey,
                u = e.role,
                f = void 0 === u ? "posting" : u,
                c = e.weight;
            s.default.getAccounts([o], function(e, o) {
                var s = i(o, 1),
                    u = s[0];
                if (e) return r(new Error(e), null);
                if (!u) return r(new Error("Invalid account name"), null);
                var h = u[f],
                    l = h.key_auths.map(function(t) {
                        return t[0]
                    }),
                    p = l.indexOf(a) !== -1;
                if (p) return r(null, null);
                c = c || u[f].weight_threshold, h.key_auths.push([a, c]);
                var d = "owner" === f ? h : void 0,
                    v = "active" === f ? h : void 0,
                    y = "posting" === f ? h : void 0;
                t.accountUpdate(n, u.name, d, v, y, u.memo_key, u.json_metadata, r)
            })
        }, t.removeKeyAuth = function(e, r) {
            var n = e.signingKey,
                o = e.username,
                a = e.authorizedKey,
                u = e.role,
                f = void 0 === u ? "posting" : u;
            s.default.getAccounts([o], function(e, o) {
                var s = i(o, 1),
                    u = s[0];
                if (e) return r(new Error(e), null);
                if (!u) return r(new Error("Invalid account name"), null);
                for (var c = u[f], h = c.key_auths.length, l = 0; l < h; l++) {
                    var p = c.key_auths[l];
                    if (p[0] === a) {
                        c.key_auths.splice(l, 1);
                        break
                    }
                }
                if (h === c.key_auths.length) return r(null, null);
                var d = "owner" === f ? c : void 0,
                    v = "active" === f ? c : void 0,
                    y = "posting" === f ? c : void 0;
                t.accountUpdate(n, u.name, d, v, y, u.memo_key, u.json_metadata, r)
            })
        }
    }
}, function(t, e, r) {
    "use strict";

    function n(t) {
        return t && t.__esModule ? t : {
            default: t
        }
    }
    var i = function() {
            function t(t, e) {
                var r = [],
                    n = !0,
                    i = !1,
                    o = void 0;
                try {
                    for (var s, a = t[Symbol.iterator](); !(n = (s = a.next()).done) && (r.push(s.value), !e || r.length !== e); n = !0);
                } catch (t) {
                    i = !0, o = t
                } finally {
                    try {
                        !n && a.return && a.return()
                    } finally {
                        if (i) throw o
                    }
                }
                return r
            }
            return function(e, r) {
                if (Array.isArray(e)) return e;
                if (Symbol.iterator in Object(e)) return t(e, r);
                throw new TypeError("Invalid attempt to destructure non-iterable instance")
            }
        }(),
        o = r(231),
        s = n(o),
        a = r(121);
    t.exports = function(t) {
        function e(t) {
            return t.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function r(t, e) {
            var r = parseFloat(t.vesting_shares.split(" ")[0]),
                n = parseFloat(e.total_vesting_shares.split(" ")[0]),
                i = parseFloat(e.total_vesting_fund_steem.split(" ")[0]),
                o = i * (r / n);
            return o
        }

        function n(t, e) {
            var r = t ? t.reduce(function(t, e) {
                    return e.sell_price.base.indexOf("SBD") !== -1 && (t += e.for_sale), t
                }, 0) / e : 0,
                n = t ? t.reduce(function(t, e) {
                    return e.sell_price.base.indexOf("STEEM") !== -1 && (t += e.for_sale), t
                }, 0) / e : 0;
            return {
                steemOrders: n,
                sbdOrders: r
            }
        }

        function o(t) {
            var e = 0,
                r = 0;
            return t.forEach(function(t) {
                var n = t.amount.split(" "),
                    o = i(n, 2),
                    s = o[0],
                    a = o[1];
                "STEEM" === a ? e += parseFloat(s) : "SBD" === a && (r += parseFloat(s))
            }), {
                savings_pending: e,
                savings_sbd_pending: r
            }
        }

        function u(e) {
            var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                a = i.gprops,
                u = i.feed_price,
                f = i.open_orders,
                c = i.savings_withdraws,
                h = i.vesting_steem,
                l = [],
                p = e.name,
                d = 1e3,
                v = void 0,
                y = void 0;
            return h && u || (a && u ? h = r(e, a) : l.push(t.getStateAsync("/@{username}").then(function(t) {
                a = t.props, u = t.feed_price, h = r(e, a)
            }))), f ? v = n(f, d) : l.push(t.getOpenOrdersAsync(p).then(function(t) {
                v = n(t, d)
            })), c ? y = o(c) : l.push(t.getSavingsWithdrawFromAsync(p).then(function(t) {
                y = o(t)
            })), Promise.all(l).then(function() {
                var t = void 0,
                    r = u,
                    n = r.base,
                    i = r.quote;
                / SBD$/.test(n) && / STEEM$/.test(i) && (t = parseFloat(n.split(" ")[0]));
                var o = e.savings_balance,
                    a = e.savings_sbd_balance,
                    f = parseFloat(e.balance.split(" ")[0]),
                    c = parseFloat(o.split(" ")[0]),
                    l = parseFloat(e.sbd_balance),
                    p = parseFloat(a.split(" ")[0]),
                    d = 0,
                    g = (new Date).getTime();
                (e.other_history || []).reduce(function(t, e) {
                    if ("convert" !== (0, s.default)(e, [1, "op", 0], "")) return t;
                    var r = new Date((0, s.default)(e, [1, "timestamp"])).getTime(),
                        n = r + 3024e5;
                    if (n < g) return t;
                    var i = parseFloat((0, s.default)(e, [1, "op", 1, "amount"]).replace(" SBD", ""));
                    d += i
                }, []);
                var _ = l + p + y.savings_sbd_pending + v.sbdOrders + d,
                    m = h + f + c + y.savings_pending + v.steemOrders;
                return (m * t + _).toFixed(2)
            })
        }

        function f() {
            var t = 32,
                e = a.key_utils.get_random_key();
            return e.toWif().substring(3, 3 + t)
        }
        return {
            reputation: function(t) {
                if (null == t) return t;
                t = parseInt(t);
                var e = String(t),
                    r = "-" === e.charAt(0);
                e = r ? e.substring(1) : e;
                var n = e,
                    i = parseInt(n.substring(0, 4)),
                    o = Math.log(i) / Math.log(10),
                    s = n.length - 1,
                    a = s + (o - parseInt(o));
                return isNaN(a) && (a = 0), a = Math.max(a - 9, 0), a *= r ? -1 : 1, a = 9 * a + 25, a = parseInt(a)
            },
            vestToSteem: function(t, e, r) {
                return parseFloat(r) * (parseFloat(t) / parseFloat(e))
            },
            commentPermlink: function(t, e) {
                var r = (new Date).toISOString().replace(/[^a-zA-Z0-9]+/g, "").toLowerCase();
                return e = e.replace(/(-\d{8}t\d{9}z)/g, ""), "re-" + t + "-" + e + "-" + r
            },
            amount: function(t, e) {
                return t.toFixed(3) + " " + e
            },
            numberWithCommas: e,
            vestingSteem: r,
            estimateAccountValue: u,
            createSuggestedPassword: f
        }
    }
}, function(t, e, r) {
    function n(t, e, r) {
        var n = null == t ? void 0 : i(t, e);
        return void 0 === n ? r : n
    }
    var i = r(232);
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        e = i(e, t);
        for (var r = 0, n = e.length; null != t && r < n;) t = t[o(e[r++])];
        return r && r == n ? t : void 0
    }
    var i = r(233),
        o = r(265);
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        return i(t) ? t : o(t, e) ? [t] : s(a(t))
    }
    var i = r(62),
        o = r(234),
        s = r(236),
        a = r(262);
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        if (i(t)) return !1;
        var r = typeof t;
        return !("number" != r && "symbol" != r && "boolean" != r && null != t && !o(t)) || (a.test(t) || !s.test(t) || null != e && t in Object(e))
    }
    var i = r(62),
        o = r(235),
        s = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        a = /^\w*$/;
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        return "symbol" == typeof t || o(t) && i(t) == s
    }
    var i = r(55),
        o = r(61),
        s = "[object Symbol]";
    t.exports = n
}, function(t, e, r) {
    var n = r(237),
        i = /^\./,
        o = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
        s = /\\(\\)?/g,
        a = n(function(t) {
            var e = [];
            return i.test(t) && e.push(""), t.replace(o, function(t, r, n, i) {
                e.push(n ? i.replace(s, "$1") : r || t)
            }), e
        });
    t.exports = a
}, function(t, e, r) {
    function n(t) {
        var e = i(t, function(t) {
                return r.size === o && r.clear(), t
            }),
            r = e.cache;
        return e
    }
    var i = r(238),
        o = 500;
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        if ("function" != typeof t || null != e && "function" != typeof e) throw new TypeError(o);
        var r = function() {
            var n = arguments,
                i = e ? e.apply(this, n) : n[0],
                o = r.cache;
            if (o.has(i)) return o.get(i);
            var s = t.apply(this, n);
            return r.cache = o.set(i, s) || o, s
        };
        return r.cache = new(n.Cache || i), r
    }
    var i = r(239),
        o = "Expected a function";
    n.Cache = i, t.exports = n
}, function(t, e, r) {
    function n(t) {
        var e = -1,
            r = null == t ? 0 : t.length;
        for (this.clear(); ++e < r;) {
            var n = t[e];
            this.set(n[0], n[1])
        }
    }
    var i = r(240),
        o = r(256),
        s = r(259),
        a = r(260),
        u = r(261);
    n.prototype.clear = i, n.prototype.delete = o, n.prototype.get = s, n.prototype.has = a, n.prototype.set = u, t.exports = n
}, function(t, e, r) {
    function n() {
        this.size = 0, this.__data__ = {
            hash: new i,
            map: new(s || o),
            string: new i
        }
    }
    var i = r(241),
        o = r(248),
        s = r(255);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        var e = -1,
            r = null == t ? 0 : t.length;
        for (this.clear(); ++e < r;) {
            var n = t[e];
            this.set(n[0], n[1])
        }
    }
    var i = r(242),
        o = r(244),
        s = r(245),
        a = r(246),
        u = r(247);
    n.prototype.clear = i, n.prototype.delete = o, n.prototype.get = s, n.prototype.has = a, n.prototype.set = u, t.exports = n
}, function(t, e, r) {
    function n() {
        this.__data__ = i ? i(null) : {}, this.size = 0
    }
    var i = r(243);
    t.exports = n
}, function(t, e, r) {
    var n = r(99),
        i = n(Object, "create");
    t.exports = i
}, function(t, e) {
    function r(t) {
        var e = this.has(t) && delete this.__data__[t];
        return this.size -= e ? 1 : 0, e
    }
    t.exports = r
}, function(t, e, r) {
    function n(t) {
        var e = this.__data__;
        if (i) {
            var r = e[t];
            return r === o ? void 0 : r
        }
        return a.call(e, t) ? e[t] : void 0
    }
    var i = r(243),
        o = "__lodash_hash_undefined__",
        s = Object.prototype,
        a = s.hasOwnProperty;
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        var e = this.__data__;
        return i ? void 0 !== e[t] : s.call(e, t)
    }
    var i = r(243),
        o = Object.prototype,
        s = o.hasOwnProperty;
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        var r = this.__data__;
        return this.size += this.has(t) ? 0 : 1, r[t] = i && void 0 === e ? o : e, this
    }
    var i = r(243),
        o = "__lodash_hash_undefined__";
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        var e = -1,
            r = null == t ? 0 : t.length;
        for (this.clear(); ++e < r;) {
            var n = t[e];
            this.set(n[0], n[1])
        }
    }
    var i = r(249),
        o = r(250),
        s = r(252),
        a = r(253),
        u = r(254);
    n.prototype.clear = i, n.prototype.delete = o, n.prototype.get = s, n.prototype.has = a, n.prototype.set = u, t.exports = n
}, function(t, e) {
    function r() {
        this.__data__ = [], this.size = 0
    }
    t.exports = r
}, function(t, e, r) {
    function n(t) {
        var e = this.__data__,
            r = i(e, t);
        if (r < 0) return !1;
        var n = e.length - 1;
        return r == n ? e.pop() : s.call(e, r, 1), --this.size, !0
    }
    var i = r(251),
        o = Array.prototype,
        s = o.splice;
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        for (var r = t.length; r--;)
            if (i(t[r][0], e)) return r;
        return -1
    }
    var i = r(105);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        var e = this.__data__,
            r = i(e, t);
        return r < 0 ? void 0 : e[r][1]
    }
    var i = r(251);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        return i(this.__data__, t) > -1
    }
    var i = r(251);
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        var r = this.__data__,
            n = i(r, t);
        return n < 0 ? (++this.size, r.push([t, e])) : r[n][1] = e, this
    }
    var i = r(251);
    t.exports = n
}, function(t, e, r) {
    var n = r(99),
        i = r(57),
        o = n(i, "Map");
    t.exports = o
}, function(t, e, r) {
    function n(t) {
        var e = i(this, t).delete(t);
        return this.size -= e ? 1 : 0, e
    }
    var i = r(257);
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        var r = t.__data__;
        return i(e) ? r["string" == typeof e ? "string" : "hash"] : r.map
    }
    var i = r(258);
    t.exports = n
}, function(t, e) {
    function r(t) {
        var e = typeof t;
        return "string" == e || "number" == e || "symbol" == e || "boolean" == e ? "__proto__" !== t : null === t
    }
    t.exports = r
}, function(t, e, r) {
    function n(t) {
        return i(this, t).get(t)
    }
    var i = r(257);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        return i(this, t).has(t)
    }
    var i = r(257);
    t.exports = n
}, function(t, e, r) {
    function n(t, e) {
        var r = i(this, t),
            n = r.size;
        return r.set(t, e), this.size += r.size == n ? 0 : 1, this
    }
    var i = r(257);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        return null == t ? "" : i(t)
    }
    var i = r(263);
    t.exports = n
}, function(t, e, r) {
    function n(t) {
        if ("string" == typeof t) return t;
        if (s(t)) return o(t, n) + "";
        if (a(t)) return c ? c.call(t) : "";
        var e = t + "";
        return "0" == e && 1 / t == -u ? "-0" : e
    }
    var i = r(56),
        o = r(264),
        s = r(62),
        a = r(235),
        u = 1 / 0,
        f = i ? i.prototype : void 0,
        c = f ? f.toString : void 0;
    t.exports = n
}, function(t, e) {
    function r(t, e) {
        for (var r = -1, n = null == t ? 0 : t.length, i = Array(n); ++r < n;) i[r] = e(t[r], r, t);
        return i
    }
    t.exports = r
}, function(t, e, r) {
    function n(t) {
        if ("string" == typeof t || i(t)) return t;
        var e = t + "";
        return "0" == e && 1 / t == -o ? "-0" : e
    }
    var i = r(235),
        o = 1 / 0;
    t.exports = n
}, function(t, e) {
    "use strict";
    t.exports = [{
        roles: ["posting", "active", "owner"],
        operation: "vote",
        params: ["voter", "author", "permlink", "weight"]
    }, {
        roles: ["posting", "active", "owner"],
        operation: "comment",
        params: ["parent_author", "parent_permlink", "author", "permlink", "title", "body", "json_metadata"]
    }, {
        roles: ["active", "owner"],
        operation: "transfer",
        params: ["from", "to", "amount", "memo"]
    }, {
        roles: ["active", "owner"],
        operation: "transfer_to_vesting",
        params: ["from", "to", "amount"]
    }, {
        roles: ["active", "owner"],
        operation: "withdraw_vesting",
        params: ["account", "vesting_shares"]
    }, {
        roles: ["active", "owner"],
        operation: "limit_order_create",
        params: ["owner", "orderid", "amount_to_sell", "min_to_receive", "fill_or_kill", "expiration"]
    }, {
        roles: ["active", "owner"],
        operation: "limit_order_cancel",
        params: ["owner", "orderid"]
    }, {
        roles: ["active", "owner"],
        operation: "price",
        params: ["base", "quote"]
    }, {
        roles: ["active", "owner"],
        operation: "feed_publish",
        params: ["publisher", "exchange_rate"]
    }, {
        roles: ["active", "owner"],
        operation: "convert",
        params: ["owner", "requestid", "amount"]
    }, {
        roles: ["active", "owner"],
        operation: "account_create",
        params: ["fee", "creator", "new_account_name", "owner", "active", "posting", "memo_key", "json_metadata"]
    }, {
        roles: ["active", "owner"],
        operation: "account_update",
        params: ["account", "owner", "active", "posting", "memo_key", "json_metadata"]
    }, {
        roles: ["active", "owner"],
        operation: "witness_update",
        params: ["owner", "url", "block_signing_key", "props", "fee"]
    }, {
        roles: ["active", "owner"],
        operation: "account_witness_vote",
        params: ["account", "witness", "approve"]
    }, {
        roles: ["active", "owner"],
        operation: "account_witness_proxy",
        params: ["account", "proxy"]
    }, {
        roles: ["active", "owner"],
        operation: "pow",
        params: ["worker", "input", "signature", "work"]
    }, {
        roles: ["active", "owner"],
        operation: "custom",
        params: ["required_auths", "id", "data"]
    }, {
        roles: ["posting", "active", "owner"],
        operation: "delete_comment",
        params: ["author", "permlink"]
    }, {
        roles: ["posting", "active", "owner"],
        operation: "custom_json",
        params: ["required_auths", "required_posting_auths", "id", "json"]
    }, {
        roles: ["posting", "active", "owner"],
        operation: "comment_options",
        params: ["author", "permlink", "max_accepted_payout", "percent_steem_dollars", "allow_votes", "allow_curation_rewards", "extensions"]
    }, {
        roles: ["active", "owner"],
        operation: "set_withdraw_vesting_route",
        params: ["from_account", "to_account", "percent", "auto_vest"]
    }, {
        roles: ["active", "owner"],
        operation: "limit_order_create2",
        params: ["owner", "orderid", "amount_to_sell", "exchange_rate", "fill_or_kill", "expiration"]
    }, {
        roles: ["posting", "active", "owner"],
        operation: "challenge_authority",
        params: ["challenger", "challenged", "require_owner"]
    }, {
        roles: ["active", "owner"],
        operation: "prove_authority",
        params: ["challenged", "require_owner"]
    }, {
        roles: ["active", "owner"],
        operation: "request_account_recovery",
        params: ["recovery_account", "account_to_recover", "new_owner_authority", "extensions"]
    }, {
        roles: ["owner"],
        operation: "recover_account",
        params: ["account_to_recover", "new_owner_authority", "recent_owner_authority", "extensions"]
    }, {
        roles: ["owner"],
        operation: "change_recovery_account",
        params: ["account_to_recover", "new_recovery_account", "extensions"]
    }, {
        roles: ["active", "owner"],
        operation: "escrow_transfer",
        params: ["from", "to", "agent", "escrow_id", "sbd_amount", "steem_amount", "fee", "ratification_deadline", "escrow_expiration", "json_meta"]
    }, {
        roles: ["active", "owner"],
        operation: "escrow_dispute",
        params: ["from", "to", "agent", "who", "escrow_id"]
    }, {
        roles: ["active", "owner"],
        operation: "escrow_release",
        params: ["from", "to", "agent", "who", "receiver", "escrow_id", "sbd_amount", "steem_amount"]
    }, {
        roles: ["active", "owner"],
        operation: "pow2",
        params: ["input", "pow_summary"]
    }, {
        roles: ["active", "owner"],
        operation: "escrow_approve",
        params: ["from", "to", "agent", "who", "escrow_id", "approve"]
    }, {
        roles: ["active", "owner"],
        operation: "transfer_to_savings",
        params: ["from", "to", "amount", "memo"]
    }, {
        roles: ["active", "owner"],
        operation: "transfer_from_savings",
        params: ["from", "request_id", "to", "amount", "memo"]
    }, {
        roles: ["active", "owner"],
        operation: "cancel_transfer_from_savings",
        params: ["from", "request_id"]
    }, {
        roles: ["posting", "active", "owner"],
        operation: "custom_binary",
        params: ["id", "data"]
    }, {
        roles: ["owner"],
        operation: "decline_voting_rights",
        params: ["account", "decline"]
    }, {
        roles: ["active", "owner"],
        operation: "reset_account",
        params: ["reset_account", "account_to_reset", "new_owner_authority"]
    }, {
        roles: ["owner", "posting"],
        operation: "set_reset_account",
        params: ["account", "current_reset_account", "reset_account"]
    }, {
        roles: ["posting", "active", "owner"],
        operation: "claim_reward_balance",
        params: ["account", "reward_steem", "reward_sbd", "reward_vests"]
    }, {
        roles: ["active", "owner"],
        operation: "delegate_vesting_shares",
        params: ["delegator", "delegatee", "vesting_shares"]
    }, {
        roles: ["active", "owner"],
        operation: "account_create_with_delegation",
        params: ["fee", "delegation", "creator", "new_account_name", "owner", "active", "posting", "memo_key", "json_metadata", "extensions"]
    }, {
        roles: ["active", "owner"],
        operation: "fill_convert_request",
        params: ["owner", "requestid", "amount_in", "amount_out"]
    }, {
        roles: ["posting", "active", "owner"],
        operation: "comment_reward",
        params: ["author", "permlink", "payout"]
    }, {
        roles: ["active", "owner"],
        operation: "liquidity_reward",
        params: ["owner", "payout"]
    }, {
        roles: ["active", "owner"],
        operation: "interest",
        params: ["owner", "interest"]
    }, {
        roles: ["active", "owner"],
        operation: "fill_vesting_withdraw",
        params: ["from_account", "to_account", "withdrawn", "deposited"]
    }, {
        roles: ["posting", "active", "owner"],
        operation: "fill_order",
        params: ["current_owner", "current_orderid", "current_pays", "open_owner", "open_orderid", "open_pays"]
    }, {
        roles: ["posting", "active", "owner"],
        operation: "fill_transfer_from_savings",
        params: ["from", "to", "amount", "request_id", "memo"]
    }]
}]));
//# sourceMappingURL=steem.min.js.map
