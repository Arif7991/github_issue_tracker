## 1. What is the difference between var, let, and const?

**var:
 Function‑scoped or globally‑scoped. It can be redeclared and updated. Hoisted to the top of its scope and initialised as `undefined`

**let: 
Block‑scoped (within `{}`). It can be updated but not redeclared in the same scope. Hoisted but not initialised – accessing it before declaration results in a `ReferenceError` (Temporal Dead Zone)

**const:
 Block‑scoped. It cannot be updated or redeclared. Must be initialised at the time of declaration. For objects and arrays, the reference is constant, but their properties/elements can still be modified.

## 2. What is the spread operator (...)?

The spread operator (`...`) allows an iterable (such as an array, string, or object) to be expanded into individual elements Common uses:

 Copying arrays/objects: `const arr2 = [...arr1];`
 Combining arrays/objects: `const combined = [...arr1, ...arr2];`
 Passing array elements as function arguments: `myFunction(...args);`

## 3. What is the difference between map(), filter(), and forEach()?

**forEach(): 
Executes a provided function once for each array element. It **does not return a new array** (returns `undefined`). Used mainly for side‑effects (e.g., logging, modifying external variables).

**map():
 Creates a **new array** populated with the results of calling a provided function on every element. Used for transforming data.

**filter():
 Creates a **new array** containing only the elements that pass a condition (the provided function returns `true`). Used for selecting a subset of an array.

## 4. What is an arrow function?

An arrow function is a compact alternative to a traditional function expression, using the `=>` syntax. Key characteristics:

Shorter syntax: `const add = (a, b) => a + b;`
 Does **not** have its own `this`, `arguments`, `super`, or `new.target`. It inherits `this` from the enclosing (parent) scope – ideal for callbacks and methods where you want to preserve context.
Cannot be used as a constructor (i.e., cannot be called with `new`).

## 5. What are template literals?

Template literals are string literals enclosed by backticks (`` ` ``) instead of single or double quotes. They provide:

 **String interpolation**: Embed expressions using `${expression}`. Example: `` `Hello, ${name}!` ``
 **Multi‑line strings**: They can span multiple lines without needing escape characters.
 **Tagged templates**: A more advanced feature that allows parsing template literals with a function.