sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/m/SearchField",
  "sap/m/List",
  "sap/m/StandardListItem",
  "sap/m/Input",
  "sap/m/Label",
  "sap/m/Button",
  "sap/m/Select",
   "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageBox, MessageToast, Dialog, SearchField, List, StandardListItem, Input, Label, Button, Select) {
  "use strict";

  return Controller.extend("com.ui5.train.orders.controller.OrdersCreate", {
    onInit: function () {
      // 1) Load data model from JSON
      var oDataModel = new JSONModel();
      oDataModel.loadData("./webapp/localService/mainService/data/Orders.json");

      // (Optional) expose raw data as a named model if you still need it in the view
      this.getView().setModel(oDataModel, "Orders");

      // 2) After data is loaded, prepare the view model (vm)
      oDataModel.attachRequestCompleted(function () {
        var oData = oDataModel.getData() || {};

        var aOrders = Array.isArray(oData.Orders) ? oData.Orders : [];
        var nextOrderId = this._getNextOrderId(aOrders);

        var oNewOrder = {
          OrderID: nextOrderId,
          CreationDate: new Date().toISOString().split("T")[0],
          ReceivingPlant: "",
          ReceivingPlantDesc: "",
          DeliveringPlant: "",
          DeliveringPlantDesc: "",
          StatusCode: "CR", // Created
          Products: []
        };

        var oViewModel = new JSONModel({
          NewOrder: oNewOrder,
          ReceivingPlants: oData.ReceivingPlants || [],
          DeliveringPlants: oData.DeliveringPlants || [],
          AllProducts: oData.Products || []
        });

        // Set VM as a named model for clear bindings
        this.getView().setModel(oViewModel, "vm");
      }.bind(this));

      // Keep your route hook
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("OrdersCreate").attachPatternMatched(this._onObjectMatched, this);
    },

    _getNextOrderId: function (aOrders) {
      if (!Array.isArray(aOrders) || aOrders.length === 0) {
        return 1;
      }
      return Math.max.apply(null, aOrders.map(function (o) {
        return Number(o.OrderID) || 0;
      })) + 1;
    },

    // ============================
    // Value Help for Receiving Plant
    // ============================
    onReceivingPlantHelp: function () {
      var oViewModel = this.getView().getModel("vm");
      var aPlants = oViewModel.getProperty("/ReceivingPlants") || [];

      var oDialog = new Dialog({
        id: "receivingPlantDialog",
        title: "Select Receiving Plant",
        content: [
          new SearchField({
            id: "receivingSearchField",
            liveChange: function (oEvent) {
              var sQuery = (oEvent.getParameter("newValue") || "").toLowerCase();
              oList.getItems().forEach(function (item) {
                item.setVisible(item.getTitle().toLowerCase().includes(sQuery));
              });
            }
          }),
          new List({ id: "receivingList" })
        ]
      });

      var oList = oDialog.getContent()[1];
      aPlants.forEach(function (p) {
        oList.addItem(new StandardListItem({
          id: "receivingItem_" + p.PlantID,
          title: p.PlantDescription,
          type: "Active",
          press: function () {
            oViewModel.setProperty("/NewOrder/ReceivingPlant", p.PlantID);
            oViewModel.setProperty("/NewOrder/ReceivingPlantDesc", p.PlantDescription);
            oDialog.close();
          }
        }));
      });

      oDialog.addButton(new Button({ id: "receivingCloseBtn", text: "Close", press: function () { oDialog.close(); } }));
      oDialog.open();
    },

    // ============================
    // Value Help for Delivering Plant
    // ============================
    onDeliveringPlantHelp: function () {
      var oViewModel = this.getView().getModel("vm");
      var aPlants = oViewModel.getProperty("/DeliveringPlants") || [];

      var oDialog = new Dialog({
        id: "deliveringPlantDialog",
        title: "Select Delivering Plant",
        content: [
          new SearchField({
            id: "deliveringSearchField",
            liveChange: function (oEvent) {
              var sQuery = (oEvent.getParameter("newValue") || "").toLowerCase();
              oList.getItems().forEach(function (item) {
                item.setVisible(item.getTitle().toLowerCase().includes(sQuery));
              });
            }
          }),
          new List({ id: "deliveringList" })
        ]
      });

      var oList = oDialog.getContent()[1];
      aPlants.forEach(function (p) {
        oList.addItem(new StandardListItem({
          id: "deliveringItem_" + p.PlantID,
          title: p.PlantDescription,
          type: "Active",
          press: function () {
            oViewModel.setProperty("/NewOrder/DeliveringPlant", p.PlantID);
            oViewModel.setProperty("/NewOrder/DeliveringPlantDesc", p.PlantDescription);
            oDialog.close();
          }
        }));
      });

      oDialog.addButton(new Button({ id: "deliveringCloseBtn", text: "Close", press: function () { oDialog.close(); } }));
      oDialog.open();
    },

    // ============================
    // Add Product dialog with quantity input
    // ============================
    onAddProduct: function () {
      var oViewModel = this.getView().getModel("vm");
      var sDeliveringPlant = oViewModel.getProperty("/NewOrder/DeliveringPlant");

      if (!sDeliveringPlant) {
        MessageToast.show("Please select a Delivering Plant first.");
        return;
      }

      var aFiltered = (oViewModel.getProperty("/AllProducts") || [])
        .filter(function (p) { return String(p.DeliveringPlant) === String(sDeliveringPlant); });

      var oDialog = new Dialog({
        id: "addProductDialog",
        title: "Add Product",
        content: [
          new Label({ id: "productSelectLabel", text: "Select Product" }),
          new Select({
            id: "productSelect",
            items: aFiltered.map(function (p) {
              return new sap.ui.core.Item({ key: p.ProductID, text: p.ProductDescription });
            })
          }),
          new Label({ id: "quantityLabel", text: "Enter Quantity" }),
          new Input({ id: "quantityInput", type: "Number", value: "1" })
        ],
        beginButton: new Button({
          id: "addProductConfirmBtn",
          text: "Add",
          press: function () {
            var sProductId = sap.ui.getCore().byId("productSelect").getSelectedKey();
            var iQuantity = parseInt(sap.ui.getCore().byId("quantityInput").getValue(), 10);

            if (!sProductId || isNaN(iQuantity) || iQuantity <= 0) {
              MessageToast.show("Please select a product and enter a valid quantity.");
              return;
            }

            var oProduct = aFiltered.find(function (p) { return String(p.ProductID) === String(sProductId); });
            this._addProductToOrder(oProduct, iQuantity);
            oDialog.close();
          }.bind(this)
        }),
        endButton: new Button({ id: "addProductCancelBtn", text: "Cancel", press: function () { oDialog.close(); } })
      });

      oDialog.open();
    },

    _addProductToOrder: function (oProduct, iQuantity) {
      var oViewModel = this.getView().getModel("vm");
      var oNewOrder = oViewModel.getProperty("/NewOrder");

      var oNewProduct = {
        ProductID: oProduct.ProductID,
        ProductDescription: oProduct.ProductDescription,
        Quantity: iQuantity,
        PricePerQuantity: oProduct.PricePerQuantity,
        TotalPrice: oProduct.PricePerQuantity * iQuantity
      };

      oNewOrder.Products.push(oNewProduct);
      oViewModel.refresh(true);
    },

    onDeleteProduct: function () {
      var oTable = this.byId("productsTable");
      var aSelected = oTable.getSelectedItems();

      if (aSelected.length === 0) {
        MessageToast.show("Please select at least one product to delete.");
        return;
      }

      MessageBox.confirm("Are you sure you want to delete selected item(s)?", {
        onClose: function (oAction) {
          if (oAction === "OK") {
            var oViewModel = this.getView().getModel("vm");
            var aProducts = oViewModel.getProperty("/NewOrder/Products");

            aSelected.forEach(function (item) {
              var sProductDesc = item.getBindingContext("vm").getObject().ProductDescription;
              aProducts = aProducts.filter(function (p) { return p.ProductDescription !== sProductDesc; });
            });

            oViewModel.setProperty("/NewOrder/Products", aProducts);
            oViewModel.refresh(true);
          }
        }.bind(this)
      });
    },

    onSave: function () {
      var oViewModel = this.getView().getModel("vm");
      var oNewOrder = oViewModel.getProperty("/NewOrder");

      if (!oNewOrder.ReceivingPlant || !oNewOrder.DeliveringPlant || oNewOrder.Products.length === 0) {
        MessageToast.show("Please fill all fields and add at least one product.");
        return;
      }

      // Append to Orders array in the raw data model if you want to keep it in-memory
      var oDataModel = this.getView().getModel("Orders");
      var oData = oDataModel.getData() || {};
      oData.Orders = Array.isArray(oData.Orders) ? oData.Orders : [];
      oData.Orders.push(oNewOrder);
      oDataModel.refresh(true);

      MessageToast.show("Order " + oNewOrder.OrderID + " created successfully!");
      this.onNavBack();
    },

    onCancel: function () {
      MessageBox.confirm("Are you sure you want to cancel?", {
        onClose: function (oAction) {
          if (oAction === "OK") {
            this.onNavBack();
          }
        }.bind(this)
      });
    },

    onNavBack: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteOrdersMain", null);
    }
   



  });
});