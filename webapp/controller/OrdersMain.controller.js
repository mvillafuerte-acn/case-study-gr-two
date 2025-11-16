sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter"    
], function(Controller, JSONModel, MessageBox, Sorter) {
    "use strict";

    return Controller.extend("com.ui5.train.orders.controller.OrdersMain", {
        onInit: function() {            

        },

        onDelete: function() {
            let oBundle = this.getView().getModel("i18n").getResourceBundle();
            let sMsgHeader = oBundle.getText("message.onDelete")
            let oTable = this.byId("ordersTable");
            let aSelectedItems = oTable.getSelectedItems();
        
            if (aSelectedItems.length > 0) {
                let sMessage = oBundle.getText("message.onDelete.Confirmation");                 
                aSelectedItems.forEach(function(item) {                
                    MessageBox.show(sMessage, {
                        title: sMsgHeader,
                        styleClass: "sapUiSizeCompact",
                        actions: [sap.m.MessageBox.Action.OK],
                        onClose: function(oAction) {
                            //Delete data here
                        }
                    });                                        
            });
            } else {
                let sMessage = oBundle.getText("message.onDelete.SelectItem");
                //Raise message Please select an item from the table
                MessageBox.error(sMessage,{
                        title: sMsgHeader,
                        styleClass: "sapUiSizeCompact",
                        actions: [sap.m.MessageBox.Action.OK],
                        onClose: function(oAction) {
                            //no action after close
                        }
                });
            }

        }
    });
});