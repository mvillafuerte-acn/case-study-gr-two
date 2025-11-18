sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter" 
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, MessageToast, History) {
        "use strict";
 
         return Controller.extend("com.ui5.train.orders.controller.DetailPage", {
            onInit: function () {
                // Get the router object
                var oRouter = this.getOwnerComponent().getRouter(this);

                oRouter.getRoute("DetailPage").attachPatternMatched(this._onObjectMatched, this);
            },
 
            _onObjectMatched: function (oEvent) {
                // Get the passed value from arguments
                var sId = oEvent.getParameter("arguments").OrderID;
                console.log(sId);
                var sPath = this.getView().getModel().createKey("OrderSet", {
                    OrderID: sId
                });

                

            }
           
        });
    });