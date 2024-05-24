# xevt

another event emiiter.

features:

- support async event.
- support conjoined events.
- support mixed async/sync handlers.

[![Coverage Status](https://coveralls.io/repos/github/lisez/xevt/badge.svg?branch=feature/0.2.0)](https://coveralls.io/github/lisez/xevt?branch=feature/0.2.0)

## Installation

```bash
npm install xevt
```

Then:

```typescript
import { Xemitter } from "xevt";
```

## Usage

### Basic usage

```typescript
const emitter = new Xemitter();

let result = 0;
emitter.on("event", () => {
  result++;
});
emitter.emit("event");
```

### Async event

```typescript
const emitter = new Xemitter();

let result = 0;
emitter.onAsync("event", async () => {
  result++;
});
await emitter.emit("event");
```

### Conjoined event

```typescript
const emitter = new Xemitter();

let count = 0;
emitter.on(["event1", "event2"], () => {
  count++;
});
emitter.emit("event1");
emitter.emit("event2");
```

### Mixed async/sync handlers

```typescript
const emitter = new Xemitter();
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
```

```typescript
const emitter = new Xemitter();
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
```
