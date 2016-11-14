'use strict';

const webdriver = require('selenium-webdriver');

// Needs Geckodriver in your PATH
const driver = new webdriver.Builder()
  .forBrowser('firefox')
  .build();

const script = 'var wp = window.performance.timing;' +
  'return wp.domComplete - wp.navigationStart;';

driver.get('http://2016.seleniumconf.co.uk/')
  .then(() =>
    driver.executeScript(script)
  )
  .then((result) => {
    console.log('DOMComplete: %d ms', result);
  })
  .finally(driver.quit);
