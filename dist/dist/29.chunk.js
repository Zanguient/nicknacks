webpackJsonp([29],{

/***/ 250:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_mutative_router_vue__ = __webpack_require__(524);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_mutative_router_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_mutative_router_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_mutative_router_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_mutative_router_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_16fa3b38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_mutative_router_vue__ = __webpack_require__(944);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_16fa3b38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_mutative_router_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_16fa3b38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_mutative_router_vue__);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(943)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_mutative_router_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_16fa3b38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_mutative_router_vue___default.a,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/advanced-router/mutative-router.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-16fa3b38", Component.options)
  } else {
    hotAPI.reload("data-v-16fa3b38", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 397:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(11)(false);
// imports


// module
exports.push([module.i, "\n.advanced-router {\n  height: 240px !important;\n}\n.advanced-router-tip-p {\n  padding: 10px 0;\n}\n", ""]);

// exports


/***/ }),

/***/ 524:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    name: 'mutative-router',
    data: function data() {
        var _this = this;

        return {
            orderColumns: [{
                type: 'index',
                title: '序号',
                width: 60
            }, {
                title: '订单号',
                key: 'order_id',
                align: 'center'
            }, {
                title: '用户',
                key: 'user_name'
            }, {
                title: '详情',
                key: 'show_more',
                align: 'center',
                render: function render(h, params) {
                    return h('Button', {
                        props: {
                            type: 'text',
                            size: 'small'
                        },
                        on: {
                            click: function click() {
                                var argu = { order_id: params.row.order_id };
                                _this.$router.push({
                                    name: 'order-info',
                                    params: argu
                                });
                            }
                        }
                    }, '了解详情');
                }
            }],
            orderData: [{
                order_id: '1000001',
                user_name: 'Aresn'
            }, {
                order_id: '1000002',
                user_name: 'Lison'
            }, {
                order_id: '1000003',
                user_name: 'lili'
            }, {
                order_id: '1000004',
                user_name: 'lala'
            }]
        };
    },

    computed: {
        avatorImage: function avatorImage() {
            return localStorage.avatorImgPath;
        }
    }
};

/***/ }),

/***/ 943:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(397);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(12)("2f8f0c18", content, false, {});
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(397, function() {
     var newContent = __webpack_require__(397);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 944:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var render = function render() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", [_c("Row", [_c("Col", { attrs: { span: "24" } }, [_c("Card", [_c("p", { attrs: { slot: "title" }, slot: "title" }, [_c("Icon", { attrs: { type: "ios-list" } }), _vm._v("\n                    订单详情(动态路由)\n                ")], 1), _vm._v(" "), _c("Row", {
    staticClass: "advanced-router",
    attrs: {
      type: "flex",
      justify: "center",
      align: "middle"
    }
  }, [_c("Table", {
    staticStyle: { width: "100%" },
    attrs: {
      columns: _vm.orderColumns,
      data: _vm.orderData
    }
  })], 1)], 1)], 1)], 1)], 1);
};
var staticRenderFns = [];
render._withStripped = true;
var esExports = { render: render, staticRenderFns: staticRenderFns };
exports.default = esExports;

if (true) {
  module.hot.accept();
  if (module.hot.data) {
    __webpack_require__(0).rerender("data-v-16fa3b38", esExports);
  }
}

/***/ })

});
//# sourceMappingURL=29.chunk.js.map