!function(a){function b(a,b){try{if("function"!=typeof a)return a;if(!a.bugsnag){var c=d();a.bugsnag=function(d){if(b&&b.eventHandler&&(q=d),r=c,!u){var e=a.apply(this,arguments);return r=null,e}try{return a.apply(this,arguments)}catch(a){throw t.notifyException(a),o(),a}finally{r=null}},a.bugsnag.bugsnag=a.bugsnag}return a.bugsnag}catch(b){return a}}function c(){x=!1}function d(){var a=document.currentScript||r;if(!a&&x){var b=document.scripts||document.getElementsByTagName("script");a=b[b.length-1]}return a}function e(a){var b=d();b&&(a.script={src:b.src,content:b.innerHTML?b.innerHTML.substr(0,50):void 0})}function f(b){var c=a.console;void 0!==c&&void 0!==c.log&&c.log("[Bugsnag] "+b)}function g(b,c,d){if(d>=w)return encodeURIComponent(c)+"=[RECURSIVE]";d=d+1||1;try{if(a.Node&&b instanceof a.Node)return encodeURIComponent(c)+"="+encodeURIComponent(n(b));var e=[];for(var f in b)if(b.hasOwnProperty(f)&&null!=f&&null!=b[f]){var h=c?c+"["+f+"]":f,i=b[f];e.push("object"==typeof i?g(i,h,d):encodeURIComponent(h)+"="+encodeURIComponent(i))}return e.join("&")}catch(a){return encodeURIComponent(c)+"="+encodeURIComponent(""+a)}}function h(a,b){var c=new XMLHttpRequest;c.open("post",a),c.setRequestHeader("Content-Type","application/json"),c.setRequestHeader("Accept","application/json"),c.send(g(b))}function i(b,c){var d=a.rgConfig&&void 0!==a.rgConfig[b]?a.rgConfig[b]:c;return"false"===d&&(d=!1),d}function j(b,c){if(a.atob&&("undefined"!=typeof YRG&&(YRG.rg&&YRG.rg.performedRequests&&(c.performedAjaxRequests=YRG.rg.performedRequests),YRG.use("event",function(a){a.fire("exceptionTriggered",{Type:"JavascriptException",PreviousType:b.name,message:b.message,File:b.file,Line:b.lineNumber+":"+b.columnNumber})})),!b.file||!b.file.match(/\/pdf\.viewer\.js$/))){var d=[b.name,b.message,b.stacktrace].join("|");if(d!==s){s=d,c=c||{},q&&(c["Last Event"]=m(q));var e={AccountId:i("accountId"),Module:i("module"),Action:i("action"),PageId:i("pageId"),CorrelationId:i("correlationId"),metaData:c,Request:a.location.href,UserAgent:navigator.userAgent,Type:"JavascriptException",PreviousType:b.name,message:b.message,Stacktrace:b.stacktrace,File:b.file,Line:b.lineNumber,Column:b.columnNumber};return 0===e.Line&&/Script error\.?/.test(e.message)?f("Ignoring cross-domain script error."):void h("go.Error.html",e)}}}function k(){var a,b=10,c="[anonymous]";try{throw new Error("")}catch(b){a=l(b)}if(!a){var d=[];try{for(var e=arguments.callee.caller.caller;e&&d.length<b;){var g=y.test(e.toString())?RegExp.$1||c:c;d.push(g),e=e.caller}}catch(a){f(a)}a=d.join("\n")}return a}function l(a){return a.stack||a.backtrace||a.stacktrace}function m(a){return{millisecondsAgo:new Date-a.timeStamp,type:a.type,which:a.which,target:n(a.target)}}function n(a){if(a){var b=a.attributes;if(b){for(var c="<"+a.nodeName.toLowerCase(),d=0;d<b.length;d++)b[d].value&&"null"!==b[d].value.toString()&&(c+=" "+b[d].name+'="'+b[d].value+'"');return c+">"}return a.nodeName}}function o(){v+=1,a.setTimeout(function(){v-=1})}function p(a,b,c){var d=a[b];a[b]=c(d)}var q,r,s,t={},u=!0,v=0,w=5;t.notifyException=function(a,b,c){a&&(b&&"string"!=typeof b&&(c=b,b=void 0),c||(c={}),e(c),j({name:b||a.name,message:a.message||a.description,stacktrace:l(a)||k(),file:a.fileName||a.sourceURL,lineNumber:a.lineNumber||a.line,columnNumber:a.columnNumber?a.columnNumber+1:void 0},c))},t.notify=function(b,c,d){j({name:b,message:c,stacktrace:k(),file:a.location.toString(),lineNumber:1},d)};var x="complete"!==document.readyState;document.addEventListener?(document.addEventListener("DOMContentLoaded",c,!0),a.addEventListener("load",c,!0)):a.attachEvent("onload",c);var y=/function\s*([\w\-$]+)?\s*\(/i;if(a.atob){if(a.ErrorEvent)try{0===new a.ErrorEvent("test").colno&&(u=!1)}catch(a){}}else u=!1;p(a,"onerror",function(b){return function(c,d,f,g,h){var i={};!g&&a.event&&(g=a.event.errorCharacter),e(i),r=null,v||("string"!=typeof c&&(c=JSON.stringify(c)),j({name:h&&h.name||"window.onerror",message:c,file:d,lineNumber:f,columnNumber:g,stacktrace:h&&l(h)||k()},i)),b&&b(c,d,f,g,h)}});var z=function(a){return function(c,d){if("function"==typeof c){c=b(c);var e=Array.prototype.slice.call(arguments,2);return a(function(){c.apply(this,e)},d)}return a(c,d)}};p(a,"setTimeout",z),p(a,"setInterval",z),a.requestAnimationFrame&&p(a,"requestAnimationFrame",function(a){return function(c){return a(b(c))}}),a.setImmediate&&p(a,"setImmediate",function(a){return function(){var c=Array.prototype.slice.call(arguments);return c[0]=b(c[0]),a.apply(this,c)}}),"EventTarget Window Node ApplicationCache AudioTrackList ChannelMergerNode CryptoOperation EventSource FileReader HTMLUnknownElement IDBDatabase IDBRequest IDBTransaction KeyOperation MediaController MessagePort ModalWindow Notification SVGElementInstance Screen TextTrack TextTrackCue TextTrackList WebSocket WebSocketWorker Worker XMLHttpRequest XMLHttpRequestEventTarget XMLHttpRequestUpload".replace(/\w+/g,function(c){var d=a[c]&&a[c].prototype;d&&d.hasOwnProperty&&d.hasOwnProperty("addEventListener")&&(p(d,"addEventListener",function(a){return function(c,d,e,g){try{d&&d.handleEvent&&(d.handleEvent=b(d.handleEvent,{eventHandler:!0}))}catch(a){f(a)}return a.call(this,c,b(d,{eventHandler:!0}),e,g)}}),p(d,"removeEventListener",function(a){return function(c,d,e,f){return a.call(this,c,d,e,f),a.call(this,c,b(d),e,f)}}))}),a.Bugsnag=t}(window);