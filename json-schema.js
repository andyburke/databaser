'use strict';

const traverse = require( 'traverse' );

// String values MUST be one of the six primitive types ("null", "boolean", "object", "array", "number", or "string"), or "integer" which matches any number with a zero fractional part. 

const DATATYPE_MAP = {
	boolean: () => ( {
		type: 'boolean'
	} ),
	email: ( field ) => ( {
		type: 'string',
		minLength: field.options.length.min
	} ),
	enum: ( field ) => ( {
		type: 'string',
		enum: field.options.values
	} ),
	integer: () => ( {
		type: 'integer'
	} ),
	ISODate: () => ( {
		type: 'string'
	} ),
	JSON: () => ( {
		type: 'string'
	} ),
	number: () => ( {
		type: 'number'
	} ),
	phone: ( field ) => ( {
		type: 'string',
		maxLength: field.options.length.max
	} ),
	string: ( field ) => {
		const schema = {
			type: 'string'
		};

		if ( typeof field.options.length.min === 'number' ) {
			schema.minLength = field.options.length.min;
		}

		if ( typeof field.options.length.max === 'number' ) {
			schema.maxLength = field.options.length.max;
		}

		return schema;
	},
	UUID: () => ( {
		type: 'string',
		minLength: 36,
		maxLength: 36
	} )
};

function property_map( value ) {
	if ( Array.isArray( value ) && this.path[ this.path.length - 1 ] === 'required' ) {
		this.update( value );
		return;
	}

	if ( typeof value !== 'object' ) {
		this.update( value );
		return;
	}

	if ( value.datatype ) {
		this.update( DATATYPE_MAP[ value.datatype ]( value ), true );
		return;
	}

	if ( value !== null && value.type && value.properties ) {
		this.update( value );
		return;
	}

	if ( value !== null && value.__processed ) {
		this.update( value );
		return;
	}

	if ( value !== null ) {

		const schema = {
			type: 'object',
			properties: Object.assign( {}, value, { __processed: true } ),
			required: Object.keys( value ).reduce( ( _required, key ) => {
				if ( typeof value[ key ] === 'object' && !!value[ key ] && value[ key ].datatype && value[ key ].options.null === false ) {
					_required.push( key );
				}
				return _required;
			}, [] )
		};

		this.update( schema );
		return;
	}

	this.update( value );
}

module.exports = ( model ) => {
	const first_pass_schema = traverse( model.options.schema ).map( property_map );
	const schema = traverse( first_pass_schema ).map( function() { 
		const name = this.path[ this.path.length - 1 ];
		if ( name === '__processed' ) {
			this.remove();
		}
	} );
	return schema;
};