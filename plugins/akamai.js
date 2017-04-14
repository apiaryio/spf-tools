#!/usr/bin/env node

var EdgeGrid = require('edgegrid');
var dnszone = process.env.DOMAIN;

if (dnszone == undefined){
  console.error("No DOMAIN specified");
  process.exit(1);
}

var stdin = process.openStdin();
var spf_records = [];

stdin.on('data', function(data){
  spf_records.push(parseSpfItem(data));
});

stdin.on('end', function(){
  console.log('done!');
  console.log(JSON.stringify(spf_records));
  getZoneFile(spf_records, function(error, zonefile){
    if (error){
      console.error(error);
      process.exit(1);
    }
    updateZoneFile(zonefile, spf_records);
    postZoneFile(zonefile);
  });
});


function parseSpfItem(data){
  var spfpartial = data.toString().split("^");
  return {
    target: JSON.parse(spfpartial[1]),
    active: true,
    name: getSpfItemName(spfpartial[0]),
    ttl: 300
  }
}

function getSpfItemName(data){
  var itemName = data.replace("." + dnszone, '');
  if (data === dnszone) itemName = null;
  return itemName;
}

function getZoneFile(spf_records, cb){
  var eg = new EdgeGrid({
    path: '.edgerc',
    section: 'default'
  });

  eg.auth({
    path: '/config-dns/v1/zones/' + dnszone,
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
  var other_records = txt_records.filter(function (item) {
    var include = true;
    if (item.name === null){
      // remove "null" spf record
      if (item.target.includes('v=spf1')) include = false;
    }
    else if (item.name.includes('spf-orig')) include = true;
    else if (item.name.includes('spf')) include = false;
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
    path: '/config-dns/v1/zones/' + dnszone,
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

  if (response.statusCode !== 200){
    console.error(body);
    process.exit(1);
  }
}

module.exports = {
  updateZoneFile: updateZoneFile
};
