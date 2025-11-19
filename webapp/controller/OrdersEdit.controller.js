sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageBox, JSONModel, Filter, FilterOperator) {
    "use strict";
    return Controller.extend("com.ui5.train.orders.controller.OrdersEdit", {
        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteOrdersEdit")
                .attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            this._sIndex = oEvent.getParameter("arguments").sIndex;
            let oModel = this.getOwnerComponent().getModel("orderdetails");
            let order = oModel.getProperty("/Orders")[this._sIndex];
            this.getView().setModel(new JSONModel(order), "editModel");
            this._mainModel = oModel;
        },
        //------------------------------------------
        // QUANTITY CHANGE CALCULATOR
        //------------------------------------------
        onQuantityChange: function (oEvent) {
            let ctx = oEvent.getSource().getBindingContext("editModel");
            let qty = parseInt(oEvent.getParameter("value")) || 0;
            ctx.getModel().setProperty(ctx.getPath() + "/ProductQty", qty);
        },
        //------------------------------------------
        // OPEN PRODUCT SELECTION POPUP
        //------------------------------------------
        onAddProduct: function () {
            if (!this._oProductDialog) {
                this._oProductDialog = sap.ui.xmlfragment(
                    "com.ui5.train.orders.fragment.Products",
                    this
                );
                this.getView().addDependent(this._oProductDialog);
            }
            this._oProductDialog.open();
        },
        //------------------------------------------
        // SEARCH INSIDE PRODUCT POPUP
        //------------------------------------------
        onProductSearch: function (oEvent) {
            let sQuery = oEvent.getParameter("newValue");
            let oTable = sap.ui.getCore().byId("idProductSelectTable");
            let oBinding = oTable.getBinding("items");
            let aFilters = [];
            if (sQuery) {
                aFilters.push(
                    new Filter("ProductName", FilterOperator.Contains, sQuery)
                );
            }
            oBinding.filter(aFilters);
        },
        //------------------------------------------
        // CONFIRM PRODUCT SELECTION
        //------------------------------------------
        onProductSelectConfirm: function () {
            let oTable = sap.ui.getCore().byId("idProductSelectTable");
            let selectedItem = oTable.getSelectedItem();
            if (!selectedItem) {
                MessageBox.error("Please select a product.");
                return;
            }
            // get selected product object
            let ctx = selectedItem.getBindingContext("productsData");
            let selectedProduct = ctx.getObject();
            // get editModel
            let oEditModel = this.getView().getModel("editModel");
            let aProducts = oEditModel.getProperty("/Product");
            // check duplicates
            let duplicate = aProducts.some(p => p.ProductID === selectedProduct.ProductID);
            if (duplicate) {
                MessageBox.error("Product already added.");
                return;
            }
            // add product
            aProducts.push({
                ProductID: selectedProduct.ProductID,
                ProductName: selectedProduct.ProductName,
                PricePerQty: selectedProduct.PricePerQty,
                ProductQty: 1
            });
            oEditModel.refresh();
            this._oProductDialog.close();
        },
        //------------------------------------------
        // CLOSE PRODUCT POPUP
        //------------------------------------------
        onCloseProductDialog: function () {
            this._oProductDialog.close();
        },
       //------------------------------------------
// DELETE PRODUCT (MULTI SELECT)
//------------------------------------------
onDeleteProduct: function () {
    const table = this.byId("idProductsTable");
    const aSelectedItems = table.getSelectedItems();
    if (aSelectedItems.length === 0) {
        MessageBox.error("Please select at least one item to delete.");
        return;
    }
    MessageBox.confirm(
        `Are you sure you want to delete ${aSelectedItems.length} item(s)?`,
        {
            onClose: (action) => {
                if (action === "OK") {
                    const oModel = this.getView().getModel("editModel");
                    let aProducts = oModel.getProperty("/Product");
                    // Collect all indexes (as numbers)
                    const aIndexes = aSelectedItems.map(item => {
                        const ctx = item.getBindingContext("editModel");
                        return parseInt(ctx.getPath().split("/").pop());
                    });
                    // Sort descending to avoid index shifting when deleting
                    aIndexes.sort((a, b) => b - a);
                    // Delete items safely
                    aIndexes.forEach(idx => {
                        aProducts.splice(idx, 1);
                    });
                    oModel.refresh();
                    table.removeSelections();
                }
            }
        }
    );
},
        //------------------------------------------
        // SAVE CHANGES
        //------------------------------------------
        onSave: function () {
            MessageBox.confirm("Are you sure you want to save these changes?", {
                onClose: (oAction) => {
                    if (oAction === "OK") {
                        let oEditModel = this.getView().getModel("editModel");
                        // write edited order back to original model
                        this._mainModel.setProperty(
                            "/Orders/" + this._sIndex,
                            oEditModel.getData()
                        );
                        MessageBox.success("Order has been successfully updated.", {
                            onClose: () => {
                                this.getOwnerComponent().getRouter().navTo(
                                    "RouteOrderDetails",
                                    { sIndex: this._sIndex }
                                );
                            }
                        });
                    }
                }
            });
        },
        //------------------------------------------
        // CANCEL EDITING
        //------------------------------------------
        onCancel: function () {
            MessageBox.confirm("Are you sure you want to cancel the changes?", {
                onClose: (oAction) => {
                    if (oAction === "OK") {
                        this.getOwnerComponent().getRouter().navTo(
                            "RouteOrderDetails",
                            { sIndex: this._sIndex }
                        );
                    }
                }
            });
        }
    });
});
