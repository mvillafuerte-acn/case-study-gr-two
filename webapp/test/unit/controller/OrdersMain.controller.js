/*global QUnit*/

sap.ui.define([
	"com/ui5/train/orders/controller/OrdersMain.controller"
], function (Controller) {
	"use strict";

	QUnit.module("OrdersMain Controller");

	QUnit.test("I should test the OrdersMain controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
