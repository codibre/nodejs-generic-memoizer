[![Actions Status](https://github.com/Codibre/nodejs-generic-memoizer/workflows/build/badge.svg)](https://github.com/Codibre/nodejs-generic-memoizer/actions)
[![Actions Status](https://github.com/Codibre/nodejs-generic-memoizer/workflows/test/badge.svg)](https://github.com/Codibre/nodejs-generic-memoizer/actions)
[![Actions Status](https://github.com/Codibre/nodejs-generic-memoizer/workflows/lint/badge.svg)](https://github.com/Codibre/nodejs-generic-memoizer/actions)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a6790604f4031ea02e4f/test_coverage)](https://codeclimate.com/github/codibre/nodejs-generic-memoizer/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/a6790604f4031ea02e4f/maintainability)](https://codeclimate.com/github/codibre/nodejs-generic-memoizer/maintainability)
[![Packages](https://david-dm.org/Codibre/nodejs-generic-memoizer.svg)](https://david-dm.org/Codibre/nodejs-generic-memoizer)
[![npm version](https://badge.fury.io/js/nodejs-generic-memoizer.svg)](https://badge.fury.io/js/nodejs-generic-memoizer)

A flexible library for function memoization

## How to Install

```
npm i generic-memoizer
```

## How to use it

generic-memoizer is meant to use with dependency injection, but you can do whatever you feel fit. The first way
is the most recommended one, using a **AsyncLocalStoreGetter**. This one uses async-hooks to create a context that will have access to the object in a safe scope, no matter how many concurrent requests you have in your api, for example. To do it, first, inject a singleton instance of your store:

```ts
injectItWithYourInjectionFramework(InjectionSymbol1, new AsyncLocalStoreGetter())
```

If you want to have two separate store for the same request, you do it by specifying a discrimination symbol:

```ts
injectItWithYourInjectionFramework(InjectionSymbol2, new AsyncLocalStoreGetter(Symbol('MySeparateStore')))
```

Now, you must inject your singleton **GenericMemoizer** instance:

```ts
injectItWithYourInjectionFramework(InjectionSymbol3, new GenericMemoizer(getInjected(InjectionSymbol1)));
```

See that, for this instance of GenericMemoizer, we used the first store getter we created. You need to have different GenericMemoizer instances if you want to have separate stores.

Now, with all set, you just need to call your function through the get method:

```ts
const result = await memoizer.get('memoization key', async () => {
  ... some processing ...
  return myResult;
});
```
This way, if any value is already memoized in the given context, it is returned.

## Particularities for AsyncLocalStoreGetter

AsyncLocalStoreGetter will not work under the hoods, as we described above. But afraid not, it's just a little detail that worth telling: The async context does not exist if not created. So, you need to create it so the memoizer using it work. You have to ways to do it:

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

We recommend to use run every time possible, but start can be use when, for example, integrating this library with an Express middleware, as you can't put all the following middlewares inside run's callback. Any situation like that, start is a better fit


## RecordLocalStoreGetter

This built-in LocalStorage uses a plain Javascript object with no context control to work. We only recommend the use of it if you have total control over the scope execution. We do not recommend to use, for example, as a Singleton instance of an API, because it will lead to a memory leak. You, however, use it with an API if you can inject is as "in request scope", with the injection framework you're using. For general purpose, it's hard to make it wrong using **AsyncLocalStoreGetter**, so, prefer it, if possible;

## ApmStoreGetter

Apm StoreGetter uses the current instance of **elastic-apm-node**'s transaction to control the memoization scope. If you have your API monitored by it, this is a good way to have under the hood memoization scope in your route, as you don't need to initialize the scope manually.

## Other ways to memoize a method

Aside from **get**, you can also generate memoized version of a function with **wrap**:

```ts
const memoizedMyFunction = memoizer.wrap(myFunction, (param1, param2) => `${param1}:${param2}`);
```

The second params will receive the same parameters as myFunction, and must be used to defined te memoization key based on them. You can wrap functions even when no context is initialized on the store getter, so it is a valid approach to do it during the application bootstrap


Another way you have to do it is by the **replace** method, where you can memoize a instance method, like this:

```ts
memoizer.replace(myInstance, 'myMethod', (param1, param2) => `${param1}:${param2}`);
```

Here, **myInstance.myMethod** is replaced by a memoized version of it. This strategy is also good to use during bootstrap.

## License

Licensed under [MIT](https://en.wikipedia.org/wiki/MIT_License).
