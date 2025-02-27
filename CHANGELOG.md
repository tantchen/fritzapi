## 0.13.7

- Upgrade dependencies

## 0.13.3

- Extending AVM Device Interfaces
- Device validation function `isAVMSwitch`,`isAVMBulb`

## 0.13.0

- Add color type
- Add more unit tests
- Add full OSInfoInterface
- Add more test env variables
- Add `eslint` airbnb config
- Add `typedoc` for documentation
- Replace `mocha` & `istanbul` with `jest`
- Replace `request` with `axios`
- Replace `xml2json-light` with `xml2json`
- Remove `bluebird` use native Promise
- Remove `cheerio`
- Fix post form format
- Rewrite legacy js in `typescript`

## 0.12.0

- enable blind controll

## 0.10.3

- expose temperature conversion helpers

## 0.10.2

- bugfix `getThermostatList` not relaying `options`

## 0.10.1

- added `getWindowOpen` polyfill

## 0.10.0

- renamed `getDeviceListInfo` to `getDeviceListInfos`
- changed `getDeviceList` and `getDevice` to always return AINs without spaces. These AINs can directly be passed into the native Fritz!Box api functions.
- added `getDeviceListFiltered` which takes a `filter` object to apply to the devices. Used internally for filtering by `functionbitmask`.

## 0.9.6

- bugfixed OO bitfunctions in object

- moved jslint to pretest
- added first testcase (mocha+chai based)
- added testdir ./test
- npm test testcase look up

- travis workflow: before_install: jslint, before_script: npm test, after_sucess: istanbul coverage
- added istanbul cover (npm run coverage)

## 0.9.0

- **Breaking change**: SSL certificate check is now strict. This will break self-signed certificates that are typically used by AVM Fritz!Box. To connect via HTTPS to such a Fritz!Box add the `strictSSL: false` option:

	fritz.getSessionID(username, password, {
		url: "https://...",
		strictSSL: false
	}).then(function(sid) {
		// ...
	});

- changed `getSwitchPower` and `getBatteryCharge` to return `null` instead of 0 or empty if device is not connected

## 0.8.0

- added object interface
