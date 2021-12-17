# setup-env

We've reached peak programming. Complex toolchains making our development lives
easier. So why not apply this to testing. But instead of complex, we just
run a couple of scripts, instead of massive configuration files, just nothing
and instead of you writing code, a module that does it for you. Sounds to good
to be true? It probably is, sorry.

You might wonder how this project will actually help you out, it automates the
following setup process's for your tests:

- Babel integration, ensures your tests are compiled with the same babel presets
  as the rest of your code.
- Set the correct env, something that is easily forgotten, `NODE_ENV=test`, but
  we gotchu fam.
- Support for loading static files using `require`. Not as fancy as WebPack, at
  least it will make your code run instead of throw.
- Shallow rendering, correctly setup and pre-configured with JSDOM, as it should.

Still not convinced? Here's some _expert_ reviews:

```
This shizz is lit fam       require, done, izipizi    Best module ever installed
          - Ya homies            - Your co-workers              - Everybody else
```

/s

## Installation

The package is released in the public npm registry under the `setup-env` name
and should be installed as `devDependency` in your project:

```
npm install --save-dev setup-env
```

Then require the file before your tests are imported, for example with `mocha`
you can use the `--require` file to achieve this:

```
mocha --require setup-env ./test/*.test.js
```

And for `jest` you can leverage the `setupFiles` array in your `jest.config.js`:

```js
{
  setupFiles: ['setup-env']
}
```

And that's it, your project is configured.

## Configuration

First of all, **configuration is optional**, this library works out of the box
for the dependencies you have installed in your project. Customizing how we
setup the environment is done using a special `setup` key in your `package.json`:

```js
{
  "name": "example-package",
  "description": "ignore this, this is content filler",
  ...

  "setup": {
    "userAgent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:38.9)"
  },

  ...
  "devDependencies": {
    "@babel/register": "latest",
    "enzyme-adapter-react-17": "latest",
    ...
  }
}
```

The following keys inside the `setup` object can be configured:

- [steps](#steps)
- [babel](#babel)
- [jsdom](#jsdom)
- [enzyme](#enzyme)
- [loaders](#loaders)
- [extensions](#extensions)

### steps

These are the steps that we execute (in order) to prepare the environment for
testing. The following steps are executed:

- `env` Ensure that a proper `NODE_ENV` is set before testing.
- `register` Enable `@babel/register` or the ancient `babel-register`.
- `enzyme` Automatically configure the Enzyme adapter.
- `jsdom` Prepare the environment with JSDOM.
- `static` Allows requiring of static files such as `.css` and `.jpg` files.

```js
{
  "setup": {
    "steps": ['static']
  }
}
```

The code above will prevent every step to run, except our `static` integration.
Please note, that you don't need to explicitly turn off the `enzyme` or
`register` steps if you don't use `@babel/register` or `enzyme` in your project.
This project is smart enough to ignore them if they are not installed.

### babel

Provide custom options to the `@babel/register` loader. This gives you full
control on how babel processes the files that you require in your test suite.

```js
{
  "setup": {
    "babel": {
      "cache": false
    }
  }
}
```

It also support the ancient `babel-register` package, if you are building a
new project we encourage you to use the latest and greatest.

### jsdom

Introduces JSDOM based globals in the environment so you can use `window`,
`document` and other DOM based globals in your test suite without issues.
Additionally this will ensure that the `{ mount }` functionality of `enzyme`
works.

```js
{
  "setup": {
    "jsdom": {
      "storageQuota": 10000000,
      "referrer": "https://example.com/"
    }
  }
}
```

Additional, the `userAgent` can be configured using the `userAgent` key in
`setup`.

### enzyme

We currently do a best effort in finding the correct Enzyme adapter. We'll
search your dependencies for package names that match the
`enzyme-adapter-react-(version number)` string and use those as adapters. When
we're unable to find these adapters we'll start guessing which adapter to use
based on the `react` version you have installed as dependency.

If everything fails, or you have to resolve to using a custom adapter you can
force the resolving of the adapter through our configuration.

```js
{
  "setup": {
    "enzyme": {
      "adapter": "@wojtekmaj/enzyme-adapter-react-17"
    }
  }
}
```

### extensions

It's not uncommon that you compile your code with WebPack and that you import
asserts inside your code such as css files or static images. These are not
supported by Node as it only understands JavaScript. We will automatically
patch the environment to ensure that these dependencies can be loaded inside
Node.js. The `extensions` option allows you to configure which extensions need
to be patched. We have a list with common media types for css, fonts, images
and video/audio files. But you can create your own list using this option.

```js
{
  "setup": {
    "extensions": [
      ".css",
      ".sass",
      ".example"
    ]
  }
}
```

### loaders

This option is used in pair with the `extensions` configuration. By default we
will have the custom extension support return the path of the file that is
loaded so you can easily assert that the correct files are loaded. However it's
possible that you want to have a custom loader, so you can return something
else. The loaders object allows you to provide a mapping between extensions
and custom loader files that can be required.

```js
{
  "setup": {
    "loaders": {
      ".css": "css-loader-module-name"
    }
  }
}
```

And the `css-loader-module-name` module would export a function that receives
a `Module` instance that it can update with what ever it wants to process.

```js
module.exports = function customloader(Module) {
  Module.exports = require('fs').readFileSync(Module.filename);
}
```

## Debugging

This library makes use of `diagnostics` to provide debug information incase
of unexpected failure when preparing the environment. In order to see these
logs you need to start the tests with `DEBUG=setup-env*`:

```
DEBUG=setup-env* npm test
```

## License

[MIT](/LICENSE)
