(this.webpackJsonpmyshop=this.webpackJsonpmyshop||[]).push([[0],{57:function(e,t,a){e.exports=a(73)},59:function(e,t,a){},73:function(e,t,a){"use strict";a.r(t);var r=a(36),n=a(42),i=a(24),o=a(43);r.a.use(o.a).use(n.a).use(i.e).init({initImmediate:!1,supportedLngs:["ar","en"],preload:["ar","en"],fallbackLng:"ar",ns:["common","products","categories","filters","attributes","coupons","orders","users","settings"],defaultNS:"common",backend:{loadPath:"admin/locales/{{lng}}/{{ns}}.json"},react:{wait:!0}});var c=r.a,l=(a(59),a(0)),s=a.n(l),m=a(46),d=a.n(m),g=a(92),p=a(2),u=a(91),b=a(88),y=a(90),h=Object(y.a)((function(e){return{root:{color:e.palette.primary.light}}})),f=function(e){var t=e.color,a=e.styles,r=e.classes,n=h();return s.a.createElement(b.a,{size:"3rem",color:"inherit",className:"".concat("light"===t?"text-light":n.root," ").concat(r),style:a})},_=s.a.createContext({theme:{},toggleDarkMode:function(){},template:"",primary:"",primary_light:"",primary_light_color:"",secondary:"",gradient_primary:"",gradient_secondary:"",gradient_third:"",language:"",toggleLanguage:function(){}}),j=function(e){var t=e.text,a=Object(l.useContext)(_).gradient_primary;return s.a.createElement("div",{className:"fullheightVH flex__centerlize ".concat(a||"bg-primary")},s.a.createElement("div",{className:"py-1 bg-logo-sm"}),s.a.createElement(u.a,{className:"text-light py-1 cairo"},t),s.a.createElement(f,{color:"light"}))},E=a(93),O=a(95),S=Object(p.d)((function(){var e=Object(l.useContext)(_),t=e.theme,a=e.gradient_primary,r=Object(O.a)().t;return s.a.createElement(g.a,{theme:t},s.a.createElement(E.a,null),s.a.createElement(l.Suspense,{fallback:s.a.createElement(j,{text:r("common:loadingggg")})},s.a.createElement("div",{className:"".concat(a," fullheightVH flex__centerlize")},s.a.createElement(u.a,{variant:"h2",className:"text-light"},"SHOP FRONT"),s.a.createElement(u.a,{variant:"h2",className:"text-light"},"DOWNLOAD APP"))))})),v=a(53),x=a(54),L=a(16),C=a(96),F=a(52),N=function(e,t,a){var r="";a&&(r="; expires="+a),document.cookie=e+"="+t+r+"; path=/"},k=function(e,t){switch(t.type){case"SET_PALETTE":return Object(L.a)(Object(L.a)({},e),{},{palette:Object(L.a)(Object(L.a)({},e.palette),z(t.template)),css:Object(L.a)({},M(t.template))});case"TOGGLE_LANG":return document.documentElement.lang=t.lang,document.documentElement.dir=t.dir,N("locale",t.lang),Object(L.a)(Object(L.a)({},e),{},{direction:t.dir,language:t.lang});default:return e}},z=function(e){switch(e){case"main":return{primary:{main:"#B8656C"},secondary:{main:"#222823"},warning:{main:"#ECD444"},text:{disabled:"#737373"}}}},M=function(e){var t=e,a="bg-primary",r="bg-primary-light",n="rgb(235, 240, 245)",i="bg-secondary",o="bg-primary-gradient",c="bg-secondary-gradient",l="bg-third-gradient";switch(e){case"main":t="main",a="bg-primary",r="bg-primary-light",n="#F3E3E4",i="bg-secondary",o="bg-primary-gradient",c="bg-secondary-gradient",l="bg-third-gradient";break;case"second":t="second",a="bg-second-primary",r="bg-second-primary-light",n="#d1deea",i="bg-second-secondary",o="bg-second-primary-gradient",c="bg-second-secondary-gradient",l="bg-second-third-gradient";break;case"third":t="third",a="bg-third-primary",r="bg-third-primary-light",n="#ffebf7",i="bg-third-secondary",o="bg-third-primary-gradient",c="bg-third-secondary-gradient",l="bg-third-third-gradient"}return{template:t,primary:a,primary_light:r,primary_light_color:n,secondary:i,gradient_primary:o,gradient_secondary:c,gradient_third:l}},R=a(4),T=a(51),w=a.n(T),A=a(94),G=a(97),I={palette:z("main"),typography:{fontFamily:["Cairo","Roboto"].join(","),h1:{fontFamily:["Cairo-bold","Roboto"].join(","),fontSize:"2rem",letterSpacing:"-0.007em"},h2:{fontFamily:["Cairo-bold","Roboto"].join(","),fontSize:"1.8rem",letterSpacing:"-0.01em"},h3:{fontFamily:["Cairo-semi","Roboto"].join(","),fontSize:"1.5rem",letterSpacing:"-0.01em"},h4:{fontFamily:["Cairo-semi","Roboto"].join(","),fontSize:"1.2rem",letterSpacing:"-0.01em"},h6:{fontFamily:["Cairo-semi","Roboto"].join(","),fontSize:"1rem",letterSpacing:"-0.01em"}},direction:"rtl",overrides:{MuiFormLabel:{root:{fontSize:"0.8rem"}},MuiAutocomplete:{option:{"&:hover":{background:"#8ea2b3"}},inputRoot:{'&[class*="MuiOutlinedInput-root"]':{padding:1}}},MuiOutlinedInput:{input:{padding:10}},MuiInputLabel:{outlined:{transform:"translate(".concat(14,"px, ",12,"px) scale(1)")}},MuiFormHelperText:{root:{fontSize:"0.65rem",marginTop:0}},MuiInputBase:{root:{fontSize:"0.9rem"}},MuiDialog:{paperFullWidth:{maxWidth:"85%"}},MuiInput:{underline:{"&$disabled":{"&:before":{borderBottomStyle:"solid"}}}},MuiTableCell:{body:{fontFamily:["Cairo","Roboto"].join(",")}}},css:Object(L.a)({},M("main"))},P=function(e){var t=Object(l.useReducer)(k,I),a=Object(x.a)(t,2),r=a[0],n=a[1],i=Object(C.a)(Object(F.a)(r)),o=Object(R.b)({plugins:[].concat(Object(v.a)(Object(A.a)().plugins),[w()()])});return s.a.createElement(_.Provider,{value:{theme:i,template:r.css.template,primary:r.css.primary,primary_light:r.css.primary_light,primary_light_color:r.css.primary_light_color,secondary:r.css.secondary,gradient_primary:r.css.gradient_primary,gradient_secondary:r.css.gradient_secondary,gradient_third:r.css.gradient_third,toggleLanguage:function(e){var t="ar",a="rtl";"en"===e&&(t="en",a="ltr"),n({type:"TOGGLE_LANG",lang:t,dir:a,value:e}),c.changeLanguage(e)}}},s.a.createElement(G.b,{jss:o},e.children))},D=a(33);d.a.render(s.a.createElement(l.Suspense,{fallback:s.a.createElement(j,{text:"Loading"})},s.a.createElement(P,null,s.a.createElement(D.a,null,s.a.createElement(S,null)))),document.querySelector("#root"))}},[[57,1,2]]]);
//# sourceMappingURL=main.b104230e.chunk.js.map