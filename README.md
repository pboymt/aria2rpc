# Aria2RPC

The Aria2 RPC library written in TypeScript running on Node.js.

## Installation

```bash
$ npm i aria2rpc
```

## Usage

```typescript
import { Aria2Client } from 'aria2rpc';

const client = new Aria2Client({
    secret: 'your secret'
});

(async () => {
    const response = client.getGlobalStat();
    console.log(response.result); // Aria2 Global Status
})()
```