# CHANGELOG

# 1.2.6

- Revert #3, it was preventing test, ci, from exiting cleanly. Some references
  are probably not cleaned up properly.

# 1.2.4 - 1.2.5

- Change the order of operations, see #3

# 1.2.3

- Allow `setup-env/jsdom` to expose the created `jsdom` instance.

## 1.2.2

- Fixed auto generation of enzyme adapters based of the `React.version`.
- Added debug information on why Enzyme adapters might be failing.

## 1.2.1

- Added `.npmignore`

## 1.2.0

- Added support for automatic plugin detection for assertion libraries.
- Clear debug statement about which `babel-register` is loaded

## 1.1.0

- Added support for the ancient `babel-register` so it's easier to migrate
  tests.

## 1.0.0

- Initial release.
