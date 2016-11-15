'use strict';

const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const path = require('path');

const profile = new firefox.Profile();
// HAR export - see http://www.softwareishard.com/blog/har-export-trigger/
profile.setPreference('extensions.netmonitor.har.enableAutomation', true);
profile.setPreference('extensions.netmonitor.har.contentAPIToken', 'supersecrettoken');
profile.setPreference('extensions.netmonitor.har.autoConnect', true);
profile.setPreference('devtools.netmonitor.har.includeResponseBodies', false);

// Download from the version page, the default URL shows wrong latest version
// https://addons.mozilla.org/sv-se/firefox/addon/har-export-trigger/versions/?page=1#version-0.5.0-beta.10
profile.addExtension(path.resolve(path.join(__dirname, '..', '/support/har_export_trigger-0.5.0-beta.10-fx.xpi')));

const ffOptions = new firefox.Options();
ffOptions.setProfile(profile);

// Needs Geckodriver in your PATH
const driver = new webdriver.Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(ffOptions)
  .build();

const script = `
            var callback = arguments[arguments.length - 1];
            function triggerExport() {
              HAR.triggerExport({'token':'supersecrettoken', 'getData':true})
                .then((result) => {
                  // Fix timings via performance.timing, see https://github.com/firebug/har-export-trigger/issues/5
                  var har = JSON.parse(result.data);
                  var t = performance.timing;
                  var pageTimings = har.log.pages[0].pageTimings;
                  pageTimings.onContentLoad = t.domContentLoadedEventStart - t.navigationStart;
                  pageTimings.onLoad = t.loadEventStart - t.navigationStart;
                  har.log.pages[0].title = document.title;
                  return callback({'har': JSON.stringify(har)});
              })
              .catch((e) => callback({'error': e}));
            };
            if (typeof HAR === 'undefined') {
              addEventListener('har-api-ready', triggerExport, false);
            } else {
              triggerExport();
            }`;

driver.get('http://2016.seleniumconf.co.uk/')
  .then(() =>
    driver.executeAsyncScript(script)
  )
  .then((result) => {
    if (result.error) {
      console.error('Could not get the HAR %s', result.error);
    } else {
      console.log(result.har);
    }
  })
  .finally(driver.quit);
