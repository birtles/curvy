require.config({
  baseUrl: '..',
});

require(['test/parsing'], function() {
  QUnit.start();
});
