/**
 * Shorthand function - is a thing not undefined?
 */
var defined = function defined(thing){
    return ( typeof thing !== 'undefined' );
};

/**
 * Retrieve the given key from the state, or if no key is provided,
 * retrieve the entire state as an object.
 */
var getState = function( key ) {
    var state = JSON.parse( window.localStorage.getItem('state') || '{}' );
    if ( defined(key) ) {
        return state[ key ];
    } else {
        return state;
    }
};

/**
 * Update the state, setting the given key to the given value.
 * If the value is not provided, or is undefined, then the key
 * will be removed from the state.
 */
var updateState = function( key, value ) {
    var state = getState();
    if ( ! defined(value) ) {
        delete state[ key ];
    } else {
        state[ key ] = value;
    }
    window.localStorage.setItem( 'state', JSON.stringify(state) );
    refreshStatefulElements();
};

/**
 * Clear the entire state.
 */
var clearState = function() {
    window.localStorage.setItem( 'state', '{}' );
    refreshStatefulElements();
};

/**
 * Apply the current state to any stateful elements on the page.
 */
var refreshStatefulElements = function() {
    $('.js-stateful').each(function(){
        var state = getState();
        var $el = $(this);
        var key = $el.attr('name') || $el.attr('data-stateful-key');

        if ( $el.is('input[type="radio"], input[type="checkbox"]') ) {
            var bool = defined(state[key]) && state[key] == $el.val();
            $el.prop('checked', bool);

        } else if ( $el.is('select[multiple]') ) {
            $el.children('option').each(function(){
                var bool = defined(state[key]) && state[key].indexOf($(this).attr('value') > -1);
                $(this).prop('selected', bool);
            });

        } else if ( $el.is('input, textarea, select') ) {
            $el.val( state[key] ? state[key] : null );

        } else {
            $el.text( state[key] ? state[key] : '' );

        }

        // We have changed the contents of the element, so we should be nice
        // citizens and trigger a `change` event, in case any other `change`
        // listeners have been attached to this element.
        // It would be wasteful to trigger *our own* `change` listener,
        // though, since we know the value hasn’t really changed.
        // So we tell our `change` listener to ignore the event by passing
        // a custom argument of "ignore", which it knows to look out for.
        $el.trigger('change', ['ignore']);

    });

    $('[data-stateful-showif]').each(function(){
        var state = getState();
        var $el = $(this);
        var key = $el.attr('name') || $el.attr('data-stateful-key');
        var bool = defined(state[key]) && state[key] === $el.attr('data-stateful-showif');
        $el.toggle(bool);
    });

    $('[data-stateful-hideif]').each(function(){
        var state = getState();
        var $el = $(this);
        var key = $el.attr('name') || $el.attr('data-stateful-key');
        var bool = defined(state[key]) && state[key] === $el.attr('data-stateful-hideif');
        $el.toggle(!bool);
    });
};

/**
 * Set a change handler on any stateful elements with a `name` attribute,
 * to update and save the state, when the element value is changed.
 */
var setUpStatefulElements = function() {
    $('.js-stateful[name]').on('change', function(e, customArgument){
        // If customArgument === 'ignore' then this event has been generated
        // by our own $('.js-stateful').each() callback, and we know the
        // element’s contents will be fresh out of the store, so we don’t need
        // to waste time saving them again.
        if ( customArgument === 'ignore' ) {
            return;
        }

        var $el = $(this);
        var key = $el.attr('name');

        if ( $el.is('input[type="radio"], input[type="checkbox"]') ) {
            if ( $el.prop('checked') ) {
                updateState( key, $el.val() );
            } else {
                updateState( key );
            }

        } else if ( $el.is('input, textarea, select') ) {
            var val = $el.val();
            if ( val ) {
                updateState( key, val);
            } else {
                updateState( key );
            }
        }
    });
};

$(function(){
    refreshStatefulElements();
    setUpStatefulElements();
});

/* example usage:

<input type="email" name="email" class="js-stateful">

<input type="checkbox" name="remember-me" class="js-stateful">

<p>Your email is: <strong class="js-stateful" data-stateful-key="email">not set!</strong></p>

*/
