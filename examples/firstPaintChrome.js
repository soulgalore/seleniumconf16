'use strict';

const webdriver = require('selenium-webdriver');

// Needs Chromedriver in your PATH
const driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build();

const script = 'var firstPaint = window.chrome.loadTimes().firstPaintTime * 1000;' +
    'var startTime = window.chrome.loadTimes().startLoadTime*1000;'
  'return firstPaint - startTime;';

driver.get('http://2016.seleniumconf.co.uk/')
  .then(() =>
    driver.executeScript(script)
  )
  .then((result) => {
    console.log('FirstPaint: %d ms', result);
  })
  .finally(driver.quit);
