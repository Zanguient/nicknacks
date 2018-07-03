webpackJsonp([23],{

/***/ 233:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_international_vue__ = __webpack_require__(494);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_international_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_international_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_international_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_international_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_a36573ba_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_international_vue__ = __webpack_require__(866);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_a36573ba_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_international_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_a36573ba_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_international_vue__);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(865)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_international_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_a36573ba_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_international_vue___default.a,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/international/international.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-a36573ba", Component.options)
  } else {
    hotAPI.reload("data-v-a36573ba", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 374:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(11)(false);
// imports


// module
exports.push([module.i, "\n.switch-language-row1 {\n  height: 240px !important;\n}\n.switch-language-tip {\n  font-size: 12px;\n  color: gray;\n  margin-top: 30px;\n}\n", ""]);

// exports


/***/ }),

/***/ 494:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    name: 'international_index',
    data: function data() {
        return {
            lang: 'zh-CN',
            valueText: 3,
            showModal: false,
            columnsI18n: [{
                key: 'name',
                title: this.$t('name')
            }, {
                key: 'company',
                title: this.$t('company')
            }],
            dataI18n: [{
                name: 'Aresn',
                company: 'TalkingData'
            }, {
                name: 'Lison',
                company: 'TalkingData'
            }, {
                name: 'Lucy',
                company: 'TalkingData'
            }]
        };
    },

    methods: {
        handleSwitch: function handleSwitch(lang) {
            this.lang = lang;
            localStorage.lang = lang;
            this.$store.commit('switchLang', lang);

            this.columnsI18n = [{
                key: 'name',
                title: this.$t('name')
            }, {
                key: 'company',
                title: this.$t('company')
            }];
        }
    },
    computed: {
        placeholderText: function placeholderText() {
            return this.$t('placeholderText');
        },
        placeholderDate: function placeholderDate() {
            return this.$t('placeholderDate');
        }
    },
    created: function created() {
        this.lang = localStorage.lang || 'zh-CN';
    }
};

/***/ }),

/***/ 865:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(374);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(12)("39c8fe88", content, false, {});
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(374, function() {
     var newContent = __webpack_require__(374);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 866:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var render = function render() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", [_c("Row", { attrs: { gutter: 10 } }, [_c("Col", { attrs: { span: "4" } }, [_c("Card", [_c("p", { attrs: { slot: "title" }, slot: "title" }, [_c("Icon", { attrs: { type: "ios-toggle" } }), _vm._v("\n                    " + _vm._s(_vm.$t("switchLangTitle")) + "\n                ")], 1), _vm._v(" "), _c("Row", {
    staticClass: "switch-language-row1",
    attrs: {
      type: "flex",
      justify: "center",
      align: "middle"
    }
  }, [_c("RadioGroup", {
    attrs: { value: _vm.lang, vertical: "" },
    on: { "on-change": _vm.handleSwitch }
  }, [_c("Radio", { attrs: { label: "zh-CN" } }, [_c("span", [_vm._v("中文简体")])]), _vm._v(" "), _c("Radio", { attrs: { label: "zh-TW" } }, [_c("span", [_vm._v("中文繁體")])]), _vm._v(" "), _c("Radio", { attrs: { label: "en-US" } }, [_c("span", [_vm._v("English")])])], 1), _vm._v(" "), _c("p", { staticClass: "switch-language-tip" }, [_vm._v(_vm._s(_vm.$t("tip")))])], 1)], 1)], 1), _vm._v(" "), _c("Col", { attrs: { span: "20" } }, [_c("Card", [_c("p", { attrs: { slot: "title" }, slot: "title" }, [_c("Icon", { attrs: { type: "ios-cog" } }), _vm._v("\n                    " + _vm._s(_vm.$t("iviewComponentTitle")) + "\n                ")], 1), _vm._v(" "), _c("Row", {
    staticClass: "switch-language-row1",
    attrs: {
      gutter: 10,
      type: "flex",
      justify: "center",
      align: "middle"
    }
  }, [_c("Col", { attrs: { span: "4", offset: "1" } }, [_c("p", [_vm._v(_vm._s(_vm.$t("intro")))])]), _vm._v(" "), _c("Col", { attrs: { span: "6", offset: "1" } }, [_c("Input", {
    staticStyle: { width: "100%" },
    attrs: { placeholder: _vm.placeholderText }
  }), _vm._v(" "), _c("div", { staticStyle: { "margin-top": "25px" } }, [_c("DatePicker", {
    staticStyle: { width: "100%" },
    attrs: {
      type: "date",
      placeholder: _vm.placeholderDate
    }
  })], 1), _vm._v(" "), _c("div", { staticStyle: { "margin-top": "25px" } }, [_c("Rate", {
    attrs: { "show-text": "" },
    model: {
      value: _vm.valueText,
      callback: function callback($$v) {
        _vm.valueText = $$v;
      },
      expression: "valueText"
    }
  })], 1)], 1), _vm._v(" "), _c("Col", { attrs: { span: "6" } }, [_c("Table", {
    attrs: {
      columns: _vm.columnsI18n,
      data: _vm.dataI18n
    }
  })], 1), _vm._v(" "), _c("Col", { attrs: { span: "6" } }, [_c("Button", {
    attrs: { type: "primary", long: "" },
    on: {
      click: function click($event) {
        _vm.showModal = true;
      }
    }
  }, [_vm._v(_vm._s(_vm.$t("btnText")))]), _vm._v(" "), _c("Modal", {
    attrs: { title: "iView" },
    model: {
      value: _vm.showModal,
      callback: function callback($$v) {
        _vm.showModal = $$v;
      },
      expression: "showModal"
    }
  }, [_c("p", [_vm._v(_vm._s(_vm.$t("modalText")))])]), _vm._v(" "), _c("div", { staticStyle: { "margin-top": "25px" } }, [_c("Poptip", {
    attrs: {
      confirm: "",
      title: _vm.$t("poptip")
    }
  }, [_c("Button", { attrs: { type: "primary", long: "" } }, [_vm._v(_vm._s(_vm.$t("showPoptipText")))])], 1)], 1)], 1)], 1)], 1)], 1)], 1)], 1);
};
var staticRenderFns = [];
render._withStripped = true;
var esExports = { render: render, staticRenderFns: staticRenderFns };
exports.default = esExports;

if (true) {
  module.hot.accept();
  if (module.hot.data) {
    __webpack_require__(0).rerender("data-v-a36573ba", esExports);
  }
}

/***/ })

});
//# sourceMappingURL=23.chunk.js.map