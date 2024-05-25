# xevt

another event emiiter.

features:

- support async event.
- support conjoined events.
- support mixed async/sync handlers.

[![Coverage Status](https://coveralls.io/repos/github/lisez/xevt/badge.svg?branch=feature/0.2.0)](https://coveralls.io/github/lisez/xevt?branch=feature/0.2.0) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
emitter.onAsync("event", async () => {
  result++;
});
await emitter.emit("event");
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

```typescript
const emitter = new Xevt();
const result: number[] = [];
emitter.on("event", (data) => {
  result.push(data);
});
emitter.onAsync(
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

// [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]
```

```typescript
const emitter = new Xevt();
const result: number[] = [];
emitter.conjoin(["event1", "event2"], async () => {
  result.push(1);
});
emitter.conjoinAsync(["event1", "event2"], async () => {
  result.push(2);
});

for (let i = 0; i < 5; i++) {
  emitter.emit("event1");
  emitter.emit("event2");
}

// [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
```

## Similar projects

- [mitt](https://github.com/developit/mitt)
- [emittery](https://github.com/sindresorhus/emittery)
- [eventemitter3](https://github.com/primus/eventemitter3)
- [evt](https://github.com/garronej/evt)
