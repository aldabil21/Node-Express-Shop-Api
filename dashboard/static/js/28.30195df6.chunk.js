(this.webpackJsonpmyshop=this.webpackJsonpmyshop||[]).push([[28],{433:function(e,t,a){"use strict";a.d(t,"a",(function(){return d}));var r=a(198),n=a(0),c=a.n(n),i=a(8),l=a(484),o=a(496),u=a(24),s=Object(i.a)((function(e){return{root:{width:55,height:26,padding:0,margin:e.spacing(1)},switchBase:{padding:1,"&$checked":{transform:"translateX(29px)",color:e.palette.common.white,"& + $track":{backgroundColor:e.palette.primary.main,opacity:1,border:"none","&:after":{content:'"'.concat(u.a.t("common:on"),'"'),display:"flex",fontSize:"0.8rem",padding:"4px 6px",color:e.palette.primary.contrastText},"&:before":{display:"none"}}},"& + $track":{backgroundColor:e.palette.secondary.light,opacity:1,border:"none","&:after":{display:"none"},"&:before":{content:'"'.concat(u.a.t("common:off"),'"'),display:"flex",justifyContent:"flex-end",fontSize:"0.8rem",padding:"4px 6px",color:e.palette.secondary.contrastText}},"&$focusVisible $thumb":{color:e.palette.primary.main,border:"6px solid #fff"}},thumb:{width:24,height:24},track:{borderRadius:13,border:"1px solid ".concat(e.palette.grey[400]),backgroundColor:e.palette.grey[50],opacity:1,transition:e.transitions.create(["background-color","border"])},checked:{},focusVisible:{}}}))((function(e){var t=e.classes,a=Object(r.a)(e,["classes"]);return c.a.createElement(o.a,Object.assign({focusVisibleClassName:t.focusVisible,disableRipple:!0,classes:{root:t.root,switchBase:t.switchBase,thumb:t.thumb,track:t.track,checked:t.checked},disabled:a.disabled},a))}));function d(e){var t=e.label,a=e.name,r=e.state,n=e.onChange,i=e.required,o=e.loading;return c.a.createElement(l.a,{control:c.a.createElement(s,{checked:r>0,onChange:function(e){var t=e.target.checked;return n(t?1:0,!i||!!t,a)},name:a,disabled:o}),label:t})}},434:function(e,t,a){"use strict";var r=a(19);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r(a(0)),c=(0,r(a(22)).default)(n.default.createElement("path",{d:"M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"}),"EditRounded");t.default=c},435:function(e,t,a){"use strict";a.d(t,"a",(function(){return r}));a(24);var r=function(e,t){var a=e&&e instanceof Array?e:Array(e||""),r=a.length&&a.find((function(e){return e.param===t}));return!!r&&r.msg}},445:function(e,t,a){"use strict";var r=a(19);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=r(a(0)),c=(0,r(a(22)).default)(n.default.createElement("path",{d:"M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"}),"AddRounded");t.default=c},479:function(e,t,a){"use strict";a.d(t,"a",(function(){return m}));var r=a(198),n=a(0),c=a.n(n),i=a(61),l=a(728),o=a(707),u=a(77),s=a(404);function d(e){var t=e.children,a=e.value,n=e.index,i=Object(r.a)(e,["children","value","index"]);return c.a.createElement(u.a,Object.assign({component:"div",role:"tabpanel",hidden:a!==n,id:"scrollable-auto-tabpanel-".concat(n),"aria-labelledby":"scrollable-auto-tab-".concat(n)},i),a===n&&c.a.createElement(s.a,{p:3},t))}var b=Object(i.a)((function(e){return{root:{flexGrow:1,width:"100%",backgroundColor:e.palette.background.paper,alignSelf:"center"},tabs:{borderBottom:"1px solid ".concat(e.palette.divider)},tab:{minWidth:"auto"}}}));function m(e){var t=e.tabs,a=(e.variant,e.value),r=e.setTab,n=e.title,i=b();return c.a.createElement("div",{className:i.root},n&&n,c.a.createElement(l.a,{value:a,indicatorColor:"primary",textColor:"primary",variant:"scrollable",scrollButtons:"on",className:i.tabs},t.map((function(e,t){return c.a.createElement(o.a,Object.assign({key:t,label:e.label,value:e.id},{id:"scrollable-auto-tab-".concat(a=t),"aria-controls":"scrollable-auto-tabpanel-".concat(a)},{onClick:function(){return r(e.id)}}));var a}))),t.map((function(e,t){return e.component&&c.a.createElement(d,{key:t,value:a,index:e.id},e.component)})))}},737:function(e,t,a){"use strict";a.r(t);var r,n=a(43),c=a(47),i=a(2),l=a(4),o=a.n(l),u=a(9),s=a(21),d=a(0),b=a.n(d),m=a(26),p=a(286),f=a(65),v=a(38),g=a(77),h=a(128),y=a(280),j=a(404),E=a(90),O=a(72),k=a(109),x=a(479),_=a(435),w=a(433),C=function(e){var t=e.descriptionResult,a=e.descriptions,r=e.touched,n=e.attributes,c=e.sort_order,i=e.status,l=e.getResult,o=f.a.settings.languages,u=Object(d.useState)(o[0].code),m=Object(s.a)(u,2),v=m[0],h=m[1],E=Object(p.a)().t,O=o.map((function(e,t){return{id:e.code,label:e.language}}));return b.a.createElement(d.Fragment,null,b.a.createElement(x.a,{tabs:O,value:v,variant:"standard",setTab:h,title:b.a.createElement(j.a,{className:"flex flex-justify-between align-items-center"},b.a.createElement(g.a,{align:"left",variant:"h6",className:"p"},E("attributes:attribute_detail")),b.a.createElement(w.a,{state:i,onChange:l,name:"status"}))}),a.map((function(e,a){return b.a.createElement(j.a,{key:e.language,className:"p-1",hidden:v!==e.language},b.a.createElement(g.a,{component:"div",className:"center p",variant:"caption",color:"textSecondary"},E("common:required_star")),b.a.createElement(y.a,{container:!0,spacing:1},b.a.createElement(y.a,{item:!0,sm:6,xs:12},b.a.createElement(k.a,{label:E("attributes:attribute_name")+" **",initialValue:e.title.value,name:"title",getResult:function(){for(var a=arguments.length,r=new Array(a),n=0;n<a;n++)r[n]=arguments[n];return t.apply(void 0,r.concat([e.language]))},required:!0,min:2,setTouched:r,serverError:Object(_.a)(n.errors&&n.errors.data,"description[".concat(a,"].title"))})),b.a.createElement(y.a,{item:!0,sm:6,xs:12},b.a.createElement(k.a,{label:E("attributes:sort_order"),initialValue:c,name:"sort_order",getResult:l,required:!0,decimal:!0,mathMin:"-1",setTouched:r}))))})))},N=a(445),R=a.n(N),B=a(434),S=a.n(B),T=a(131),V=function(){return f.a.settings.languages.map((function(e){return{language:e.code,title:{value:"",validity:!1}}}))},z=function(e){return{description:e?V().map((function(t){var a=e.description.find((function(e){return e.language===t.language}));return a?{language:t.language,title:{value:a.title,validity:!!a.title}}:t})):V(),status:{value:e?e.status:1,validity:!0},sort_order:{value:e?e.sort_order+"":"0",validity:!0}}};t.default=function(e){var t=e.history,a=e.match.params.id,l=Object(d.useState)(!!a),k=Object(s.a)(l,2),x=k[0],_=k[1],w=Object(d.useState)(z),N=Object(s.a)(w,2),B=N[0],V=N[1],M=Object(d.useState)(!1),$=Object(s.a)(M,2),q=$[0],A=$[1],F=Object(m.d)((function(e){return e.attributes})),I=Object(p.a)().t,J=Object(m.c)(),L=Object(d.useCallback)(Object(u.a)(o.a.mark((function e(){var r,n;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,J(v.E(a));case 3:r=e.sent,V(z(r)),_(!1),e.next=13;break;case 8:e.prev=8,e.t0=e.catch(0),n=e.t0.message||I("attributes:attribute_not_found"),J(v.B("error",n)),t.replace("/attributes");case 13:case"end":return e.stop()}}),e,null,[[0,8]])}))),[a,J,I,t]);Object(d.useEffect)((function(){return a&&(r=setTimeout((function(){L()}),0)),function(){return clearTimeout(r)}}),[a,L]);var P=function(){var e=Object(u.a)(o.a.mark((function e(){var r,l,u,s,d,b,m,p;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r={},e.t0=o.a.keys(B);case 2:if((e.t1=e.t0()).done){e.next=11;break}if("description"===(l=e.t1.value)){e.next=9;break}if(r=Object(i.a)(Object(i.a)({},r),{},Object(c.a)({},l,B[l].value)),B[l].validity){e.next=9;break}return A(!0),e.abrupt("return",J(v.B("error",I("common:complete_red_input"))));case 9:e.next=2;break;case 11:u=[],s=Object(n.a)(B.description),e.prev=13,b=function(){var e=d.value;for(var t in u.push({language:e.language,title:e.title.value}),e)if("language"!==t&&!e[t].validity)return A(!0),{v:J(v.B("error",I("common:complete_red_input_detail",{section:I("attributes:attribute_detail"),language:f.a.settings.languages.find((function(t){return t.code===e.language})).language})))}},s.s();case 16:if((d=s.n()).done){e.next=22;break}if("object"!==typeof(m=b())){e.next=20;break}return e.abrupt("return",m.v);case 20:e.next=16;break;case 22:e.next=27;break;case 24:e.prev=24,e.t2=e.catch(13),s.e(e.t2);case 27:return e.prev=27,s.f(),e.finish(27);case 30:return r=Object(i.a)(Object(i.a)({},r),{},{description:u}),e.prev=31,e.next=34,J(v.b(r,a));case 34:t.replace("/attributes"),e.next=41;break;case 37:e.prev=37,e.t3=e.catch(31),p=e.t3.message||I("attributes:save_err"),J(v.B("error",p));case 41:case"end":return e.stop()}}),e,null,[[13,24,27,30],[31,37]])})));return function(){return e.apply(this,arguments)}}();return b.a.createElement(d.Fragment,null,b.a.createElement(g.a,{align:"center",variant:"h4",className:"py-1"},I(a?"attributes:edit_attribute":"attributes:add_attribute")),x?b.a.createElement(h.a,null,b.a.createElement(O.a,{row:4,col:2})):b.a.createElement(d.Fragment,null,b.a.createElement(y.a,{container:!0,spacing:1},b.a.createElement(y.a,{item:!0,xs:12},b.a.createElement(h.a,{className:"my-1"},b.a.createElement(C,{descriptions:B.description,descriptionResult:function(e,t,a,r){V((function(n){return Object(i.a)(Object(i.a)({},n),{},{description:n.description.map((function(n){return n.language===r?Object(i.a)(Object(i.a)({},n),{},Object(c.a)({},a,{value:e,validity:t})):n}))})}))},touched:q,attributes:F,sort_order:B.sort_order.value,status:B.status.value,getResult:function(e,t,a){V((function(r){return Object(i.a)(Object(i.a)({},r),{},Object(c.a)({},a,{value:e,validity:t}))}))}})))),b.a.createElement(j.a,{className:"center py-1"},b.a.createElement(E.a,{variant:"contained",color:"primary",size:"large",onClick:P,endIcon:F.loading&&b.a.createElement(T.a,null),startIcon:a?b.a.createElement(S.a,null):b.a.createElement(R.a,null),disabled:F.loading,style:{width:"80%"}},b.a.createElement(g.a,{variant:"h4",className:"py-1"},I(a?"attributes:edit_attribute":"attributes:add_attribute"))))))}}}]);
//# sourceMappingURL=28.30195df6.chunk.js.map