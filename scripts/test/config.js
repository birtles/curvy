require.config({
  baseUrl: '..',
});

require(['test/parsing', 'test/compute-widths'], function() {
  QUnit.start();
});
