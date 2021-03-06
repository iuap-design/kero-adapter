(function (exports) {
'use strict';

/**
 * Module : Sparrow touch event
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-07-28 14:41:17
 */

var on = function(element, eventName, child, listener) {
	if(!element)
		return;
	if(arguments.length < 4) {
		listener = child;
		child = undefined;
	} else {
		var childlistener = function(e) {
			if(!e) {
				return;
			}
			var tmpchildren = element.querySelectorAll(child);
			tmpchildren.forEach(function(node) {
				if(node == e.target) {
					listener.call(e.target, e);
				}
			});
		};
	}
	//capture = capture || false;

	if(!element["uEvent"]) {
		//在dom上添加记录区
		element["uEvent"] = {};
	}
	//判断是否元素上是否用通过on方法填加进去的事件
	if(!element["uEvent"][eventName]) {
		element["uEvent"][eventName] = [child ? childlistener : listener];
		if(u.event && u.event[eventName] && u.event[eventName].setup) {
			u.event[eventName].setup.call(element);
		}
		element["uEvent"][eventName + 'fn'] = function(e) {
			//火狐下有问题修改判断
			if(!e)
				e = typeof event != 'undefined' && event ? event : window.event;
			element["uEvent"][eventName].forEach(function(fn) {
				try {
					e.target = e.target || e.srcElement; //兼容IE8
				} catch(ee) {}
				if(fn)
					fn.call(element, e);
			});
		};
		if(element.addEventListener) { // 用于支持DOM的浏览器
			element.addEventListener(eventName, element["uEvent"][eventName + 'fn']);
		} else if(element.attachEvent) { // 用于IE浏览器
			element.attachEvent("on" + eventName, element["uEvent"][eventName + 'fn']);
		} else { // 用于其它浏览器
			element["on" + eventName] = element["uEvent"][eventName + 'fn'];
		}
	} else {
		//如果有就直接往元素的记录区添加事件
		var lis = child ? childlistener : listener;
		var hasLis = false;
		element["uEvent"][eventName].forEach(function(fn) {
			if(fn == lis) {
				hasLis = true;
			}
		});
		if(!hasLis) {
			element["uEvent"][eventName].push(child ? childlistener : listener);
		}
	}

};

var off = function(element, eventName, listener) {
	//删除事件数组
	if(listener) {
		if(element && element["uEvent"] && element["uEvent"][eventName]) {
			element["uEvent"][eventName].forEach(function(fn, i) {
				if(fn == listener) {
					element["uEvent"][eventName].splice(i, 1);
				}
			});
		}
		return;
	}
	var eventfn;
	if(element && element["uEvent"] && element["uEvent"][eventName + 'fn'])
		eventfn = element["uEvent"][eventName + 'fn'];
	if(element.removeEventListener) { // 用于支持DOM的浏览器
		element.removeEventListener(eventName, eventfn);
	} else if(element.removeEvent) { // 用于IE浏览器
		element.removeEvent("on" + eventName, eventfn);
	} else { // 用于其它浏览器
		delete element["on" + eventName];
	}
	if(u.event && u.event[eventName] && u.event[eventName].teardown) {
		u.event[eventName].teardown.call(element);
	}

	if(element && element["uEvent"] && element["uEvent"][eventName])
		element["uEvent"][eventName] = undefined;
	if(element && element["uEvent"] && element["uEvent"][eventName + 'fn'])
		element["uEvent"][eventName + 'fn'] = undefined;

};
/**
 * 阻止冒泡
 */
var stopEvent = function(e) {
	if(typeof(e) != "undefined") {
		if(e.stopPropagation)
			e.stopPropagation();
		else {
			e.cancelBubble = true;
		}
		//阻止默认浏览器动作(W3C)
		if(e && e.preventDefault)
			e.preventDefault();
		//IE中阻止函数器默认动作的方式
		else
			window.event.returnValue = false;
	}
};

/**
 * Module : Sparrow extend enum
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-07-27 21:46:50
 */

var U_LANGUAGES = "i_languages";
var U_THEME = "u_theme";
var U_LOCALE = "u_locale";
var U_USERCODE = "usercode";
var enumerables = true;
var enumerablesTest = {
		toString: 1
	};
for(var i in enumerablesTest) {
	enumerables = null;
}
if(enumerables) {
	enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
		'toLocaleString', 'toString', 'constructor'
	];
}

/**
 * Module : Sparrow extend
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-07-27 21:46:50
 */

/**
 * 复制对象属性
 *
 * @param {Object}  目标对象
 * @param {config} 源对象
 */
var extend = function(object, config) {
	var args = arguments,
		options;
	if(args.length > 1) {
		for(var len = 1; len < args.length; len++) {
			options = args[len];
			if(object && options && typeof options === 'object') {
				var i, j, k;
				for(i in options) {
					object[i] = options[i];
				}
				if(enumerables) {
					for(j = enumerables.length; j--;) {
						k = enumerables[j];
						if(options.hasOwnProperty && options.hasOwnProperty(k)) {
							object[k] = options[k];
						}
					}
				}
			}
		}
	}
	return object;
};

if(!Object.assign){
	Object.assign = extend;
}

/**
 * Module : Sparrow util tools
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-07-27 21:46:50
 */

/**
 * 创建一个带壳的对象,防止外部修改
 * @param {Object} proto
 */
var createShellObject = function(proto) {
	var exf = function() {};
	exf.prototype = proto;
	return new exf();
};
try{
	NodeList.prototype.forEach = Array.prototype.forEach;
}catch(e){
	
}


/**
 * 获得字符串的字节长度
 */
String.prototype.lengthb = function() {
	//	var str = this.replace(/[^\x800-\x10000]/g, "***");
	var str = this.replace(/[^\x00-\xff]/g, "**");
	return str.length;
};

/**
 * 将AFindText全部替换为ARepText
 */
String.prototype.replaceAll = function(AFindText, ARepText) {
	//自定义String对象的方法
	var raRegExp = new RegExp(AFindText, "g");
	return this.replace(raRegExp, ARepText);
};


var dateFormat = function ( str ) {
	//如果不是string类型  原型返回
	if ( typeof ( str ) !== 'string')
	{
		return str;
	}
	//判断 str 格式如果是 yy-mm-dd
	if (str && str.indexOf ('-') > -1){
		//获取当前是否是 ios版本,>8是因为ios不识别new Date（“2016/11”）格式
		var ua = navigator.userAgent.toLowerCase();
		if (/iphone|ipad|ipod/.test(ua)) {
			//转换成 yy/mm/dd
		    str = str.replace(/-/g,"/");
			str = str.replace(/(^\s+)|(\s+$)/g,"");
			if(str.length <= 8){
				str = str += "/01";
			}
		}
	}


	return str;
};

/**
 * Module : Sparrow cookies
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-07-27 21:46:50
 */

var setCookie = function(sName, sValue, oExpires, sPath, sDomain, bSecure) {
	var sCookie = sName + "=" + encodeURIComponent(sValue);
	if(oExpires)
		sCookie += "; expires=" + oExpires.toGMTString();
	if(sPath)
		sCookie += "; path=" + sPath;
	if(sDomain)
		sCookie += "; domain=" + sDomain;
	if(bSecure)
		sCookie += "; secure=" + bSecure;
	document.cookie = sCookie;
};

var getCookie = function(sName) {
	var sRE = "(?:; )?" + sName + "=([^;]*);?";
	var oRE = new RegExp(sRE);

	if(oRE.test(document.cookie)) {
		return decodeURIComponent(RegExp["$1"]);
	} else
		return null;
};

/**
 * Module : Sparrow core context
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-07-28 13:52:19
 */
var environment = {};
/**
 * client attributes
 */
var clientAttributes = {};

var sessionAttributes = {};

var fn = {};
var maskerMeta = {
	'float': {
		precision: 2
	},
	'datetime': {
		format: 'YYYY-MM-DD HH:mm:ss',
		metaType: 'DateTimeFormatMeta',
		speratorSymbol: '-'
	},
	'time': {
		format: 'HH:mm'
	},
	'date': {
		format: 'YYYY-MM-DD'
	},
	'currency': {
		precision: 2,
		curSymbol: '￥'
	},
	'percent': {

	},
	'phoneNumber': {
		
	}
};
/**
 * 获取环境信息
 * @return {environment}
 */
fn.getEnvironment = function() {
	return createShellObject(environment);
};

/**
 * 获取客户端参数对象
 * @return {clientAttributes}
 */
fn.getClientAttributes = function() {
	var exf = function() {};
	return createShellObject(clientAttributes);
};

fn.setContextPath = function(contextPath) {
	return environment[IWEB_CONTEXT_PATH] = contextPath
};
fn.getContextPath = function(contextPath) {
		return environment[IWEB_CONTEXT_PATH]
	};
	/**
	 * 设置客户端参数对象
	 * @param {Object} k 对象名称
	 * @param {Object} v 对象值(建议使用简单类型)
	 */
fn.setClientAttribute = function(k, v) {
		clientAttributes[k] = v;
	};
	/**
	 * 获取会话级参数对象
	 * @return {clientAttributes}
	 */
fn.getSessionAttributes = function() {
	var exf = function() {};
	return createShellObject(sessionAttributes);
};

/**
 * 设置会话级参数对象
 * @param {Object} k 对象名称
 * @param {Object} v 对象值(建议使用简单类型)
 */
fn.setSessionAttribute = function(k, v) {
	sessionAttributes[k] = v;
	setCookie("ISES_" + k, v);
};

/**
 * 移除客户端参数
 * @param {Object} k 对象名称
 */
fn.removeClientAttribute = function(k) {
	clientAttributes[k] = null;
	execIgnoreError(function() {
		delete clientAttributes[k];
	});
};

/**
 * 获取地区信息编码
 */
fn.getLocale = function() {
	return this.getEnvironment().locale
};

/**
 * 获取多语信息
 */
fn.getLanguages = function() {
	return this.getEnvironment().languages
};
/**
 * 收集环境信息(包括客户端参数)
 * @return {Object}
 */
fn.collectEnvironment = function() {
	var _env = this.getEnvironment();
	var _ses = this.getSessionAttributes();

	for(var i in clientAttributes) {
		_ses[i] = clientAttributes[i];
	}
	_env.clientAttributes = _ses;
	return _env
};

/**
 * 设置数据格式信息
 * @param {String} type
 * @param {Object} meta
 */
fn.setMaskerMeta = function(type, meta) {
	if(typeof type == 'function') {
		getMetaFunc = type;
	} else {
		if(!maskerMeta[type])
			maskerMeta[type] = meta;
		else {
			if(typeof meta != 'object')
				maskerMeta[type] = meta;
			else
				for(var key in meta) {
					maskerMeta[type][key] = meta[key];
				}
		}
	}
};
fn.getMaskerMeta = function(type) {
	if(typeof getMetaFunc == 'function') {
		var meta = getMetaFunc.call(this);
		return meta[type];
	} else
		return extend({}, maskerMeta[type]);
};
environment.languages = getCookie(U_LANGUAGES) ? getCookie(U_LANGUAGES).split(',') : navigator.language ? navigator.language : 'zh-CN';
if(environment.languages == 'zh-cn')
	environment.languages = 'zh-CN';
if(environment.languages == 'en-us')
	environment.languages = 'en-US';

environment.theme = getCookie(U_THEME);
environment.locale = getCookie(U_LOCALE);
//environment.timezoneOffset = (new Date()).getTimezoneOffset()
environment.usercode = getCookie(U_USERCODE);
//init session attribute
document.cookie.replace(/ISES_(\w*)=([^;]*);?/ig, function(a, b, c) {
	sessionAttributes[b] = c;
});

var Core = function() {};
Core.prototype = fn;

var core = new Core();

/**
 * Module : Sparrow browser environment
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-07-27 21:46:50
 */

var u$1 = {};


extend(u$1, {
	isIE:  false,
	isFF: false,
	isOpera: false,
	isChrome: false,
	isSafari: false,
	isWebkit: false,
	isIE8_BEFORE: false,
	isIE8: false,
	isIE8_CORE: false,
	isIE9: false,
	isIE9_CORE: false,
	isIE10: false,
	isIE10_ABOVE: false,
	isIE11: false,
	isEdge: false,
	isIOS: false,
	isIphone: false,
	isIPAD: false,
	isStandard: false,
	version: 0,
	isWin: false,
	isUnix: false,
	isLinux: false,
	isAndroid: false,
	isAndroidPAD:false,
	isAndroidPhone:false,
	isMac: false,
	hasTouch: false,
	isMobile: false
});

(function() {
	var userAgent = navigator.userAgent,
		rMsie = /(msie\s|trident.*rv:)([\w.]+)/,
		rFirefox = /(firefox)\/([\w.]+)/,
		rOpera = /(opera).+version\/([\w.]+)/,
		rChrome = /(chrome)\/([\w.]+)/,
		rSafari = /version\/([\w.]+).*(safari)/,
		version,
		ua = userAgent.toLowerCase(),
		s,
		browserMatch = {
			browser: "",
			version: ''
		},
		match = rMsie.exec(ua);

	if(match != null) {
		browserMatch = {
			browser: "IE",
			version: match[2] || "0"
		};
	}
	match = rFirefox.exec(ua);
	if(match != null) {
		browserMatch = {
			browser: match[1] || "",
			version: match[2] || "0"
		};
	}
	match = rOpera.exec(ua);
	if(match != null) {
		browserMatch = {
			browser: match[1] || "",
			version: match[2] || "0"
		};
	}
	match = rChrome.exec(ua);
	if(match != null) {
		browserMatch = {
			browser: match[1] || "",
			version: match[2] || "0"
		};
	}
	match = rSafari.exec(ua);
	if(match != null) {
		browserMatch = {
			browser: match[2] || "",
			version: match[1] || "0"
		};
	}

	if(userAgent.indexOf("Edge") > -1){
		u$1.isEdge = true;
	}
	if(s = ua.match(/opera.([\d.]+)/)) {
		u$1.isOpera = true;
	} else if(browserMatch.browser == "IE" && browserMatch.version == 11) {
		u$1.isIE11 = true;
		u$1.isIE = true;
	} else if(s = ua.match(/chrome\/([\d.]+)/)) {
		u$1.isChrome = true;
		u$1.isStandard = true;
	} else if(s = ua.match(/version\/([\d.]+).*safari/)) {
		u$1.isSafari = true;
		u$1.isStandard = true;
	} else if(s = ua.match(/gecko/)) {
		//add by licza : support XULRunner
		u$1.isFF = true;
		u$1.isStandard = true;
	} else if(s = ua.match(/msie ([\d.]+)/)) {
		u$1.isIE = true;
	} else if(s = ua.match(/firefox\/([\d.]+)/)) {
		u$1.isFF = true;
		u$1.isStandard = true;
	}
	if(ua.match(/webkit\/([\d.]+)/)) {
		u$1.isWebkit = true;
	}
	if(ua.match(/ipad/i)) {
		u$1.isIOS = true;
		u$1.isIPAD = true;
		u$1.isStandard = true;
	}

	if(ua.match(/iphone/i)) {
		u$1.isIOS = true;
		u$1.isIphone = true;
	}

	if((navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel")) {
		//u.isIOS = true;
		u$1.isMac = true;
	}

	if((navigator.platform == "Win32") || (navigator.platform == "Windows") || (navigator.platform == "Win64")) {
		u$1.isWin = true;
	}

	if((navigator.platform == "X11") && !u$1.isWin && !u$1.isMac) {
		u$1.isUnix = true;
	}
	if((String(navigator.platform).indexOf("Linux") > -1)) {
		u$1.isLinux = true;
	}

	if(ua.indexOf('Android') > -1 || ua.indexOf('android') > -1 || ua.indexOf('Adr') > -1 || ua.indexOf('adr') > -1) {
		u$1.isAndroid = true;
	}

	u$1.version = version ? (browserMatch.version ? browserMatch.version : 0) : 0;
	if(u$1.isAndroid){
		if(window.screen.width>=768&&window.screen.width<1024){
			u$1.isAndroidPAD=true;
		}
		if(window.screen.width<=768) {
			u$1.isAndroidPhone = true;
		}
	}
	if(u$1.isIE) {
		var intVersion = parseInt(u$1.version);
		var mode = document.documentMode;
		if(mode == null) {
			if(intVersion == 6 || intVersion == 7) {
				u$1.isIE8_BEFORE = true;
			}
		} else {
			if(mode == 7) {
				u$1.isIE8_BEFORE = true;
			} else if(mode == 8) {
				u$1.isIE8 = true;
			} else if(mode == 9) {
				u$1.isIE9 = true;
				u$1.isSTANDARD = true;
			} else if(mode == 10) {
				u$1.isIE10 = true;
				u$1.isSTANDARD = true;
				u$1.isIE10_ABOVE = true;
			} else {
				u$1.isSTANDARD = true;
			}
			if(intVersion == 8) {
				u$1.isIE8_CORE = true;
			} else if(intVersion == 9) {
				u$1.isIE9_CORE = true;
			} else if(browserMatch.version == 11) {
				u$1.isIE11 = true;
			}
		}
	}
	if("ontouchend" in document) {
		u$1.hasTouch = true;
	}
	if(u$1.isIphone || u$1.isAndroidPhone)
		u$1.isMobile = true;

})();

var env = u$1;

/**
 * Module : Sparrow i18n
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-07-29 10:16:54
 */
//import {uuii18n} from '?';//缺失故修改为default值
// 从datatable/src/compatiable/u/JsExtension.js抽取
window.getCurrentJsPath = function() {
	var doc = document,
	a = {},
	expose = +new Date(),
	rExtractUri = /((?:http|https|file):\/\/.*?\/[^:]+)(?::\d+)?:\d+/,
	isLtIE8 = ('' + doc.querySelector).indexOf('[native code]') === -1;
	// FF,Chrome
	if (doc.currentScript){
		return doc.currentScript.src;
	}

	var stack;
	try{
		a.b();
	}
	catch(e){
		stack = e.stack || e.fileName || e.sourceURL || e.stacktrace;
	}
	// IE10
	if (stack){
		var absPath = rExtractUri.exec(stack)[1];
		if (absPath){
			return absPath;
		}
	}

	// IE5-9
	for(var scripts = doc.scripts,
		i = scripts.length - 1,
		script; script = scripts[i--];){
		if (script.className !== expose && script.readyState === 'interactive'){
			script.className = expose;
			// if less than ie 8, must get abs path by getAttribute(src, 4)
			return isLtIE8 ? script.getAttribute('src', 4) : script.src;
		}
	}
};

if (window.i18n) {
	window.u = window.u || {};
    var scriptPath = getCurrentJsPath(),
        _temp = scriptPath.substr(0, scriptPath.lastIndexOf('/')),
        __FOLDER__ = _temp.substr(0, _temp.lastIndexOf('/')),
        resGetPath = u.i18nPath || __FOLDER__ + '/locales/__lng__/__ns__.json';
    i18n.init({
        postAsync: false,
        getAsync: false,
        fallbackLng: false,
        ns: {namespaces: ['uui-trans']},
		lng:getCookie(U_LOCALE) || 'zh',
        resGetPath: resGetPath
    });
}

var trans = function (key, dftValue) {
    return  window.i18n ?  i18n.t('uui-trans:' + key) : dftValue
};

/**
 * Module : Sparrow date util
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-08-06 13:37:20
 */

var u$2 = {};
u$2.date = {

    /**
     * 多语言处理
     */
    //TODO 后续放到多语文件中
    _dateLocale: {
        'zh-CN': {
            months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
            monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
            weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
            weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
            weekdaysMin: '日_一_二_三_四_五_六'.split('_')
        },
        'en-US': {
            months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
            monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
            weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thurday_Friday_Saturday'.split('_'),
            weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            weekdaysMin: 'S_M_T_W_T_F_S'.split('_')
        }
    },
    _jsonLocale: {
        months: trans('date.months', "一月\n二月\n三月\n四月\n五月\n六月\n七月\n八月\n九月\n十月\n十一月\n十二月").split('\n'),
        monthsShort: trans('date.monthsShort', "1月\n2月\n3月\n4月\n5月\n6月\n7月\n8月\n9月\n10月\n11月\n12月").split('\n'),
        weekdays: trans('date.weekdays', "星期日\n星期一\n星期二\n星期三\n星期四\n星期五\n星期六").split('\n'),
        weekdaysShort: trans('date.weekdaysShort', "周日\n周一\n周二\n周三\n周四\n周五\n周六").split('\n'),
        weekdaysMin: trans('date.weekdaysMin', "日\n一\n二\n三\n四\n五\n六").split('\n'),
        defaultMonth: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
    },

    _formattingTokens: /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYY|YY|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,

    leftZeroFill: function(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    },

    _formats: {
        //year
        YY: function(date) {
            return u$2.date.leftZeroFill(date.getFullYear() % 100, 2);
        },
        YYYY: function(date) {
            return date.getFullYear();
        },
        //month
        M: function(date) {
            return date.getMonth() + 1;
        },
        MM: function(date) {
            var m = u$2.date._formats.M(date);
            return u$2.date.leftZeroFill(m, 2);
        },
        MMM: function(date, language) {
            var m = date.getMonth();
            // return u.date._dateLocale[language].monthsShort[m];
            return u$2.date._jsonLocale.monthsShort[m];
        },
        MMMM: function(date, language) {
            var m = date.getMonth();
            // return u.date._dateLocale[language].months[m];
            return u$2.date._jsonLocale.months[m];
        },
        //date
        D: function(date) {
            return date.getDate();
        },
        DD: function(date) {
            var d = u$2.date._formats.D(date);
            return u$2.date.leftZeroFill(d, 2);
        },
        // weekday
        d: function(date) {
            return date.getDay();
        },
        dd: function(date, language) {
            var d = u$2.date._formats.d(date);
            // return u.date._dateLocale[language].weekdaysMin[d];
            return u$2.date._jsonLocale.weekdaysMin[d];
        },
        ddd: function(date, language) {
            var d = u$2.date._formats.d(date);
            // return u.date._dateLocale[language].weekdaysShort[d];
            return u$2.date._jsonLocale.weekdaysShort[d];
        },
        dddd: function(date, language) {
            var d = u$2.date._formats.d(date);
            // return u.date._dateLocale[language].weekdays[d];
            return u$2.date._jsonLocale.weekdays[d];
        },
        // am pm
        a: function(date) {
            if (date.getHours() > 12) {
                return 'pm';
            } else {
                return 'am';
            }
        },
        //hour
        h: function(date) {
            var h = date.getHours();
            h = h > 12 ? h - 12 : h;
            return h
        },
        hh: function(date) {
            var h = u$2.date._formats.h(date);
            return u$2.date.leftZeroFill(h, 2);
        },
        H: function(date) {
            return date.getHours();
        },
        HH: function(date) {
            return u$2.date.leftZeroFill(date.getHours(), 2);
        },
        // minutes
        m: function(date) {
            return date.getMinutes();
        },
        mm: function(date) {
            return u$2.date.leftZeroFill(date.getMinutes(), 2);
        },
        //seconds
        s: function(date) {
            return date.getSeconds();
        },
        ss: function(date) {
            return u$2.date.leftZeroFill(date.getSeconds(), 2);
        }
    },

    /**
     * 日期格式化
     * @param date
     * @param formatString
     */
    format: function(date, formatString, language) {
        if (!date && date != 0) return ''; // renturn date 改为 return '',因：setFormat初始会赋值为undefined,造成二次选择报错
        var array = formatString.match(u$2.date._formattingTokens),
            i, length, output = '';
        var _date = u$2.date.getDateObj(date);
        if (!_date) return date;
        language = language || core.getLanguages();
        for (i = 0, length = array.length; i < length; i++) {
            if (u$2.date._formats[array[i]]) {
                output += u$2.date._formats[array[i]](_date, language);
            } else {
                output += array[i];
            }
        }
        return output;
    },
    strToDateByTimezone: function(str, timezone) {
        var dateObj = u$2.date.getDateObj(str);
        var localTime = dateObj.getTime();
        var localOffset = dateObj.getTimezoneOffset() * 60000;
        var utc = localTime + localOffset; //得到国际标准时间
        utc = utc + (3600000 * parseFloat(timezone));
        return utc;
    },

    /**
     * 根据当前时区日期对象获取指定时区日期对象
     * @param  {Date} date     当前时区日期对象
     * @param  {number} timezone 指定时区
     * @return {Date}          转化后的日期对象
     */
    getDateByTimeZonec2z: function(date, timezone) {
        var dateObj = u$2.date.getDateObj(date);
        var localTime = dateObj.getTime();
        var localOffset = dateObj.getTimezoneOffset() * 60000;
        var utc = localTime + localOffset;
        var calctime = utc + (3600000 * parseFloat(timezone));
        return new Date(calctime);
    },
    /**
     * 根据指定时区日期对象获取当前时区日期对象
     * @param  {Date} date     指定时区日期对象
     * @param  {number} timezone 指定时区
     * @return {Date}          转化后的日期对象
     */
    getDateByTimeZonez2c: function(date, timezone) {
        var dateObj = u$2.date.getDateObj(date);
        var localTime = dateObj.getTime();
        var localOffset = dateObj.getTimezoneOffset() * 60000;
        var utc = localTime - (3600000 * parseFloat(timezone)) - localOffset;
        return new Date(utc)
    },

    _addOrSubtract: function(date, period, value, isAdding) {
        var times = date.getTime(),
            d = date.getDate(),
            m = date.getMonth(),
            _date = u$2.date.getDateObj(date);
        if (period === 'ms') {
            times = times + value * isAdding;
            _date.setTime(times);
        } else if (period == 's') {
            times = times + value * 1000 * isAdding;
            _date.setTime(times);
        } else if (period == 'm') {
            times = times + value * 60000 * isAdding;
            _date.setTime(times);
        } else if (period == 'h') {
            times = times + value * 3600000 * isAdding;
            _date.setTime(times);
        } else if (period == 'd') {
            d = d + value * isAdding;
            _date.setDate(d);
        } else if (period == 'w') {
            d = d + value * 7 * isAdding;
            _date.setDate(d);
        } else if (period == 'M') {
            m = m + value * isAdding;
            _date.setMonth(m);
        } else if (period == 'y') {
            m = m + value * 12 * isAdding;
            _date.setMonth(m);
        }
        return _date;
    },

    add: function(date, period, value) {
        return u$2.date._addOrSubtract(date, period, value, 1);
    },
    sub: function(date, period, value) {
        return u$2.date._addOrSubtract(date, period, value, -1);
    },
    getDateObj: function(value, obj) {
        var timezone;
        if (obj) {
            timezone = obj.timezone;
        }
        if ((!value && value != 0) || typeof value == 'undefined') return value;
        var dateFlag = false;
        var _date = new Date(dateFormat(value));
        if (isNaN(_date)) {
            // IE的话对"2016-2-13 12:13:22"进行处理
            var index1, index2, index3, s1, s2, s3, s4;
            if (value.indexOf) {
                index1 = value.indexOf('-');
                index2 = value.indexOf(':');
                index3 = value.indexOf(' ');
                if (index1 > 0 || index2 > 0 || index3 > 0) {
                    _date = new Date();
                    if (index3 > 0) {
                        s3 = value.split(' ');
                        s1 = s3[0].split('-');
                        s2 = s3[1].split(':');
                        s4 = s3[2];
                    } else if (index1 > 0) {
                        s1 = value.split('-');
                    } else if (index2 > 0) {
                        s2 = value.split(':');
                    }
                    if (s1 && s1.length > 0) {
                        _date.setYear(s1[0]);
                        _date.setMonth(parseInt(s1[1] - 1));
                        _date.setDate(s1[2] ? s1[2] : 0);
                        _date.setMonth(parseInt(s1[1] - 1));
                        _date.setDate(s1[2] ? s1[2] : 0);
                        dateFlag = true;
                    }
                    if (s2 && s2.length > 0) {
                        //解决ie和firefox等时间pm直接变am问题
                        if (s4 == "pm") {
                            s2[0] = s2[0] - (-12);
                        }
                        _date.setHours(s2[0] ? s2[0] : 0);
                        _date.setMinutes(s2[1] ? s2[1] : 0);
                        _date.setSeconds(s2[2] ? s2[2] : 0);
                        dateFlag = true;
                    }
                } else {
                    _date = new Date(parseInt(value));
                    if (isNaN(_date)) {
                        // throw new TypeError('invalid Date parameter');
                    } else {
                        dateFlag = true;
                    }
                }
            }
        } else {
            dateFlag = true;
        }
        if (dateFlag) {
            if (timezone) {
                _date = u$2.date.getDateByTimeZonec2z(_date, timezone);
            }
            return _date;
        } else
            return null;
    }

};

var date = u$2.date;

/**
 * Module : Sparrow dom
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-08-16 13:59:17
 */
/**
 * 元素增加指定样式
 * @param value
 * @returns {*}
 */
var addClass = function(element, value) {
	if(element){
		if(typeof element.classList === 'undefined') {
			if(u._addClass){
				u._addClass(element, value);
			}else{
				$(element).addClass(value);
			}

		} else {
			element.classList.add(value);
		}
	}

	return this;
};
/**
 * 删除元素上指定样式
 * @param {Object} element
 * @param {Object} value
 */
var removeClass = function(element, value) {
	if(element){
		if(typeof element.classList === 'undefined') {
			if(u._removeClass){
				u._removeClass(element, value);
			}else{
				$(element).removeClass(value);
			}

		} else {
			element.classList.remove(value);
		}
	}
	return this;
};
/**
 * 元素上是否存在该类
 * @param {Object} element
 * @param {Object} value
 */
var hasClass = function(element, value) {
	if(!element) return false;
	if(element.nodeName && (element.nodeName === '#text' || element.nodeName === '#comment')) return false;
	if(typeof element.classList === 'undefined') {
		if(u._hasClass){
			return u._hasClass(element, value);
		}else{
			return $(element).hasClass(value);
		}

		return false;
	} else {
		return element.classList.contains(value);
	}
};
var globalZIndex;
/**
 * 统一zindex值, 不同控件每次显示时都取最大的zindex，防止显示错乱
 */
var getZIndex = function() {
	if(!globalZIndex) {
		globalZIndex = 2000;
	}
	return globalZIndex++;
};
var makeDOM = function(htmlString) {
	var tempDiv = document.createElement("div");
	tempDiv.innerHTML = htmlString;
	var _dom = tempDiv.children[0];
	return _dom;
};
/**
 * element
 */
var makeModal = function(element, parEle) {
	var overlayDiv = document.createElement('div');
	$(overlayDiv).addClass('u-overlay');
	overlayDiv.style.zIndex = getZIndex();
	// 如果有父元素则插入到父元素上，没有则添加到body上
	if(parEle && parEle != document.body) {
		addClass(overlayDiv, 'hasPar');
		parEle.appendChild(overlayDiv);
	} else {
		document.body.appendChild(overlayDiv);
	}

	element.style.zIndex = getZIndex();
	on(overlayDiv, 'click', function(e) {
		stopEvent(e);
	});
	return overlayDiv;
};


var showPanelByEle = function(obj) {
		var ele = obj.ele,panel = obj.panel,position = obj.position,
			// off = u.getOffset(ele),scroll = u.getScroll(ele),
			// offLeft = off.left,offTop = off.top,
			// scrollLeft = scroll.left,scrollTop = scroll.top,
			// eleWidth = ele.offsetWidth,eleHeight = ele.offsetHeight,
			// panelWidth = panel.offsetWidth,panelHeight = panel.offsetHeight,
			bodyWidth = document.body.clientWidth,bodyHeight = document.body.clientHeight,
			position = position || 'top',
			// left = offLeft - scrollLeft,top = offTop - scrollTop,
			eleRect = obj.ele.getBoundingClientRect(),
			panelRect = obj.panel.getBoundingClientRect(),
			eleWidth = eleRect.width || 0,eleHeight = eleRect.height || 0,
			left = eleRect.left || 0,top = eleRect.top || 0,
			panelWidth = panelRect.width || 0,panelHeight = panelRect.height || 0,
			docWidth =  document.documentElement.clientWidth, docHeight =  document.documentElement.clientHeight;

			// 基准点为Ele的左上角
			// 后续根据需要完善
		if(position == 'left'){
			left=left-panelWidth;
			top=top+(eleHeight - panelHeight)/2;
		}else if(position == 'right'){
			left=left+eleWidth;
			top=top+(eleHeight - panelHeight)/2;
		}else if(position == 'top'||position == 'topCenter'){
			left = left + (eleWidth - panelWidth)/2;
			top = top - panelHeight;
		}else if(position == 'bottom'||position == 'bottomCenter'){
			left = left+ (eleWidth - panelWidth)/2;
			top = top + eleHeight;
		}else if(position == 'bottomLeft'){
			left = left;
			top = top + eleHeight;
		}

	        if((left + panelWidth) > docWidth)
	            left = docWidth - panelWidth - 10;
	        if(left < 0)
	            left = 0;

	         if((top + panelHeight) > docHeight) {
		 top = docHeight - panelHeight - 10;
		 }

	         if(top < 0)
	             top = 0;
	        panel.style.left = left + 'px';
	        panel.style.top = top + 'px';
	};

/**
 * Module : neoui-clockpicker
 * Author : liuyk(liuyk@yonyou.com)
 * Date	  : 2016-08-11 15:17:07
 */

const ClockPicker = u.BaseComponent.extend({
    DEFAULTS: {},
    init: function() {
        var self = this;
        var element = this.element;
        this.options = extend({}, this.DEFAULTS, this.options);
        this.format = this.options['format'] || core.getMaskerMeta('time').format;
        this.panelDiv = null;
        this.input = this.element.querySelector("input");
        if (env.isMobile) {
            this.input.setAttribute('readonly', 'readonly');
        }
        addClass(this.element, 'u-text');

        this.template = '<div class="u-clock-ul popover clockpicker-popover" style="padding:0px;">';
        this.template += '<div class="popover-title"><button class="u-button u-date-clean u-clock-clean" >';
        this.template += trans('public.clear', "清空");
        this.template += '</button><span class="clockpicker-span-hours">02</span> : <span class="clockpicker-span-minutes text-primary">01</span><span class="clockpicker-span-am-pm"></span></div>';
        this.template += '<div class="popover-content">';
        this.template += '	<div class="clockpicker-plate">';
        this.template += '		<div class="clockpicker-canvas">';
        this.template += '			<svg class="clockpicker-svg">';
        this.template += '				<g transform="translate(100,100)">';
        this.template += '					<circle class="clockpicker-canvas-bg clockpicker-canvas-bg-trans" r="13" cx="8.362277061412277" cy="-79.56175162946187"></circle>';
        this.template += '					<circle class="clockpicker-canvas-fg" r="3.5" cx="8.362277061412277" cy="-79.56175162946187"></circle>';
        this.template += '					<line x1="0" y1="0" x2="8.362277061412277" y2="-79.56175162946187"></line>';
        this.template += '					<circle class="clockpicker-canvas-bearing" cx="0" cy="0" r="2"></circle>';
        this.template += '				</g>';
        this.template += '			</svg>';
        this.template += '		</div>';
        this.template += '		<div class="clockpicker-dial clockpicker-hours" style="visibility: visible;">';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-1" >00</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-2" >1</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-3" >2</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-4" >3</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-5" >4</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-6" >5</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-7" >6</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-8" >7</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-9" >8</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-10" >9</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-11" >10</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-12" >11</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-13" >12</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-14" >13</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-15" >14</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-16" >15</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-17" >16</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-18" >17</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-19" >18</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-20" >19</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-21" >20</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-22" >21</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-23" >22</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-24" >23</div>';
        this.template += '		</div>';
        this.template += '		<div class="clockpicker-dial clockpicker-minutes" style="visibility: hidden;">';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-25" >00</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-26" >05</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-27" >10</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-28" >15</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-29" >20</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-30" >25</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-31" >30</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-32" >35</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-33" >40</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-34" >45</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-35" >50</div>';
        this.template += '			<div class="clockpicker-tick clockpicker-tick-36" >55</div>';
        this.template += '		</div>';
        this.template += '	</div><span class="clockpicker-am-pm-block"></span></div>';
        this.template += '	</div>';
        on(this.input, 'blur', function(e) {
            self._inputFocus = false;
            this.setValue(this.input.value);
        }.bind(this));

        var d = new Date();
        this.defaultHour = d.getHours() > 9 ? '' + d.getHours() : '0' + d.getHours();
        this.defaultMin = d.getMinutes() > 9 ? '' + d.getMinutes() : '0' + d.getMinutes();
        this.defaultSec = d.getSeconds() > 9 ? '' + d.getSeconds() : '0' + d.getSeconds();

        this.hours = this.defaultHour;
        this.min = this.defaultMin;
        this.sec = this.defaultSec;
        // 添加focus事件
        this.focusEvent();
        // 添加右侧图标click事件
        this.clickEvent();
    },

    _zoomIn: function(newPage) {

        addClass(newPage, 'zoom-in');

        var cleanup = function() {
            off(newPage, 'transitionend', cleanup);
            off(newPage, 'webkitTransitionEnd', cleanup);
            // this.panelContentDiv.removeChild(this.contentPage);
            this.contentPage = newPage;
        }.bind(this);
        if (this.contentPage) {
            on(newPage, 'transitionend', cleanup);
            on(newPage, 'webkitTransitionEnd', cleanup);
        }
        setTimeout(function() {
            newPage.style.visibility = 'visible';
            removeClass(newPage, 'zoom-in');
        }, 150);
    },

    createPanel: function() {
        if (this.panelDiv)
            return;
        var oThis = this;
        this.panelDiv = makeDOM(this.template);

        this.hand = this.panelDiv.querySelector('line');
        this.bg = this.panelDiv.querySelector('.clockpicker-canvas-bg');
        this.fg = this.panelDiv.querySelector('.clockpicker-canvas-fg');
        this.titleHourSpan = this.panelDiv.querySelector('.clockpicker-span-hours');
        this.titleMinSpan = this.panelDiv.querySelector('.clockpicker-span-minutes');
        this.hourDiv = this.panelDiv.querySelector('.clockpicker-hours');
        this.minDiv = this.panelDiv.querySelector('.clockpicker-minutes');
        this.btnClean = this.panelDiv.querySelector('.u-date-clean');
        if (!env.isMobile)
            this.btnClean.style.display = 'none';
        this.currentView = 'hours';
        on(this.hourDiv, 'click', function(e) {
            var target = e.target;
            if (hasClass(target, 'clockpicker-tick')) {
                this.hours = target.innerHTML;
                this.hours = this.hours > 9 || this.hours == 0 ? '' + this.hours : '0' + this.hours;
                this.titleHourSpan.innerHTML = this.hours;
                this.hourDiv.style.visibility = 'hidden';
                // this.minDiv.style.visibility = 'visible';
                this._zoomIn(this.minDiv);
                this.currentView = 'min';
                this.setHand();
            }
        }.bind(this));

        on(this.minDiv, 'click', function(e) {
            var target = e.target;
            if (hasClass(target, 'clockpicker-tick')) {
                this.min = target.innerHTML;
                // this.min = this.min > 9 || this.min == 00? '' + this.min:'0' + this.min;
                this.titleMinSpan.innerHTML = this.min;
                this.minDiv.style.visibility = 'hidden';
                this.hourDiv.style.visibility = 'visible';
                this.currentView = 'hours';
                var v = this.hours + ':' + this.min + ':' + this.sec;
                this.setValue(v);
                this.hide();
            }
        }.bind(this));

        on(this.btnClean, 'click', function(e) {
            this.setValue("");
            this.hide();
        }.bind(this));
    },

    setHand: function() {
        var dialRadius = 100,
            innerRadius = 54,
            outerRadius = 80;
        var view = this.currentView,
            value = this[view],
            isHours = view === 'hours',
            unit = Math.PI / (isHours ? 6 : 30),
            radian = value * unit,
            radius = isHours && value > 0 && value < 13 ? innerRadius : outerRadius,
            x = Math.sin(radian) * radius,
            y = -Math.cos(radian) * radius;
        this.setHandFun(x, y);
    },

    setHandFun: function(x, y, roundBy5, dragging) {
        var dialRadius = 100,
            innerRadius = 54,
            outerRadius = 80;

        var radian = Math.atan2(x, -y),
            isHours = this.currentView === 'hours',
            unit = Math.PI / (isHours ? 6 : 30),
            z = Math.sqrt(x * x + y * y),
            options = this.options,
            inner = isHours && z < (outerRadius + innerRadius) / 2,
            radius = inner ? innerRadius : outerRadius,
            value;

        if (this.twelvehour) {
            radius = outerRadius;
        }

        // Radian should in range [0, 2PI]
        if (radian < 0) {
            radian = Math.PI * 2 + radian;
        }

        // Get the round value
        value = Math.round(radian / unit);

        // Get the round radian
        radian = value * unit;

        // Correct the hours or minutes
        if (options.twelvehour) {
            if (isHours) {
                if (value === 0) {
                    value = 12;
                }
            } else {
                if (roundBy5) {
                    value *= 5;
                }
                if (value === 60) {
                    value = 0;
                }
            }
        } else {
            if (isHours) {
                if (value === 12) {
                    value = 0;
                }
                value = inner ? (value === 0 ? 12 : value) : value === 0 ? 0 : value + 12;
            } else {
                if (roundBy5) {
                    value *= 5;
                }
                if (value === 60) {
                    value = 0;
                }
            }
        }

        // Set clock hand and others' position
        var w = this.panelDiv.querySelector('.clockpicker-plate').offsetWidth;
        var u = w / 200;
        var cx = Math.sin(radian) * radius * u,
            cy = -Math.cos(radian) * radius * u;
        var iu = 100 * u;
        this.panelDiv.querySelector('g').setAttribute('transform', 'translate(' + iu + ',' + iu + ')');

        this.hand.setAttribute('x2', cx);
        this.hand.setAttribute('y2', cy);
        this.bg.setAttribute('cx', cx);
        this.bg.setAttribute('cy', cy);
        this.fg.setAttribute('cx', cx);
        this.fg.setAttribute('cy', cy);
    },

    setValue: function(value) {
        value = value ? value : '';
        var oldShowValue;
        if (value == '') {
            if (this.input.value != '') {
                this.input.value = '';
                this.trigger('valueChange', {
                    value: ''
                });
            }
            return;

        }


        if (value && value.indexOf(':') > -1) {
            var vA = value.split(":");
            var hour = vA[0];
            hour = hour % 24;
            this.hours = hour > 9 ? '' + hour : '0' + hour;
            var min = vA[1];
            min = min % 60;
            this.min = min > 9 ? '' + min : '0' + min;
            var sec = vA[2] || 0;
            sec = sec % 60;
            this.sec = sec > 9 ? '' + sec : '0' + sec;

            value = this.hours + ':' + this.min + ':' + this.sec;
        } else {
            this.hours = this.defaultHour;
            this.min = this.defaultMin;
            this.sec = this.defaultSec;
        }
        var _date = new Date();
        _date.setHours(this.hours);
        _date.setMinutes(this.min);
        _date.setSeconds(this.sec);
        var showValue = date.format(_date, this.format);
        oldShowValue = this.input.value;
        this.input.value = showValue;
        if (oldShowValue != showValue) {
            this.trigger('valueChange', {
                value: value
            });
        }
    },

    focusEvent: function() {
        var self = this;
        on(this.input, 'focus', function(e) {
            self._inputFocus = true;
            self.show(e);
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }

        });
    },

    //下拉图标的点击事件
    clickEvent: function() {
        var self = this;
        var caret = this.element.nextSibling;
        on(caret, 'click', function(e) {
            self._inputFocus = true;
            self.show(e);
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }

        });
    },


    show: function(evt) {

        var inputValue = this.input.value;
        this.setValue(inputValue);

        var self = this;
        this.createPanel();
        this.minDiv.style.visibility = 'hidden';
        this.hourDiv.style.visibility = 'visible';
        this.currentView = 'hours';
        this.titleHourSpan.innerHTML = this.hours;
        this.titleMinSpan.innerHTML = this.min;

        /*因为元素可能变化位置，所以显示的时候需要重新计算*/
        if (env.isMobile) {
            this.panelDiv.style.position = 'fixed';
            this.panelDiv.style.top = '20%';
            var screenW = document.body.clientWidth;
            var l = (screenW - 226) / 2;
            this.panelDiv.style.left = l + 'px';
            this.overlayDiv = makeModal(this.panelDiv);
            on(this.overlayDiv, 'click', function() {
                self.hide();
            });
        } else {
            if (this.options.showFix) {
                document.body.appendChild(this.panelDiv);
                this.panelDiv.style.position = 'fixed';
                showPanelByEle({
                    ele: this.input,
                    panel: this.panelDiv,
                    position: "bottomLeft"
                });
            } else {

                var bodyWidth = document.body.clientWidth,
                    bodyHeight = document.body.clientHeight,
                    panelWidth = this.panelDiv.offsetWidth,
                    panelHeight = this.panelDiv.offsetHeight;

                this.element.appendChild(this.panelDiv);
                this.element.style.position = 'relative';
                this.left = this.input.offsetLeft;
                var inputHeight = this.input.offsetHeight;
                this.top = this.input.offsetTop + inputHeight;

                if (this.left + panelWidth > bodyWidth) {
                    this.left = bodyWidth - panelWidth;
                }

                if ((this.top + panelHeight) > bodyHeight) {
                    this.top = bodyHeight - panelHeight;
                }


                this.panelDiv.style.left = this.left + 'px';
                this.panelDiv.style.top = this.top + 'px';
            }
        }

        this.panelDiv.style.zIndex = getZIndex();
        addClass(this.panelDiv, 'is-visible');

        this.setHand();

        var callback = function(e) {
            if (e !== evt && e.target !== this.input && !self.clickPanel(e.target) && self._inputFocus != true) {
                off(document, 'click', callback);
                this.hide();
            }
        }.bind(this);
        on(document, 'click', callback);

        //tab事件
        on(self.input, 'keydown', function(e) {
            var keyCode = e.keyCode;
            if (keyCode == 9) {
                self.hide();
            }
        });


    },

    clickPanel: function(dom) {
        while (dom) {
            if (dom == this.panelDiv) {
                return true
            } else {
                dom = dom.parentNode;
            }
        }
        return false;
    },

    hide: function() {
        removeClass(this.panelDiv, 'is-visible');
        this.panelDiv.style.zIndex = -1;
        if (this.overlayDiv) {
            try {
                document.body.removeChild(this.overlayDiv);
            } catch (e) {

            }

        }
    }
});
if (!env.isIE8) {
    if (u.compMgr)
        u.compMgr.regComp({
            comp: ClockPicker,
            compAsString: 'u.ClockPicker',
            css: 'u-clockpicker'
        });
}

var Time = u.BaseComponent.extend({
    DEFAULTS: {},
    init: function() {
        var self = this;
        var element = this.element;
        this.options = extend({}, this.DEFAULTS, this.options);
        this.panelDiv = null;
        this.input = this.element.querySelector("input");
        addClass(this.element, 'u-text');


        on(this.input, 'blur', function(e) {
            self._inputFocus = false;
            this.setValue(this.input.value);
        }.bind(this));

        // 添加focus事件
        this.focusEvent();
        // 添加右侧图标click事件
        this.clickEvent();
    }
});



Time.fn = Time.prototype;

Time.fn.createPanel = function() {
    if (this.panelDiv)
        return;
    var oThis = this;
    this.panelDiv = makeDOM('<div class="u-date-panel" style="padding:0px;"></div>');
    this.panelContentDiv = makeDOM('<div class="u-time-content"></div>');
    this.panelDiv.appendChild(this.panelContentDiv);
    this.panelHourDiv = makeDOM('<div class="u-time-cell"></div>');
    this.panelContentDiv.appendChild(this.panelHourDiv);
    this.panelHourInput = makeDOM('<input class="u-time-input">');
    this.panelHourDiv.appendChild(this.panelHourInput);
    this.panelMinDiv = makeDOM('<div class="u-time-cell"></div>');
    this.panelContentDiv.appendChild(this.panelMinDiv);
    this.panelMinInput = makeDOM('<input class="u-time-input">');
    this.panelMinDiv.appendChild(this.panelMinInput);
    this.panelSecDiv = makeDOM('<div class="u-time-cell"></div>');
    this.panelContentDiv.appendChild(this.panelSecDiv);
    this.panelSecInput = makeDOM('<input class="u-time-input">');
    this.panelSecDiv.appendChild(this.panelSecInput);
    this.panelNavDiv = makeDOM('<div class="u-time-nav"></div>');
    this.panelDiv.appendChild(this.panelNavDiv);
    this.panelOKButton = makeDOM('<button class="u-button" style="float:right;">OK</button>');
    this.panelNavDiv.appendChild(this.panelOKButton);
    on(this.panelOKButton, 'click', function() {
        var v = oThis.panelHourInput.value + ':' + oThis.panelMinInput.value + ':' + oThis.panelSecInput.value;
        oThis.setValue(v);
        oThis.hide();
    });
    this.panelCancelButton = makeDOM('<button class="u-button" style="float:right;">Cancel</button>');
    this.panelNavDiv.appendChild(this.panelCancelButton);
    on(this.panelCancelButton, 'click', function() {
        oThis.hide();
    });

    var d = new Date();
    this.panelHourInput.value = d.getHours() > 9 ? '' + d.getHours() : '0' + d.getHours();
    this.panelMinInput.value = d.getMinutes() > 9 ? '' + d.getMinutes() : '0' + d.getMinutes();
    this.panelSecInput.value = d.getSeconds() > 9 ? '' + d.getSeconds() : '0' + d.getSeconds();

};

Time.fn.setValue = function(value) {
    var hour = '',
        min = '',
        sec = '';
    value = value ? value : '';
    if (value == this.input.value) return;
    if (value && value.indexOf(':') > -1) {
        var vA = value.split(":");
        var hour = vA[0];
        hour = hour % 24;
        hour = hour > 9 ? '' + hour : '0' + hour;
        var min = vA[1];
        min = min % 60;
        min = min > 9 ? '' + min : '0' + min;
        var sec = vA[2];
        sec = sec % 60;
        sec = sec > 9 ? '' + sec : '0' + sec;

        value = hour + ':' + min + ':' + sec;
    }
    this.input.value = value;
    this.createPanel();

    this.panelHourInput.value = hour;
    this.panelMinInput.value = min;
    this.panelSecInput.value = sec;
    this.trigger('valueChange', {
        value: value
    });
};

Time.fn.focusEvent = function() {
    var self = this;
    on(this.input, 'focus', function(e) {
        self._inputFocus = true;
        self.show(e);
        stopEvent(e);
    });
};

//下拉图标的点击事件
Time.fn.clickEvent = function() {
    var self = this;
    var caret = this.element.nextSibling;
    on(caret, 'click', function(e) {
        self.input.focus();
        stopEvent(e);
    });
};


Time.fn.show = function(evt) {

    var inputValue = this.input.value;
    this.setValue(inputValue);

    var oThis = this;
    this.createPanel();

    /*因为元素可能变化位置，所以显示的时候需要重新计算*/
    this.width = this.element.offsetWidth;
    if (this.width < 300)
        this.width = 300;

    this.panelDiv.style.width = this.width + 'px';
    this.panelDiv.style.maxWidth = this.width + 'px';
    if (this.options.showFix) {
        document.body.appendChild(this.panelDiv);
        this.panelDiv.style.position = 'fixed';
        showPanelByEle({
            ele: this.input,
            panel: this.panelDiv,
            position: "bottomLeft"
        });
    } else {
        // this.element.parentNode.appendChild(this.panelDiv);
        // //调整left和top
        // this.left = this.element.offsetLeft;
        // var inputHeight = this.element.offsetHeight;
        // this.top = this.element.offsetTop + inputHeight;
        // this.panelDiv.style.left = this.left + 'px';
        // this.panelDiv.style.top = this.top + 'px';

        var bodyWidth = document.body.clientWidth,
            bodyHeight = document.body.clientHeight,
            panelWidth = this.panelDiv.offsetWidth,
            panelHeight = this.panelDiv.offsetHeight;

        this.element.appendChild(this.panelDiv);
        this.element.style.position = 'relative';
        this.left = this.input.offsetLeft;
        var inputHeight = this.input.offsetHeight;
        this.top = this.input.offsetTop + inputHeight;

        if (this.left + panelWidth > bodyWidth) {
            this.left = bodyWidth - panelWidth;
        }

        if ((this.top + panelHeight) > bodyHeight) {
            this.top = bodyHeight - panelHeight;
        }


        this.panelDiv.style.left = this.left + 'px';
        this.panelDiv.style.top = this.top + 'px';
    }

    this.panelDiv.style.zIndex = getZIndex();
    addClass(this.panelDiv, 'is-visible');

    var callback = function(e) {
        if (e !== evt && e.target !== this.input && !oThis.clickPanel(e.target) && oThis._inputFocus != true) {
            off(document, 'click', callback);
            // document.removeEventListener('click', callback);
            this.hide();
        }
    }.bind(this);
    on(document, 'click', callback);
    // document.addEventListener('click', callback);
};

Time.fn.clickPanel = function(dom) {
    while (dom) {
        if (dom == this.panelDiv) {
            return true
        } else {
            dom = dom.parentNode;
        }
    }
    return false;
};

Time.fn.hide = function() {
    removeClass(this.panelDiv, 'is-visible');
    this.panelDiv.style.zIndex = -1;
};

if (u.compMgr) {
    u.compMgr.regComp({
        comp: Time,
        compAsString: 'u.Time',
        css: 'u-time'
    });
    if (env.isIE8) {
        u.compMgr.regComp({
            comp: Time,
            compAsString: 'u.ClockPicker',
            css: 'u-clockpicker'
        });
    }
}

/**
 * Module : Kero time adapter
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-08-10 12:40:46
 */


var TimeAdapter = u.BaseAdapter.extend({
    init: function(options) {
        var self = this;
        this.validType = 'time';

        this.maskerMeta = core.getMaskerMeta('time') || {};
        this.maskerMeta.format = this.dataModel.getMeta(this.field, "format") || this.maskerMeta.format;

        if (this.options.type == 'u-clockpicker' && !env.isIE8)
            this.comp = new ClockPicker(this.element);
        else
            this.comp = new Time(this.element);
        var dataType = this.dataModel.getMeta(this.field, 'type');
        this.dataType = dataType || 'string';


        this.comp.on('valueChange', function(event) {
            var setValueFlag = false;
            self.slice = true;
            if (event.value == '') {
                self.dataModel.setValue(self.field, '');
            } else {
                var _date = self.dataModel.getValue(self.field);
                if (self.dataType === 'datetime') {
                    var valueArr = event.value.split(':');
                    //如果_date为空时赋值就无法赋值，所以为空时设置了个默认值
                    if (!_date) {
                        _date = "1970-01-01 00:00:00";
                        setValueFlag = true;
                    }
                    _date = date.getDateObj(_date);
                    if (!_date) {
                        self.dataModel.setValue(self.field, '');
                    } else {
                        if (event.value == (_date.getHours() < 10 ? '0' + _date.getHours() : _date.getHours()) + ':' + (_date.getMinutes() < 10 ? '0' + _date.getMinutes() : _date.getMinutes()) + ':' + (_date.getSeconds() < 10 ? '0' + _date.getSeconds() : _date.getSeconds())) {
                            if (!setValueFlag) {
                                self.slice = false;
                                return;
                            }
                        }
                        _date.setHours(valueArr[0]);
                        _date.setMinutes(valueArr[1]);
                        _date.setSeconds(valueArr[2]);
                        self.dataModel.setValue(self.field, u.date.format(_date, 'YYYY-MM-DD HH:mm:ss'));
                    }
                } else {
                    if (event.value == _date)
                        return;
                    self.dataModel.setValue(self.field, event.value);
                }
            }

            self.slice = false;
            //self.setValue(event.value);
        });


    },
    modelValueChange: function(value) {
        if (this.slice) return;
        var compValue = '';
        if (this.dataType === 'datetime') {
            var _date = date.getDateObj(value);
            if (!_date)
                compValue = '';
            else
                compValue = (_date.getHours() < 10 ? '0' + _date.getHours() : _date.getHours()) + ':' + (_date.getMinutes() < 10 ? '0' + _date.getMinutes() : _date.getMinutes()) + ':' + (_date.getSeconds() < 10 ? '0' + _date.getSeconds() : _date.getSeconds());
        } else {
            compValue = value;
        }
        this.comp.setValue(compValue);
    },
    setEnable: function(enable) {}
});

if (u.compMgr)
    u.compMgr.addDataAdapter({
        adapter: TimeAdapter,
        name: 'u-time'
    });

if (u.compMgr)
    u.compMgr.addDataAdapter({
        adapter: TimeAdapter,
        name: 'u-clockpicker'
    });

exports.TimeAdapter = TimeAdapter;

}((this.bar = this.bar || {})));
