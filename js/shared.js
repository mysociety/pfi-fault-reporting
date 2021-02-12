$('[data-form-action]').on('change', function() {

  var form = $(this).parents('form');

  if (!form.data('originalAction')) {
    form.data('originalAction', form.attr('action'));
  }

  form.attr('action', $(this).attr('data-form-action'));

  if ($(this).is(':checked')) {
    form.attr('action', $(this).attr('data-form-action'));
  } else {
    form.attr('action', form.data('originalAction'));
  }

});

