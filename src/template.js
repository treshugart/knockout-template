define(['knockout'], function(ko) {
  var oldTemplate = ko.bindingHandlers.template;
  var loading = {};

  return {
    init: function(el, val) {
      var args = arguments;
      var name = getNameFromValue(val);
      var script = document.getElementById(name);

      if (script && script.src) {
        var src = script.src;

        delete script.src;
        loading[name] = true;

        xhr(src, {}, 'get', function(r) {
          loading[name] = false;
          script.innerText = r.responseText;
          call('init', args);
        });
      } else {
        call('init', args);
      }

      return { controlsDescendantBindings: true };
    },

    update: function(el, val) {
      var args = arguments;
      var name = getNameFromValue(val);
      var script = document.getElementById(name);

      if (script) {
        var ival = setInterval(function() {
          if (!loading[name]) {
            clearInterval(ival);
            call('update', args);
          }
        });
      } else {
        call('update', args);
      }
    }
  };

  function getNameFromValue(val) {
    var opts = ko.unwrap(val());
    return ko.unwrap(typeof opts === 'string' ? opts : ko.unwrap(opts.name));
  }

  function call(type, args) {
    oldTemplate[type].apply(oldTemplate, [].slice.call(args));
  }

  // Adapted from http://www.quirksmode.org/js/xmlhttp.html.
  function xhr(url, data, type, fn, async) {
    var request = false;
    var factories = [
        function () { return new XMLHttpRequest() },
        function () { return new ActiveXObject('Msxml2.XMLHTTP') },
        function () { return new ActiveXObject('Msxml3.XMLHTTP') },
        function () { return new ActiveXObject('Microsoft.XMLHTTP') }
      ];

    for (var i = 0; i < factories.length; i++) {
      try {
        request = factories[i]();
      } catch (e) {
        continue;
      }

      break;
    }

    if (!request) {
      return;
    }

    if (!type) {
      type = data ? 'post' : 'get';
    }

    request.open(type, url, async || true);

    request.onreadystatechange = function () {
      if (request.readyState != 4) {
        return;
      }

      if (request.status != 200 && request.status != 304) {
        return;
      }

      fn(request);
    }

    if (request.readyState == 4) {
      return;
    }

    request.send(data);
  }
});