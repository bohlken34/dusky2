var expect = require("chai").expect;
var tools = require("../lib/tools");

describe("Tools", function() {

	describe("printName()", function() {
		it("should print the last name first", function() {
			var results = tools.printName({ first: "Jake", last: "Bohlken" });
			expect(results).to.equal("Bohlken, Jake");
		});
	});

	describe("loadWiki()", function() {
		it("Load Abraham Lincoln's wikipedia page", function(done) {

			tools.loadWiki({ first: "Abraham", last: "Lincoln" }, function(html) {
				expect(html).to.be.ok;
				done();
			});

		});

	});

});



