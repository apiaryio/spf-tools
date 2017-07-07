#!/usr/bin/env node

var EdgeGrid = require('edgegrid');

if (process.env.DOMAIN == undefined || process.env.ORIG_SPF == undefined){
  console.error("Please set the DOMAIN and ORIG_SPF (e.g. example.com and spf-orig.example.com).");
  process.exit(1);
}

var stdin = process.openStdin();
var spf_records = [];

stdin.on('data', function(data){
  spf_records.push(parseSpfItem(data));
});

stdin.on('end', function(){
  console.log("Fetching zone file from Akamai API for domain " + process.env.DOMAIN);
  getZoneFile(spf_records, function(error, zonefile){
    if (error){
      console.error(error);
      process.exit(1);
    }
    console.log("Updating zone file with new SPF records");
    updateZoneFile(zonefile, spf_records);
    if (process.env.DRY_RUN == 1){
      console.log("This is a dry run so I won't post anything. This is what I would have:");
      console.log(JSON.stringify(zonefile));
    }
    else {
      postZoneFile(zonefile);
    }
  });
});


function parseSpfItem(data){
  console.log(data.toString());
  var spfpartial = data.toString().split("^");
  return {
    target: JSON.parse(spfpartial[1]),
    active: true,
    name: getSpfItemName(spfpartial[0]),
    ttl: 300
  }
}

function getSpfItemName(data){
  var itemName = data.replace("." + process.env.DOMAIN, '');
  if (data === process.env.DOMAIN) itemName = null;
  return itemName;
}

function getZoneFile(spf_records, cb){
  var eg = new EdgeGrid({
    path: '.edgerc',
    section: 'default'
  });

  eg.auth({
    path: '/config-dns/v1/zones/' + process.env.DOMAIN,
    method: 'GET',
    headers: {}
  });

  eg.send(function (error, response, body) {
    exitOnError(error, response, body);
    cb(error,  JSON.parse(body));
  });
}

function updateZoneFile(zonefile, spf_records){
  zonefile.zone.soa.serial += 1;
  var txt_records = zonefile.zone.txt;
  var spf_orig_record = getSpfItemName(process.env.ORIG_SPF);
  var other_records = txt_records.filter(function (item) {
    var include = true;
    if (item.name === null){
      if (item.target.includes('v=spf1')) include = false; // remove the first spf record (with null name)
    }
    else if (item.name.includes(spf_orig_record)) include = true; // we want to keep the ORIG_SPF record
    else if (item.name.includes('spf')) include = false; // get rid of the old SPF records
    return include;
  });
  var updated_records = other_records.concat(spf_records);
  updated_records = updated_records.sort(function (item1, item2) {
    if (item1.name === item2.name) {
      return item1.target.localeCompare(item2.target);
    }
    if (item1.name === null) return -1;
    if (item2.name === null) return 1;
    return item1.name.localeCompare(item2.name);
  });
  zonefile.zone.txt = updated_records;
}

function postZoneFile(zonefile){
  var eg = new EdgeGrid({
    path: '.edgerc',
    section: 'default'
  });

  eg.auth({
    path: '/config-dns/v1/zones/' + process.env.DOMAIN,
    method: 'POST',
    headers: {
      'Content-Type': "application/json"
    },
    body: zonefile
  });

  eg.send(function (error, response, body) {
    exitOnError(error, response, body);
    console.log("SPF records updated at Akamai for domain " + process.env.DOMAIN);
  });
}

function exitOnError(error, response, body) {
  if (error){
    console.error(error);
    process.exit(1);
  }

  if (response.statusCode != 200 && response.statusCode != 204){
    console.error('Error occurred. Status code received: ' + response.statusCode);
    process.exit(1);
  }
}

module.exports = {
  updateZoneFile: updateZoneFile
};
