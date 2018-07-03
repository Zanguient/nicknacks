webpackJsonp([23],{232:function(t,a,e){"use strict";function n(t){c||e(840)}Object.defineProperty(a,"__esModule",{value:!0});var l=e(454),o=e.n(l);for(var i in l)"default"!==i&&function(t){e.d(a,t,function(){return l[t]})}(i);var s=e(842),r=e.n(s),c=!1,p=e(0),u=n,d=p(o.a,r.a,!1,u,null,null);d.options.__file="src/views/international/international.vue",a.default=d.exports},454:function(t,a,e){"use strict";Object.defineProperty(a,"__esModule",{value:!0}),a.default={name:"international_index",data:function(){return{lang:"zh-CN",valueText:3,showModal:!1,columnsI18n:[{key:"name",title:this.$t("name")},{key:"company",title:this.$t("company")}],dataI18n:[{name:"Aresn",company:"TalkingData"},{name:"Lison",company:"TalkingData"},{name:"Lucy",company:"TalkingData"}]}},methods:{handleSwitch:function(t){this.lang=t,localStorage.lang=t,this.$store.commit("switchLang",t),this.columnsI18n=[{key:"name",title:this.$t("name")},{key:"company",title:this.$t("company")}]}},computed:{placeholderText:function(){return this.$t("placeholderText")},placeholderDate:function(){return this.$t("placeholderDate")}},created:function(){this.lang=localStorage.lang||"zh-CN"}}},840:function(t,a,e){var n=e(841);"string"==typeof n&&(n=[[t.i,n,""]]),n.locals&&(t.exports=n.locals);e(10)("39c8fe88",n,!1,{})},841:function(t,a,e){a=t.exports=e(9)(!1),a.push([t.i,"\n.switch-language-row1 {\n  height: 240px !important;\n}\n.switch-language-tip {\n  font-size: 12px;\n  color: gray;\n  margin-top: 30px;\n}\n",""])},842:function(t,a,e){"use strict";Object.defineProperty(a,"__esModule",{value:!0});var n=function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("div",[e("Row",{attrs:{gutter:10}},[e("Col",{attrs:{span:"4"}},[e("Card",[e("p",{attrs:{slot:"title"},slot:"title"},[e("Icon",{attrs:{type:"ios-toggle"}}),t._v("\n                    "+t._s(t.$t("switchLangTitle"))+"\n                ")],1),t._v(" "),e("Row",{staticClass:"switch-language-row1",attrs:{type:"flex",justify:"center",align:"middle"}},[e("RadioGroup",{attrs:{value:t.lang,vertical:""},on:{"on-change":t.handleSwitch}},[e("Radio",{attrs:{label:"zh-CN"}},[e("span",[t._v("中文简体")])]),t._v(" "),e("Radio",{attrs:{label:"zh-TW"}},[e("span",[t._v("中文繁體")])]),t._v(" "),e("Radio",{attrs:{label:"en-US"}},[e("span",[t._v("English")])])],1),t._v(" "),e("p",{staticClass:"switch-language-tip"},[t._v(t._s(t.$t("tip")))])],1)],1)],1),t._v(" "),e("Col",{attrs:{span:"20"}},[e("Card",[e("p",{attrs:{slot:"title"},slot:"title"},[e("Icon",{attrs:{type:"ios-cog"}}),t._v("\n                    "+t._s(t.$t("iviewComponentTitle"))+"\n                ")],1),t._v(" "),e("Row",{staticClass:"switch-language-row1",attrs:{gutter:10,type:"flex",justify:"center",align:"middle"}},[e("Col",{attrs:{span:"4",offset:"1"}},[e("p",[t._v(t._s(t.$t("intro")))])]),t._v(" "),e("Col",{attrs:{span:"6",offset:"1"}},[e("Input",{staticStyle:{width:"100%"},attrs:{placeholder:t.placeholderText}}),t._v(" "),e("div",{staticStyle:{"margin-top":"25px"}},[e("DatePicker",{staticStyle:{width:"100%"},attrs:{type:"date",placeholder:t.placeholderDate}})],1),t._v(" "),e("div",{staticStyle:{"margin-top":"25px"}},[e("Rate",{attrs:{"show-text":""},model:{value:t.valueText,callback:function(a){t.valueText=a},expression:"valueText"}})],1)],1),t._v(" "),e("Col",{attrs:{span:"6"}},[e("Table",{attrs:{columns:t.columnsI18n,data:t.dataI18n}})],1),t._v(" "),e("Col",{attrs:{span:"6"}},[e("Button",{attrs:{type:"primary",long:""},on:{click:function(a){t.showModal=!0}}},[t._v(t._s(t.$t("btnText")))]),t._v(" "),e("Modal",{attrs:{title:"iView"},model:{value:t.showModal,callback:function(a){t.showModal=a},expression:"showModal"}},[e("p",[t._v(t._s(t.$t("modalText")))])]),t._v(" "),e("div",{staticStyle:{"margin-top":"25px"}},[e("Poptip",{attrs:{confirm:"",title:t.$t("poptip")}},[e("Button",{attrs:{type:"primary",long:""}},[t._v(t._s(t.$t("showPoptipText")))])],1)],1)],1)],1)],1)],1)],1)],1)},l=[];n._withStripped=!0;var o={render:n,staticRenderFns:l};a.default=o}});