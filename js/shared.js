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

$(function() {
    var remembered = JSON.parse(localStorage.getItem('remembered') || '{}');
    var current = location.pathname;

    // Joined 'remember' checkboxes
    var chain = {
        '/report-a-fault/location-site/': ['/report-a-fault/location-building/'],
        '/report-a-fault/location-building/': ['/report-a-fault/location-place/'],
        '/report-a-fault/location-place/': ['/report-a-fault/location-dept/', '/report-a-fault/location-common/'],
        '/report-a-fault/location-dept/': ['/report-a-fault/location-restricted/'],
        '/report-a-fault/location-common/': ['/report-a-fault/location-restricted/'],
        '/report-a-fault/location-id/': ['/report-a-fault/location-restricted/'],
    };

    // Delete subsequent remembered data if we've gone to a previous page in the hierarchy
    var del = [current];
    while (del.length) {
        var p = del.shift();
        delete remembered[p];
        del.push.apply(del, chain[p]);
    }

    localStorage.setItem('remembered', JSON.stringify(remembered));

    // Construct a reverse of the chain, to hide the remember checkbox if previous step wasn't ticked
    var lastNotRemembered = {};
    for (u in chain) {
        chain[u].forEach(function(n) {
            lastNotRemembered[n] = (typeof lastNotRemembered[n] === 'undefined') ? 1 : lastNotRemembered[n];
            if (remembered[u]) {
                lastNotRemembered[n] = 0;
            }
        });
    }
    if (lastNotRemembered[current]) {
        $('#remember').parents('.nhsuk-form-group').hide();
    }
});

$('form').on('submit', function() {
    var $form = $(this);
    var next = $form.attr('action');
    var remembered = JSON.parse(localStorage.getItem('remembered') || '{}');
    var box = document.getElementById('remember');
    if (box) {
        var current = location.pathname;
        if (box.checked) {
            remembered[current] = {
                'answers': $form.serializeArray(),
                'next': next,
            };
        } else {
            delete remembered[current];
        }
        localStorage.setItem('remembered', JSON.stringify(remembered));
    }
    var action = skipPage(next, remembered);
    if (action) {
        $form.attr('action', action);
    }
});

// Initial start might cause a skip too
$('#start-button').on('click', function(e) {
    var remembered = JSON.parse(localStorage.getItem('remembered') || '{}');
    var action = skipPage('/report-a-fault/location-id/', remembered);
    if (action) {
        updateState('id-known', 'yes');
        e.preventDefault();
        location.href = action;
        return;
    }
    action = skipPage('/report-a-fault/location-site/', remembered);
    if (action) {
        updateState('id-known', 'no');
        e.preventDefault();
        location.href = action;
        return;
    }
});

function skipPage(page, remembered) {
    var newPage;
    while (remembered[page]) {
        remembered[page]['answers'].forEach(function(a) {
            updateState(a.name, a.value);
        });
        page = remembered[page]['next'];
        newPage = page;
    }
    return newPage;
}
