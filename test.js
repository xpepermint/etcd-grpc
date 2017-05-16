const { KVClient, LeaseClient } = require("./dist");

const kv = new KVClient();
const lease = new LeaseClient();

kv.put({
  key: new Buffer("name"),
  value: new Buffer("John"),
}).then(() => {
  return kv.put({
    key: new Buffer("name2"),
    value: new Buffer("John"),
  });
}).then((data) => {
  console.log(data);
}).catch((err) => {
  console.log(err);
});

// lease.leaseGrant({
//   TTL: 10,
//   ID: 100
// }).then(({ id }) => {
//   return kv.put({
//     key: new Buffer("name"),
//     value: new Buffer("John"),
//     lease: id, // attach this key to lease
//   });
// }).then((res) => {
//   return kv.range({
//     key: new Buffer("name"),
//   });
// }).then((data) => {
//   console.log(data);
// }).catch((err) => {
//   console.log(err);
// });

// kv.range({
//   key: new Buffer("name"),
// }).then((data) => {
//   console.log(data);
// }).catch((err) => {
//   console.log(err);
// });
