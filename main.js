var libxml = require("libxmljs");
var util = require("util");

exports.parse = function(str) {
    var xml = libxml.parseXmlString(str);

    return convertElement(xml.root());
}

function convertElement(elem) {
    // Convert child elements recursively
    var converted = elem.childNodes().map(function(it) {
        if (it instanceof libxml.Element) {
            return convertElement(it);
        }

        return it;
    });

    // Create properties that group child elements by names
    var tagNames = {};
    converted.forEach(function (it) {
        console.log("it", it);
        if (it instanceof Array) {
            var name = it.$.name();
            tagNames[name] = true;
        }
    });
    for (var tag in tagNames) {
        Object.defineProperty(converted, tag, {
            get: (function(tag) {
                     return converted.filter(function(it) { return it.$.name() == tag; });
                 }).bind(null, tag)
        });
    }

    // Collect attributes
    elem.attrs().forEach(function(it) {
        converted["$" + it.name()] = it.value();
    });

    // Save DOM element object
    converted.$ = elem;

    return converted;
}
