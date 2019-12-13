window[window.dataLayerName] = window[window.dataLayerName] || [];

jQuery.event.special.touchstart = {
  setup: function( _, ns, handle ){
    if ( ns.includes("noPreventDefault") ) {
      this.addEventListener("touchstart", handle, { passive: false });
    } else {
      this.addEventListener("touchstart", handle, { passive: true });
    }
  }
};

//global jQuery
window.btoa = window.btoa || function () {
  var object = typeof exports != "undefined" ? exports : this; // #8: web workers
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = "InvalidCharacterError";

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
    object.btoa = function (input) {
      var str = String(input);
      for (
        // initialize result and counter
        var block, charCode, idx = 0, map = chars, output = "";
        // if the next str index does not exist:
        //   change the mapping table to "="
        //   check if d has no fractional digits
        str.charAt(idx | 0) || (map = "=", idx % 1);
        // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
        output += map.charAt(63 & block >> 8 - idx % 1 * 8)
        ) {
        charCode = str.charCodeAt(idx += 3/4);
        if (charCode > 0xFF) {
          throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
      }
      return output;
    });
};

(function($) {
  var loggedInUser;
  $.fn.serializeObject = function() {
    var myObject = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (myObject[this.name] !== undefined) {
        if (!myObject[this.name].push) {
          myObject[this.name] = [myObject[this.name]];
        }
        myObject[this.name].push(this.value || "");
      } else {
        myObject[this.name] = this.value || "";
      }
    });
    return myObject;
  };

  // Init
  function init() {
    // Determine Logged In User
    loggedInUser = store.get("loggedInUser");
    if (typeof loggedInUser !== "undefined") {
      login(loggedInUser);
    } else {
      $("#loginForm").show();
    }
  }

  // Login
  function login(loggedInUser) {
    var $loginForm,
        eventData;

    $loginForm = $("#loginForm");
    $loginForm.after("<span id=\"loggedInUser\" class=\"navbar-text navbar-right\">Logged in as: <strong>" + loggedInUser + "</strong></span>");
    $loginForm.hide();
    $("#loggedInUser").append(" <a id=\"logoutLink\" href=\"javascript:void(0);\">Logout</a>");
    $("#logoutLink").on("click", logout);
  }

  // Logout
  function logout() {
    var eventData;

    store.remove("loggedInUser");
    $("#loggedInUser").remove();

    eventData = {event: "logout"};

    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);

    setTimeout(function() {
      location.reload();
    }, 500);
  }

  init();

  // Demo itself features
  $("#loginForm").on("submit", function(event) {
    var eventData;

    event.preventDefault();

    eventData = $(this).serializeObject();
    store.set("loggedInUser", eventData.username);
    login(eventData.username);
    delete eventData.password;
    eventData.userId = getUserId(eventData.username);
    delete eventData.username;
    eventData.formId = "loginForm";
    eventData.event = "login";

    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);
    this.reset();
  });

  $("#leadForm").on("submit", function(event) {
    var eventData;

    event.preventDefault();

    eventData = $(this).serializeObject();
    eventData.formId = "leadForm";
    eventData.event = "leadSent";

    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);
    this.reset();
  });

  $("#contactForm").on("submit", function(event) {
    var eventData;

    event.preventDefault();

    eventData = $(this).serializeObject();
    eventData.formId = "contactForm";
    eventData.event = "contactSent";

    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);
    this.reset();
  });

  $(".download").on("click", function(event) {
    var $target,
      linkHref,
      fileType,
      eventData;

    event.preventDefault();

    $target = $(event.target);
    linkHref = $target.attr("href");
    fileType = linkHref.split(".").pop().toUpperCase();

    eventData = {event: "fileDownload", fileName: linkHref, fileType: fileType}

    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);

    event.preventDefault();

    $target = $(event.target);
    linkHref = $target.attr("href");
    fileType = linkHref.split(".").pop().toUpperCase();

    setTimeout(function() {
      window.location = linkHref;
    }, 500);
  });

  var $dateFields;
  $dateFields = $(".date");

  if ($dateFields.length > 0) {
    $dateFields.datetimepicker({
      locale: "cs",
      format: "DD.MM.YYYY"
    });
  }

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.getElementsByClassName("needs-validation");
  // Loop over them and prevent submission
  var validation = Array.prototype.filter.call(forms, function(form) {
    form.addEventListener("submit", function(event) {
      var currentStep,
          $currentStepTabLink,
          nextStep,
          $nextStepTabLink,
          invalidFields,
          invalidFieldsMessage,
          eventData;
      
      event.preventDefault();
      event.stopPropagation();

      if (form.checkValidity() === true) {
        currentStep = parseInt($(form).find(".form-step").val());
        $currentStepTabLink = $("#step" + currentStep + "tab a");
        nextStep = currentStep + 1;
        $nextStepTabLink = $("#step" + nextStep + "tab a");
        $nextStepTabLink.removeClass("disabled");
        $currentStepTabLink.addClass("disabled");
        $nextStepTabLink.tab("show");

        eventData = {
          event: "wizard" + ((nextStep === 3) ? "Success" : "Step" + nextStep) + "Loaded"
        };

        console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
        window[window.dataLayerName].push(eventData);  
      } else {
        invalidFields = $(event.target).find(":invalid");
  
        invalidFieldsMessage = invalidFields.toArray().filter(function(field) {
          return field.id !== "";
        }).map(function (field) {
          var errorMessage,
              eventData;

          if (field.validity.valueMissing) {
            errorMessage = "empty";
          }
          if (field.validity.typeMismatch) {
            errorMessage = "invalid";
          }
          if (field.validity.patternMismatch) {
            errorMessage = "invalid";
          }
          if (field.validity.tooShort) {
            errorMessage = "short";
          }
          if (field.validity.tooLong) {
            errorMessage = "long";
          }
          return field.id + ":" + errorMessage;
        });
        eventData = {
          event: "failedValidation",
          invalidFields: invalidFieldsMessage
        };

        console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
        window[window.dataLayerName].push(eventData);  
      }
      form.classList.add("was-validated");
    }, false);
  });

  $("#wizardStep1 :input").change(function(event) {
    var $target,
        eventData;

    $target = $(event.target);
    eventData = {
      event: "inputChange",
      fieldName: $("label[for=" + $target.attr("id") + "]").text(),
      fieldValue: $target.val()
    };

    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);
  });

  $("#interactions a[data-toggle=\"tab\"]").on("shown.bs.tab", function (e) {
    var eventData;

    eventData = {
      event: "contentShown",
      contentTitle: $(e.target).text().trim()
    };
    
    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);
  });

  $(".collapse").on("shown.bs.collapse", function (e) {
    var eventData;

    eventData = {
      event: "contentShown",
      contentTitle: $($(e.target).data("title")).text().trim()
    };
    
    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);
  });

})(jQuery);

/*
 * Global Variable for available Youtube players
 */
var youtubePlayers = [],
  youtubePlayerIframes = [];

/*
 * Init Youtube Iframe API
 */
(function() {
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

function onYouTubeIframeAPIReady() {
  var player1 = new YT.Player("player-1", {
    height: "304",
    width: "540",
    videoId: "wofkHuZm4Kg",
    playerVars: {
      origin: document.location.protocol + "//" + document.location.hostname,
    },
    events: {
      "onStateChange": onPlayerStateChange
    }
  });
  var player2 = new YT.Player("player-2", {
    height: "304",
    width: "540",
    videoId: "AMBWY7o9RtE",
    playerVars: {
      origin: document.location.protocol + "//" + document.location.hostname,
    },
    events: {
      "onStateChange": onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  var videoData,
      eventData;
  
  videoData = event.target.getVideoData();
  switch (event.data) {
  case YT.PlayerState.PLAYING:
    eventData = {event: "videoPlay", video: {id: videoData.video_id, title: videoData.title}};
    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);
    break;
  case YT.PlayerState.PAUSED:
    eventData = {event: "videoPause", video: {id: videoData.video_id, title: videoData.title, timePlayed: event.target.getCurrentTime()}};
    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);
    break;
  case YT.PlayerState.ENDED:
    eventData = {event: "videoEnd", video: {id: videoData.video_id, title: videoData.title, timePlayed: event.target.getCurrentTime()}};
    console.log("Pushing to Data Layer: " + JSON.stringify(eventData, null, 2));
    window[window.dataLayerName].push(eventData);
    break;
  }
}