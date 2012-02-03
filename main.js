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

    // Group child elements by names
    converted.forEach(function(it) {
        if (it instanceof Array) {
            var name = it.$.name();
            if (!converted[name]) {
                converted[name] = [];
            }
            converted[name].push(it);
        }
    });

    // Collect attributes
    elem.attrs().forEach(function(it) {
        converted["$" + it.name()] = it.value();
    });

    // Save DOM element object
    converted.$ = elem;

    return converted;
}
