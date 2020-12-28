/**
 * This is a tiny UI module for displaying simple stats data.
 *
 * Not working with IEx. Use a 'Proxy' polyfill maybe?
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 *
 * @author Ikaros Kappler
 * @date   2020-12-20
 */

/**
 * Observable keys are simple types: strings, numbers or booleans.
 * Arrays or objects cannot be observed by this tool.
 */
type ObservableType = string | number | boolean;


/**
 * Each observed key is mapped to a HTML element identified by a unique ID.
 * Additionally it has an UIStatsElem, holding an evaluator function.
 */
interface KeyProps {
    id : string;
    childElem : any; // UIStats.UIStatsElem;
};


/**
 * The evaluator modifies the current values to final display values.
 */
type Evaluator = (value:ObservableType) => ObservableType;

/**
 * The default `Evaluator` function: identity (display values raw as they are).
 */
const FN_IDENTITY = ( value:ObservableType ) : ObservableType => value;

/**
 * The main class.
 * 
 * Once instantiated it will append a new HTMLDivElement node to the DOM.
 */
class UIStats {
    
    // @member {object} Keeps the props for currently observed keys.
    private keyProps : Record<string,KeyProps> = {};

    // @member {number} The currenty observed keys.
    private keyCount : number;

    // @member {object} The object to observe.
    private observee : object; 

    // @member {HTMLDivElement} The root element (absolute positioned).
    private root : HTMLDivElement;

    // @member {boolean} Indicated if the HTML element is toggled on/off.
    private toggled : boolean;

    // @member {HTMLDivElement} A header node.
    private header : HTMLDivElement;

    // @member {Proxy} Used to observe single keys (not supported by IE).
    public proxy : typeof Proxy;
    

    // @param {UIStats} liveStats
    // @param {string} keyName
    // @param {function} evaluateFn - A function with one param: value => newValue
    static UIStatsChild = class {

	// The containing UIStats instance.
	uiStats : UIStats;
	// The key name this child is associated with.
	keyName : string;
	// Identity function is the default behavior.
	evaluateFn : Evaluator;

	// Creates a new child.
	constructor( uiStats : UIStats, keyName : string, evaluateFn : Evaluator ) {
	    this.uiStats = uiStats;
	    this.keyName = keyName;
	    this.evaluateFn = evaluateFn;
	};

	__installAsNewParent( evaluateFn : Evaluator ) {
	    var newChildElem = new UIStats.UIStatsChild( this.uiStats, this.keyName, evaluateFn );
	    this.uiStats.__updateChildElem( this.keyName, newChildElem );
	    return newChildElem;
	};

	precision = function( precision:number ) {
	    var _self = this;
	    return this.__installAsNewParent( function( value ) {
		return Number( _self.evaluateFn(value) ).toFixed(precision);
	    } );
	};

	suffix = function( suffixText:string ) {
	    var _self = this;
	    return this.__installAsNewParent( function( value ) {
		return [_self.evaluateFn(value), suffixText].join('');
	    } );
	};

	prefix = function( prefixText:string ) {
	    var _self = this;
	    return this.__installAsNewParent( function( value ) {
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
	this.header.addEventListener('click', () => { _self.__toggleVisibility(); } );
	this.root.appendChild( this.header );

	this.__applyBaseLayout();

	var proxyHandler = {
	    get: function(target, prop, receiver) {
	        // if( prop === 'message' )
	        //   ...;
		// console.log('get', prop, target, receiver );
		return target[prop]; // _self.observee[prop];
	    }, 
	    set: function(obj, propName, value) {
		// Apply the setter itself
		_self.observee[propName] = value;
		// Check further handling
		var kProps = _self.keyProps[propName];
		if( typeof kProps !== "undefined" ) {
		    const refinedValue : ObservableType = kProps.childElem.evaluateFn( value );
		    _self.__applyKeyValue( propName, kProps, refinedValue );
		}
		return true; // Indicates change was successful
	    }
	};
	this.proxy = new Proxy( observee, proxyHandler );
    };

    // @private
    __applyKeyValue( keyName:string, kProps, value ) {
	var node = document.getElementById(kProps.id);
	node.innerHTML = value;
	node.setAttribute('title', value);
    };

    // @param {string} keyName
    // @param {LiveStatsElem} newElem
    __updateChildElem( keyName, newElem ) {
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
	const node : HTMLDivElement = document.createElement('div');
	const label : HTMLDivElement = document.createElement('div');
	const content : HTMLDivElement = document.createElement('div');
	node.style.display = 'flex';
	node.style.borderBottom = '1px solid #2c2c2c';
	node.style.borderLeft = '3px solid #806787';
	
	label.style.width = '50%';
	label.style.color = '#0070ff';
	this.__applyTextLayout( label );
	label.innerHTML = keyName;
	label.setAttribute('title', keyName);
	
	content.style.width = '50%';
	content.style.color = '#cccecb';
	content.setAttribute('id', id);
	this.__applyTextLayout( content );	

	node.appendChild( label );
	node.appendChild( content );
	this.root.appendChild( node );

	// Gives the user the opportunity to tweak the output.
	// Identity function is the default behavior.
	const childElem = new UIStats.UIStatsChild( this, keyName, FN_IDENTITY );
	this.keyProps[keyName] = { id : id, childElem : childElem };
	this.keyCount++;
	
	// Initially display the current value
	this.__applyKeyValue( keyName, this.keyProps[keyName], this.observee[keyName] );

	return childElem;
    };

    // Toggles the main component on/off.
    // @private
    __toggleVisibility() {
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
    __applyTextLayout( textNode : HTMLDivElement )  {
	textNode.style.paddingLeft = '3px';
	textNode.style.overflow = 'hidden';
	textNode.style.whiteSpace = 'nowrap';
	textNode.style.textOverflow = 'ellipsis';
    };

    // @private
    __applyBaseLayout() {
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
