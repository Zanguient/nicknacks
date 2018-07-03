webpackJsonp([19],{

/***/ 227:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_own_space_vue__ = __webpack_require__(487);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_own_space_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_own_space_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_own_space_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_own_space_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_809e9776_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_own_space_vue__ = __webpack_require__(850);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_809e9776_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_own_space_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_809e9776_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_own_space_vue__);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(849)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_own_space_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__babel_loader_node_modules_vue_loader_lib_template_compiler_index_id_data_v_809e9776_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_own_space_vue___default.a,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/views/own-space/own-space.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(0)
  hotAPI.install(__webpack_require__(1), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-809e9776", Component.options)
  } else {
    hotAPI.reload("data-v-809e9776", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 366:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(11)(false);
// imports


// module
exports.push([module.i, "\n.own-space-btn-box {\n  margin-bottom: 10px;\n}\n.own-space-btn-box button {\n  padding-left: 0;\n}\n.own-space-btn-box button span {\n  color: #2D8CF0;\n  transition: all .2s;\n}\n.own-space-btn-box button span:hover {\n  color: #0C25F1;\n  transition: all .2s;\n}\n.own-space-tra {\n  width: 10px;\n  height: 10px;\n  transform: rotate(45deg);\n  position: absolute;\n  top: 50%;\n  margin-top: -6px;\n  left: -3px;\n  box-shadow: 0 0 2px 3px rgba(0, 0, 0, 0.1);\n  background-color: white;\n  z-index: 100;\n}\n.own-space-input-identifycode-con {\n  position: absolute;\n  width: 200px;\n  height: 100px;\n  right: -220px;\n  top: 50%;\n  margin-top: -50px;\n  border-radius: 4px;\n  box-shadow: 0 0 2px 3px rgba(0, 0, 0, 0.1);\n}\n", ""]);

// exports


/***/ }),

/***/ 487:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = __webpack_require__(30);

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    name: 'ownspace_index',
    data: function data() {
        var _this = this;

        var validePhone = function validePhone(rule, value, callback) {
            var re = /^1[0-9]{10}$/;
            if (!re.test(value)) {
                callback(new Error('请输入正确格式的手机号'));
            } else {
                callback();
            }
        };
        var valideRePassword = function valideRePassword(rule, value, callback) {
            if (value !== _this.editPasswordForm.newPass) {
                callback(new Error('两次输入密码不一致'));
            } else {
                callback();
            }
        };
        return {
            userForm: {
                name: '',
                cellphone: '',
                company: '',
                department: ''
            },
            uid: '',
            securityCode: '',
            phoneHasChanged: false,
            save_loading: false,
            identifyError: '',
            editPasswordModal: false,
            savePassLoading: false,
            oldPassError: '',
            identifyCodeRight: false,
            hasGetIdentifyCode: false,
            canGetIdentifyCode: false,
            checkIdentifyCodeLoading: false,
            inforValidate: {
                name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
                cellphone: [{ required: true, message: '请输入手机号码' }, { validator: validePhone }]
            },
            editPasswordForm: {
                oldPass: '',
                newPass: '',
                rePass: ''
            },
            passwordValidate: {
                oldPass: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
                newPass: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '请至少输入6个字符', trigger: 'blur' }, { max: 32, message: '最多输入32个字符', trigger: 'blur' }],
                rePass: [{ required: true, message: '请再次输入新密码', trigger: 'blur' }, { validator: valideRePassword, trigger: 'blur' }]
            },
            inputCodeVisible: false,
            initPhone: '',
            gettingIdentifyCodeBtnContent: '获取验证码' };
    },

    methods: {
        getIdentifyCode: function getIdentifyCode() {
            var _this2 = this;

            this.hasGetIdentifyCode = true;
            this.$refs['userForm'].validate(function (valid) {
                if (valid) {
                    _this2.canGetIdentifyCode = true;
                    var timeLast = 60;
                    var timer = setInterval(function () {
                        if (timeLast >= 0) {
                            _this2.gettingIdentifyCodeBtnContent = timeLast + '秒后重试';
                            timeLast -= 1;
                        } else {
                            clearInterval(timer);
                            _this2.gettingIdentifyCodeBtnContent = '获取验证码';
                            _this2.canGetIdentifyCode = false;
                        }
                    }, 1000);
                    _this2.inputCodeVisible = true;
                }
            });
        },
        showEditPassword: function showEditPassword() {
            this.editPasswordModal = true;
        },
        cancelEditUserInfor: function cancelEditUserInfor() {
            this.$store.commit('removeTag', 'ownspace_index');
            localStorage.pageOpenedList = (0, _stringify2.default)(this.$store.state.app.pageOpenedList);
            var lastPageName = '';
            if (this.$store.state.app.pageOpenedList.length > 1) {
                lastPageName = this.$store.state.app.pageOpenedList[1].name;
            } else {
                lastPageName = this.$store.state.app.pageOpenedList[0].name;
            }
            this.$router.push({
                name: lastPageName
            });
        },
        saveEdit: function saveEdit() {
            var _this3 = this;

            this.$refs['userForm'].validate(function (valid) {
                if (valid) {
                    if (_this3.phoneHasChanged && _this3.userForm.cellphone !== _this3.initPhone) {
                        if (_this3.hasGetIdentifyCode) {
                            if (_this3.identifyCodeRight) {
                                _this3.saveInfoAjax();
                            } else {
                                _this3.$Message.error('验证码错误，请重新输入');
                            }
                        } else {
                            _this3.$Message.warning('请先点击获取验证码');
                        }
                    } else {
                        _this3.saveInfoAjax();
                    }
                }
            });
        },
        cancelEditPass: function cancelEditPass() {
            this.editPasswordModal = false;
        },
        saveEditPass: function saveEditPass() {
            var _this4 = this;

            this.$refs['editPasswordForm'].validate(function (valid) {
                if (valid) {
                    _this4.savePassLoading = true;
                }
            });
        },
        init: function init() {
            this.userForm.name = 'Lison';
            this.userForm.cellphone = '17712345678';
            this.initPhone = '17712345678';
            this.userForm.company = 'TalkingData';
            this.userForm.department = '可视化部门';
        },
        cancelInputCodeBox: function cancelInputCodeBox() {
            this.inputCodeVisible = false;
            this.userForm.cellphone = this.initPhone;
        },
        submitCode: function submitCode() {
            var _this5 = this;

            var vm = this;
            vm.checkIdentifyCodeLoading = true;
            if (this.securityCode.length === 0) {
                this.$Message.error('请填写短信验证码');
            } else {
                setTimeout(function () {
                    _this5.$Message.success('验证码正确');
                    _this5.inputCodeVisible = false;
                    _this5.checkIdentifyCodeLoading = false;
                }, 1000);
            }
        },
        hasChangePhone: function hasChangePhone() {
            this.phoneHasChanged = true;
            this.hasGetIdentifyCode = false;
            this.identifyCodeRight = false;
        },
        saveInfoAjax: function saveInfoAjax() {
            var _this6 = this;

            this.save_loading = true;
            setTimeout(function () {
                _this6.$Message.success('保存成功');
                _this6.save_loading = false;
            }, 1000);
        }
    },
    mounted: function mounted() {
        this.init();
    }
};

/***/ }),

/***/ 849:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(366);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(12)("01d235fa", content, false, {});
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(366, function() {
     var newContent = __webpack_require__(366);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 850:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var render = function render() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", [_c("Card", [_c("p", { attrs: { slot: "title" }, slot: "title" }, [_c("Icon", { attrs: { type: "person" } }), _vm._v("\n            个人信息\n        ")], 1), _vm._v(" "), _c("div", [_c("Form", {
    ref: "userForm",
    attrs: {
      model: _vm.userForm,
      "label-width": 100,
      "label-position": "right",
      rules: _vm.inforValidate
    }
  }, [_c("FormItem", { attrs: { label: "用户姓名：", prop: "name" } }, [_c("div", {
    staticStyle: { display: "inline-block", width: "300px" }
  }, [_c("Input", {
    model: {
      value: _vm.userForm.name,
      callback: function callback($$v) {
        _vm.$set(_vm.userForm, "name", $$v);
      },
      expression: "userForm.name"
    }
  })], 1)]), _vm._v(" "), _c("FormItem", { attrs: { label: "用户手机：", prop: "cellphone" } }, [_c("div", {
    staticStyle: { display: "inline-block", width: "204px" }
  }, [_c("Input", {
    on: { "on-keydown": _vm.hasChangePhone },
    model: {
      value: _vm.userForm.cellphone,
      callback: function callback($$v) {
        _vm.$set(_vm.userForm, "cellphone", $$v);
      },
      expression: "userForm.cellphone"
    }
  })], 1), _vm._v(" "), _c("div", {
    staticStyle: {
      display: "inline-block",
      position: "relative"
    }
  }, [_c("Button", {
    attrs: { disabled: _vm.canGetIdentifyCode },
    on: { click: _vm.getIdentifyCode }
  }, [_vm._v(_vm._s(_vm.gettingIdentifyCodeBtnContent))]), _vm._v(" "), _vm.inputCodeVisible ? _c("div", {
    staticClass: "own-space-input-identifycode-con"
  }, [_c("div", {
    staticStyle: {
      "background-color": "white",
      "z-index": "110",
      margin: "10px"
    }
  }, [_c("Input", {
    attrs: {
      placeholder: "请填写短信验证码"
    },
    model: {
      value: _vm.securityCode,
      callback: function callback($$v) {
        _vm.securityCode = $$v;
      },
      expression: "securityCode"
    }
  }), _vm._v(" "), _c("div", {
    staticStyle: {
      "margin-top": "10px",
      "text-align": "right"
    }
  }, [_c("Button", {
    attrs: { type: "ghost" },
    on: {
      click: _vm.cancelInputCodeBox
    }
  }, [_vm._v("取消")]), _vm._v(" "), _c("Button", {
    attrs: {
      type: "primary",
      loading: _vm.checkIdentifyCodeLoading
    },
    on: { click: _vm.submitCode }
  }, [_vm._v("确定")])], 1)], 1)]) : _vm._e()], 1)]), _vm._v(" "), _c("FormItem", { attrs: { label: "公司：" } }, [_c("span", [_vm._v(_vm._s(_vm.userForm.company))])]), _vm._v(" "), _c("FormItem", { attrs: { label: "部门：" } }, [_c("span", [_vm._v(_vm._s(_vm.userForm.department))])]), _vm._v(" "), _c("FormItem", { attrs: { label: "登录密码：" } }, [_c("Button", {
    attrs: { type: "text", size: "small" },
    on: { click: _vm.showEditPassword }
  }, [_vm._v("修改密码")])], 1), _vm._v(" "), _c("div", [_c("Button", {
    staticStyle: { width: "100px" },
    attrs: { type: "text" },
    on: { click: _vm.cancelEditUserInfor }
  }, [_vm._v("取消")]), _vm._v(" "), _c("Button", {
    staticStyle: { width: "100px" },
    attrs: { type: "primary", loading: _vm.save_loading },
    on: { click: _vm.saveEdit }
  }, [_vm._v("保存")])], 1)], 1)], 1)]), _vm._v(" "), _c("Modal", {
    attrs: { closable: false, "mask-closable": false, width: 500 },
    model: {
      value: _vm.editPasswordModal,
      callback: function callback($$v) {
        _vm.editPasswordModal = $$v;
      },
      expression: "editPasswordModal"
    }
  }, [_c("h3", {
    staticStyle: { color: "#2D8CF0" },
    attrs: { slot: "header" },
    slot: "header"
  }, [_vm._v("修改密码")]), _vm._v(" "), _c("Form", {
    ref: "editPasswordForm",
    attrs: {
      model: _vm.editPasswordForm,
      "label-width": 100,
      "label-position": "right",
      rules: _vm.passwordValidate
    }
  }, [_c("FormItem", {
    attrs: {
      label: "原密码",
      prop: "oldPass",
      error: _vm.oldPassError
    }
  }, [_c("Input", {
    attrs: { placeholder: "请输入现在使用的密码" },
    model: {
      value: _vm.editPasswordForm.oldPass,
      callback: function callback($$v) {
        _vm.$set(_vm.editPasswordForm, "oldPass", $$v);
      },
      expression: "editPasswordForm.oldPass"
    }
  })], 1), _vm._v(" "), _c("FormItem", { attrs: { label: "新密码", prop: "newPass" } }, [_c("Input", {
    attrs: { placeholder: "请输入新密码，至少6位字符" },
    model: {
      value: _vm.editPasswordForm.newPass,
      callback: function callback($$v) {
        _vm.$set(_vm.editPasswordForm, "newPass", $$v);
      },
      expression: "editPasswordForm.newPass"
    }
  })], 1), _vm._v(" "), _c("FormItem", { attrs: { label: "确认新密码", prop: "rePass" } }, [_c("Input", {
    attrs: { placeholder: "请再次输入新密码" },
    model: {
      value: _vm.editPasswordForm.rePass,
      callback: function callback($$v) {
        _vm.$set(_vm.editPasswordForm, "rePass", $$v);
      },
      expression: "editPasswordForm.rePass"
    }
  })], 1)], 1), _vm._v(" "), _c("div", { attrs: { slot: "footer" }, slot: "footer" }, [_c("Button", { attrs: { type: "text" }, on: { click: _vm.cancelEditPass } }, [_vm._v("取消")]), _vm._v(" "), _c("Button", {
    attrs: { type: "primary", loading: _vm.savePassLoading },
    on: { click: _vm.saveEditPass }
  }, [_vm._v("保存")])], 1)], 1)], 1);
};
var staticRenderFns = [];
render._withStripped = true;
var esExports = { render: render, staticRenderFns: staticRenderFns };
exports.default = esExports;

if (true) {
  module.hot.accept();
  if (module.hot.data) {
    __webpack_require__(0).rerender("data-v-809e9776", esExports);
  }
}

/***/ })

});
//# sourceMappingURL=19.chunk.js.map