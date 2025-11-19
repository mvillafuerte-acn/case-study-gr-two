sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
     "sap/ui/core/routing/History"
], function(Controller, JSONModel, MessageBox, Sorter, Filter, History) {
    "use strict";

    return Controller.extend("com.ui5.train.orders.controller.OrderDetails", {
          onInit: function() {                             
           this.getOwnerComponent().getRouter().getRoute("RouteOrderDetails").attachPatternMatched(this._onObjectMatched, this);                                 
        },
        _onObjectMatched: function (oEvent) {           
            let sIndex = oEvent.getParameter("arguments").sIndex;
            let oModel = this.getOwnerComponent().getModel("orderdetails");
            let oSelectedOrder = oModel.getProperty("/Orders");
            let oFilteredModel = new sap.ui.model.json.JSONModel(oSelectedOrder[sIndex]);
            this.getView().setModel(oFilteredModel, "orderdetails");            
           
    }     
             
    });
});