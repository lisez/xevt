# xevt

another event emiiter.

features:

- can listen async/conjoined event.
- support to mixed async/sync handlers
- conditional event handlers.
- return unscriber when you subscribe an event.

[![Coverage Status](https://coveralls.io/repos/github/lisez/xevt/badge.svg)](https://coveralls.io/github/lisez/xevt) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Github release](https://badgen.net/github/release/lisez/xevt)](https://github.com/lisez/xevt/releases) [![NPM Version](https://img.shields.io/npm/v/xevt)](https://www.npmjs.com/package/xevt) [![JSR](https://jsr.io/badges/@lisez/xevt)](https://jsr.io/@lisez/xevt)

## Installation

```bash
npm install xevt
```

Then:

```typescript
import { Xevt } from "xevt";
```

## Usage

### Basic usage

```typescript
const emitter = new Xevt();

let result = 0;
emitter.on("event", () => {
  result++;
});
emitter.emit("event");
```

### Async event

```typescript
const emitter = new Xevt();

let result = 0;
emitter.on("event", async () => {
  result++;
});
await emitter.emit("event");
```

### Conditional event handlers.

IMPORTANT:

- NOT supported in conjoined events.
- NOT supported any arguments in handlers.
- It will be executed after the triggered event finished. (Blocking mode.)

```typescript
const emitter = new Xevt();
const result: any[] = [];
emitter.on("event", async (arg: number) => {
  result.push(arg);
  return arg % 2 === 0;
});

emitter.on("event", {
  true: async () => {
    result.push("first");
  },
});

emitter.on("event", {
  false: async () => {
    result.push("fail");
  },
});

emitter.on("event", {
  true: () => {
    result.push(100);
  },
  false: () => {
    result.push(99);
  },
});

emitter.emit("event", 1);
emitter.emit("event", 2);
await delay(10);
// [1, "fail", 99, 2, "first", 100]
```

### Conjoined event

IMPORTANT: conjoined events are not supported any arguments in handlers.

```typescript
const emitter = new Xevt();

let count = 0;
emitter.on(["event1", "event2"], () => {
  count++;
});
emitter.emit("event1");
emitter.emit("event2");

console.log(count); // 1
```

### Mixed async/sync handlers

Non-blocking in default.

```typescript
const emitter = new Xevt();
const result: number[] = [];
emitter.on("event", (data) => {
  result.push(data);
});
emitter.on(
  "event",
  async (data) =>
    new Promise((res) => {
      setTimeout(() => {
        result.push(data);
        res(true);
      }, 10);
    }),
);

for (let i = 0; i < 5; i++) {
  emitter.emit("event", i);
}

// [0, 1, 2, 3, 4, 0, 1, 2, 3, 4]
```

Blocking mode.

```typescript
const emitter = new Xevt();
const result: number[] = [];
emitter.on("event", (data) => {
  result.push(data);
});
emitter.on(
  "event",
  // deno-lint-ignore require-await
  async (data) =>
    new Promise((res) => {
      setTimeout(() => {
        result.push(data);
        res(true);
      }, 1);
    }),
  { async: true },
);

for (let i = 0; i < 5; i++) {
  emitter.emit("event", i);
}
await delay(15);

// [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]
```

## Return unscriber after registered an event

```typescript
const emitter = new Xevt();
const result: number[] = [];
const unscribe = emitter.on("event", (arg: number) => {
  result.push(arg);
});
unscribe();
```

```typescript
const emitter = new Xevt();
const result: number[] = [];
const unscribe = emitter.conjoin(["event1", "event2"], () => {
  result.push(1);
});
unscribe();
```

### Debug mode

```typescript
const emitter = new Xevt();
emitter.debug = true;
```

Then you can see the debug information in the console.

## Similar projects

- [mitt](https://github.com/developit/mitt)
- [emittery](https://github.com/sindresorhus/emittery)
- [eventemitter3](https://github.com/primus/eventemitter3)
- [evt](https://github.com/garronej/evt)
