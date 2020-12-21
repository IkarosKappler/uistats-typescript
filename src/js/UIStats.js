"use strict";
/**
 * Not working with IEx. Use a 'Proxy' polyfill maybe?
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 * @date 2020-12-20
 */
Object.defineProperty(exports, "__esModule", { value: true });
;
var FN_IDENTITY = function (value) { return value; };
var UIStats = /** @class */ (function () {
    // @name LiveStats
    // @constructor
    // @param {object} observee
    // @param {Object} keyToObserve (string->Object with props)
    function UIStats(observee) {
        // @member {object}
        this.keyProps = {};
        // @member {object}
        this.keyProps = {};
        // @member {number}
        this.keyCount = 0;
        // @member {object}
        this.observee = observee;
        this.root = document.createElement('div');
        document.body.appendChild(this.root);
        var _self = this;
        this.toggled = false;
        // Add header node
        this.header = document.createElement('div');
        this.header.addEventListener('click', function () { _self.toggleVisibility(); });
        this.root.appendChild(this.header);
        this._applyBaseLayout();
        var proxyHandler = {
            // get: function(target, prop, receiver) {
            //    if( prop === 'message' )
            //       return ...;
            // }, 
            set: function (obj, propName, value) {
                var kProps = _self.keyProps[propName];
                if (typeof kProps !== "undefined") {
                    var refinedValue = kProps.childElem.evaluateFn(value);
                    _self._applyKeyValue(propName, kProps, refinedValue);
                }
                return true; // Indicates change was successful
            }
        };
        this.proxy = new Proxy(observee, proxyHandler);
    }
    ;
    // @private
    UIStats.prototype._applyKeyValue = function (keyName, kProps, value) {
        var node = document.getElementById(kProps.id);
        node.innerHTML = value;
        node.setAttribute('title', value);
    };
    ;
    // @param {string} keyName
    // @param {LiveStatsElem} newElem
    UIStats.prototype._upateChildElem = function (keyName, newElem) {
        var kProps = this.keyProps[keyName];
        if (typeof kProps !== "undefined") {
            kProps.childElem = newElem;
        }
    };
    ;
    UIStats.prototype.add = function (keyName) {
        var id = keyName + "_" + Math.floor(Math.random() * 65636);
        // └-Root
        //   └-Node
        //     ├-Label
        //     └-Content (with unique ID)
        var node = document.createElement('div');
        var label = document.createElement('div');
        var content = document.createElement('div');
        node.style.display = 'flex';
        label.style.width = '50%';
        label.style.color = '#0070ff';
        this._applyTextLayout(label);
        label.innerHTML = keyName;
        label.setAttribute('title', keyName);
        content.style.width = '50%';
        content.style.color = '#cccecb';
        content.setAttribute('id', id);
        this._applyTextLayout(content);
        node.appendChild(label);
        node.appendChild(content);
        this.root.appendChild(node);
        // Gives the user the opportunity to tweak the output
        var childElem = new UIStats.UIStatsChild(this, keyName, FN_IDENTITY);
        // this.keyProps[keyName] = Object.assign( { id : id, childElem : childElem }, keyProps );
        this.keyProps[keyName] = { id: id, childElem: childElem };
        this.keyCount++;
        // Initially display the current value
        this._applyKeyValue(keyName, this.keyProps[keyName], this.observee[keyName]);
        return childElem;
    };
    ;
    UIStats.prototype.toggleVisibility = function () {
        this.toggled = !this.toggled;
        if (this.toggled) {
            this.root.style.left = '-200px';
            this.header.style.transform = 'rotate(180deg)';
        }
        else {
            this.root.style.left = '0px';
            this.header.style.transform = 'rotate(0deg)';
        }
    };
    ;
    // Avoid text from overflowing or breaking the bounds.
    // @private
    UIStats.prototype._applyTextLayout = function (textNode) {
        textNode.style.paddingLeft = '3px';
        textNode.style.overflow = 'hidden';
        textNode.style.whiteSpace = 'nowrap';
        textNode.style.textOverflow = 'ellipsis';
    };
    ;
    // @private
    UIStats.prototype._applyBaseLayout = function () {
        this.root.style.position = 'absolute';
        this.root.style.left = '0';
        this.root.style.top = '0';
        this.root.style.width = '200px';
        this.root.style.background = '#1a1a1a'; // Like in dat.gui
        this.root.style.fontFamily = 'Calibri, Arial, Helvetica';
        this.root.style.fontSize = '12px';
        this.root.style.transition = 'left 1s';
        this.header.style.position = 'absolute';
        this.header.style.display = 'flex';
        this.header.style.justifyContent = 'center';
        this.header.style.alignItems = 'center';
        this.header.style.top = '0';
        this.header.style.left = '100%';
        this.header.style.width = '12px';
        this.header.style.height = '12px';
        this.header.style.borderRadius = '6px';
        this.header.style.background = 'rgba(255,255,255,0.5)';
        this.header.style.color = 'black';
        this.header.style.fontSize = '6px';
        this.header.style.cursor = 'pointer';
        this.header.innerHTML = '&#9664;';
    };
    ;
    // @param {UIStats} liveStats
    // @param {string} keyName
    // @param {function} evaluateFn - A function with one param: value => newValue
    UIStats.UIStatsChild = /** @class */ (function () {
        function class_1(uiStats, keyName, evaluateFn) {
            this.precision = function (precision) {
                var _self = this;
                return this._installAsNewParent(function (value) {
                    return Number(_self.evaluateFn(value)).toFixed(precision);
                });
            };
            this.suffix = function (suffixText) {
                var _self = this;
                return this._installAsNewParent(function (value) {
                    return [_self.evaluateFn(value), suffixText].join('');
                });
            };
            this.prefix = function (prefixText) {
                var _self = this;
                return this._installAsNewParent(function (value) {
                    return [prefixText, _self.evaluateFn(value)].join('');
                });
            };
            this.uiStats = uiStats;
            this.keyName = keyName;
            // Identity function is the default behavior
            this.evaluateFn = evaluateFn;
        }
        ;
        class_1.prototype._installAsNewParent = function (evaluateFn) {
            var newChildElem = new UIStats.UIStatsChild(this.uiStats, this.keyName, evaluateFn);
            this.uiStats._upateChildElem(this.keyName, newChildElem);
            return newChildElem;
        };
        ;
        return class_1;
    }()); // END nested class
    return UIStats;
}());
;
exports.default = UIStats;
//# sourceMappingURL=UIStats.js.map