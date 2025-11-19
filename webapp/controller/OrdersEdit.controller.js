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

        //------------------------------------------
        // ROUTE MATCHED (FIX APPLIED HERE)
        //------------------------------------------
        _onObjectMatched: function (oEvent) {
            this._sIndex = oEvent.getParameter("arguments").sIndex;
            this._mainModel = this.getOwnerComponent().getModel("orderdetails");

            const order = this._mainModel.getProperty(`/Orders/${this._sIndex}`);

            // Deep copy original for rollback
            this._originalOrder = JSON.parse(JSON.stringify(order));

            // Deep copy for safe edit model (critical fix)
            const oOrderCopy = JSON.parse(JSON.stringify(order));

            this.getView().setModel(new JSONModel(oOrderCopy), "editModel");
        },

        //------------------------------------------
        // QUANTITY CHANGE
        //------------------------------------------
        onQuantityChange: function (oEvent) {
            const ctx = oEvent.getSource().getBindingContext("editModel");
            const qty = parseInt(oEvent.getParameter("value")) || 0;
            ctx.getModel().setProperty(ctx.getPath() + "/ProductQty", qty);
        },

        //------------------------------------------
        // OPEN PRODUCT SELECTION (FILTER BY DELIVERY PLANT)
        //------------------------------------------
        onAddProduct: function () {
            const oEditModel = this.getView().getModel("editModel");
            const sDeliveryPlant = oEditModel.getProperty("/DeliveryPlant");

            if (!this._oProductDialog) {
                this._oProductDialog = sap.ui.xmlfragment(
                    "com.ui5.train.orders.fragment.Products",
                    this
                );
                this.getView().addDependent(this._oProductDialog);
            }

            const oTable = sap.ui.getCore().byId("idProductSelectTable");
            const oBinding = oTable.getBinding("items");
            const aFilters = [];
            if (sDeliveryPlant) {
                aFilters.push(new Filter("DeliveryPlant", FilterOperator.EQ, sDeliveryPlant));
            }
            oBinding.filter(aFilters);

            this._oProductDialog.open();
        },

        //------------------------------------------
        // SEARCH PRODUCTS IN POPUP
        //------------------------------------------
        onProductSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue");
            const oTable = sap.ui.getCore().byId("idProductSelectTable");
            const oBinding = oTable.getBinding("items");
            const aFilters = [];

            if (sQuery) {
                aFilters.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
            }
            oBinding.filter(aFilters);
        },

        //------------------------------------------
        // CONFIRM PRODUCT SELECTION
        //------------------------------------------
        onProductSelectConfirm: function () {
            const oTable = sap.ui.getCore().byId("idProductSelectTable");
            const selectedItem = oTable.getSelectedItem();

            if (!selectedItem) {
                MessageBox.error("Please select a product.");
                return;
            }

            const ctx = selectedItem.getBindingContext("productsData");
            const selectedProduct = ctx.getObject();

            const oEditModel = this.getView().getModel("editModel");
            const aProducts = oEditModel.getProperty("/Product") || [];

            if (aProducts.some(p => p.ProductID === selectedProduct.ProductID)) {
                MessageBox.error("Product already added.");
                return;
            }

            aProducts.push({
                ProductID: selectedProduct.ProductID,
                ProductName: selectedProduct.ProductName,
                PricePerQty: selectedProduct.PricePerQty,
                ProductQty: 1
            });

            oEditModel.setProperty("/Product", aProducts);
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
        // DELETE PRODUCT
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
                    icon: MessageBox.Icon.WARNING,
                    title: "Delete Product",
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    styleClass: "sapUiSizeCompact",
                    onClose: (action) => {
                        if (action === "OK") {
                            const oEditModel = this.getView().getModel("editModel");
                            const aProducts = oEditModel.getProperty("/Product");

                            const aIndexes = aSelectedItems.map(item =>
                                parseInt(item.getBindingContext("editModel").getPath().split("/").pop())
                            ).sort((a, b) => b - a);

                            aIndexes.forEach(idx => aProducts.splice(idx, 1));
                            oEditModel.refresh();
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
                title: "Save Changes",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                styleClass: "sapUiSizeCompact",
                onClose: (action) => {
                    if (action === "OK") {
                        const oEditModel = this.getView().getModel("editModel");
                        this._mainModel.setProperty(`/Orders/${this._sIndex}`, oEditModel.getData());

                        MessageBox.success("Order has been successfully updated.", {
                            onClose: () => {
                                this.getOwnerComponent().getRouter().navTo("RouteOrderDetails", { sIndex: this._sIndex }, true);
                            }
                        });
                    }
                }
            });
        },

        //------------------------------------------
        // CANCEL EDITING WITH ROLLBACK
        //------------------------------------------
        onCancel: function () {
            MessageBox.confirm("Are you sure you want to cancel the changes?", {
                title: "Cancel Changes",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                styleClass: "sapUiSizeCompact",
                onClose: (action) => {
                    if (action === "OK") {
                        this._mainModel.setProperty(
                            `/Orders/${this._sIndex}`,
                            JSON.parse(JSON.stringify(this._originalOrder))
                        );

                        this.getOwnerComponent().getRouter().navTo(
                            "RouteOrderDetails",
                            { sIndex: this._sIndex },
                            true
                        );
                    }
                }
            });
        }

    });
});
