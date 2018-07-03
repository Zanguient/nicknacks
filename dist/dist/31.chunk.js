webpackJsonp([31],{

/***/ 251:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_argument_page_vue__ = __webpack_require__(525);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_argument_page_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_argument_page_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_argument_page_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_argument_page_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_c4d9c30c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_argument_page_vue__ = __webpack_require__(946);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_c4d9c30c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_argument_page_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_c4d9c30c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_argument_page_vue__);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(945)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_argument_page_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_c4d9c30c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_argument_page_vue___default.a,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/advanced-router/argument-page.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c4d9c30c", Component.options)
  } else {
    hotAPI.reload("data-v-c4d9c30c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 398:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(11)(false);
// imports


// module
exports.push([module.i, "\n.advanced-router {\n  height: 240px !important;\n}\n.advanced-router-tip-p {\n  padding: 10px 0;\n}\n", ""]);

// exports


/***/ }),

/***/ 525:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    name: 'argument-page',
    data: function data() {
        var _this = this;

        return {
            shoppingColumns: [{
                type: 'index',
                title: '序号',
                width: 60
            }, {
                title: '购物单号',
                key: 'shopping_id',
                align: 'center'
            }, {
                title: '购买物品名称',
                key: 'name',
                align: 'center'
            }, {
                title: '购买时间',
                key: 'time'
            }, {
                title: '查看详情',
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
                                var query = { shopping_id: params.row.shopping_id };
                                _this.$router.push({
                                    name: 'shopping',
                                    query: query
                                });
                            }
                        }
                    }, '了解详情');
                }
            }],
            shoppingData: [{
                shopping_id: 100001,
                name: '《vue.js实战》',
                time: '2017年11月12日'
            }, {
                shopping_id: 100002,
                name: '面包',
                time: '2017年11月5日'
            }, {
                shopping_id: 100003,
                name: '咖啡',
                time: '2017年11月8日'
            }, {
                shopping_id: 100004,
                name: '超级豪华土豪金牙签',
                time: '2017年11月9日'
            }]
        };
    }
};

/***/ }),

/***/ 945:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(398);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(12)("4f82d6b2", content, false, {});
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(398, function() {
     var newContent = __webpack_require__(398);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 946:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var render = function render() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", [_c("Row", [_c("Card", [_c("p", { attrs: { slot: "title" }, slot: "title" }, [_c("Icon", { attrs: { type: "ios-list" } }), _vm._v("\n                购物记录(传递参数)\n            ")], 1), _vm._v(" "), _c("Row", {
    staticClass: "advanced-router",
    attrs: { type: "flex", justify: "center", align: "middle" }
  }, [_c("Table", {
    staticStyle: { width: "100%" },
    attrs: {
      columns: _vm.shoppingColumns,
      data: _vm.shoppingData
    }
  })], 1)], 1)], 1)], 1);
};
var staticRenderFns = [];
render._withStripped = true;
var esExports = { render: render, staticRenderFns: staticRenderFns };
exports.default = esExports;

if (true) {
  module.hot.accept();
  if (module.hot.data) {
    __webpack_require__(0).rerender("data-v-c4d9c30c", esExports);
  }
}

/***/ })

});
//# sourceMappingURL=31.chunk.js.map