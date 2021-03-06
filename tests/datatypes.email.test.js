'use strict';

const assert = require( 'assert' );
const { datatypes, model } = require( '../index.js' );

module.exports = async ( plaintest ) => {
	const group = plaintest.group( 'datatypes.email' );

	group.test( 'should have expected implementation', () => {
		assert.strictEqual( typeof datatypes.email, 'function' );

		const obj = datatypes.email();

		assert.strictEqual( obj?.datatype, 'email' );
		assert.deepStrictEqual( obj?.options, {
			nullable: true,
			unique: false,
			initial: undefined,
			validate: undefined,
			length: {
				max: undefined,
				min: 5
			},
			example: 'you@domain.com'
		} );

		assert.strictEqual( typeof obj?.initial, 'function' );
		assert.strictEqual( typeof obj?.validate, 'function' );
	} );

	group.test( 'should handle null values', () => {
		const nullable = model( {
			name: 'validation',
			schema: {
				val: datatypes.email( {
					nullable: true
				} )
			}
		} );

		const nullable_good = nullable.create( {
			val: null
		} );

		const nullable_bad = nullable.create( {
			val: 'foofoo'
		} );

		assert.deepStrictEqual( nullable.validate( nullable_good ), [] );
		assert.deepStrictEqual( nullable.validate( nullable_bad ), [ {
			field: 'val',
			error: 'invalid value format'
		} ] );

		const non_nullable = model( {
			name: 'validation',
			schema: {
				val: datatypes.email( {
					nullable: false
				} )
			}
		} );

		const non_nullable_good = non_nullable.create( {
			val: 'foo@domain.com'
		} );

		const non_nullable_bad = non_nullable.create( {
			val: null
		} );

		assert.deepStrictEqual( non_nullable.validate( non_nullable_good ), [] );
		assert.deepStrictEqual( non_nullable.validate( non_nullable_bad ), [ {
			field: 'val',
			error: 'null value not allowed'
		} ] );
	} );	

	group.test( 'should allow custom validation', () => {
		const Validation = model( {
			name: 'validation',
			schema: {
				val: datatypes.email( {
					validate: ( value ) => {
						if ( value !== 'you@domain.com' ) {
							return 'not you@domain.com';
						}
					}
				} )
			}
		} );

		const good = Validation.create( {
			val: 'you@domain.com'
		} );

		const bad = Validation.create( {
			val: 'you@otherdomain.com'
		} );

		assert.deepStrictEqual( Validation.validate( good ), [] );
		assert.deepStrictEqual( Validation.validate( bad ), [ {
			field: 'val',
			error: 'not you@domain.com'
		} ] );
	} );
};