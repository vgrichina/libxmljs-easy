var assert = require("assert");

describe("easy", function() {
    var easy = require("./main.js");

    it("should parse XML into JS object", function() {
        var xml = easy.parse('<books><book name="Lord of the Rings"><author name="J. R. R. Tolkien" /></book></books>');
        assert.equal(xml.book[0].$name, "Lord of the Rings");
        assert.equal(xml.book[0].author[0].$name, "J. R. R. Tolkien");
    });
});
