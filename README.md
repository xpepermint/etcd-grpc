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

[Etcd](https://github.com/coreos/etcd) API consists of multiple [gRPC](http://www.grpc.io/) services. This package follows the same principle and provides a client class per service.

### KV Client

The `KV` client provides the interface for reading, updating and deleting keys stored in `etcd`. You start by initializing a new KV client.

```ts
import { KVClient } from "etcd-grpc";

const kv = new KVClient();
```

We can now set the `name` key with value `John` as show below. Note that `key` and `value` must be of type `Buffer`.

```ts
kv.put({
  key: new Buffer("name"),
  value: new Buffer("John"),
}).then((res) => {
  console.log(res);
});
```

The connection to the `etcd` server will sometimes fail thus the performing commands will fail. A command will throw an error in case of connectivity problem which we can catch and then try to reconnect manually.

```ts
import { getErrorKind, ErrorKind } from "etcd-grpc";

promise.catch((err) => {
  if (getErrorKind(err) === ErrorKind.CONNECTION_FAILED) {
    kv.reconnect(); // reconnect to the next available endpoint (round-robin style)
  } else {
    throw err;
  }
});
```

When targeting the server using DNS, the service, in some cases, can hang forever if the address can not be resolved. Use IP address as your enpoint address instead, because the connectivity problem will be handled by throwing an error as explained.

We can read one or many keys from the server using the `range` method. In the following example we retrieve a single key `name`.

```ts
kv.range({
  key: new Buffer("name"),
}).then((res) => {
  console.log(res);
});
```

Etcd stores keys in a sequence. By using a special character `\0` we can target the first or the last key in the store. The following example returns all keys in the etcd store.

```ts
import { EDGE_KEY } from "etcd-grpc";

kv.range({
  key: new Buffer(EDGE_KEY), // first key
  rangeEnd: new Buffer(EDGE_KEY), // last key
}).then((res) => {
  console.log(res);
});
```

Keys can be deleted from the server using the `rangeDelete` method. In the following example we delete a single key `name`.

```ts
kv.rangeDelete({
  key: new Buffer("name"),
}).then((res) => {
  console.log(res);
});
```

We can also perform multiple operations in transaction using the `txn` method. The following example sets the `name` key to `bar` if that key already exists with a value set to `foo`.

```js
import { CompareResult, CompareTarget } from "etcd-grpc";

kv.txn({
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

There's more so please use TypeScript or check the [source files](https://github.com/xpepermint/etcd-grpc/blob/master/src/lib/kv.ts).

### Watch Client

The `Watch` service allows us to connect to the `etcd` server and listen for changes. The example below shows how to quickly setup a watcher.

```js
import { WatchClient } from "etcd-grpc";

const watcher = new WatchClient();
watcher.watch({ // watch the `name` key
  key: new Buffer("name"),
});
watcher.on("data", console.log);
watcher.on("finish", console.log);
watcher.on("end", console.log);
watcher.on("close", console.log);
watcher.on("error", console.log);
```

Watcher can be paused by calling the `cancel()` method. To start watching again, we can run the `watch()` method again.

```ts
watcher.cancel(); // stop watching
watcher.watch({ // continue watching the `name` key
  key: new Buffer("name"),
});
```

Watcher also provides the `reconnect()` method which we can use in case of conectivity problems. The method will try to reconnect to the next available endpoint.

```ts
import { getErrorKind, ErrorKind } from "etcd-grpc";

watcher.on("error", (err) => {
  if (getErrorKind(err) === ErrorKind.CONNECTION_FAILED) {
    watcher.reconnect();
  }
});
```

There's more so please use TypeScript or check the [source files](https://github.com/xpepermint/etcd-grpc/blob/master/src/lib/watch.ts).

### Lease Client

The `Lease` service provides an interface for managing keys TTL. We can use that to set the automatic expiration for one or multiple keys. The following example shows how to set a key which is automatically removed after 10s.

```js
import { LeaseClient } from "etcd-grpc";

const lease = new LeaseClient();

lease.leaseGrant({
  TTL: 5,
  ID: 100
}).then(({ id }) => {
  return kv.put({
    key: new Buffer("name"),
    value: new Buffer("John"),
    lease: id, // attach this key to lease
  });
});
```

Note also that this client provides the same connectivity logic as the `KVClient`. There's more so please use TypeScript or check the [source files](https://github.com/xpepermint/etcd-grpc/blob/master/src/lib/lease.ts).

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
