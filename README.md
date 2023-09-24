# JSONV Module

The jsonv module is a TypeScript class that allows you to load and parse Variable JSON (JSONV) objects, which are JSON objects containing variables. This module enables you to inject variables into the loaded jsonv file at runtime.

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
-   [API Reference](#api-reference)
    -   [Constructor](#constructor)
    -   [inject](#inject)
-   [Example](#example)
-   [License](#license)

## Installation

To use the JSONV module in your TypeScript project, you can install it via npm:

```bash
npm install jsonv
```

## Usage

To use the jsonv module in your TypeScript project, follow these steps:

1. Install the jsonv module via npm:

    ```bash
    npm install jsonv
    ```

2. Import the jsonv class if you are parsing strings directly, otherwise import the load method to parse jsonv files

    ```typescript
    // import for loading strings which contain variables in json format
    import { JSONV } from "jsonv";
    ```

    ```typescript
    // import 'load' method for importing directly from a .jsonv file
    import { load } from "jsonv";
    ```

3. Load the jsonv file
