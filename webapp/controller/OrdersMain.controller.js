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
            let oModel = new JSONModel();
            oModel = this.getOwnerComponent().getModel("orderdetails");
            let iOrders = oModel.getProperty("/Orders");
            //Sort data ascending by Order ID
            iOrders.sort(function(a, b){
                return a.OrderID - b.OrderID;
            });
            oModel.setProperty("/Orders", iOrders);
            this.getView().setModel(oModel, "orderdetails");  

            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOrdersMain").attachPatternMatched(this._onRouteMatched, this);          
        },

        onPressOrder: function(oEvent) {            
            let sPath = oEvent.getSource().getBindingContextPath();
            let splitPath = sPath.split("/");
            let sIndex = splitPath[2];

            this.getOwnerComponent().getRouter().navTo("RouteOrderDetails", {
                sIndex: sIndex
            });
        },
        
        onDelete: function() {            
            let oBundle = this.getView().getModel("i18n").getResourceBundle();
            let sMsgHeader = oBundle.getText("message.onDelete")
            let oTable = this.byId("ordersTable");
            let aSelectedItems = oTable.getSelectedItems();
            let oModel = this.getView().getModel("orderdetails");
            //let oModel = this.getOwnerComponent().getModel();
            let iPending = aSelectedItems.length;
                                            
            if (aSelectedItems.length > 0) {
                let sMessage = oBundle.getText("message.onDelete.Confirmation");                                 
                aSelectedItems.forEach(function(item) {                    
                    let sPath = item.getBindingContextPath();               
                    MessageBox.show(sMessage, {
                        title: sMsgHeader,
                        styleClass: "sapUiSizeCompact",
                        actions: [sap.m.MessageBox.Action.OK],
                        onClose: function(oAction) {
                            //Code to delete data here     
                            let splitPath = sPath.split("/");
                            let sIndex = splitPath[2];
                            let aData = oModel.getProperty("/Orders").splice(sIndex, 1);
                            let rData = oModel.getProperty("/Orders");
                            oModel.setProperty("/Orders", rData);
                                                                                           
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


        onSearch: function() {
             //get order id
            let sOrderID = this.byId("ordersInput").getValue();
            let rDate  = this.byId("DRS1").getValue();
            let oSelectedStatus = this.byId("statusBox").getSelectedKeys();            
            //get table data
            let oTable = this.byId("ordersTable");
            let oBinding = oTable.getBinding("items");            
            if (sOrderID != "") {                
                //set filter details
                let oFilter = new sap.ui.model.Filter("OrderID", sap.ui.model.FilterOperator.EQ, sOrderID);
                //filter table items
                oBinding.filter([oFilter]);                
            };
            if (rDate != "") {
                let oFilterDate = new sap.ui.model.Filter("OrderDate", sap.ui.model.FilterOperator.EQ, rDate);
                oBinding.filter([oFilterDate]);
            };
            if (oSelectedStatus != "") {
                let oFilterStatus = new sap.ui.model.Filter("StatusID", sap.ui.model.FilterOperator.EQ, oSelectedStatus);
                oBinding.filter([oFilterStatus]);                
            }






        },

    
        onAdd: function () {
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("OrdersCreate", null);
       
        }


        

    
    });
});