webpackJsonp([5],{

/***/ 242:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_page_vue__ = __webpack_require__(513);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_page_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_page_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_page_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_page_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_1d36e9df_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_split_pane_page_vue__ = __webpack_require__(918);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_1d36e9df_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_split_pane_page_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_1d36e9df_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_split_pane_page_vue__);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(913)
}
var normalizeComponent = __webpack_require__(2)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-1d36e9df"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_page_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_1d36e9df_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_split_pane_page_vue___default.a,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/my-components/split-pane/split-pane-page.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1d36e9df", Component.options)
  } else {
    hotAPI.reload("data-v-1d36e9df", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 387:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(11)(false);
// imports


// module
exports.push([module.i, "\n.split-pane-con[data-v-1d36e9df] {\n  width: 100%;\n  height: 89vh;\n}\n.custom-trigger[data-v-1d36e9df] {\n  position: absolute;\n  width: 40px;\n  height: 40px;\n  box-sizing: border-box;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  background: white;\n  border-radius: 50%;\n  box-shadow: 2px 2px 5px 2px rgba(0, 0, 0, 0.1), 2px 2px 10px 2px rgba(0, 0, 0, 0.2) inset;\n  border: 1px solid #c3c3c3;\n  cursor: pointer;\n}\n.introduce-left-con h4[data-v-1d36e9df] {\n  margin-bottom: 20px;\n}\n.introduce-left-con h5[data-v-1d36e9df] {\n  margin-bottom: 10px;\n  margin-left: 20px;\n}\n.split-pane-right-con[data-v-1d36e9df] {\n  padding: 30px;\n}\n.split-pane-right-con p[data-v-1d36e9df] {\n  font-size: 26px;\n  font-weight: 700;\n  color: white;\n}\n", ""]);

// exports


/***/ }),

/***/ 388:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(11)(false);
// imports


// module
exports.push([module.i, "\n.split-pane {\n  position: relative;\n}\n.split-pane-container {\n  height: 100%;\n  width: 100%;\n}\n.split-pane-horizontal > div > .split-pane-trigger {\n  transform: translateX(-50%);\n  cursor: col-resize;\n  width: 8px;\n  height: 100%;\n  margin: 0 1px;\n}\n.split-pane-horizontal > div > .split-pane-trigger .trigger-middle-point {\n  width: 3px;\n  height: 20px;\n}\n.split-pane-horizontal > div > .split-pane-trigger .trigger-middle-point p {\n  width: 100%;\n  height: 1px;\n  margin-top: 2px;\n}\n.split-pane-vertical > div > .split-pane-trigger {\n  transform: translateY(-50%);\n  cursor: row-resize;\n  height: 8px;\n  width: 100%;\n  margin: 1px 0;\n}\n.split-pane-vertical > div > .split-pane-trigger .trigger-middle-point {\n  width: 20px;\n  height: 3px;\n}\n.split-pane-vertical > div > .split-pane-trigger .trigger-middle-point p {\n  height: 100%;\n  width: 1px;\n  display: inline-block;\n  margin-left: 2px;\n}\n.split-pane-trigger {\n  position: absolute;\n  z-index: 3;\n  background: #F8F8F9;\n  box-shadow: 0 0 4px 0 rgba(28, 36, 56, 0.32);\n}\n.split-pane-trigger .trigger-middle-point {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -87%);\n  line-height: 0px;\n}\n.split-pane-trigger .trigger-middle-point p {\n  background: rgba(23, 35, 61, 0.25);\n}\n.split-pane-left-area {\n  height: 100%;\n  float: left;\n  z-index: 2;\n}\n.split-pane-right-area {\n  height: 100%;\n  float: left;\n  z-index: 2;\n}\n.split-pane-top-area {\n  width: 100%;\n  z-index: 2;\n}\n.split-pane-bottom-area {\n  width: 100%;\n  z-index: 2;\n}\n", ""]);

// exports


/***/ }),

/***/ 513:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _splitPane = __webpack_require__(914);

var _splitPane2 = _interopRequireDefault(_splitPane);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    name: 'split-pane-page',
    components: {
        splitPane: _splitPane2.default
    },
    data: function data() {
        return {
            triggerOffset: 20,
            triggerOffsetV: 70,
            triggerOffsetMin: 40,
            atMax: false,
            atMin: false
        };
    },

    methods: {
        handleMousedown: function handleMousedown(e) {
            this.$refs.pane.handleMousedown(e);
        },
        handleMoving: function handleMoving(e) {
            this.atMax = e.atMax;
            this.atMin = e.atMin;
        }
    }
};

/***/ }),

/***/ 514:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assign = __webpack_require__(92);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var oneOf = function oneOf(ele, targetArr) {
    if (targetArr.indexOf(ele) >= 0) {
        return true;
    } else {
        return false;
    }
};
exports.default = {
    name: 'splitPane',
    props: {
        value: {
            type: [Number, String],
            default: 50
        },
        direction: {
            type: String,
            default: 'horizontal',
            validator: function validator(val) {
                return oneOf(val, ['vertical', 'horizontal']);
            }
        },
        min: {
            type: [Number, String],
            default: 3
        },
        max: {
            type: [Number, String],
            default: 97
        },
        maxRight: {
            type: Boolean,
            default: false
        },
        right: {
            type: Boolean,
            default: false
        },
        triggerStyle: {
            type: Object,
            default: function _default() {
                if (this.direction === 'horizontal') {
                    return {
                        width: '4px',
                        background: '#BDBDBD'
                    };
                } else {
                    return {
                        height: '4px',
                        background: '#BDBDBD'
                    };
                }
            }
        }
    },
    data: function data() {
        return {
            prefix: 'split-pane',
            canMove: false,
            triggerOffset: 50,
            triggerOldOffset: 50,
            offset: {},
            atMin: false,
            atMax: false,
            directionMark: 0
        };
    },

    computed: {
        wraperClasses: function wraperClasses() {
            return [this.prefix, this.direction === 'vertical' ? this.prefix + '-vertical' : this.prefix + '-horizontal'];
        },
        leftSize: function leftSize() {
            return this.right ? 100 - this.triggerOffset + '%' : this.triggerOffset + '%';
        },
        rightSize: function rightSize() {
            return this.right ? this.triggerOffset + '%' : 100 - this.triggerOffset + '%';
        },
        triggerLeft: function triggerLeft() {
            return this.right ? 100 - this.triggerOffset + '%' : this.triggerOffset + '%';
        },
        minTransed: function minTransed() {
            return this.transValue(this.min);
        },
        maxTransed: function maxTransed() {
            var max = this.right ? 100 - this.transValue(this.max) : this.transValue(this.max);
            return this.maxRight ? 100 - max : max;
        },
        horizontalTriggerStyle: function horizontalTriggerStyle() {
            return (0, _assign2.default)({ left: this.triggerLeft }, this.triggerStyle);
        },
        verticalTriggerStyle: function verticalTriggerStyle() {
            return (0, _assign2.default)({ top: this.triggerLeft }, this.triggerStyle);
        }
    },
    methods: {
        handleMouseup: function handleMouseup(e) {
            this.canMove = false;
            this.$emit('on-resizing-end', e);
        },
        transValue: function transValue(val) {
            return typeof val === 'number' ? val : Math.floor(parseFloat(val) / this.$refs.wraper.offsetWidth * 10000) / 100;
        },
        handleMousedown: function handleMousedown(e) {
            this.canMove = true;
            this.triggerOldOffset = this.triggerOffset;
            this.offset = {
                x: e.pageX,
                y: e.pageY
            };
            this.$emit('on-resizing-start', e);
            e.preventDefault();
        },
        handleMouseout: function handleMouseout() {
            this.canMove = false;
        },
        handleMousemove: function handleMousemove(e) {
            if (this.canMove) {
                var offset = void 0;
                var moveSize = 0;
                if (this.direction === 'horizontal') {
                    moveSize = Math.floor((e.clientX - this.offset.x) / this.$refs.wraper.offsetWidth * 10000) / 100;
                    offset = this.triggerOldOffset + (this.right ? -moveSize : moveSize);
                } else {
                    moveSize = Math.floor((e.clientY - this.offset.y) / this.$refs.wraper.offsetHeight * 10000) / 100;
                    offset = this.triggerOldOffset + (this.right ? -moveSize : moveSize);
                }
                if (this.right) {
                    var offsetHandle = 100 - offset;
                    if (offsetHandle <= this.minTransed) {
                        this.triggerOffset = 100 - Math.max(offsetHandle, this.minTransed);
                    } else {
                        this.triggerOffset = 100 - Math.min(offsetHandle, this.maxTransed);
                    }
                } else {
                    if (offset <= this.minTransed) {
                        this.triggerOffset = Math.max(offset, this.minTransed);
                    } else {
                        this.triggerOffset = Math.min(offset, this.maxTransed);
                    }
                }
                e.atMin = 100 - offset <= this.minTransed;
                e.atMax = 100 - offset >= this.maxTransed;
                if (e.pageX > this.directionMark) {
                    e.direction = 1;
                } else {
                    e.direction = 0;
                }
                this.directionMark = e.pageX;
                this.$emit('input', this.triggerOffset);
                this.$emit('on-resizing', e);
            }
        },
        setTriggerOffset: function setTriggerOffset(offset) {
            var _this = this;

            this.$nextTick(function () {
                _this.triggerOffset = typeof offset === 'number' ? offset : Math.floor(parseInt(offset) / _this.$refs.wraper.offsetWidth * 10000) / 100;
                _this.$emit('input', _this.triggerOffset);
            });
        }
    },
    watch: {
        value: function value(val) {
            var _this2 = this;

            this.$nextTick(function () {
                _this2.triggerOffset = typeof val === 'number' ? val : Math.floor(parseInt(val) / _this2.$refs.wraper.offsetWidth * 10000) / 100;
            });
        }
    },
    mounted: function mounted() {
        var _this3 = this;

        if (this.value !== undefined) {
            this.$nextTick(function () {
                _this3.triggerOffset = typeof _this3.value === 'number' ? _this3.value : Math.floor(parseInt(_this3.value) / _this3.$refs.wraper.offsetWidth * 10000) / 100;
            });
            this.triggerOffset = typeof this.value === 'number' ? this.value : Math.floor(parseInt(this.value) / this.$refs.wraper.offsetWidth * 10000) / 100;
        }
    }
};

/***/ }),

/***/ 913:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(387);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(12)("6f9f67f0", content, false, {});
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(387, function() {
     var newContent = __webpack_require__(387);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 914:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _splitPane = __webpack_require__(915);

var _splitPane2 = _interopRequireDefault(_splitPane);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _splitPane2.default;

/***/ }),

/***/ 915:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_vue__ = __webpack_require__(514);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_95b033e6_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_split_pane_vue__ = __webpack_require__(917);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_95b033e6_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_split_pane_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_95b033e6_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_split_pane_vue__);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(916)
}
var normalizeComponent = __webpack_require__(2)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_split_pane_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_95b033e6_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_split_pane_vue___default.a,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/my-components/split-pane/split-pane/split-pane.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-95b033e6", Component.options)
  } else {
    hotAPI.reload("data-v-95b033e6", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 916:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(388);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(12)("a577a754", content, false, {});
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(388, function() {
     var newContent = __webpack_require__(388);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 917:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var render = function render() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", {
    ref: "wraper",
    class: _vm.wraperClasses,
    on: {
      mouseup: _vm.handleMouseup,
      mousemove: _vm.handleMousemove,
      mouseleave: _vm.handleMouseout
    }
  }, [_vm.direction === "horizontal" ? _c("div", { class: _vm.prefix + "-container" }, [_c("div", {
    class: _vm.prefix + "-left-area",
    style: { width: _vm.leftSize }
  }, [_vm._t("left")], 2), _vm._v(" "), _vm._t("trigger", [_c("div", {
    ref: "trigger",
    class: _vm.prefix + "-trigger",
    style: _vm.horizontalTriggerStyle,
    attrs: { unselectable: "on" },
    on: { mousedown: _vm.handleMousedown }
  }, [_vm._m(0)])]), _vm._v(" "), _c("div", {
    class: _vm.prefix + "-right-area",
    style: { width: _vm.rightSize }
  }, [_vm._t("right")], 2)], 2) : _c("div", { class: _vm.prefix + "-container" }, [_c("div", {
    class: _vm.prefix + "-top-area",
    style: { height: _vm.leftSize }
  }, [_vm._t("top")], 2), _vm._v(" "), _vm._t("trigger", [_c("div", {
    ref: "trigger",
    class: _vm.prefix + "-trigger",
    style: _vm.verticalTriggerStyle,
    attrs: { unselectable: "on" },
    on: { mousedown: _vm.handleMousedown }
  }, [_vm._m(1)])]), _vm._v(" "), _c("div", {
    class: _vm.prefix + "-bottom-area",
    style: { height: _vm.rightSize }
  }, [_vm._t("bottom")], 2)], 2)]);
};
var staticRenderFns = [function () {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "trigger-middle-point" }, [_c("p"), _c("p"), _c("p"), _c("p"), _c("p"), _c("p")]);
}, function () {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "trigger-middle-point" }, [_c("p"), _c("p"), _c("p"), _c("p"), _c("p"), _c("p")]);
}];
render._withStripped = true;
var esExports = { render: render, staticRenderFns: staticRenderFns };
exports.default = esExports;

if (true) {
  module.hot.accept();
  if (module.hot.data) {
    __webpack_require__(0).rerender("data-v-95b033e6", esExports);
  }
}

/***/ }),

/***/ 918:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var render = function render() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", [_c("Card", { attrs: { padding: 0 } }, [_c("div", { staticClass: "split-pane-con" }, [_c("split-pane", {
    style: { height: "100%" },
    attrs: {
      right: "",
      min: 20,
      max: "100px",
      direction: "horizontal"
    },
    on: { "on-trigger-moving": _vm.handleMoving },
    model: {
      value: _vm.triggerOffset,
      callback: function callback($$v) {
        _vm.triggerOffset = $$v;
      },
      expression: "triggerOffset"
    }
  }, [_c("div", {
    staticStyle: { height: "100%" },
    attrs: { slot: "left" },
    slot: "left"
  }, [_c("split-pane", {
    style: { height: "100%" },
    attrs: { direction: "vertical" },
    model: {
      value: _vm.triggerOffsetV,
      callback: function callback($$v) {
        _vm.triggerOffsetV = $$v;
      },
      expression: "triggerOffsetV"
    }
  }, [_c("div", {
    staticClass: "introduce-left-con",
    staticStyle: {
      background: "#EDE3A0",
      height: "100%",
      padding: "30px"
    },
    attrs: { slot: "top" },
    slot: "top"
  }, [_c("h4", [_vm._v("- 该组件可以拖动修改左右尺寸，还可以绑定v-model来设置，如设置v-model=\"40\"即左侧40%，右侧60%，也可设置'200px'像素值")]), _vm._v(" "), _c("h4", [_vm._v("- 设置right属性则v-model设置的值为右侧（下册）的宽度（高度）")]), _vm._v(" "), _c("h4", [_vm._v('- 可设置最小和最大距离，如:min="80"即向右拖动到80%处就不能再拖动')]), _vm._v(" "), _c("h4", [_vm._v("- 可绑定事件@on-trigger-moving，回调函数的返回值是鼠标事件对象，同时该对象还包括两个我们自定义的变量，即atMax和atMin，即此时是否是在最大或最小距离处，类型是Boolean。来拖动右边的trigger看看吧。")]), _vm._v(" "), _c("h4", { staticStyle: { "margin-bottom": "10px" } }, [_vm._v('- 可使用slot="trigger"自定义拖动触发器，但有三个注意点:')]), _vm._v(" "), _c("h5", [_vm._v("-- 样式需要设置position: absolute;")]), _vm._v(" "), _c("h5", [_vm._v("-- 需要给trigger绑定mousedown事件，绑定的方法调用this.$refs.pane.handleMousedow(e)，e为mousedown事件的事件对象")]), _vm._v(" "), _c("h5", [_vm._v("-- 给trigger添加:style=\"{width: offset + '%'}\"，这里的offset是通过v-model给split-pane组件绑定的值")]), _vm._v(" "), _c("h4", [_vm._v("- 其他api请看源码")])]), _vm._v(" "), _c("div", {
    staticStyle: {
      background: "#A2EDB6",
      height: "100%"
    },
    attrs: { slot: "bottom" },
    slot: "bottom"
  }, [_c("split-pane", {
    ref: "pane",
    style: { height: "100%" },
    attrs: { direction: "horizontal" },
    model: {
      value: _vm.triggerOffsetMin,
      callback: function callback($$v) {
        _vm.triggerOffsetMin = $$v;
      },
      expression: "triggerOffsetMin"
    }
  }, [_c("div", {
    staticStyle: {
      background: "#EDACE2",
      height: "100%"
    },
    attrs: { slot: "left" },
    slot: "left"
  }), _vm._v(" "), _c("div", {
    staticClass: "custom-trigger",
    style: { left: _vm.triggerOffsetMin + "%" },
    attrs: { slot: "trigger" },
    on: { mousedown: _vm.handleMousedown },
    slot: "trigger"
  }), _vm._v(" "), _c("div", {
    staticStyle: {
      background: "#A2EDB6",
      height: "100%"
    },
    attrs: { slot: "right" },
    slot: "right"
  })])], 1)])], 1), _vm._v(" "), _c("div", {
    staticClass: "split-pane-right-con",
    staticStyle: { background: "#8FB5ED", height: "100%" },
    attrs: { slot: "right" },
    slot: "right"
  }, [_c("p", [_vm._v("是否是在最小距离处： " + _vm._s(_vm.atMin))]), _vm._v(" "), _c("p", [_vm._v("是否是在最大距离处： " + _vm._s(_vm.atMax))])])])], 1)])], 1);
};
var staticRenderFns = [];
render._withStripped = true;
var esExports = { render: render, staticRenderFns: staticRenderFns };
exports.default = esExports;

if (true) {
  module.hot.accept();
  if (module.hot.data) {
    __webpack_require__(0).rerender("data-v-1d36e9df", esExports);
  }
}

/***/ })

});
//# sourceMappingURL=5.chunk.js.map