// libxmljs-easy
// =============
//
// libxmljs-easy is a Node.js module which simplifies XML traversing,
// similar to [E4X](http://en.wikipedia.org/wiki/ECMAScript_for_XML).
//
// Installation
// ------------
//
//      npm install libxmljs-easy
//

var libxml = require("libxmljs");
var util = require("util");

// Usage
// -----
//
// Use module
//
//      var easy = require("libxmljs-easy");
//
// Parse XML
//
//      var xml = easy.parse('<books><book name="Lord of the Rings">' +
//                              '<author name="J. R. R. Tolkien" />' +
//                              '<language>English</language>' +
//                           '</book></books>');
//
// Select elements from collections explicitly
//
//      assert.equal(xml.book[0].$name, "Lord of the Rings");
//      assert.equal(xml.book[0].author[0].$name, "J. R. R. Tolkien");
//
// Use shorthands (works well for case when there is single child element with given name)
//
//      assert.equal(xml.book.$name, "Lord of the Rings");
//      assert.equal(xml.book.author.$name, "J. R. R. Tolkien");
//
// Basically the idea is that you construct a path from tag names,
// which can optionally end with attribute name prefixed with "$".
//
// When index is ommited – the array of elements is matched.
// When attribute is accessed on such array, its value is concatenated string
// of attribtue values for each of elements in the array.
//
// There is also original DOM element available as "$" property
// of individual converted elements.
//
//      assert.equal(xml.book.language[0].$.text(), "English");
//
//
exports.parse = function(str) {
    var xml = libxml.parseXmlString(str);

    return convertElement(xml.root());
}

// Merge enumerable properties from `src` object into `dst` object.
// Note that `dst` is modified in-place.
function merge(dst, src) {
    for (var key in src) {
        dst[key] = src[key];
    }
}

// Add properties to access tags with given names using given getter
function addTagProperties(parent, tagNames, getter) {
    for (var tag in tagNames) {
        Object.defineProperty(parent, tag, {
            get: getter.bind(parent, tag)
        });
    }
}

// Add shorthand properties to given array of converted nodes
function addShorthandProperties(result) {
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

// Get child elements with given tag of elements in `this` as array
function childTagGetter(tag) {
    // Collect child elements
    var result = [];
    this.forEach(function(it) {
        Array.prototype.push.apply(result, it[tag]);
    });

    // Add shorthand properties for child elements / attributes
    addShorthandProperties(result);

    return result;
}

// Get elements with given tag from `this` as array
function tagGetter(tag) {
    // Filter matching tags
    var result = this.filter(function(it) { return it.$.name() == tag; });

    // Add shorthand properties for child elements / attributes
    addShorthandProperties(result);

    return result;
}

// Convert single DOM element into "easy" representation
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
