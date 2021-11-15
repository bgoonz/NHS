f = require('./Downloads/finra.json')
curl = require('../../programs/har-to-curl')
var fs = require('fs')
var day = require('dayjs')
var tick = process.argv[2]
var name = process.argv[3]
var last = '2021-02-01'
for(var xx = 0; xx <= 0; xx++){
  let date = day(last).subtract(xx * 7, 'days').format('YYYY-MM-DD')
  let p = JSON.parse(f.log.entries[0].request.postData.text)

  let x = p.compareFilters.map(e => {
    if(e.fieldName == 'issueName') e.fieldValue = process.argv[3]
    if(e.fieldName == 'issueSymbolIdentifier') {
      e.fieldValue = process.argv[2]
    }
    if(e.fieldName == 'weekStartDate') e.fieldValue = date//'2021-2-1' 
    return e 
  })//.filter(Boolean)

//  console.log(x)
  let h = f.log.entries[0].request.headers
  h = h.map( e => {
    if(e.name == 'content-length') e.value = new Buffer(JSON.stringify(p)).length
    return e
  })
  //process.exit()
  p.compareFilters = x
  f.log.entries[0].request.postData.text = JSON.stringify(p)
  f.log.entries[0].request.headers = h
  c = curl(f)[0]
  //console.log(f.log.entries[0].request.postData, c)
  fs.writeFileSync(`./py/data/${tick}/${date}.sh`, c, 'utf8')
  //s(c).stdout.pipe(fs.createWriteStream('aapl.json.gz'))//, (e, r) => console.log(e, typeof r, z(new Buffer(r))))

}
//process.exit()
