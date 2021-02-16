$('[data-form-action]').on('change', function() {
  
  var form = $(this).parents('form');
  var checked = $('input[data-form-action]:checked');

  if (!form.data('originalAction')) {
    form.data('originalAction', form.attr('action'));
  }

  if (checked.length) {
    form.attr('action', checked.attr('data-form-action'));
  } else {
    form.attr('action', form.data('originalAction'));
  }

});