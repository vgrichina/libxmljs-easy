var libxml = require("libxmljs");
var util = require("util");

exports.parse = function(str) {
    var xml = libxml.parseXmlString(str);

    return convertElement(xml.root());
}

function merge(dst, src) {
    for (var key in src) {
        dst[key] = src[key];
    }
}

function addTagProperties(parent, tagNames, getter) {
    for (var tag in tagNames) {
        Object.defineProperty(parent, tag, {
            get: getter.bind(parent, tag)
        });
    }
}

function addChildGetters(result) {
    // Create properties for child tags
    var allTags = {};
    result.forEach(function(it) {
        merge(allTags, it.$$tagNames);
    });
    addTagProperties(result, allTags, childTagGetter);

    // Create properties for attributes of matched tags
    var allAttrs = {};
    result.forEach(function(it) {
        it.$.attrs().forEach(function(attr) {
            allAttrs[attr.name()] = (allAttrs[attr.name()] || "") + attr.value();
        });
    });
    for (var key in allAttrs) {
        Object.defineProperty(result, "$" + key, {
            value: allAttrs[key]
        });
    }
}

function childTagGetter(tag) {
    var result = [];
    this.forEach(function(it) {
        Array.prototype.push.apply(result, it[tag]);
    });

    addChildGetters(result);

    return result;
}

function tagGetter(tag) {
    // Filter matching tags
    var result = this.filter(function(it) { return it.$.name() == tag; });

    addChildGetters(result);

    return result;
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
        if (it instanceof Array) {
            var name = it.$.name();
            tagNames[name] = true;
        }
    });
    addTagProperties(converted, tagNames, tagGetter);

    // Collect attributes
    elem.attrs().forEach(function(it) {
        converted["$" + it.name()] = it.value();
    });

    // Save DOM element object
    Object.defineProperty(converted, "$", {value: elem});
    Object.defineProperty(converted, "$$tagNames", {value: tagNames});


    return converted;
}
