# VJSON Module

The VJSON module is a TypeScript class that allows you to load and parse Variable JSON (VJSON) objects, which are JSON objects containing variables. This module enables you to inject variables into the loaded VJSON file at runtime.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Constructor](#constructor)
  - [inject](#inject)
- [Example](#example)
- [License](#license)

## Installation

To use the VJSON module in your TypeScript project, you can install it via npm:

```bash
npm install vjson
```

## Usage

To use the VJSON module in your TypeScript project, follow these steps:

1. Install the VJSON module via npm:

   ```bash
   npm install vjson
   ```

2. Import the VJSON class if you are parsing strings directly, otherwise import the load method to parse vjson files
    ```typescript
    // import for loading strings which contain variables in json format
    import { VJSON } from 'vjson';
    ```

    ```typescript
    // import 'load' method for importing directly from a .vjson file
    import { load } from "vjson";
    ```

