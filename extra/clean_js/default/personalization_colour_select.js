
(() => {
    var Mt = Object.defineProperty;
    var kt = (o, e, t) => (e in o ? Mt(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (o[e] = t));
    var h = (o, e, t) => (kt(o, typeof e != "symbol" ? e + "" : e, t), t);
    //panel colour picker buttons
    var ot =
        ".colour-picker{position:relative}.button{width:4rem;height:4rem;padding:.25rem;background:none;border:none;cursor:pointer;box-sizing:border-box}.button-colour{display:block;width:100%;height:100%;box-shadow:0px 2px 4px 0px rgba(0,0,0,0.2);box-sizing:border-box;border-radius:8px;}";
    var it =
        ".popup{position:absolute;left:0%;top:calc(100% - 1px);z-index:50;box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 8px 12px -2px rgba(0, 0, 0, 0.3);padding:.5rem;background:var(--modeback);border-width:1px;border-style:solid;border-color:var(--backtext);border-radius:.25rem}.popup.right{right:0;left:auto}";
    var rt =
        ".saturation{touch-action:none;overflow:hidden;width:100%;height:8rem;position:relative}.box{width:100%;height:100%;position:absolute}.white{background:linear-gradient(90deg,#fff,hsla(0,0%,100%,0))}.black{background:linear-gradient(0,#000,transparent)}.pointer{top:34.902%;left:18.6747%;cursor:pointer;position:absolute;outline:0}.handler{box-shadow:0 0 0 1.5px #fff,inset 0 0 1px 1px rgb(0,0,0,0.3),0 0 1px 2px rgb(0,0,0,0.4);-webkit-transform:translate(-2px,-2px);transform:translate(-2px,-2px);border-radius:100%;width:.25rem;height:.25rem;outline:0}";
    var p = "tc-hsv-changed",
        f = "tc-hue-changed",
        D = "tc-button-clicked",
        nt = (o) => {
            !o || document.dispatchEvent(new CustomEvent(D, { detail: { cid: o } }));
        },
        b = (o, e, t, i) => {
            !o || document.dispatchEvent(new CustomEvent(p, { detail: { h: e, s: t, v: i, cid: o } }));
        },
        st = (o, e) => {
            !o || document.dispatchEvent(new CustomEvent(f, { detail: { h: e, cid: o } }));
        };
    function u(o, e) {
        St(o) && (o = "100%");
        var t = Tt(o);
        return (
            (o = e === 360 ? o : Math.min(e, Math.max(0, parseFloat(o)))),
            t && (o = parseInt(String(o * e), 10) / 100),
            Math.abs(o - e) < 1e-6 ? 1 : (e === 360 ? (o = (o < 0 ? (o % e) + e : o % e) / parseFloat(String(e))) : (o = (o % e) / parseFloat(String(e))), o)
        );
    }
    function St(o) {
        return typeof o == "string" && o.indexOf(".") !== -1 && parseFloat(o) === 1;
    }
    function Tt(o) {
        return typeof o == "string" && o.indexOf("%") !== -1;
    }
    function _(o) {
        return (o = parseFloat(o)), (isNaN(o) || o < 0 || o > 1) && (o = 1), o;
    }
    function L(o) {
        return o <= 1 ? "".concat(Number(o) * 100, "%") : o;
    }
    function C(o) {
        return o.length === 1 ? "0" + o : String(o);
    }
    function at(o, e, t) {
        return { r: u(o, 255) * 255, g: u(e, 255) * 255, b: u(t, 255) * 255 };
    }
    function U(o, e, t) {
        (o = u(o, 255)), (e = u(e, 255)), (t = u(t, 255));
        var i = Math.max(o, e, t),
            r = Math.min(o, e, t),
            n = 0,
            s = 0,
            a = (i + r) / 2;
        if (i === r) (s = 0), (n = 0);
        else {
            var d = i - r;
            switch (((s = a > 0.5 ? d / (2 - i - r) : d / (i + r)), i)) {
                case o:
                    n = (e - t) / d + (e < t ? 6 : 0);
                    break;
                case e:
                    n = (t - o) / d + 2;
                    break;
                case t:
                    n = (o - e) / d + 4;
                    break;
                default:
                    break;
            }
            n /= 6;
        }
        return { h: n, s, l: a };
    }
    function O(o, e, t) {
        return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? o + (e - o) * (6 * t) : t < 1 / 2 ? e : t < 2 / 3 ? o + (e - o) * (2 / 3 - t) * 6 : o;
    }
    function ht(o, e, t) {
        var i, r, n;
        if (((o = u(o, 360)), (e = u(e, 100)), (t = u(t, 100)), e === 0)) (r = t), (n = t), (i = t);
        else {
            var s = t < 0.5 ? t * (1 + e) : t + e - t * e,
                a = 2 * t - s;
            (i = O(a, s, o + 1 / 3)), (r = O(a, s, o)), (n = O(a, s, o - 1 / 3));
        }
        return { r: i * 255, g: r * 255, b: n * 255 };
    }
    function N(o, e, t) {
        (o = u(o, 255)), (e = u(e, 255)), (t = u(t, 255));
        var i = Math.max(o, e, t),
            r = Math.min(o, e, t),
            n = 0,
            s = i,
            a = i - r,
            d = i === 0 ? 0 : a / i;
        if (i === r) n = 0;
        else {
            switch (i) {
                case o:
                    n = (e - t) / a + (e < t ? 6 : 0);
                    break;
                case e:
                    n = (t - o) / a + 2;
                    break;
                case t:
                    n = (o - e) / a + 4;
                    break;
                default:
                    break;
            }
            n /= 6;
        }
        return { h: n, s: d, v: s };
    }
    function lt(o, e, t) {
        (o = u(o, 360) * 6), (e = u(e, 100)), (t = u(t, 100));
        var i = Math.floor(o),
            r = o - i,
            n = t * (1 - e),
            s = t * (1 - r * e),
            a = t * (1 - (1 - r) * e),
            d = i % 6,
            x = [t, s, n, n, a, t][d],
            w = [a, t, t, s, n, n][d],
            R = [n, n, a, t, t, s][d];
        return { r: x * 255, g: w * 255, b: R * 255 };
    }
    function K(o, e, t, i) {
        var r = [C(Math.round(o).toString(16)), C(Math.round(e).toString(16)), C(Math.round(t).toString(16))];
        return i && r[0].startsWith(r[0].charAt(1)) && r[1].startsWith(r[1].charAt(1)) && r[2].startsWith(r[2].charAt(1)) ? r[0].charAt(0) + r[1].charAt(0) + r[2].charAt(0) : r.join("");
    }
    function dt(o, e, t, i, r) {
        var n = [C(Math.round(o).toString(16)), C(Math.round(e).toString(16)), C(Math.round(t).toString(16)), C(Rt(i))];
        return r && n[0].startsWith(n[0].charAt(1)) && n[1].startsWith(n[1].charAt(1)) && n[2].startsWith(n[2].charAt(1)) && n[3].startsWith(n[3].charAt(1)) ? n[0].charAt(0) + n[1].charAt(0) + n[2].charAt(0) + n[3].charAt(0) : n.join("");
    }
    function Rt(o) {
        return Math.round(parseFloat(o) * 255).toString(16);
    }
    function V(o) {
        return g(o) / 255;
    }
    function g(o) {
        return parseInt(o, 16);
    }
    function ut(o) {
        return { r: o >> 16, g: (o & 65280) >> 8, b: o & 255 };
    }
    function ct(o) {
        var e = { r: 0, g: 0, b: 0 },
            t = 1,
            i = null,
            r = null,
            n = null,
            s = !1,
            a = !1;
        return (
            typeof o == "string" && (o = Pt(o)),
            typeof o == "object" &&
                (E(o.r) && E(o.g) && E(o.b)
                    ? ((e = at(o.r, o.g, o.b)), (s = !0), (a = String(o.r).substr(-1) === "%" ? "prgb" : "rgb"))
                    : E(o.h) && E(o.s) && E(o.v)
                    ? ((i = L(o.s)), (r = L(o.v)), (e = lt(o.h, i, r)), (s = !0), (a = "hsv"))
                    : E(o.h) && E(o.s) && E(o.l) && ((i = L(o.s)), (n = L(o.l)), (e = ht(o.h, i, n)), (s = !0), (a = "hsl")),
                Object.prototype.hasOwnProperty.call(o, "a") && (t = o.a)),
            (t = _(t)),
            { ok: s, format: o.format || a, r: Math.min(255, Math.max(e.r, 0)), g: Math.min(255, Math.max(e.g, 0)), b: Math.min(255, Math.max(e.b, 0)), a: t }
        );
    }
    var Dt = "[-\\+]?\\d+%?",
        _t = "[-\\+]?\\d*\\.\\d+%?",
        y = "(?:".concat(_t, ")|(?:").concat(Dt, ")"),
        G = "[\\s|\\(]+(".concat(y, ")[,|\\s]+(").concat(y, ")[,|\\s]+(").concat(y, ")\\s*\\)?"),
        F = "[\\s|\\(]+(".concat(y, ")[,|\\s]+(").concat(y, ")[,|\\s]+(").concat(y, ")[,|\\s]+(").concat(y, ")\\s*\\)?"),
        v = {
            CSS_UNIT: new RegExp(y),
            rgb: new RegExp("rgb" + G),
            rgba: new RegExp("rgba" + F),
            hsl: new RegExp("hsl" + G),
            hsla: new RegExp("hsla" + F),
            hsv: new RegExp("hsv" + G),
            hsva: new RegExp("hsva" + F),
            hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        };
    function Pt(o) {
        if (((o = o.trim().toLowerCase()), o.length === 0)) return !1;
        var e = !1;
        var t = v.rgb.exec(o);
        return t
            ? { r: t[1], g: t[2], b: t[3] }
            : ((t = v.rgba.exec(o)),
              t
                  ? { r: t[1], g: t[2], b: t[3], a: t[4] }
                  : ((t = v.hsl.exec(o)),
                    t
                        ? { h: t[1], s: t[2], l: t[3] }
                        : ((t = v.hsla.exec(o)),
                          t
                              ? { h: t[1], s: t[2], l: t[3], a: t[4] }
                              : ((t = v.hsv.exec(o)),
                                t
                                    ? { h: t[1], s: t[2], v: t[3] }
                                    : ((t = v.hsva.exec(o)),
                                      t
                                          ? { h: t[1], s: t[2], v: t[3], a: t[4] }
                                          : ((t = v.hex8.exec(o)),
                                            t
                                                ? { r: g(t[1]), g: g(t[2]), b: g(t[3]), a: V(t[4]), format: e ? "name" : "hex8" }
                                                : ((t = v.hex6.exec(o)),
                                                  t
                                                      ? { r: g(t[1]), g: g(t[2]), b: g(t[3]), format: e ? "name" : "hex" }
                                                      : ((t = v.hex4.exec(o)),
                                                        t
                                                            ? { r: g(t[1] + t[1]), g: g(t[2] + t[2]), b: g(t[3] + t[3]), a: V(t[4] + t[4]), format: e ? "name" : "hex8" }
                                                            : ((t = v.hex3.exec(o)), t ? { r: g(t[1] + t[1]), g: g(t[2] + t[2]), b: g(t[3] + t[3]), format: e ? "name" : "hex" } : !1)))))))));
    }
    function E(o) {
        return Boolean(v.CSS_UNIT.exec(String(o)));
    }
    var l = (function () {
        function o(e, t) {
            e === void 0 && (e = ""), t === void 0 && (t = {});
            var i;
            if (e instanceof o) return e;
            typeof e == "number" && (e = ut(e)), (this.originalInput = e);
            var r = ct(e);
            (this.originalInput = e),
                (this.r = r.r),
                (this.g = r.g),
                (this.b = r.b),
                (this.a = r.a),
                (this.roundA = Math.round(100 * this.a) / 100),
                (this.format = (i = t.format) !== null && i !== void 0 ? i : r.format),
                (this.gradientType = t.gradientType),
                this.r < 1 && (this.r = Math.round(this.r)),
                this.g < 1 && (this.g = Math.round(this.g)),
                this.b < 1 && (this.b = Math.round(this.b)),
                (this.isValid = r.ok);
        }
        return (
            (o.prototype.toHsv = function () {
                var e = N(this.r, this.g, this.b);
                return { h: e.h * 360, s: e.s, v: e.v, a: this.a };
            }),
            (o.prototype.toHsvString = function () {
                var e = N(this.r, this.g, this.b),
                    t = Math.round(e.h * 360),
                    i = Math.round(e.s * 100),
                    r = Math.round(e.v * 100);
                return this.a === 1 ? "hsv(".concat(t, ", ").concat(i, "%, ").concat(r, "%)") : "hsva(".concat(t, ", ").concat(i, "%, ").concat(r, "%, ").concat(this.roundA, ")");
            }),
            (o.prototype.toHsl = function () {
                var e = U(this.r, this.g, this.b);
                return { h: e.h * 360, s: e.s, l: e.l, a: this.a };
            }),
            (o.prototype.toHslString = function () {
                var e = U(this.r, this.g, this.b),
                    t = Math.round(e.h * 360),
                    i = Math.round(e.s * 100),
                    r = Math.round(e.l * 100);
                return this.a === 1 ? "hsl(".concat(t, ", ").concat(i, "%, ").concat(r, "%)") : "hsla(".concat(t, ", ").concat(i, "%, ").concat(r, "%, ").concat(this.roundA, ")");
            }),
            (o.prototype.toHex = function (e) {
                return e === void 0 && (e = !1), K(this.r, this.g, this.b, e);
            }),
            (o.prototype.toHexString = function (e) {
                return e === void 0 && (e = !1), "#" + this.toHex(e);
            }),
            (o.prototype.toHex8 = function (e) {
                return e === void 0 && (e = !1), dt(this.r, this.g, this.b, this.a, e);
            }),
            (o.prototype.toHex8String = function (e) {
                return e === void 0 && (e = !1), "#" + this.toHex8(e);
            }),
            (o.prototype.toRgb = function () {
                return { r: Math.round(this.r), g: Math.round(this.g), b: Math.round(this.b), a: this.a };
            }),
            (o.prototype.toRgbString = function () {
                var e = Math.round(this.r),
                    t = Math.round(this.g),
                    i = Math.round(this.b);
                return this.a === 1 ? "rgb(".concat(e, ", ").concat(t, ", ").concat(i, ")") : "rgba(".concat(e, ", ").concat(t, ", ").concat(i, ", ").concat(this.roundA, ")");
            }),
            o
        );
    })();
    var $ = () => Math.random().toString(16).slice(2),
        P = (o) => Math.round((o + Number.EPSILON) * 100) / 100;
    var H = 0.01,
        q = (o) => (o < 0 && (o = 0), o > 360 && (o = 360), `hsl(${Math.round(o)}, 100%, 50%)`),
        S = (o) => {
            let e = o.toRgb();
            return `rgba(${e.r}, ${e.g}, ${e.b}, ${P(e.a)})`;
        },
        W = (o) => (o < 0 && (o = 0), o > 1 && (o = 1), `${(-(o * 100) + 100).toFixed(2)}%`),
        X = (o) => (o < 0 && (o = 0), o > 1 && (o = 1), `${(o * 100).toFixed(2)}%`),
        T = (o) => {
            o < 0 && (o = 0), o > 360 && (o = 360);
            let e = (o * 100) / 360,
                t = Math.round(e * 100) / 100;
            return t < 0 && (t = 0), t > 100 && (t = 100), t;
        },
        B = (o) => (360 * o) / 100,
        I = (o) => {
            let e = Number(o) || 0;
            return (e = Math.round(e)), (e = Math.max(0, e)), (e = Math.min(255, e)), e;
        },
        c = (o) => {
            let e = new l(o || "#000");
            return e;
        };
    var j = class extends HTMLElement {
            constructor() {
                super();
                h(this, "cid");
                h(this, "$saturation");
                h(this, "$color");
                h(this, "$pointer");
                h(this, "hue", 0);
                h(this, "saturation", 0);
                h(this, "value", 0);
                this.attachShadow({ mode: "open" }),
                    (this.onMouseDown = this.onMouseDown.bind(this)),
                    (this.onMouseUp = this.onMouseUp.bind(this)),
                    (this.onChange = this.onChange.bind(this)),
                    (this.onPointerKeyDown = this.onPointerKeyDown.bind(this)),
                    (this.hsvChanged = this.hsvChanged.bind(this)),
                    (this.hueChanged = this.hueChanged.bind(this));
            }
            static get observedAttributes() {
                return ["color"];
            }
            render(t = !0) {
                this.$pointer && ((this.$pointer.style.left = X(this.saturation)), (this.$pointer.style.top = W(this.value))),
                    this.$color && this.$color.setAttribute("style", `background: ${q(this.hue)}`),
                    t && b(this.cid, this.hue, this.saturation, this.value);
            }
            onChange(t) {
                if (!this.$saturation) return;
                let { width: i, height: r, left: n, top: s } = this.$saturation.getBoundingClientRect();
                if (i === 0 || r === 0) return;
                let a = typeof t.clientX == "number" ? t.clientX : t.touches[0].clientX,
                    d = typeof t.clientY == "number" ? t.clientY : t.touches[0].clientY,
                    x = Math.min(Math.max(0, a - n), i),
                    w = Math.min(Math.max(0, d - s), r);
                (this.saturation = x / i), (this.value = 1 - w / r), this.render();
            }
            onPointerKeyDown(t) {
                switch (t.key) {
                    case "ArrowLeft": {
                        (this.saturation = Math.max(0, this.saturation - H)), this.render();
                        break;
                    }
                    case "ArrowRight": {
                        (this.saturation = Math.min(1, this.saturation + H)), this.render();
                        break;
                    }
                    case "ArrowUp": {
                        (this.value = Math.min(1, this.value + H)), this.render();
                        break;
                    }
                    case "ArrowDown": {
                        t.preventDefault(), (this.value = Math.max(0, this.value - H)), this.render();
                        break;
                    }
                }
            }
            onMouseDown(t) {
                t.preventDefault && t.preventDefault(),
                    this.onChange(t),
                    window.addEventListener("mousemove", this.onChange),
                    window.addEventListener("mouseup", this.onMouseUp),
                    window.setTimeout(() => {
                        var i;
                        (i = this.$pointer) == null || i.focus();
                    }, 0);
            }
            onMouseUp() {
                window.removeEventListener("mousemove", this.onChange), window.removeEventListener("mouseup", this.onChange);
            }
            hsvChanged(t) {
                if (!t || !t.detail || !t.detail.cid || t.detail.cid !== this.cid) return;
                let i = !1;
                this.hue !== t.detail.h && ((this.hue = t.detail.h), (i = !0)),
                    this.saturation !== t.detail.s && ((this.saturation = t.detail.s), (i = !0)),
                    this.value !== t.detail.v && ((this.value = t.detail.v), (i = !0)),
                    i && this.render(!1);
            }
            hueChanged(t) {
                !t || !t.detail || !t.detail.cid || (t.detail.cid === this.cid && ((this.hue = t.detail.h), this.render()));
            }
            connectedCallback() {
                var s, a, d, x, w;
                if (!this.shadowRoot) return;
                this.cid = this.getAttribute("cid") || "";
                let i = c(this.getAttribute("color")).toHsv();
                (this.hue = i.h), (this.saturation = i.s), (this.value = i.v);
                let r = W(this.value),
                    n = X(this.saturation);
                (this.shadowRoot.innerHTML = `
           <style>${rt}</style>
           <div class="saturation">
                <div class="box" style="background: ${q(this.hue)}">
                    <div class="white box">
                        <div class="black box"></div>
                        
                        <div class="pointer" tabindex="0" style="top: ${r}; left: ${n};">
                            <div class="handler"></div>
                        </div>
                    </div>
                </div>
           </div>
        `),
                    (this.$saturation = this.shadowRoot.querySelector(".saturation")),
                    (this.$color = this.shadowRoot.querySelector(".box")),
                    (this.$pointer = this.shadowRoot.querySelector(".pointer")),
                    (s = this.$pointer) == null || s.addEventListener("keydown", this.onPointerKeyDown),
                    (a = this.$saturation) == null || a.addEventListener("mousedown", this.onMouseDown),
                    (d = this.$saturation) == null || d.addEventListener("mouseup", this.onMouseUp),
                    (x = this.$saturation) == null || x.addEventListener("touchmove", this.onChange),
                    (w = this.$saturation) == null || w.addEventListener("touchstart", this.onChange),
                    document.addEventListener(p, this.hsvChanged),
                    document.addEventListener(f, this.hueChanged);
            }
            disconnectedCallback() {
                var t, i, r, n, s;
                (t = this.$saturation) == null || t.removeEventListener("mousedown", this.onMouseDown),
                    (i = this.$saturation) == null || i.removeEventListener("mouseup", this.onMouseUp),
                    (r = this.$saturation) == null || r.removeEventListener("touchmove", this.onChange),
                    (n = this.$saturation) == null || n.removeEventListener("touchstart", this.onChange),
                    (s = this.$pointer) == null || s.removeEventListener("keydown", this.onPointerKeyDown),
                    document.removeEventListener(p, this.hsvChanged),
                    document.removeEventListener(f, this.hueChanged);
            }
            attributeChangedCallback(t, i, r) {
                let s = c(r).toHsv();
                (this.hue = s.h), (this.saturation = s.s), (this.value = s.v), this.render(!1);
            }
        },
        bt = j;
    var vt =
        ".hue{overflow:hidden;height:.625rem;margin-bottom:.25rem;margin-top:.25rem;position:relative}.box{width:100%;height:100%;position:absolute}.hue-v{background:linear-gradient(0,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red)}.hue-h{background:linear-gradient(90deg,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red);width:100%;height:100%;position:relative}.pointer-box{left:87%;position:absolute;outline:0}.handler{background:#fff;box-shadow:0 0 2px rgb(0 0 0 / 60%);box-sizing:border-box;border:1px solid hsla(0,0%,88%,.5);height:8px;margin-top:1px;-webkit-transform:translateX(-4px);transform:translateX(-4px);width:8px;cursor:pointer;outline:0}.pointer-box:focus .handler{border:2px solid hsla(0,0%,88%,1)}";
    var Y = class extends HTMLElement {
            constructor() {
                super();
                h(this, "cid");
                h(this, "$hue");
                h(this, "$pointer");
                h(this, "hue", 0);
                this.attachShadow({ mode: "open" }),
                    (this.onMouseDown = this.onMouseDown.bind(this)),
                    (this.onMouseUp = this.onMouseUp.bind(this)),
                    (this.onChange = this.onChange.bind(this)),
                    (this.onKeyDown = this.onKeyDown.bind(this)),
                    (this.hsvChanged = this.hsvChanged.bind(this));
            }
            static get observedAttributes() {
                return ["color"];
            }
            render() {
                this.$pointer && (this.$pointer.style.left = `${T(this.hue)}%`), st(this.cid, this.hue);
            }
            hsvChanged(t) {
                !t || !t.detail || !t.detail.cid || (t.detail.cid === this.cid && this.hue !== t.detail.h && ((this.hue = t.detail.h), this.render()));
            }
            onChange(t) {
                if (!this.$hue) return;
                t.preventDefault && t.preventDefault();
                let { width: i, left: r } = this.$hue.getBoundingClientRect();
                if (i === 0) return;
                let n = typeof t.clientX == "number" ? t.clientX : t.touches[0].clientX,
                    s = Math.min(Math.max(0, n - r), i),
                    a = Math.min(Math.max(0, Math.round((s * 100) / i)), 100);
                (this.hue = B(a)), this.render();
            }
            onKeyDown(t) {
                var i;
                switch (((i = this.$pointer) == null || i.focus(), t.key)) {
                    case "ArrowLeft": {
                        let r = T(this.hue);
                        (r = Math.max(0, r - 1)), (this.hue = B(r)), this.render();
                        break;
                    }
                    case "ArrowRight": {
                        let r = T(this.hue);
                        (r = Math.min(100, r + 1)), (this.hue = B(r)), this.render();
                        break;
                    }
                }
            }
            onMouseDown(t) {
                t.preventDefault && t.preventDefault(),
                    this.onChange(t),
                    window.addEventListener("mousemove", this.onChange),
                    window.addEventListener("mouseup", this.onMouseUp),
                    window.setTimeout(() => {
                        var i;
                        (i = this.$pointer) == null || i.focus();
                    }, 0);
            }
            onMouseUp() {
                window.removeEventListener("mousemove", this.onChange), window.removeEventListener("mouseup", this.onChange);
            }
            connectedCallback() {
                var i, r, n, s, a;
                if (!this.shadowRoot) return;
                this.cid = this.getAttribute("cid") || "";
                let t = c(this.getAttribute("color"));
                (this.hue = t.toHsv().h),
                    (this.shadowRoot.innerHTML = `
           <style>${vt}</style>
           <div class="hue">
                <div class="box">
                    <div class="hue-v box">
                        <div class="hue-h"></div>
                    </div>
                    
                    <div class="pointer box">
                        <div class="pointer-box" tabindex="0" style="left: ${T(this.hue)}%">
                            <div class="handler"></div>
                        </div>
                    </div>
                </div>
           </div>
        `),
                    (this.$hue = this.shadowRoot.querySelector(".hue")),
                    (this.$pointer = this.shadowRoot.querySelector(".pointer-box")),
                    (i = this.$hue) == null || i.addEventListener("mousedown", this.onMouseDown),
                    (r = this.$hue) == null || r.addEventListener("mouseup", this.onMouseUp),
                    (n = this.$hue) == null || n.addEventListener("touchmove", this.onChange),
                    (s = this.$hue) == null || s.addEventListener("touchstart", this.onChange),
                    (a = this.$pointer) == null || a.addEventListener("keydown", this.onKeyDown),
                    document.addEventListener(p, this.hsvChanged);
            }
            disconnectedCallback() {
                var t, i, r, n, s;
                (t = this.$hue) == null || t.removeEventListener("mousedown", this.onMouseDown),
                    (i = this.$hue) == null || i.removeEventListener("mouseup", this.onMouseUp),
                    (r = this.$hue) == null || r.removeEventListener("touchmove", this.onChange),
                    (n = this.$hue) == null || n.removeEventListener("touchstart", this.onChange),
                    (s = this.$pointer) == null || s.removeEventListener("keydown", this.onKeyDown),
                    document.removeEventListener(p, this.hsvChanged);
            }
            attributeChangedCallback(t, i, r) {
                let s = c(r).toHsv();
                (this.hue = s.h), this.render();
            }
        },
        mt = Y;

    var Et =
        ".fields{font-size:11px;grid-template-columns:60px 35px 35px 35px;text-align:center;display:grid;gap:.25rem;margin-top:.25rem;color:var(--modetext)}.fields input{background:var(--modeback);border-width:1px;border-style:solid;border-color:var(--backtext);padding:1px 3px;border-radius:2px;color:var(--modetext);font-family:inherit;font-size:100%;line-height:inherit;margin:0;box-sizing:border-box}";
    var J = class extends HTMLElement {
            constructor() {
                super();
                h(this, "cid");
                h(this, "color", new l("#000"));
                h(this, "$hex");
                h(this, "$r");
                h(this, "$g");
                h(this, "$b");
                h(this, "hex", "");
                h(this, "r", 0);
                h(this, "g", 0);
                h(this, "b", 0);
                h(this, "a", 1);
                this.attachShadow({ mode: "open" }),
                    (this.hsvChanged = this.hsvChanged.bind(this)),
                    (this.hueChanged = this.hueChanged.bind(this)),
                    (this.onHexChange = this.onHexChange.bind(this)),
                    (this.render = this.render.bind(this)),
                    (this.onRedChange = this.onRedChange.bind(this)),
                    (this.onGreenChange = this.onGreenChange.bind(this)),
                    (this.onBlueChange = this.onBlueChange.bind(this)),
                    (this.onRedKeyDown = this.onRedKeyDown.bind(this)),
                    (this.onBlueKeyDown = this.onBlueKeyDown.bind(this)),
                    (this.onGreenKeyDown = this.onGreenKeyDown.bind(this))
            }
            static get observedAttributes() {
                return ["color"];
            }
            hueChanged(t) {
                if (!t || !t.detail || !t.detail.cid || t.detail.cid !== this.cid) return;
                let i = this.color.toHsv();
                (this.color = new l({ h: Number(t.detail.h), s: i.s, v: i.v, a: i.a })), this.render();
            }
            hsvChanged(t) {
                !t || !t.detail || !t.detail.cid || (t.detail.cid === this.cid && ((this.color = new l({ h: t.detail.h, s: t.detail.s, v: t.detail.v, a: this.color.toHsv().a })), this.render()));
            }
            render() {
                var i, r, n, s;
                let t = this.color.toRgb();
                (this.r = t.r),
                    (this.g = t.g),
                    (this.b = t.b),
                    (this.a = t.a),
                    (this.hex = this.color.toHex()),
                    this.$hex && ((i = this.shadowRoot) == null ? void 0 : i.activeElement) !== this.$hex && (this.$hex.value = this.hex.toUpperCase()),
                    this.$r && ((r = this.shadowRoot) == null ? void 0 : r.activeElement) !== this.$r && (this.$r.value = this.r.toString()),
                    this.$g && ((n = this.shadowRoot) == null ? void 0 : n.activeElement) !== this.$g && (this.$g.value = this.g.toString()),
                    this.$b && ((s = this.shadowRoot) == null ? void 0 : s.activeElement) !== this.$b && (this.$b.value = this.b.toString())
            }
            onFieldKeyDown(t, i) {
                var n, s;
                let r = this.color.toRgb();
                switch (t.key) {
                    case "ArrowUp": {
                        if (i === "r") {
                            (this.r = Math.min(255, r.r + 1)), (r.r = this.r);
                            let a = new l(r).toHsv();
                            b(this.cid, a.h, a.s, a.v), (this.$r.value = this.r.toString()), this.render();
                        }
                        if (i === "g") {
                            (this.g = Math.min(255, r.g + 1)), (r.g = this.g);
                            let a = new l(r).toHsv();
                            b(this.cid, a.h, a.s, a.v), (this.$g.value = this.g.toString()), this.render();
                        }
                        if (i === "b") {
                            (this.b = Math.min(255, r.b + 1)), (r.b = this.b);
                            let a = new l(r).toHsv();
                            b(this.cid, a.h, a.s, a.v), (this.$b.value = this.b.toString()), this.render();
                        }
                        break;
                    }
                    case "ArrowDown": {
                        if (i === "r") {
                            (this.r = Math.max(0, r.r - 1)), (r.r = this.r);
                            let a = new l(r).toHsv();
                            b(this.cid, a.h, a.s, a.v), (this.$r.value = this.r.toString()), this.render();
                        }
                        if (i === "g") {
                            (this.g = Math.max(0, r.g - 1)), (r.g = this.g);
                            let a = new l(r).toHsv();
                            b(this.cid, a.h, a.s, a.v), (this.$g.value = this.g.toString()), this.render();
                        }
                        if (i === "b") {
                            (this.b = Math.max(0, r.b - 1)), (r.b = this.b);
                            let a = new l(r).toHsv();
                            b(this.cid, a.h, a.s, a.v), (this.$b.value = this.b.toString()), this.render();
                        }
                        break;
                    }
                    case "Escape": {
                        (n = this.shadowRoot) != null && n.activeElement && this.shadowRoot.activeElement.blur(), this.render();
                        break;
                    }
                    case "Enter": {
                        (s = this.shadowRoot) != null && s.activeElement && this.shadowRoot.activeElement.blur(), this.render();
                        break;
                    }
                }
            }
            onRedKeyDown(t) {
                this.onFieldKeyDown(t, "r");
            }
            onGreenKeyDown(t) {
                this.onFieldKeyDown(t, "g");
            }
            onBlueKeyDown(t) {
                this.onFieldKeyDown(t, "b");
            }
            onHexChange(t) {
                if(typeof t === 'string') {
                    let r = new l(t);
                    if (r.isValid) {
                        this.color = r;
                        let n = this.color.toHsv();
                        b(this.cid, n.h, n.s, n.v);
                    }
                    return;
                }
                let i = t.target;
                if (i.value.length !== 6) return;
                let r = new l(`#${i.value}`);
                if (r.isValid) {
                    this.color = r;
                    let n = this.color.toHsv();
                    b(this.cid, n.h, n.s, n.v);
                }
            }
            onRedChange(t) {
                let i = t.target,
                    r = I(i.value);
                if (r.toString() === i.value) {
                    let n = this.color.toRgb();
                    n.r = r;
                    let s = new l(n).toHsv();
                    b(this.cid, s.h, s.s, s.v);
                }
            }
            onGreenChange(t) {
                let i = t.target,
                    r = I(i.value);
                if (r.toString() === i.value) {
                    let n = this.color.toRgb();
                    n.g = r;
                    let s = new l(n).toHsv();
                    b(this.cid, s.h, s.s, s.v);
                }
            }
            onBlueChange(t) {
                let i = t.target,
                    r = I(i.value);
                if (r.toString() === i.value) {
                    let n = this.color.toRgb();
                    n.b = r;
                    let s = new l(n).toHsv();
                    b(this.cid, s.h, s.s, s.v);
                }
            }
            hexToRgb(hex) {
                hex = hex.replace('#', '');
                if (hex.length === 3) {
                    hex = hex.split('').map(c => c + c).join('');
                }
                let r = parseInt(hex.substring(0, 2), 16);
                let g = parseInt(hex.substring(2, 4), 16);
                let b = parseInt(hex.substring(4, 6), 16);
                return { r, g, b };
            }
            connectedCallback() {
                if (!this.shadowRoot) return;
                (this.cid = this.getAttribute("cid") || ""), (this.color = c(this.getAttribute("color")));
                let t = this.color.toRgb();
                (this.r = t.r), (this.g = t.g), (this.b = t.b), (this.a = t.a), (this.hex = this.color.toHex());
                let i = $(),
                    r = $(),
                    n = $(),
                    s = $(),
                    a = $();
                const pickerID = this.offsetParent.offsetParent.parentNode.host.id;
                const currentHex = pickerID == "primary-colour-picker" ? document.documentElement.style.getPropertyValue('--main') : document.documentElement.style.getPropertyValue('--secondary');
                const rgb = this.hexToRgb(currentHex);

                (this.shadowRoot.innerHTML = `
           <style>${Et}</style>
           <div class="fields">
               <input id="hex-${i}" type="text" value="${this.hex.toUpperCase()}" data-type="hex" />
               <input id="r-${r}" type="text" value="${this.r}" data-type="r" />
               <input id="g-${n}" type="text" value="${this.g}" data-type="g" />
               <input id="b-${s}" type="text" value="${this.b}" data-type="b" />
               
               <label for="hex-${i}">Hex</label>
               <label for="r-${r}">R</label>
               <label for="g-${n}">G</label>
               <label for="b-${s}">B</label>
           </div>
        `),
                    (this.$hex = this.shadowRoot.getElementById(`hex-${i}`)),
                    (this.$r = this.shadowRoot.getElementById(`r-${r}`)),
                    (this.$g = this.shadowRoot.getElementById(`g-${n}`)),
                    (this.$b = this.shadowRoot.getElementById(`b-${s}`)),

                    this.onHexChange(currentHex),
                    this.$hex.value = currentHex.slice(1),
                    this.$r.value = rgb.r,
                    this.$g.value = rgb.g,
                    this.$b.value = rgb.b,
                    
                    document.addEventListener(p, this.hsvChanged),
                    document.addEventListener(f, this.hueChanged),
                    this.$hex.addEventListener("input", this.onHexChange),
                    this.$r.addEventListener("input", this.onRedChange),
                    this.$g.addEventListener("input", this.onGreenChange),
                    this.$b.addEventListener("input", this.onBlueChange),
                    this.$hex.addEventListener("blur", this.render),
                    this.$r.addEventListener("blur", this.render),
                    this.$g.addEventListener("blur", this.render),
                    this.$b.addEventListener("blur", this.render),
                    this.$r.addEventListener("keydown", this.onRedKeyDown),
                    this.$g.addEventListener("keydown", this.onGreenKeyDown),
                    this.$b.addEventListener("keydown", this.onBlueKeyDown)
            }
            disconnectedCallback() {
                document.removeEventListener(p, this.hsvChanged),
                    document.removeEventListener(f, this.hueChanged),
                    this.$hex.removeEventListener("input", this.onHexChange),
                    this.$r.removeEventListener("input", this.onRedChange),
                    this.$g.removeEventListener("input", this.onGreenChange),
                    this.$b.removeEventListener("input", this.onBlueChange),
                    this.$hex.removeEventListener("blur", this.render),
                    this.$r.removeEventListener("blur", this.render),
                    this.$g.removeEventListener("blur", this.render),
                    this.$b.removeEventListener("blur", this.render),
                    this.$r.removeEventListener("keydown", this.onRedKeyDown),
                    this.$g.removeEventListener("keydown", this.onGreenKeyDown),
                    this.$b.removeEventListener("keydown", this.onBlueKeyDown)
            }
            attributeChangedCallback(t, i, r) {
                (this.color = c(r)), this.render();
            }
        },
        Ct = J;
    var Z = class extends HTMLElement {
            constructor() {
                super();
                h(this, "cid");
                h(this, "popupPosition", "left");
                h(this, "$popup");
                h(this, "color", "#000");
                customElements.get("theme-colour-picker-saturation") || customElements.define("theme-colour-picker-saturation", bt),
                    customElements.get("theme-colour-picker-hue") || customElements.define("theme-colour-picker-hue", mt),
                    customElements.get("theme-colour-picker-fields") || customElements.define("theme-colour-picker-fields", Ct),
                    (this.cid = this.getAttribute("cid") || ""),
                    (this.prevent = this.prevent.bind(this)),
                    this.attachShadow({ mode: "open" });
            }
            static get observedAttributes() {
                return ["color", "popup-position"];
            }
            prevent(t) {
                t.stopPropagation();
            }
            connectedCallback() {
                var t, i;
                !this.shadowRoot ||
                    ((this.color = this.getAttribute("color") || "#000"),
                    (this.popupPosition = this.getAttribute("popup-position") || "left"),
                    (this.shadowRoot.innerHTML = `
           <style>${it}</style>
           <div class="popup">
                <theme-colour-picker-saturation color="${this.color}" cid="${this.cid}"></theme-colour-picker-saturation>
                <theme-colour-picker-hue color="${this.color}" cid="${this.cid}"></theme-colour-picker-hue>
                <theme-colour-picker-fields color="${this.color}" cid="${this.cid}"></theme-colour-picker-fields>
           </div>
        `),
                    (this.$popup = this.shadowRoot.querySelector(".popup")),
                    (t = this.$popup) == null || t.addEventListener("mousedown", this.prevent),
                    (i = this.$popup) == null || i.classList.toggle("right", this.popupPosition === "right"));
            }
            disconnectedCallback() {
                var t;
                (t = this.$popup) == null || t.removeEventListener("mousedown", this.prevent);
            }
            attributeChangedCallback(t, r) {
                var n, s, d;
                if ((t === "popup-position" && ((this.popupPosition = r), this.$popup && this.$popup.classList.toggle("right", this.popupPosition === "right")), t === "color")) {
                    this.color = r;
                    let x = (n = this.shadowRoot) == null ? void 0 : n.querySelector("theme-colour-picker-saturation"),
                        w = (s = this.shadowRoot) == null ? void 0 : s.querySelector("theme-colour-picker-hue"),
                        et = (d = this.shadowRoot) == null ? void 0 : d.querySelector("theme-colour-picker-fields");
                    x && x.setAttribute("color", this.color), w && w.setAttribute("color", this.color), et && et.setAttribute("color", this.color);
                }
            }
        },
        yt = Z;
    var Ut = { sm: "0.875rem", md: "1.2rem", lg: "1.5rem", xl: "2.25rem", "2xl": "3rem", "3xl": "3.75rem", "4xl": "4.5rem" },
        tt = class extends HTMLElement {
            constructor() {
                super();
                h(this, "cid");
                h(this, "$button");
                h(this, "$buttonColour");
                h(this, "$popupBox");
                h(this, "stateDefaults", { isPopupVisible: !1, popupPosition: "left", initialColour: new l("#000"), color: new l("#000"), buttonWidth: null, buttonHeight: null, buttonPadding: null });
                h(this, "state");
                (this.cid = $()),
                    customElements.get("theme-colour-picker-popup") || customElements.define("theme-colour-picker-popup", yt),
                    this.attachShadow({ mode: "open" }),
                    (this.toggle = this.toggle.bind(this)),
                    (this.onKeyDown = this.onKeyDown.bind(this)),
                    (this.clickedOutside = this.clickedOutside.bind(this)),
                    (this.stopPropagation = this.stopPropagation.bind(this)),
                    (this.hsvChanged = this.hsvChanged.bind(this)),
                    (this.hueChanged = this.hueChanged.bind(this)),
                    (this.buttonClicked = this.buttonClicked.bind(this)),
                    (this.formatButtonSize = this.formatButtonSize.bind(this)),
                    this.initState();
            }
            static get observedAttributes() {
                return ["color", "popup-position", "button-width", "button-height", "button-padding"];
            }
            set color(t) {
                this.state.color = new l(t);
            }
            get color() {
                return this.state.color;
            }
            get hex() {
                return this.state.color.toHexString().toUpperCase();
            }
            initState() {
                let t = this;
                this.state = new Proxy(t.stateDefaults, {
                    set(i, r, n, s) {
                        return (
                            (i[r] = n),
                            r === "isPopupVisible" && t.onPopupVisibilityChange(),
                            r === "popupPosition" && t.onPopupPosChange(),
                            r === "initialColour" && t.oninitialColourChange(),
                            r === "color" && t.onColourChange(),
                            (r === "buttonWidth" || r === "buttonHeight" || r === "buttonPadding") && t.setButtonSize(),
                            !0
                        );
                    },
                });
            }
            onPopupVisibilityChange() {
                !this.$popupBox || (this.$popupBox.innerHTML = this.state.isPopupVisible ? `<theme-colour-picker-popup color="${this.state.color.toRgbString()}" cid="${this.cid}" popup-position="${this.state.popupPosition}" />` : "");
            }
            onPopupPosChange() {
                if (!this.$popupBox) return;
                let t = this.$popupBox.querySelector("theme-colour-picker-popup");
                !t || t.setAttribute("popup-position", this.state.popupPosition);
            }
            oninitialColourChange() {
                var r;
                let t = S(this.state.color);
                this.$buttonColour && (this.$buttonColour.style.backgroundColor = t);
                let i = (r = this.shadowRoot) == null ? void 0 : r.querySelector("theme-colour-picker-popup");
                i && i.setAttribute("color", t);
            }
            setButtonSize() {
                !this.$button ||
                    (this.state.buttonWidth && (this.$button.style.width = this.formatButtonSize(this.state.buttonWidth)),
                    this.state.buttonHeight && (this.$button.style.height = this.formatButtonSize(this.state.buttonHeight)),
                    this.state.buttonPadding && (this.$button.style.padding = this.state.buttonPadding));
            }
            onColourChange() {
                this.$buttonColour && (this.$buttonColour.style.backgroundColor = S(this.state.color)),
                    this.dispatchEvent(new CustomEvent("change", { detail: { hex: this.hex, hex8: this.hex8, rgb: this.rgb, rgba: this.rgba, hsl: this.hsl, hsv: this.hsv, hsva: this.hsva, color: this.color } }));
            }
            hsvChanged(t) {
                !t || !t.detail || !t.detail.cid || (t.detail.cid === this.cid && (this.state.color = new l({ h: t.detail.h, s: t.detail.s, v: t.detail.v, a: this.state.color.toHsv().a })));
            }
            hueChanged(t) {
                if (!t || !t.detail || !t.detail.cid || t.detail.cid !== this.cid) return;
                let i = this.state.color.toHsv();
                this.state.color = new l({ h: t.detail.h, s: i.s, v: i.v, a: i.a });
            }
            buttonClicked(t) {
                !t || !t.detail || !t.detail.cid || (t.detail.cid !== this.cid && (this.state.isPopupVisible = !1));
            }
            clickedOutside() {
                this.state.isPopupVisible = !1;
            }
            toggle() {
                let t = this.state.isPopupVisible;
                if (!t) {
                    this.state.isPopupVisible = !t;
                    nt(this.cid);
                }
            }
            onKeyDown(t) {
                t.key === "Escape" && (this.state.isPopupVisible = !1);
            }
            stopPropagation(t) {
                t.stopPropagation();
            }
            formatButtonSize(t) {
                var i;
                return (i = Ut[t]) != null ? i : t;
            }
            connectedCallback() {
                var t, i, r;
                !this.shadowRoot ||
                    ((this.state.initialColour = c(this.getAttribute("color"))),
                    (this.state.color = c(this.getAttribute("color"))),
                    (this.state.popupPosition = this.getAttribute("popup-position") || "left"),
                    (this.state.buttonWidth = this.getAttribute("button-width")),
                    (this.state.buttonHeight = this.getAttribute("button-height")),
                    (this.state.buttonPadding = this.getAttribute("button-padding")),
                    (this.shadowRoot.innerHTML = `
            <style>
                ${ot} 
            </style>
            <div class="colour-picker" >
                <button
                    type="button"
                    tabIndex="0"
                    class="button"
                    title="Select Colour">
                    <span class="button-colour" style="background: ${S(this.state.color)};"></span>
                </button>
                <div data-popup-box></div>
            </div>
        `),
                    (this.$button = this.shadowRoot.querySelector(".button")),
                    (this.$buttonColour = this.shadowRoot.querySelector(".button-colour")),
                    (t = this.$button) == null || t.addEventListener("click", this.toggle),
                    (i = this.$button) == null || i.addEventListener("keydown", this.onKeyDown),
                    (r = this.$button) == null || r.addEventListener("mousedown", this.stopPropagation),
                    (this.$popupBox = this.shadowRoot.querySelector("[data-popup-box]")),
                    this.setButtonSize(),
                    document.addEventListener("mousedown", this.clickedOutside),
                    document.addEventListener(p, this.hsvChanged),
                    document.addEventListener(f, this.hueChanged),
                    document.addEventListener(D, this.buttonClicked));
            }
            disconnectedCallback() {
                var t, i, r;
                (t = this.$button) == null || t.removeEventListener("click", this.toggle),
                    (i = this.$button) == null || i.removeEventListener("keydown", this.onKeyDown),
                    (r = this.$button) == null || r.removeEventListener("mousedown", this.stopPropagation),
                    document.removeEventListener("mousedown", this.clickedOutside),
                    document.removeEventListener(p, this.hsvChanged),
                    document.removeEventListener(f, this.hueChanged),
                    document.removeEventListener(D, this.buttonClicked);
            }
            attributeChangedCallback(t) {
                switch (t) {
                    case "color": {
                        (this.state.initialColour = c(this.getAttribute("color"))), (this.state.color = c(this.getAttribute("color"))), this.oninitialColourChange();
                        break;
                    }
                    case "popup-position": {
                        (this.state.popupPosition = this.getAttribute("popup-position") || "left"), this.onPopupPosChange();
                        break;
                    }
                    case "button-width": {
                        (this.state.buttonWidth = this.getAttribute("button-width")), this.setButtonSize();
                        break;
                    }
                    case "button-height": {
                        (this.state.buttonHeight = this.getAttribute("button-height")), this.setButtonSize();
                        break;
                    }
                    case "button-padding": {
                        (this.state.buttonPadding = this.getAttribute("button-padding")), this.setButtonSize();
                        break;
                    }
                }
            }
        },
        $t = tt;
    customElements.get("theme-colour-picker") || customElements.define("theme-colour-picker", $t);
})();
