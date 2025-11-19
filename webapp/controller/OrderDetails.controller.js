sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageBox, Sorter, Filter, History) {
    "use strict";

    return Controller.extend("com.ui5.train.orders.controller.OrderDetails", {

        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteOrderDetails")
                .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            let sIndex = oEvent.getParameter("arguments").sIndex;

            let oModel = this.getOwnerComponent().getModel("orderdetails");
            let aOrders = oModel.getProperty("/Orders");

            let oSelectedOrder = aOrders[sIndex];

            // Set the selected order into a local model for detail binding
            this.getView().setModel(new JSONModel(oSelectedOrder), "orderdetails");

            // Store OrderID to allow editing later
            this._currentOrderID = oSelectedOrder.OrderID;
        },

        onEdit: function () {
            let oModel = this.getOwnerComponent().getModel("orderdetails");
            let aOrders = oModel.getProperty("/Orders");

            // Find order index using OrderID
            let iIndex = aOrders.findIndex(order => order.OrderID === this._currentOrderID);

            if (iIndex === -1) {
                MessageBox.error("Order not found.");
                return;
            }

            // Navigate to edit view
            this.getOwnerComponent().getRouter().navTo("RouteOrdersEdit", { sIndex: iIndex });
        },

        // ==========================================
        // CANCEL BUTTON → return to OrdersMain LIST
        // ==========================================
        onCancel: function () {
            let oHistory = History.getInstance();
            let sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                // User came from OrdersMain → go back normally
                window.history.go(-1);
            } else {
                // User opened detail directly → navigate to main list
                this.getOwnerComponent().getRouter().navTo("RouteOrdersMain", {}, true);
            }
        }

    });
});
