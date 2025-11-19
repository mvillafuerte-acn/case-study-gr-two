sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function(Controller, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("com.ui5.train.orders.controller.OrderDetails", {

        onInit: function() {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteOrderDetails")
                .attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function(oEvent) {
            this._currentOrderIndex = parseInt(oEvent.getParameter("arguments").sIndex);

            const oModel = this.getOwnerComponent().getModel("orderdetails");
            const oOrder = oModel.getProperty(`/Orders/${this._currentOrderIndex}`);

            // ❗ IMPORTANT FIX:
            // DO NOT deep copy or modify data here.
            // Just show the existing object so status remains unchanged.
            this.getView().setModel(new JSONModel(oOrder), "orderdetails");

            // Optional: highlight in main table
            const oTable = this.byId("ordersTable");
            if (oTable) {
                oTable.removeSelections();
                const aItems = oTable.getItems();
                if (aItems[this._currentOrderIndex]) {
                    oTable.setSelectedItem(aItems[this._currentOrderIndex]);
                }
            }
        },

        // Navigate to edit screen
        onEdit: function() {
            this.getOwnerComponent()
                .getRouter()
                .navTo("RouteOrdersEdit", { sIndex: this._currentOrderIndex });
        },

        // Always return to main page
        onCancel: function() {
            MessageBox.confirm(
                "Are you sure you want to go back to the main page?",
                {
                    title: "Leave Order Details",
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: (action) => {
                        if (action === "OK") {
                            this.getOwnerComponent().getRouter()
                                .navTo("RouteOrdersMain", {}, true);
                        }
                    }
                }
            );
        }

    });
});
