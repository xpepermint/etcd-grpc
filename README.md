![Build Status](https://travis-ci.org/xpepermint/etcd-grpc.svg?branch=master)&nbsp;[![NPM Version](https://badge.fury.io/js/etcd-grpc.svg)](https://badge.fury.io/js/etcd-grpc)&nbsp;[![Dependency Status](https://gemnasium.com/xpepermint/etcd-grpc.svg)](https://gemnasium.com/xpepermint/etcd-grpc)

# [etcd](https://github.com/coreos/etcd)-[grpc](http://www.grpc.io/)

> A gRPC based etcd client for NodeJS targeting etcd V3.

[Etcd](https://github.com/coreos/etcd) is a distributed reliable key-value store for the most critical data of a distributed system.

This NPM package provides a high performance [gRPC](http://www.grpc.io/) based promisified clients for [Etcd V3](https://github.com/coreos/etcd). It's open-source and it's written with  [TypeScript](https://www.typescriptlang.org).

The source code is available on [GitHub](https://github.com/xpepermint/etcd-grpc) where you can also find our [issue tracker](https://github.com/xpepermint/etcd-grpc/blob/master/issues).

## Installation

Run the command below to install the package.

```
npm install --save etcd-grpc
```

## Getting Started

Before you start make sure that [etcd](https://github.com/coreos/etcd) is running on your local machine. Code snippets below expect that [etcd](https://github.com/coreos/etcd) is listening locally on the default port `2379`. To make the code clean, the examples are written in [TypeScript](https://www.typescriptlang.org/).

### Initialization

[Etcd](https://github.com/coreos/etcd) API consists of multiple [gRPC](http://www.grpc.io/) services. This package provides all these functionalities through a unified API.

You start by initializing a new client.

```ts
import { Etcd } from "etcd-grpc";

const client = new Etcd();
```

### KV Service

The `KV` etcd service provides the API for reading, updating and deleting keys stored in etcd.

We can set the `name` key with value `John` as show below. Note that `key` and `value` must be of type `Buffer`.

```ts
client.put({
  key: new Buffer("name"),
  value: new Buffer("John"),
}).then((res) => {
  console.log(res);
});
```

The connection to the `etcd` server can sometimes fail thus the performing commands can fail. A command will throw an error in case of connectivity problem which we can catch and then reconnect the client manually.

```ts
import { getErrorKind, ErrorKind } from "etcd-grpc";

promise.catch((err) => {
  if (getErrorKind(err) === ErrorKind.CONNECTION_FAILED) {
    client.reconnect(); // reconnect the client to the next available endpoint (round-robin style)
    client.put({ ... }); // try-again code
  } else {
    throw err;
  }
});
```

We can read one or many keys from the server using the `range` method. In the following example we retrieve a single key `name`.

```ts
client.range({
  key: new Buffer("name"),
}).then((res) => {
  console.log(res);
});
```

There are some parts of etcd that could represent an endless source of confusion. Etcd stores keys in a sequence and there is a special key `\0` which you can use to target the first or the last key in the store.

```ts
client.range({
  key: new Buffer("\0"), // first key
  rangeEnd: new Buffer("\0"), // last key
}).then((res) => {
  console.log(res);
});
```

Another trick is that if you set `rangeEnd` to the `key` plus one byte, the etcd will read keys from `key` to the last key prefixed with `key` (all keys of a directory). This means that if the `key` name is `/aaa`, then to get the rest of the keys of that prefix, we need to set `rangeEnd` to `aab`. You can use the [incstr](https://www.npmjs.com/package/incstr) NPM module to increment strings or check the [Stackoverflow](https://stackoverflow.com/q/38352497/132257) page.

```ts
client.range({
  key: new Buffer("name/aaa"), // start key
  rangeEnd: new Buffer("name/aab"), // get all keys `name/{something}` from `name/aaa`
}).then((res) => {
  console.log(res);
});
```

Keys can be deleted from the server using the `rangeDelete` method. In the following example we delete a single key `name`.

```ts
client.rangeDelete({
  key: new Buffer("name"),
}).then((res) => {
  console.log(res);
});
```

We can also perform multiple operations in transaction using the `txn` method. The following example sets the `name` key to `bar` if that key already exists with a value set to `foo`.

```js
import { CompareResult, CompareTarget } from "etcd-grpc";

client.txn({
  compare: {
    result: CompareResult.EQUAL, // must be equal to
    target: CompareTarget.VALUE, // check the value
    key: new Buffer("name"), // key name
    value: new Buffer("foo"), // key value
  },
  success: [{ // run these operations if the `compare` successeeds
    requestPut: {
      key: new Buffer("name"),
      value: new Buffer("bar"),
    }
  }],
  failure: [{ // run these operations if the `compare` fails
    requestPut: {
      key: new Buffer("name"),
      value: new Buffer("foo"),
    }
  }],
}).then((res) => {
  console.log(res);
});
```

There's more so please use TypeScript or check the [source files](https://github.com/xpepermint/etcd-grpc/blob/master/src/lib/rpc.ts).

### Lease Service

The `Lease` service provides an interface for managing keys TTL. We can use that to set the automatic expiration for one or multiple keys. The following example shows how to set a key which is automatically removed after 10s.

```js
client.leaseGrant({
  ttl: 5,
  id: 100
}).then(({ id }) => {
  return client.put({
    key: new Buffer("name"),
    value: new Buffer("John"),
    lease: id, // attach this key to lease
  });
});
```

There's more so please use TypeScript or check the [source files](https://github.com/xpepermint/etcd-grpc/blob/master/src/lib/rpc.ts).

### Watch Service

The `Watch` service allows us to connect to the `etcd` server and listen for changes. The example below shows how to quickly setup a watcher.

```js
const watcher = client.createWatcher();
watcher.on("data", console.log);
watcher.on("finish", console.log);
watcher.on("end", console.log);
watcher.on("close", console.log);
watcher.on("error", console.log);
watcher.watch({ // watch the `name` key
  key: new Buffer("name"),
});
```

The `watch()` command can be called multiple times. It will automatically cose the previous watch request. This is handy when handling a reconnect.

```ts
import { getErrorKind, ErrorKind } from "etcd-grpc";

watcher.on("error", (err) => {
  if (getErrorKind(err) === ErrorKind.CONNECTION_FAILED) {
    client.reconnect(); // reconfigure the client
    watcher.watch({ ... }); // start watching through reconfigured client
  }
});
```

Watcher can be closed by calling the `close()` method.

There's more so please use TypeScript or check the [source files](https://github.com/xpepermint/etcd-grpc/blob/master/src/lib/watch.ts).

## Related Packages

* [etcd3](https://github.com/WatchBeam/etcd3)
* [node-etcd3](https://github.com/CitySim/node-etcd3)

## License (MIT)

```
Copyright (c) 2016+ Kristijan Sedlak <xpepermint@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated modelation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
