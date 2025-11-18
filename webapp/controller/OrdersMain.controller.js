sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter" ,
    "sap/m/MessageToast"   
], function(Controller, JSONModel, MessageBox, Sorter, MessageToast) {
    "use strict";

    return Controller.extend("com.ui5.train.orders.controller.OrdersMain", {
        onInit: function() {            
            // Create a new JSON model
            var oModel = new JSONModel();
            // Load data from external JSON file
            oModel.loadData("./webapp/localService/mainService/data/Orders.json");
            // Set the model to the view
            this.getView().setModel(oModel, "Orders");          

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
            

        },

    
        onAdd: function () {
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("OrdersCreate", null);
       
        },


    


    });
});