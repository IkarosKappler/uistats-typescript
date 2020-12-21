/**
 * Not working with IEx. Use a 'Proxy' polyfill maybe?
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 * @date 2020-12-20
 */



interface KeyProps {
    id : string;
    childElem : any; // TODO LiveStatsElem?
};

type ObservableType = string | number | boolean;

type Evaluator = (value:ObservableType) => ObservableType;

const FN_IDENTITY = ( value:ObservableType ) : ObservableType => value;

class UIStats {
    
    // @member {object}
    private keyProps : Record<string,KeyProps> = {};

    // @member {number}
    private keyCount : number;

    // @member {object}
    private observee : object; 

    private root : HTMLDivElement;

    private toggled : boolean;

    // Add header node
    private header : HTMLDivElement;

    public proxy : typeof Proxy;
    

    // @param {UIStats} liveStats
    // @param {string} keyName
    // @param {function} evaluateFn - A function with one param: value => newValue
    static UIStatsChild = class {

	uiStats : UIStats;
	keyName : string;
	// Identity function is the default behavior
	evaluateFn : Evaluator;
	
	constructor( uiStats : UIStats, keyName : string, evaluateFn : Evaluator ) {
	    this.uiStats = uiStats;
	    this.keyName = keyName;
	    // Identity function is the default behavior
	    this.evaluateFn = evaluateFn;
	};

	_installAsNewParent( evaluateFn : Evaluator ) {
	    var newChildElem = new UIStats.UIStatsChild( this.uiStats, this.keyName, evaluateFn );
	    this.uiStats._upateChildElem( this.keyName, newChildElem );
	    return newChildElem;
	};

	precision = function( precision:number ) {
	    var _self = this;
	    return this._installAsNewParent( function( value ) {
		return Number( _self.evaluateFn(value) ).toFixed(precision);
	    } );
	};

	suffix = function( suffixText:string ) {
	    var _self = this;
	    return this._installAsNewParent( function( value ) {
		return [_self.evaluateFn(value), suffixText].join('');
	    } );
	};

	prefix = function( prefixText:string ) {
	    var _self = this;
	    return this._installAsNewParent( function( value ) {
		return [prefixText, _self.evaluateFn(value)].join('');
	    } );
	}
    }; // END nested class

    // @name LiveStats
    // @constructor
    // @param {object} observee
    // @param {Object} keyToObserve (string->Object with props)
    constructor( observee:object ) { 

	// @member {object}
	this.keyProps = {};

	// @member {number}
	this.keyCount = 0;

	// @member {object}
	this.observee = observee; 

	this.root = document.createElement('div');	
	document.body.appendChild( this.root );

	var _self = this;
	
	this.toggled = false;

	// Add header node
	this.header = document.createElement('div');
	this.header.addEventListener('click', () => { _self.toggleVisibility(); } );
	this.root.appendChild( this.header );

	this._applyBaseLayout();

	var proxyHandler = {
	    // get: function(target, prop, receiver) {
	    //    if( prop === 'message' )
	    //       return ...;
	    // }, 
	    set: function(obj, propName, value) {
		var kProps = _self.keyProps[propName];
		if( typeof kProps !== "undefined" ) {
		    var refinedValue = kProps.childElem.evaluateFn( value );
		    _self._applyKeyValue( propName, kProps, refinedValue );
		}
		return true; // Indicates change was successful
		
	    }
	};
	this.proxy = new Proxy( observee, proxyHandler );
    };

    // @private
    _applyKeyValue( keyName:string, kProps, value ) {
	var node = document.getElementById(kProps.id);
	node.innerHTML = value;
	node.setAttribute('title', value);
    };

    // @param {string} keyName
    // @param {LiveStatsElem} newElem
    _upateChildElem( keyName, newElem ) {
	var kProps = this.keyProps[keyName];
	if( typeof kProps !== "undefined" ) {
	    kProps.childElem = newElem;
	}
    };

    add( keyName:string ) { 
	var id = keyName + "_" + Math.floor( Math.random() * 65636 );
	
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
	this._applyTextLayout( label );
	label.innerHTML = keyName;
	label.setAttribute('title', keyName);
	
	content.style.width = '50%';
	content.style.color = '#cccecb';
	content.setAttribute('id', id);
	this._applyTextLayout( content );	

	node.appendChild( label );
	node.appendChild( content );
	this.root.appendChild( node );

	// Gives the user the opportunity to tweak the output
	var childElem = new UIStats.UIStatsChild( this, keyName, FN_IDENTITY );
	// this.keyProps[keyName] = Object.assign( { id : id, childElem : childElem }, keyProps );
	this.keyProps[keyName] = { id : id, childElem : childElem };
	this.keyCount++;
	
	// Initially display the current value
	this._applyKeyValue( keyName, this.keyProps[keyName], this.observee[keyName] );

	return childElem;
    };

    toggleVisibility() {
	this.toggled = !this.toggled;
	if( this.toggled ) {
	    this.root.style.left = '-200px';
	    this.header.style.transform = 'rotate(180deg)';
	} else {
	    this.root.style.left = '0px';
	    this.header.style.transform = 'rotate(0deg)';
	}
    };

    // Avoid text from overflowing or breaking the bounds.
    // @private
    _applyTextLayout( textNode : HTMLDivElement )  {
	textNode.style.paddingLeft = '3px';
	textNode.style.overflow = 'hidden';
	textNode.style.whiteSpace = 'nowrap';
	textNode.style.textOverflow = 'ellipsis';
    };

    // @private
    _applyBaseLayout() {
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
};

export default UIStats;