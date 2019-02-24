(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["options"] = factory();
	else
		root["options"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/options.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/options.js":
/*!************************!*\
  !*** ./src/options.js ***!
  \************************/
/*! exports provided: renderModeType, resizeOptions, defaultItemOptions, defaultGridOptions, defaultPlaceholderStyles */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "renderModeType", function() { return renderModeType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resizeOptions", function() { return resizeOptions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultItemOptions", function() { return defaultItemOptions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultGridOptions", function() { return defaultGridOptions; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaultPlaceholderStyles", function() { return defaultPlaceholderStyles; });
var renderModeType = {
  // flex = percentages
  flex: 'flex',
  // fixed = px
  fixed: 'fixed'
};
var resizeOptions = {
  // boxes are fixed width
  none: 'none',
  // resize x direction only
  x: 'x',
  // resize y direction 
  y: 'y',
  // resize both
  both: 'both'
};
var defaultItemOptions = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  className: 'grid-item',
  glued: false,
  // not yet supported but is partially done in the algo, do not alter
  visible: true,
  displayResize: true,
  position: {
    topPx: 0,
    leftPx: 0,
    topPct: 0,
    leftPct: 0,
    widthPx: 0,
    heightPx: 0,
    widthPct: 0,
    heightPct: 0,
    ending: 'px'
  },
  meta: {
    isDragging: false,
    isResizing: false
  }
};
var defaultPlaceholderStyles = {
  position: 'absolute',
  border: '2px dashed grey',
  zIndex: -1
};
var defaultGridOptions = {
  gridColumns: 12,
  gridRows: 12,
  width: '100%',
  height: '100%',
  className: 'curator-grid',
  // whether to render the grid items using percentages or pixel values
  renderMode: renderModeType.flex,
  // when a dragged element pushes others out of the way, they may return to their 
  // old spot if dragging continues
  stickyElements: true,
  // show the grid lines: not currently supported
  //showGrid: false,
  // can resize the grid by dragging elements
  itemsCanResizeGrid: true,
  // which directions the grid can resize in (either dragging handle or items)
  resizeGridDirections: resizeOptions.y,
  // move items using transitions
  useTransition: true,
  // specific options for transitions
  transitionDuration: 600,
  // On an individual transition completed for an element (multiple fires when multiple elements moved)
  onTransitionComplete: function onTransitionComplete(element, details, eventIfFired) {},
  // On all transitions completed for a given element
  onAllTransitionsComplete: function onAllTransitionsComplete(element, details, eventIfFired) {},
  // class name for the resize handle
  resizeClassName: 'resize-handle',
  enableCSS3: true,
  algo: null
};


/***/ })

/******/ });
});
//# sourceMappingURL=options.js.map