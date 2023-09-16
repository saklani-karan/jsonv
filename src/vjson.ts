import { readFileSync } from "fs";

const formatting = new RegExp("\t|\n|\r|\\s+", "i");
const variableNameRegex = new RegExp("^([a-zA-Z_$][a-zA-Zd_$]*)$");
let fileExtensionRegex: RegExp = /^.*\/(.*)\.(.*)$/g;
let trueRemBoolean: string = "rue";
let falseRemBoolean: string = "alse";
let nullRemString: string = "ull";

/**
 * Loads file from file path. File path must be a valid vjson file (extension .vjson). Return VJSON object
 * @param {string} filePath
 * @returns {VJSON}
 */
export function load(filePath: string): VJSON {
    let matches = fileExtensionRegex.exec(filePath);
    if (matches.length < 3) {
        throw new Error("Invalid file path");
    }
    if (matches[2].toLowerCase() !== "vjson") {
        throw new Error(`Extension of the file must be 'vjson'`);
    }
    return new VJSON(readFileSync("./test.vjson").toString("utf-8"));
}

/**
 * Represents a class for parsing and injecting variables into variable JSON objects (VJSON).
 */
export class VJSON {
    private variableKeyPathMap: Map<string, string[][]> = new Map();
    private object: any = null;
    /**
     * Creates a new instance of the VJSON class by parsing the provided input string.
     * @param {string} input - The input string to parse.
     */
    constructor(input: string) {
        let { res, endIdx } = this.parseObject(input, this.variableKeyPathMap);
        this.object = res;
    }

    /**
     * Parses a JSON-like object from the input string, optionally with variable references.
     * @param {string} input - The input string to parse.
     * @param {Map<string, string[][]>} variableMap - A map to store variable references.
     * @param {number} start - The starting index for parsing (optional, default is 0).
     * @param {string[]} path - The current path of the object being parsed (optional).
     * @returns {Object} - The parsed JSON-like object.
     * @throws {Error} - Throws an error if parsing fails.
     */
    private parseObject(
        input: string,
        variableMap: Map<string, string[][]>,
        start: number = 0,
        path: string[] = []
    ): {
        res: any;
        endIdx: number;
    } {
        input = input.trim();
        let isKey: boolean = false,
            valueType: string = null,
            isValue: boolean = false,
            isOpen: boolean = false,
            key: string | number = null,
            iterator: number = start,
            value: string = null;
        let res = null;
        let charStack: Array<string> = [];
        let objectType = "object";
        while (iterator < input.length) {
            let char: string = input[iterator];
            if (isOpen) {
                // neither key nor value decided yet -> just opened or found last key-value pair
                if (!isKey && !isValue) {
                    if (formatting.test(char)) {
                        iterator++;
                        continue;
                    }
                    // here set key
                    if (objectType === "array") {
                        isValue = true;
                        key = Object.keys(res).length;
                        continue;
                    }
                    isKey = true;
                    if (char !== '"') {
                        throw new Error(`invalid key at index ${iterator}`);
                    }
                    charStack.push(char);
                } else if (isKey) {
                    // we were in the key mode
                    if (key) {
                        if (formatting.test(char)) {
                            iterator++;
                            continue;
                        }
                        if (char !== ":") {
                            throw new Error(
                                `invalid character at index ${iterator}`
                            );
                        } else {
                            // shift to value now
                            isKey = false;
                            isValue = true;
                        }
                    } else {
                        if (char === '"') {
                            let top: string = charStack.pop();
                            let stackPopCounter: number = 1;
                            key = "";
                            while (top !== '"') {
                                if (!charStack.length) {
                                    throw new Error(
                                        `error at index ${
                                            iterator - stackPopCounter
                                        }`
                                    );
                                }
                                key = top + key;
                                stackPopCounter++;
                                top = charStack.pop();
                            }
                        } else {
                            charStack.push(char);
                        }
                    }
                } else {
                    // we were in value mode
                    if (!valueType) {
                        if (formatting.test(char)) {
                            iterator++;
                            continue;
                        }
                        if (char === '"') {
                            valueType = "string";
                            charStack.push(char);
                        } else if (char >= "0" && char <= "9") {
                            valueType = "number";
                            charStack.push(char);
                        } else if (char === "t" || char === "f") {
                            valueType = "boolean";
                            let remBoolean: string =
                                char === "t" ? trueRemBoolean : falseRemBoolean;
                            for (
                                let remBooleanIndex = 0;
                                remBooleanIndex < remBoolean.length;
                                remBooleanIndex++
                            ) {
                                if (
                                    iterator + remBooleanIndex + 1 >
                                    input.length
                                ) {
                                    throw new Error(
                                        `error at index ${iterator}`
                                    );
                                }
                                if (
                                    input[iterator + remBooleanIndex + 1] !==
                                    remBoolean[remBooleanIndex]
                                ) {
                                    throw new Error(
                                        `error at index ${
                                            iterator + remBooleanIndex
                                        }`
                                    );
                                }
                            }
                            value = char + remBoolean;
                            iterator += remBoolean.length + 1;
                            continue;
                        } else if (char === "n") {
                            valueType = "null";
                            for (
                                let remNullIndex = 0;
                                remNullIndex < nullRemString.length;
                                remNullIndex++
                            ) {
                                if (
                                    iterator + remNullIndex + 1 >
                                    input.length
                                ) {
                                    throw new Error(
                                        `error at index ${iterator}`
                                    );
                                }
                                if (
                                    input[iterator + remNullIndex + 1] !==
                                    nullRemString[remNullIndex]
                                ) {
                                    throw new Error(
                                        `error at index ${
                                            iterator + remNullIndex
                                        }`
                                    );
                                }
                            }
                            value = "null";
                            iterator += nullRemString.length + 1;
                            continue;
                        } else if (char === "{" || char === "[") {
                            valueType = "object";
                            const parseObjectResponse = this.parseObject(
                                input,
                                variableMap,
                                iterator,
                                [...path, key.toString()]
                            );
                            value = parseObjectResponse.res;
                            iterator = parseObjectResponse.endIdx + 1;
                            continue;
                        } else if (char === "#") {
                            valueType = "variable";
                            charStack.push(char);
                        } else {
                            throw new Error(`error at index ${iterator}`);
                        }
                    } else if (!value) {
                        if (valueType === "string") {
                            if (char === '"') {
                                let top: string = charStack.pop();
                                let stackPopCounter: number = 0;
                                value = "";
                                while (top !== '"') {
                                    if (!charStack.length) {
                                        throw new Error(
                                            `error at index ${
                                                iterator - stackPopCounter
                                            }`
                                        );
                                    }
                                    stackPopCounter++;
                                    value = top + value;
                                    top = charStack.pop();
                                }
                            } else {
                                charStack.push(char);
                            }
                        } else if (valueType === "number") {
                            if (char >= "0" && char <= "9") {
                                charStack.push(char);
                            } else if (
                                char === "," ||
                                (char === "}" && objectType === "object") ||
                                (char === "]" && objectType === "array") ||
                                formatting.test(char)
                            ) {
                                let top: string = charStack.pop();
                                let stackPopCounter: number = 0;
                                value = "";
                                while (top >= "0" && top <= "9") {
                                    if (!charStack.length) {
                                        throw new Error(
                                            `error at index ${
                                                iterator - stackPopCounter
                                            }`
                                        );
                                    }
                                    stackPopCounter++;
                                    value = top + value;
                                    top = charStack.pop();
                                }
                                charStack.push(top);
                                // don't change iterator here
                                continue;
                            } else {
                                throw new Error(`error at index ${iterator}`);
                            }
                        } else if (valueType === "variable") {
                            if (
                                char === "," ||
                                (char === "}" && objectType === "object") ||
                                (char === "]" && objectType === "array") ||
                                formatting.test(char)
                            ) {
                                value = "";
                                let top: string = charStack.pop();
                                while (top !== "#") {
                                    if (!charStack.length) {
                                        throw new Error(
                                            `invalid variable name at index ${iterator}`
                                        );
                                    }
                                    value = top + value;
                                    top = charStack.pop();
                                }
                                if (!variableNameRegex.test(value)) {
                                    throw new Error(
                                        `invalid variable name ${value} at index ${iterator}`
                                    );
                                }
                                // do not change value here
                                let variablePaths: string[][] = [];
                                if (variableMap.has(value)) {
                                    variablePaths = variableMap.get(value);
                                }
                                variablePaths.push([...path, key.toString()]);
                                variableMap.set(value, variablePaths);
                                value = "#" + value;
                                continue;
                            } else {
                                charStack.push(char);
                            }
                        }
                    } else {
                        if (formatting.test(char)) {
                            iterator++;
                            continue;
                        }
                        if (char === ",") {
                            if (objectType === "object") {
                                isKey = false;
                                isValue = false;
                                res[key] = value;
                                valueType = null;
                                key = null;
                                value = null;
                            } else {
                                isValue = true;
                                res.push(value);
                                key = res.length;
                                isKey = false;
                                valueType = null;
                                value = null;
                            }
                        } else if (char === "}" && objectType === "object") {
                            let top: string = charStack.pop();
                            if (top !== "{") {
                                throw new Error(`error at index ${iterator}`);
                            }
                            isKey = false;
                            isValue = false;
                            isOpen = false;
                            res[key] = value;
                            break;
                        } else if (char === "]" && objectType === "array") {
                            let top: string = charStack.pop();
                            if (top !== "[") {
                                throw new Error(`error at index ${iterator}`);
                            }
                            isKey = false;
                            isValue = false;
                            isOpen = false;
                            res.push(value);
                            break;
                        } else {
                            throw new Error(`error at index ${iterator}`);
                        }
                    }
                }
            } else {
                if (formatting.test(char)) {
                    iterator++;
                    continue;
                }
                // parenthesis is not open
                if (char === "{") {
                    charStack.push("{");
                    isOpen = true;
                    objectType = "object";
                    res = {};
                } else if (char === "[") {
                    charStack.push("[");
                    isOpen = true;
                    objectType = "array";
                    res = [];
                } else {
                    throw new Error(`error parsing value at index ${iterator}`);
                }
            }
            iterator++;
        }
        if (isOpen) {
            throw new Error(`error parsing value, unclosed parenthesis`);
        }
        return {
            res,
            endIdx: iterator,
        };
    }

    /**
     * Injects variables into the parsed VJSON object.
     * @param {Record<string, any>} injectedVariables - An object containing variables to inject.
     * @returns {any} - The parsed VJSON object with injected variables.
     * @throws {Error} - Throws an error if any injected variables are missing.
     */
    inject(injectedVariables: Record<string, any>): any {
        let foundVariables: Set<string> = new Set();
        Object.keys(injectedVariables).forEach((variable: string) => {
            if (!this.variableKeyPathMap.has(variable)) {
                return;
            }
            foundVariables.add(variable);
            let paths: string[][] = this.variableKeyPathMap.get(variable);
            paths.forEach((path: string[]) => {
                this.setValueByPath(
                    this.object,
                    path,
                    injectedVariables[variable]
                );
            });
        });
        if (
            foundVariables.size !== [...this.variableKeyPathMap.keys()].length
        ) {
            throw new Error("Missing variables found");
        }
        return this.object;
    }

    /**
     * Sets the value of an object property based on a given path.
     * @param {any} object - The object to modify.
     * @param {string[]} path - The path to the property.
     * @param {any} value - The value to set.
     * @private
     */
    private setValueByPath(object: any, path: string[], value: any) {
        for (let pathIdx = 0; pathIdx < path.length - 1; pathIdx++) {
            let key = path[pathIdx];
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                object = object[key];
            } else {
                object[key] = {};
                object = object[key];
            }
        }
        object[path[path.length - 1]] = value;
    }
}
