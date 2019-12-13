/*global $*/
var eventData = eventData || {};
eventData.errors = eventData.errors || [];

$('#datepicker').datetimepicker({
  locale: 'cs',
  format: 'L'
}).on('dp.change', function() {
  $('#datepicker').find('input').change();
});

$('#form').bootstrapValidator({
  feedbackIcons: {
    valid: 'glyphicon glyphicon-ok',
    invalid: 'glyphicon glyphicon-remove',
    validating: 'glyphicon glyphicon-refresh'
  },
  live: 'disabled', // only validate submitted form
  fields: {
    // Validations configuration
    text: {
      validators: {
        notEmpty: {
          message: 'The text is required and cannot be empty'
        },
        stringLength: {
          min: 6,
          max: 30,
          message: 'The text must be more than 6 and less than 30 characters long'
        },
        regexp: {
          regexp: /^[a-zA-Z0-9_]+$/,
          message: 'The text can only consist of alphabetical, number and underscore'
        }
      }
    },
    email: {
      validators: {
        notEmpty: {
          message: 'The email is required and cannot be empty'
        },
        emailAddress: {
          message: 'The input is not a valid email address'
        }
      }
    },
    telephone: {
      validators: {
        notEmpty: {
          message: 'The phone number is required and cannot be empty'
        },
        // Regexp for Czech Republic
        regexp: {
          regexp: /^(\+420|00420)?[0-9]{9}$/,
          message: 'The input is not a valid phone number'
        }
      }
    },
    contact: {
      validators: {
        notEmpty: {
          message: 'The email is required and cannot be empty'
        }
      }
    },
    date: {
      validators: {
        date: {
          format: 'DD.MM.YYYY',
          separator: '.',
          message: 'The value is not a valid date'
        }
      }
    },
    accountNumber: {
      validators: {
//          digits: {
//            message: 'The value is not a valid number'
//          },
//          stringLength: {
//            min: 2,
//            max: 10,
//            message: 'Account number has to be 2-10 digits long'
//          },
        callback: {
          message: 'Invalid account number',
          callback: function(value) {
            if ((value == "") || (value == 0)) {
              return false;
            } else {
              var n = value.length;
              var weights = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
              var sum = 0;
              for (var i = n - 1; i >= 0; i--) {
                sum = sum + parseInt(value.charAt(i)) * weights[10 - n + i];
              }
              return (sum % 11) == 0;
            }
          }
        }
      }
    },
    'checkboxes[]': {
      validators: {
        choice: {
          min: 2,
          max: 3,
          message: 'Choose 2-3 items'
        }
      }
    },
    minimum: {
      validators: {
        numeric: {
          separator: ',',
          message: 'The value is not a valid number'
        },
        greaterThan: {
          inclusive: 'true',
          value: 0,
          message: 'The number must be greter than 0'
        },
        lessThan: {
          inclusive: 'true',
          value: 'maximum',
          message: 'The number must be lesser than maximum'
        }
      }
    },
    maximum: {
      validators: {
        numeric: {
          separator: ',',
          message: 'The value is not a valid number'
        },
        greaterThan: {
          inclusive: 'true',
          value: 'minimum',
          message: 'The number must be greter than minimum'
        }
      }
    },
    number: {
      validators: {
        numeric: {
          separator: ',',
          message: 'The value is not a valid number'
        },
        between: {
          min: 'minimum',
          max: 'maximum',
          message: 'The number must be between minimum and maximum'
        }
      }
    }
  }
})
  .on('error.validator.bv', function(e, data) {
    var value;
    switch (data.field) {
    case 'checkboxes[]':
      var fields = document.getElementsByName('checkboxes[]'),
        values = [];
      for (var i = 0; i < fields.length; ++i) {
        if (fields[i].checked) {
          values.push(fields[i].value);
        }
      }
      value = values.join(',');
      break;
    case 'cislo':
      switch (data.validator) {
      case 'between':
        value = data.element[0].value + "|" + document.getElementsByName('minCislo')[0].value + "-" + document.getElementsByName('maxCislo')[0].value;
        break;
      default:
        value = data.element[0].value;
      }
      break;
    case 'minCislo':
      switch (data.validator) {
      case 'lessThan':
        value = data.element[0].value + "<" + document.getElementsByName('maxCislo')[0].value;
        break;
      default:
        value = data.element[0].value;
      }
      break;
    case 'maxCislo':
      switch (data.validator) {
      case 'greaterThan':
        value = data.element[0].value + ">" + document.getElementsByName('minCislo')[0].value;
        break;
      default:
        value = data.element[0].value;
      }
      break;
    default:
      value = data.element[0].value;
    }
    eventData.errors.push({
      fieldName: data.field,
      errorType: data.validator,
      fieldValue: value
    });
  })
  .on('error.form.bv', function(event) {
    event.preventDefault();
    
    eventData.event = 'validationFailed';
    
    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);

    eventData.errors = [];
  })
  .on('success.form.bv', function(event) {
    event.preventDefault();
    
    eventData.event = 'formSent';

    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);

    eventData.errors = [];
  });