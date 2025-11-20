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
], function (Controller, JSONModel, MessageBox, MessageToast, Dialog, SearchField, List, StandardListItem, Input, Label, Button, Select, History) {
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

        // Create NewOrder object
        var oNewOrder = {
          OrderID: "", // will set next ID below
          CreationDate: new Date().toISOString().split("T")[0],
          ReceivingPlant: "",
          ReceivingPlantDesc: "",
          DeliveringPlant: "",
          DeliveringPlantDesc: "",
          StatusCode: "CR", // Created
          Products: []
        };

        // Compute next OrderID from orderdetails model (OrdersMain source)
        var nextOrderId = this._getNextOrderIdFromOrdersJSON();
        oNewOrder.OrderID = nextOrderId;

        // Prepare vm model
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

    _getNextOrderIdFromOrdersJSON: function () {
      var oOrdersJSON = this.getOwnerComponent().getModel("orderdetails");
      if (!oOrdersJSON) { return 1; }

      var aOrders = oOrdersJSON.getProperty("/Orders");
      if (!Array.isArray(aOrders) || aOrders.length === 0) { return 1; }

      // Some legacy entries may store OrderID as string – normalize to number
      var maxId = aOrders.reduce(function (max, o) {
        var id = Number(o.OrderID);
        return isNaN(id) ? max : Math.max(max, id);
      }, 0);

      return maxId + 1;
    },
 
    // ============================
    // Value Help for Receiving Plant
    // ============================
    onReceivingPlantHelp: function () {
      var oView = this.getView();
      var oTargetModel = oView.getModel("vm");
      var oReceivingPlantInput = oView.byId("receivingPlantInput");
      var aPlants = oView.getModel("receivingPlantsModel").getData();
      var oDialog;
 
      var oList = new List({
        id: oView.createId("receivingList"),
        selectionMode: "None"
      });
 
      aPlants.forEach(function (p) {
        oList.addItem(new StandardListItem({
          title: p.PlantDescription,
          description: "ID: " + p.PlantID,
          type: "Active",
 
          press: function () {
            oReceivingPlantInput.setValue(p.PlantDescription);
            oTargetModel.setProperty("/NewOrder/ReceivingPlant", p.PlantID);
            oTargetModel.setProperty("/NewOrder/ReceivingPlantDesc", p.PlantDescription);
            oDialog.close();
            oDialog.destroy();
          }
        }));
      });
 
      var oSearchField = new SearchField({
        id: oView.createId("receivingSearchField"),
        liveChange: function (oEvent) {
          var sQuery = (oEvent.getParameter("newValue") || "").toLowerCase();
 
          oList.getItems().forEach(function (item) {
            var sTitle = item.getTitle().toLowerCase();
            var sDescription = item.getDescription().toLowerCase();
            var bVisible = sTitle.includes(sQuery) || sDescription.includes(sQuery);
            item.setVisible(bVisible);
          });
        }
      });
 
      oDialog = new Dialog({
        id: oView.createId("receivingPlantDialog"),
        title: "Select Receiving Plant",
        contentWidth: "400px",
        content: [
          oSearchField,
          oList
        ],
        beginButton: new Button({
          text: "Close",
          press: function () {
            oDialog.close();
            oDialog.destroy();
          }
        }),
 
        afterClose: function () {
          oDialog.destroy();
        }
      });
 
      oView.addDependent(oDialog);
      oDialog.open();
    },
 
 
    // ============================
    // Value Help for Delivering Plant
    // ============================
    onDeliveringPlantHelp: function () {
      var oView = this.getView();
      var oTargetModel = oView.getModel("vm");
      var oDeliveringPlantInput = oView.byId("deliveringPlantInput");
      var aPlants = oView.getModel("deliveryPlantsModel").getData();
      var oDialog;
 
      var oList = new List({
        id: oView.createId("deliveringList"),
        selectionMode: "None"
      });
 
      aPlants.forEach(function (p) {
        oList.addItem(new StandardListItem({
          title: p.PlantDescription,
          description: "ID: " + p.PlantID,
          type: "Active",
 
          press: function () {
            oDeliveringPlantInput.setValue(p.PlantDescription);
            // oTargetModel.setProperty("/NewOrder/DeliveringPlantDesc", p.PlantDescription);     
            oTargetModel.setProperty("/NewOrder/DeliveringPlant", p.PlantID);
            oTargetModel.setProperty("/NewOrder/DeliveringPlantDesc", p.PlantDescription);
            oDialog.close();
            oDialog.destroy();
          }
        }));
      });
 
      var oSearchField = new SearchField({
        id: oView.createId("deliveringSearchField"),
        liveChange: function (oEvent) {
          var sQuery = (oEvent.getParameter("newValue") || "").toLowerCase();
 
          oList.getItems().forEach(function (item) {
            var sTitle = item.getTitle().toLowerCase();
            var sDescription = item.getDescription().toLowerCase();
            var bVisible = sTitle.includes(sQuery) || sDescription.includes(sQuery);
            item.setVisible(bVisible);
          });
        }
      });
 
      oDialog = new Dialog({
        id: oView.createId("deliveringPlantDialog"),
        title: "Select Delivering Plant",
        contentWidth: "400px",
        content: [
          oSearchField,
          oList
        ],
        beginButton: new Button({
          text: "Close",
          press: function () {
            oDialog.close();
            oDialog.destroy();
          }
        }),
 
        afterClose: function () {
          oDialog.destroy();
        }
      });
 
      oView.addDependent(oDialog);
      oDialog.open();
    },
 
    // ============================
    // Add Product dialog with quantity input
    // ============================
    onAddProduct: function () {
      var oController = this;
      var oView = oController.getView();
      var oViewModel = oView.getModel("vm");
      var sDeliveringPlant = oViewModel.getProperty("/NewOrder/DeliveringPlant");
 
      if (!sDeliveringPlant) {
        MessageToast.show("Please select a Delivering Plant first.");
        return;
      }
 
      // var aAllProducts = oView.getModel("productsModel").getData() || [];
      var aAllProducts = oView.getModel("productsData").getData() || [];
      var aFiltered = aAllProducts.filter(function (p) {
        return String(p.DeliveringPlant) === String(sDeliveringPlant);
      });
 
      var oDialog = new Dialog({
        id: oView.createId("addProductDialog"),
        title: "Add Product",
        content: [
          new Label({ id: oView.createId("productSelectLabel"), text: "Select Product" }),
          new Select({
            id: oView.createId("productSelect"),
            items: aAllProducts.map(function (p) {
              return new sap.ui.core.Item({
                key: p.ProductID,
                text: p.ProductDescription
              });
            })
          }),
          new Label({ id: oView.createId("quantityLabel"), text: "Enter Quantity" }),
          new Input({ id: oView.createId("quantityInput"), type: "Number", value: "1" })
        ],
 
        beginButton: new Button({
          text: "Add",
          press: function () {
            var sProductId = oView.byId("productSelect").getSelectedKey();
            var iQuantity = parseInt(oView.byId("quantityInput").getValue(), 10);
 
            if (!sProductId || isNaN(iQuantity) || iQuantity <= 0) {
              MessageToast.show("Please select a product and enter a valid quantity.");
              return;
            }
            // var oProduct = oView.getModel("productsModel").getData().find(function (p) {
            var oProduct = oView.getModel("productsData").getData().find(function (p) {
              return String(p.ProductID) === String(sProductId);
            });
 
            oController._addProductToOrder(oProduct, iQuantity);
            oDialog.close();
          }
        }),
 
        endButton: new Button({
          text: "Cancel",
          press: function () {
            oDialog.close();
          }
        }),
        afterClose: function () {
          oDialog.destroy();
        }
      });
 
      oView.addDependent(oDialog);
      oDialog.open();
    },
 
    _addProductToOrder: function (oProduct, iQuantity) {
      var oViewModel = this.getView().getModel("vm");
 
      var fPricePerQuantity = parseFloat(1);
      var fTotalPrice = fPricePerQuantity * iQuantity;
 
      var oNewItem = {
        ProductID: oProduct.ProductID,
        ProductDescription: oProduct.ProductDescription,
        Quantity: iQuantity,
        PricePerQuantity: oProduct.PricePerQuantity,
        TotalPrice: oProduct.PricePerQuantity * iQuantity
      };
 
      var aCurrentProducts = oViewModel.getProperty("/NewOrder/ProductsData") || [];
      var oExistingItem = aCurrentProducts.find(function (item) {
        return item.ProductID === oNewItem.ProductID;
      });
 
      if (oExistingItem) {
 
        oExistingItem.Quantity += iQuantity;
        oExistingItem.TotalPrice = oExistingItem.Quantity * oExistingItem.PricePerQuantity;
 
        oViewModel.refresh(true);
        sap.m.MessageToast.show("Quantity updated for " + aAllProducts.ProductDescription);
 
      } else {
        aCurrentProducts.push(oNewItem);
 
        oViewModel.setProperty("/NewOrder/ProductsData", aCurrentProducts);
        oViewModel.refresh(true);
      }
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
            var aProducts = oViewModel.getProperty("/NewOrder/ProductsData");
 
            aSelected.forEach(function (item) {
              var sProductDesc = item.getBindingContext("vm").getObject().ProductDescription;
              aProducts = aProducts.filter(function (p) { return p.ProductDescription !== sProductDesc; });
            });
 
            oViewModel.setProperty("/NewOrder/ProductsData", aProducts);
            oViewModel.refresh(true);
          }
        }.bind(this)
      });
    },

    onSave: function () {
      var oVM = this.getView().getModel("vm");
      if (!oVM) { sap.m.MessageBox.error("View model not found."); return; }

      var oOrdersJSON = this.getOwnerComponent().getModel("orderdetails"); // the model OrdersMain uses
      if (!oOrdersJSON) { sap.m.MessageBox.error("Orders model 'orderdetails' not found."); return; }

      var oNew = oVM.getProperty("/NewOrder") || {};
      var aItems = Array.isArray(oNew.Products) ? oNew.Products : [];

      // ----- Validate -----
      var aErrors = [];
      if (!oNew.ReceivingPlant)  aErrors.push("Receiving Plant is required.");
      if (!oNew.DeliveringPlant) aErrors.push("Delivering Plant is required.");
      // if (aItems.length === 0)   aErrors.push("At least one product is required.");
      if (aErrors.length) { sap.m.MessageBox.error(aErrors.join("\n")); return; }

      // ----- Compute next OrderID from OrdersMain source -----
      var aOrders = oOrdersJSON.getProperty("/Orders");
      if (!Array.isArray(aOrders)) { aOrders = []; }
      var nextId = aOrders.length
        ? Math.max.apply(null, aOrders.map(function (x) { return Number(x.OrderID) || 0; })) + 1
        : 1;

      var iOrderId = Number(oNew.OrderID) || nextId;

      // ----- Map items to OrdersMain JSON schema -----
      var aJsonProducts = aItems.map(function (p) {
        return {
          OrderID: iOrderId,
          ProductID: String(p.ProductID || ""),
          ProductName: String(p.ProductDescription || ""),
          ProductQty: String(p.Quantity != null ? p.Quantity : ""),
          PriceperQty: String(p.PricePerQuantity != null ? p.PricePerQuantity : "")
        };
      });

      // ----- Build order with CORRECT ID/TEXT mapping -----
      var sOrderDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      var oOrderToSave = {
        OrderID: iOrderId,
        OrderDate: sOrderDate,

        // IMPORTANT: code goes to *ID*, description to *Text*
        ReceivingPlantID:  String(oNew.ReceivingPlant),            
        ReceivingPlantText: String(oNew.ReceivingPlantDesc || ""), 

        DeliveringPlantID:  String(oNew.DeliveringPlant),           
        DeliveringPlantText: String(oNew.DeliveringPlantDesc || ""), 

        Status: "Created",
        Statusstate: "None",

        // Items array name used by OrdersMain
        Product: aJsonProducts
      };

      // ----- Persist in the exact path OrdersMain reads -----
      aOrders.push(oOrderToSave);
      oOrdersJSON.setProperty("/Orders", aOrders);
      oOrdersJSON.refresh(true);

      // Keep vm aligned
      oVM.setProperty("/NewOrder/OrderID", iOrderId);

      sap.m.MessageToast.show("Order " + iOrderId + " created successfully!");
      this.onNavBack();
    },
        
 
    onNavBack: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteOrdersMain", null);
    }
   
 
 
 
  });
});