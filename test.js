var assert = require("assert");

describe("easy", function() {
    var easy = require("./main.js");

    var sampleXml = '<books><book name="Lord of the Rings">' +
                        '<author name="J. R. R. Tolkien" />' +
                        '<language>English</language>' +
                    '</book></books>';

    it("should parse XML into JS object", function() {
        var xml = easy.parse(sampleXml);
        assert.ok(xml);
        assert.ok(xml.book);
        assert.equal(xml.book.length, 1);
        assert.equal(xml.book[0].$name, "Lord of the Rings");
        assert.equal(xml.book[0].author[0].$name, "J. R. R. Tolkien");
    });

    it("should save original DOM element in '$' property", function() {
        var xml = easy.parse(sampleXml);
        assert.ok(xml.$);
        assert.equal(xml.book.language[0].$.text(), "English");
    });

    it("should allow non-array shorthands", function() {
        var xml = easy.parse(sampleXml);
        assert.equal(xml.book.$name, "Lord of the Rings");
        assert.equal(xml.book.author.$name, "J. R. R. Tolkien");
    });
});
