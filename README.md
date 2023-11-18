[![Actions Status](https://github.com/Codibre/nodejs-generic-memoizer/workflows/build/badge.svg)](https://github.com/Codibre/nodejs-generic-memoizer/actions)
[![Actions Status](https://github.com/Codibre/nodejs-generic-memoizer/workflows/test/badge.svg)](https://github.com/Codibre/nodejs-generic-memoizer/actions)
[![Actions Status](https://github.com/Codibre/nodejs-generic-memoizer/workflows/lint/badge.svg)](https://github.com/Codibre/nodejs-generic-memoizer/actions)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a6790604f4031ea02e4f/test_coverage)](https://codeclimate.com/github/codibre/nodejs-generic-memoizer/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/a6790604f4031ea02e4f/maintainability)](https://codeclimate.com/github/codibre/nodejs-generic-memoizer/maintainability)
[![Packages](https://david-dm.org/Codibre/nodejs-generic-memoizer.svg)](https://david-dm.org/Codibre/nodejs-generic-memoizer)
[![npm version](https://badge.fury.io/js/nodejs-generic-memoizer.svg)](https://badge.fury.io/js/nodejs-generic-memoizer)

Boost your JavaScript application's performance with **generic-memoizer** – a versatile and efficient memoization library.

Seamlessly integrate it with your project using dependency injection and choose from a variety of strategies to initialize memoization contexts. Whether handling asynchronous operations, optimizing for concurrency, or improving API response times, "generic-memoizer" has you covered. Explore features like AsyncLocalStoreGetter for safe access to objects, Apm StoreGetter for easy integration with Elastic APM, and flexible methods like get, wrap, and replace for fine-tuned control over memoization. Elevate your code's efficiency and responsiveness – try "generic-memoizer" today!

## How to Install

```
npm i generic-memoizer
```

## Memoization: Optimizing Function Performance

### What is Memoization?

Memoization is a powerful optimization technique used in computer science and programming to enhance the performance of functions by caching their results. The core idea is to store the output of expensive function calls and return the cached result when the same inputs occur again. This eliminates redundant calculations, reducing computation time and resource usage.

### How Does it Work?

When a function is memoized, its input parameters serve as keys to a cache, and the corresponding output is stored. Subsequent calls with the same inputs retrieve the cached result instead of recalculating, resulting in faster and more efficient execution.

### Key Benefits:

Improved Performance: Reduces redundant calculations, leading to faster function execution.
Resource Efficiency: Minimizes the use of computational resources by storing and reusing calculated results.
Optimal for Recurring Computations: Particularly beneficial for functions with repetitive or recursive patterns.

## Using "generic-memoizer":

Our library, **generic-memoizer**, empowers you to easily implement memoization in your JavaScript applications. With support for various memoization strategies, integration with popular frameworks, and flexibility in context management, it provides a comprehensive solution to boost the efficiency of your functions

## How to use it

generic-memoizer is meant to be used with dependency injection, but you can do whatever you feel is fitting. The first way is the most recommended one, using an AsyncLocalStoreGetter. This one uses async-hooks to create a context that will have access to the object in a safe scope, no matter how many concurrent requests you have in your API, for example. To do it, first inject a singleton instance of your store:

```ts
injectItWithYourInjectionFramework(InjectionSymbol1, new AsyncLocalStoreGetter())
```

If you want to have two separate stores for the same request, you can achieve this by specifying a discrimination symbol:

```ts
injectItWithYourInjectionFramework(InjectionSymbol2, new AsyncLocalStoreGetter(Symbol('MySeparateStore')))
```

Now, you must inject your singleton instance of **GenericMemoizer**:

```ts
injectItWithYourInjectionFramework(InjectionSymbol3, new GenericMemoizer(getInjected(InjectionSymbol1)));
```

Note that, for this instance of GenericMemoizer, we used the first store getter we created. If you want to have separate stores, you'll need different instances of GenericMemoizer. With everything set up, you just need to call your function using the **get** method:

```ts
const result = await memoizer.get('memoization key', async () => {
  ... some processing ...
  return myResult;
});
```
This way, if any value is already memoized in the given context, it will be returned.

## Particularities of AsyncLocalStoreGetter

The **AsyncLocalStoreGetter** will not work under the hood, as we described above. But don't worry, it's just a small detail that's worth mentioning: The async context does not exist if not created. So, you need to create it for the memoizer using it to work. You have two ways to do it:

* Run

```ts
storeGetter.run(async () => {
  ... Everything inside this callback can access the memoization context ...
})
```

* Start
```ts
storeGetter.start();
... Everything after the above call and into the same Promise chain, will have access to the context
```

We recommend using run whenever possible, but start can be used when, for example, integrating this library with an Express middleware. This is because you can't put all the following middlewares inside run's callback. In any situation like that, start is a better fit.


## RecordLocalStoreGetter

This built-in **RecordLocalStoreGetter** uses a plain JavaScript object with no context control to work. We only recommend using it if you have total control over the scope execution. For instance, we do not advise using it as a Singleton instance of an API, as it may lead to a memory leak. However, you can use it with an API if you can inject it as 'in request scope' with the injection framework you're using. For general purposes, it's hard to go wrong using the **AsyncLocalStoreGetter**, so we recommend it whenever possible

## ApmStoreGetter

The **ApmStoreGetter** uses the current instance of elastic-apm-node's transaction to control the memoization scope. If your API is monitored by it, this is a good way to have memoization scope under the hood in your route, as you don't need to initialize the scope manually.

## Other ways to memoize a method

Besides **get**, you can also generate a memoized version of a function with **wrap**:

```ts
const memoizedMyFunction = memoizer.wrap(myFunction, (param1, param2) => `${param1}:${param2}`);
```

The second parameter will receive the same parameters as **myFunction** and must be used to define the memoization key based on them. You can wrap functions even when no context is initialized on the store getter, so it is a valid approach to do it during the application bootstrap.

Another way to do it is using the **replace** method, where you can memoize an instance method, like this:

```ts
memoizer.replace(myInstance, 'myMethod', (param1, param2) => `${param1}:${param2}`);
```

Here, **myInstance.myMethod** is replaced by a memoized version of it. This strategy is also good to use during the bootstrap of your application.

## License

Licensed under [MIT](https://en.wikipedia.org/wiki/MIT_License).
