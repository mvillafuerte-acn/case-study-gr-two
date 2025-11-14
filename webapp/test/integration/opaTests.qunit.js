/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["com/ui5/train/orders/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
