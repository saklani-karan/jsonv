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

    To load the file directly, we can use the load method from the jsonvar module. The object returned from the load method is an instance of the class JSONV that contains the validated stub object and the mapping from the variable name to the path reference within the stub object.

    In case, the variable JSON also has to be loaded from a string, a new instance of the JSONV class can be created directly by calling the constructor of the class which accepts a string as an argument.

    ```typescript
    import { load, JSONV } from "jsonvar";
    // load from a file
    const variableJSONLoadedFromFile: JSONV = load(
        "./cancelled-orders-for-users.jsonv"
    );
    // create from a string
    const variableJSONFromAString: JSONV = new JSONV('{"active":#active}');
    ```

4. Injecting variables on runtime

    To inject variables into the stub object, use the inject method which takes an object as an argument.

    ```typescript
    import { load } from "jsonvar";
    // load from a file
    const variableJSON: JSONV = load("./cancelled-orders-for-users.jsonv");
    ```
