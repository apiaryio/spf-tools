var assert = require('assert');
var path = require('path');

describe('Akamai', function() {
  describe('updateDnsFile()', function() {
    it('should update the dns file', function() {
      process.env.DOMAIN = "example.com";
      process.env.ORIG_SPF = "spf-orig.example.com";
      var akamai = require('../../plugins/akamai');
      var expected_zonefile = require(path.resolve(__dirname, 'fixtures/new-zonefile.json'));
      var actual_zonefile = require(path.resolve(__dirname, 'fixtures/old-zonefile.json'));
      var spfRecords = require(path.resolve(__dirname, 'fixtures/spf-records.json'));
      akamai.updateZoneFile(actual_zonefile, spfRecords);
      assert.deepEqual(actual_zonefile, expected_zonefile);
    });
  });
});
