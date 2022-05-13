import { Injectable } from '@angular/core';
import { IProduct, IUserProfile } from 'src/app/_interfaces';
import { faker } from '@faker-js/faker';

@Injectable({
  providedIn: 'root'
})
export class FakeProductsService {

  products: IProduct[];
  constructor() { }

  getRecords(count: number) { 
    const products = [] as IProduct[];
    for (var i = 1; i < count; i +=1){
       const item = this.getProduct();
       products.push(item)
    }
    return products
  }

  getProduct(): IProduct {
    const item = {} as IProduct;

    item.unit                         = 0;
    item.unitTypeID                   = 0;
    item.xcoordinant                  = 0;
    item.categoryID                   = 0;
    item.subCategoryID                = 0;
    item.retail                       = 0;
    item.wholesale                    = 0;
    item.supplierid                   = 0;
    item.metaTag                      = 'value'
    item.hyperlink                    = 'value'
    item.imagelink                    = 0;
    item.imagedesc                    = 'value'
    item.taxable                      = 0;
    item.menubutton1                  = 'value'
    item.menubutton2                  = 'value'
    item.taxLookUp                    = 0;
    item.prodModifierType             = 0;
    item.modifierName                 = 'value'
    item.buildWizard                  = 0;
    item.fullProductName              = 'value'
    item.retire                       = 0;
    item.retireDate                   = 'value'
    item.buildWizardCategory          = 0;
    item.priceCategory                = 0;
    item.printerID                    = 0;
    item.productCount                 = 0;
    item.warnIfLow                    = 0;
    item.warnifLowNumber              = 0;
    item.specialPriceID               = 0;
    item.hasSerial                    = 0;
    item.isInventoryItem              = 0;
    item.trackinSales                 = 0;
    item.prodSecondLanguage           = 'value'
    item.imageRef                     = 0;
    item.productSupplierCatID         = 0;
    item.alcoholPrompt                = 0;
    item.isOpenPrice                  = 0;
    item.pizzaItem                    = 0;
    item.attachedPricing              = 0;
    item.isSpecial                    = 0;
    item.productPartCategoriesID      = 0;
    item.doNotDelete                  = 0;
    item.barcode                      = 'value'
    item.doNotDiscount                = false;
    item.revenueCenter                = 0;
    item.componentID                  = 0;
    item.ingredientID                 = 0;
    item.drinkID                      = 0;
    item.priceC                       = 0;
    item.priceA                       = 0;
    item.priceB                       = 0;
    item.manufacturer                 = 0;
    item.departmentID                 = 0;
    item.reOrderLevel                 = 0;
    item.leadTime                     = 0;
    item.preparedItems                = 0;
    item.removeGSTTax                 = 0;
    item.itemModifier                 = 0;
    item.requiresMods                 = 0;
    item.alcoholItem                  = 0;
    item.manufacturerID               = 0;
    item.height                       = 'value'
    item.width                        = 'value'
    item.depth                        = 'value'
    item.weight                       = 'value'
    item.productOrder                 = 0;
    item.medicareAllowable            = 0;
    item.kcode                        = 'value'
    item.barCodeID                    = 'value'
    item.barCodeAlt                   = 'value'
    item.rentalStatus                 = 0;
    item.rental                       = 0;
    item.comboItemID1                 = 0;
    item.comboItemID2                 = 0;
    item.comboItemID3                 = 0;
    item.comboItemID4                 = 0;
    item.menuButtonPic                = 'value'
    item.menuButtonColor              = 'value'
    item.itemCommission1              = 0;
    item.modifierButton               = 0;
    item.modifierButtonAltPrice       = 0;
    item.modifierButtonMultiplier     = 0;
    item.promptQuantity               = 0;
    item.markedForReorder             = 0;
    item.countryOfOrigin              = 'value'
    item.mlAmount                     = 0;
    item.dateMade                     = 'value'
    item.yearsOld                     = 0;
    item.caseQty                      = 0;
    item.caseWholeSale                = 0;
    item.caseRetail                   = 0;
    item.casePrice1                   = 0;
    item.casePrice2                   = 0;
    item.casePrice3                   = 0;
    item.productScheduleTime          = 0;
    item.preventSubPromptModifier     = 0;
    item.class                        = 'value'
    item.subClass                     = 'value'
    item.colorDesc                    = 'value'
    item.style                        = 'value'
    item.msrp                         = 0;
    item.itemReturn                   = 0;
    item.productTypeOption            = 0;
    item.reOrderAmount                = 0;
    item.reOrderUnitTypeID            = 0;
    item.proof                        = 0;
    item.crv                          = 0;
    item.foodStampEligible            = 0;
    item.wickEligible                 = 0;
    item.unitsOrderHeight             = 'value'
    item.unitsOrderWeight             = 'value'
    item.unitsOrderDepth              = 'value'
    item.unitsOrderWidth              = 'value'
    item.hideTextMenuDisplay          = 0;
    item.wicebt                       = 0;
    item.weightedItem                 = 0;
    item.retailPriceTier              = 0;
    item.tax2                         = 0;
    item.tax3                         = 0;
    item.thcContent                   = 0;
    item.printLabelsByQuantity        = 0;
    item.gender                       = 0;
    item.lowestNegotiatedPrice        = 0;
    item.useRetailPricing             = 0;
    item.adjustTotal                  = 0;
    item.productGroupReturnScheduleID = 0;
    item.pieceWieght                  = 0;
    item.brandID                      = 0;
    item.qbImport                     = 0;
    item.baseQuantity                 = 0;
    item.baseItemID                   = 0;
    item.overRideWeight               = 0;
    item.giftCardType                 = 0;
    item.preferredCaseMargin          = 'value'
    item.preferredMargin              = 'value'
    item.gramCount                    = 0;
    item.webProduct                   = 0;
    item.maxDiscounts                 = 0;
    item.testDate                     = 'value'
    item.gramCountMultiplier          = 0;
    item.groupID                      = 0;
    item.barcodeLength                = 0;
    item.packager                     = 0;
    item.menuSort                     = 0;
    item.menuName                     = 0;
    item.description_Temp             = 'value'
    item.uid                          = 'value'
    item.uidPriceCategory             = 'value'
    item.attributeName                = 'value'
    item.attributeValue               = 'value'
    item.unitTypeUID                  = 'value'
    item.description                  = 'value'
    item.urlImageMain                 = 'value'
    item.urlImageOther                = 'value'
    item.onlineShortDescription       = 'value'
    item.onlineDescription            = 'value'
    item.metaDescription              = 'value'
    item.metaTags                     = 'value'
    item.ageOfRequirement             = 0;
    item.ratingAverage                = 0;
    item.ratingCount                  = 0;
    item.cbd                          = (+faker.random.numeric(2)/100).toString()
    item.cbd2                         = +faker.random.numeric(2)/100
    item.thc                          = (+faker.random.numeric(2)/100).toString()
    item.thc2                         = +faker.random.numeric(2)/100
    item.thca                         = +faker.random.numeric(2)/100
    item.thca2                        = +faker.random.numeric(2)/100
    item.cbn                          = +faker.random.numeric(2)/100
    item.cbn2                         = +faker.random.numeric(2)/100
    item.cbda                         = +faker.random.numeric(2)/100
    item.cbda2                        = +faker.random.numeric(2)/100
    item.species                      = 'value'
    item.productCategoryType          = 'value'
    item.quantityType                 = 'value'
    item.defaultLabTestingState       = 'value'
    item.approvalStatus               = 'value'
    item.approvalStatusDateTime       = 'value'
    item.isUsed                       = false;
    item.strainName                   = false;
    item.strainID                     = false;
    item.webWorkRequired              = false;
    item.lastEdited                   = false;
    item.abv                           = 'value'
    item.promptGroupID                = 0;
    item.active                       = false;
    item.glutenFree                   = false;
    item.icon                         = 'value'
    
    item.productCount = +faker.random.numeric(3);
    item.retail = +faker.random.numeric(2);
    item.wholesale  = item.retail * .3;
    item.active  = true;
    item.webProduct = 1;
    item.name =  faker.animal.bird();
    item.sku = faker.random.alphaNumeric(10)
    return item
  }

}