import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IInventoryAssignment } from '../inventory/inventory-assignment.service';
import { IPOSOrder, PosPayment,PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { IServiceType } from 'src/app/_interfaces';
import { IPOSOrderItem, PosOrderMenuItem } from 'src/app/_interfaces/transactions/posorderitems';

// export interface IPOSOrder  {
//   order: any;
//   site : any;
// }

@Injectable({
  providedIn: 'root'
})
export class FakeDataService {

  constructor() { }

  getItemData() {
    const items = [] as PosOrderItem[];
    const item = {} as PosOrderItem;
    item.id = 1;
    item.total = 6.95
    item.productName ='Chicken 1/4 LB.'
    item.quantity = 2
    item.unitPrice = 3.00
    items.push(item);
    item.id = 1;
    item.total = 6.95
    item.productName ='Chicken 1/4 LB.'
    item.quantity = 2
    item.unitPrice = 3.49
    items.push(item)
    return items
  }

  getOrder() {
    let   order = {} as IPOSOrder;
    let   orders = {} as IPOSOrder[];
    order.id = 10
    order.subTotal   = 12.98
    order.taxTotal   = 0.00
    order.total =12.98
    order.orderDate= '10/10/2030'
    order.customerName = 'Bill'
    order.posPayments   = this.getPayments();
    order.posOrderItems = this.getItemData();

    try {
        orders.push(order)
    } catch (error) {

    }

    return orders
  }

  getPayments() {
    let item = {}  as  PosPayment
    let items = [] as  PosPayment[]
    item.amountPaid = 12.98
    items.push(item)
    return items
  }

  getOrderType() {
    let type  =  {} as IServiceType
    let types = [] as  IServiceType[]

    type.name        = 'Sale'
    type.description = 'All Sales Final'

    types.push(type)

    return types;
  }

  getInventoryItemTestData(): any  {
    const item = {} as any;
    item.sku         = 'MTA1234567';
    item.productName = 'Rec The Clear  OG Elite 1G C CEll';
    item.unitPrice   = 55.00;
    item.serialCode  = '1A4FFFB303D5721000000112';
    item.menuItem = {} as IMenuItem;
    item.menuItem.unitPrice = 55.00;
    item.inventory = {} as IInventoryAssignment;
    item.inventory.label = "Example Label"
    item.inventory.sku   = 'Example Sku'
    item.inventory.thc = '30.00'
    item.inventory.cbd = '25.00'

    item.inventory.batchDate = '01/01/2001';
    item.inventory.testDate = '01/01/2001'

    item.inventory.price = '45.00'
    item.inventory.facilityLicenseNumber = '10481404'
    item.menuItem.thc  = '30.00'
    item.menuItem.cbd  = '25.00'
    item.posOrderMenuItem = {} as PosOrderMenuItem;
    return item
  }

  getMenuItem() {
   return  { "priceCategories": { "productPrices": [ { "priceTiers": { "priceTierPrices": [ { "id": 1518, "productPriceID": 1390, "quantityFrom": "3.45", "quantityTo": "7.04", "retail": "5.71", "price1": "0", "price2": "0", "price3": "0", "price4": "0", "price5": "0", "price6": "0", "price7": "0", "price8": "0", "price9": "0", "startTime": "", "endTime": "", "specialPrice": "0", "weekDays": "", "flatQuantity": "3.5", "priceName": "Eight" }, { "id": 1520, "productPriceID": 1390, "quantityFrom": "7.05", "quantityTo": "13.94", "retail": "5.71", "price1": "0", "price2": "0", "price3": "0", "price4": "0", "price5": "0", "price6": "0", "price7": "0", "price8": "0", "price9": "0", "startTime": "", "endTime": "", "specialPrice": "0", "weekDays": "", "flatQuantity": "7", "priceName": "Quarter" }, { "id": 1599, "productPriceID": 1390, "quantityFrom": "13.95", "quantityTo": "27.75", "retail": "5.35", "price1": "0", "price2": "0", "price3": "0", "price4": "0", "price5": "0", "price6": "0", "price7": "0", "price8": "0", "price9": "0", "startTime": "", "endTime": "", "specialPrice": "6", "weekDays": "Monday", "flatQuantity": "14", "priceName": "Half" }, { "id": 1391, "productPriceID": 1390, "quantityFrom": "0.01", "quantityTo": "3.44", "retail": "8", "price1": "0", "price2": "0", "price3": "0", "price4": "0", "price5": "0", "price6": "0", "price7": "0", "price8": "0", "price9": "0", "startTime": "", "endTime": "", "specialPrice": "12", "weekDays": "Saturday", "flatQuantity": "1", "priceName": "Gram" }, { "id": 1865, "productPriceID": 1390, "quantityFrom": "27.76", "quantityTo": "28", "retail": "4.32", "price1": "0", "price2": "0", "price3": "0", "price4": "0", "price5": "0", "price6": "0", "price7": "0", "price8": "0", "price9": "0", "startTime": "", "endTime": "", "specialPrice": "6", "weekDays": "Monday", "flatQuantity": "28", "priceName": "Ounce" } ], "id": 1390, "name": "Blue Cap", "uid": "1390", "webEnabled": -1 }, "unitType": { "id": 995, "name": "1", "unitNote": null, "unitCategory": "0", "unitMultipliedTo": 0, "unitMultiplyer": 0, "mainUnit": 0, "isMainUnit": false, "itemMultiplier": 0, "doNotDelete": null, "abbreviation": null, "plural": null, "milileters": null, "fluidOunces": null, "massOunces": null, "grams": null, "unitID": null, "uid": "995" }, "id": 11039, "priceCategoryID": 253, "retail": 9, "wholeSale": 0, "unitTypeID": 995, "price1": 0, "price2": 0, "price3": 0, "hideFromMenu": 0, "useforInventory": 0, "pizzaMultiplier": 0, "unitPartRatio": 1, "partMultiplyer": 1, "doNotDelete": 0, "pizzaSize": 0, "priceType": 0, "barcode": null, "itemQuantity": 0, "productID": null, "tierPriceGroup": 1390, "price4": 0, "price5": 0, "price6": 0, "price7": 0, "price8": 0, "price9": 0, "price10": 0, "timeBasedPrice": 5, "uid": "11039", "weekDays": "Special Today", "endTime": "", "startTime": "", "webEnabled": 1, "specialDatePrice": 0, "startDate": null, "endDate": null }, { "priceTiers": null, "unitType": { "id": 2765, "name": "Flower Friday 1/2 OZ 1/3/20", "unitNote": null, "unitCategory": "0", "unitMultipliedTo": 0, "unitMultiplyer": 0, "mainUnit": 0, "isMainUnit": false, "itemMultiplier": 0, "doNotDelete": null, "abbreviation": null, "plural": null, "milileters": null, "fluidOunces": null, "massOunces": null, "grams": null, "unitID": null, "uid": "2765" }, "id": 11079, "priceCategoryID": 253, "retail": 5, "wholeSale": 0, "unitTypeID": 2765, "price1": 0, "price2": 0, "price3": 0, "hideFromMenu": 0, "useforInventory": 0, "pizzaMultiplier": 0, "unitPartRatio": 1, "partMultiplyer": 1, "doNotDelete": 0, "pizzaSize": 0, "priceType": 0, "barcode": null, "itemQuantity": 0, "productID": null, "tierPriceGroup": 0, "price4": 0, "price5": 0, "price6": 0, "price7": 0, "price8": 0, "price9": 0, "price10": 0, "timeBasedPrice": 0, "uid": "11079", "weekDays": "", "endTime": "", "startTime": "", "webEnabled": 1, "specialDatePrice": 0, "startDate": null, "endDate": null } ], "id": 253, "name": "Select Shelf", "uid": "253" }, "itemType": { "flatRateTax": { "flatRateTaxValues": [], "id": 1457, "name": null }, "tax1": { "id": 4222, "amount": null, "name": null }, "tax2": { "id": 4223, "amount": null, "name": null }, "tax3": { "id": 4224, "amount": null, "name": null }, "id": 1, "name": "Category", "taxable": 0, "type": "grouping", "weightedItem": true, "expirationRequired": false, "labelRequired": false, "tax1id": 4222, "tax2id": 4223, "tax3id": 4224, "ageRequirement": 0, "flatRateTaxID": 1457, "sortOrder": 8, "enabled": true }, "id": 19099, "prodModifierType": 1, "name": "Big Buddha Blue Cheese", "displayName": "Big Bud B2", "caseQty": 0, "caseWholeSale": 0, "retail": 9, "caseRetail": 0, "casePrice1": 0, "casePrice2": 0, "casePrice3": 0, "price1": 0, "price2": 0, "price3": 0, "msrp": 0, "productCount": 42, "gramCount": 1, "metaTags": null, "metaDescription": null, "onlineDescription": null, "onlineShortDescription": null, "urlImageOther": "", "urlImageMain": null, "categoryID": 2940, "subCategoryID": 0, "priceCategoryID": 253, "category": "Misc. Items", "subcategory": null, "barcode": "", "sku": "Big Buddha Blue Cheese", "brandID": 0, "departmentID": 19719, "department": "Weighted", "unitTypeID": 995, "unitDescription": "1", "specialDescription": "", "taxable": 2, "order_BarTax": "", "order_CRV": "", "order_SeedCount": "", "order_GramCount": "", "order_LiquidCount": "", "order_ConcentrateCount": "", "order_Quantity": "", "wholeSale": 0, "taxRate1ID": 2, "taxRate2ID": 0, "taxRate3ID": 0, "priceTierID": 0, "requiredGroupID": 0, "productSortOrder": 0, "kcode": "", "cannabisType": "Medicine - Weighted", "item_GramCountMulitplier": "", "order_TaxAmount1": "", "order_TaxAmount2": "", "order_TaxAmount3": "", "order_EachCount": "", "order_SolidCount": "", "order_ExtractCount": "", "gender": 0, "requiresSerial": 1, "wicEBT": 0, "wickEligible": null, "giftCardType": 0, "alcoholItem": 0, "weightedItem": 1, "ratingAverage": 0, "ratingCount": null, "thc": null, "thc2": null, "thca": null, "thca2": null, "cbd": null, "cbd2": null, "cbn": null, "cbn2": null, "species": null, "productCategoryType": null, "quantityType": null, "defaultLabTestingState": null, "approvalStatus": null, "approvalStatusDateTime": null, "strainID": null, "strainName": null, "isUsed": null, "productPrice": { "priceTiers": { "priceTierPrices": [ { "id": 1518, "productPriceID": 1390, "quantityFrom": "3.45", "quantityTo": "7.04", "retail": "5.71", "price1": "0", "price2": "0", "price3": "0", "price4": "0", "price5": "0", "price6": "0", "price7": "0", "price8": "0", "price9": "0", "startTime": "", "endTime": "", "specialPrice": "0", "weekDays": "", "flatQuantity": "3.5", "priceName": "Eight" }, { "id": 1520, "productPriceID": 1390, "quantityFrom": "7.05", "quantityTo": "13.94", "retail": "5.71", "price1": "0", "price2": "0", "price3": "0", "price4": "0", "price5": "0", "price6": "0", "price7": "0", "price8": "0", "price9": "0", "startTime": "", "endTime": "", "specialPrice": "0", "weekDays": "", "flatQuantity": "7", "priceName": "Quarter" }, { "id": 1599, "productPriceID": 1390, "quantityFrom": "13.95", "quantityTo": "27.75", "retail": "5.35", "price1": "0", "price2": "0", "price3": "0", "price4": "0", "price5": "0", "price6": "0", "price7": "0", "price8": "0", "price9": "0", "startTime": "", "endTime": "", "specialPrice": "6", "weekDays": "Monday", "flatQuantity": "14", "priceName": "Half" }, { "id": 1391, "productPriceID": 1390, "quantityFrom": "0.01", "quantityTo": "3.44", "retail": "8", "price1": "0", "price2": "0", "price3": "0", "price4": "0", "price5": "0", "price6": "0", "price7": "0", "price8": "0", "price9": "0", "startTime": "", "endTime": "", "specialPrice": "12", "weekDays": "Saturday", "flatQuantity": "1", "priceName": "Gram" }, { "id": 1865, "productPriceID": 1390, "quantityFrom": "27.76", "quantityTo": "28", "retail": "4.32", "price1": "0", "price2": "0", "price3": "0", "price4": "0", "price5": "0", "price6": "0", "price7": "0", "price8": "0", "price9": "0", "startTime": "", "endTime": "", "specialPrice": "6", "weekDays": "Monday", "flatQuantity": "28", "priceName": "Ounce" } ], "id": 1390, "name": "Blue Cap", "uid": "1390", "webEnabled": -1 }, "unitType": { "id": 995, "name": "1", "unitNote": null, "unitCategory": "0", "unitMultipliedTo": 0, "unitMultiplyer": 0, "mainUnit": 0, "isMainUnit": false, "itemMultiplier": 0, "doNotDelete": null, "abbreviation": null, "plural": null, "milileters": null, "fluidOunces": null, "massOunces": null, "grams": null, "unitID": null, "uid": "995" }, "id": 11039, "priceCategoryID": 253, "retail": 9, "wholeSale": 0, "unitTypeID": 995, "price1": 0, "price2": 0, "price3": 0, "hideFromMenu": 0, "useforInventory": 0, "pizzaMultiplier": 0, "unitPartRatio": 1, "partMultiplyer": 1, "doNotDelete": 0, "pizzaSize": 0, "priceType": 0, "barcode": null, "itemQuantity": 0, "productID": null, "tierPriceGroup": 1390, "price4": 0, "price5": 0, "price6": 0, "price7": 0, "price8": 0, "price9": 0, "price10": 0, "timeBasedPrice": 5, "uid": "11039", "weekDays": "Special Today", "endTime": "", "startTime": "", "webEnabled": 1, "specialDatePrice": 0, "startDate": null, "endDate": null } }
  }

  getPackage()    {
    return { "item": { "id": 21405, "name": "Wade's Wonder Weed", "productCategoryName": "Buds", "productCategoryType": "Buds", "quantityType": "WeightBased", "defaultLabTestingState": "NotSubmitted", "unitOfMeasureName": "Grams", "approvalStatus": "Approved", "approvalStatusDateTime": "0001-01-01T00:00:00+00:00", "strainId": 18703, "strainName": "Wade's Wonder Weed", "administrationMethod": "", "unitCbdPercent": null, "unitCbdContent": null, "unitCbdContentUnitOfMeasureName": null, "unitCbdContentDose": null, "unitCbdContentDoseUnitOfMeasureName": null, "unitThcPercent": null, "unitThcContent": null, "unitThcContentUnitOfMeasureName": null, "unitThcContentDose": null, "unitThcContentDoseUnitOfMeasureName": null, "unitVolume": null, "unitVolumeUnitOfMeasureName": null, "unitWeight": null, "unitWeightUnitOfMeasureName": null, "servingSize": "", "supplyDurationDays": null, "numberOfDoses": null, "unitQuantity": null, "unitQuantityUnitOfMeasureName": null, "publicIngredients": "", "description": "", "isUsed": false }, "id": 142401, "label": "1A4FFFB303D5721000001126", "packageType": "Product", "sourceHarvestName": null, "locationID": null, "locationName": null, "locationTypeName": null, "quantity": 4, "unitOfMeasureName": "Grams", "unitOfMeasureAbbreviation": "g", "patientLicenseNumber": "", "itemFromFacilityLicenseNumber": "402R-X0001", "itemFromFacilityName": "CO LOFTY ESTABLISHMENT, LLC", "itemStrainName": null, "note": "Split package.", "packagedDate": "2021-03-11", "initialLabTestingState": "NotSubmitted", "labTestingState": "Not Submitted", "labTestingStateDate": "2021-03-11", "isProductionBatch": false, "productionBatchNumber": "", "sourceProductionBatchNumbers": "", "isTradeSample": false, "isTradeSamplePersistent": false, "isDonation": false, "isDonationPersistent": false, "sourcePackageIsDonation": false, "isTestingSample": false, "isProcessValidationTestingSample": false, "productRequiresRemediation": false, "containsRemediatedProduct": false, "remediationDate": null, "receivedDateTime": null, "receivedFromManifestNumber": null, "receivedFromFacilityLicenseNumber": null, "receivedFromFacilityName": null, "isOnHold": false, "archivedDate": null, "finishedDate": null, "lastModified": "2021-03-11T02:32:09-07:00", "remainingCount": 4, "inventoryImported": false, "metrcItemID": 21405, "productID": null, "productName": "Wade's Wonder Weed", "productCategoryName": "Buds" }
  }

  getPOSOrderContents() {
    const order = {} as IPOSOrder;
    return order
  }

}
