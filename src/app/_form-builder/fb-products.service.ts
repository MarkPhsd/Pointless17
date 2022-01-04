import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IProduct } from '../_interfaces';

@Injectable({
  providedIn: 'root'
})

export class FbProductsService {

  constructor(private _fb: FormBuilder) { }

  setOnlineDescription(product: IProduct, value: string) {
    product.onlineShortDescription = value
  }

    setProductValues(product: IProduct, inputForm: FormGroup): IProduct {
    if (inputForm.valid) {
      //first we set the value of the product from the form.
      //then we can set values that aren't filled. we can do this in the api or on the app?
      product                 = inputForm.value;
      product.barCodeID       = product.barcode
      return product
    }
  }

  initForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({

        id:                           [''],
        name:                         [''],
        sku:                          [''],
        unit:                         [''],
        unitTypeID:                   [''],
        xcoordinant:                  [''],
        categoryID:                   [''],
        subCategoryID:                [''],
        retail:                       [''],
        wholesale:                    [''],
        supplierid:                   [''],
        metaTag:                      [''],
        hyperlink:                    [''],
        imagelink:                    [''],
        imagedesc:                    [''],
        taxable:                      [''],
        menubutton1:                  [''],
        menubutton2:                  [''],
        taxLookUp:                    [''],
        prodModifierType:             [''],
        modifierName:                 [''],
        buildWizard:                  [''],
        fullProductName:              [''],
        retire:                       [''],
        retireDate:                   [''],
        buildWizardCategory:          [''],
        priceCategory:                [''],
        hotWords_OldID:               [''],
        printerID:                    [''],
        productCount:                 [''],
        warnIfLow:                    [''],
        warnifLowNumber:              [''],
        specialPriceID:               [''],
        hasSerial:                    [''],
        isInventoryItem:              [''],
        trackinSales:                 [''],
        prodSecondLanguage:           [''],
        imageRef:                     [''],
        productSupplierCatID:         [''],
        alcoholPrompt:                [''],
        isOpenPrice:                  [''],
        pizzaItem:                    [''],
        blAttachedPricing:            [''],
        isSpecial:                    [''],
        productPartCategoriesID:      [''],
        doNotDelete:                  [''],
        barcode:                      [''],
        barcodeid:                    [''],
        doNotDiscount:                [''],
        revenueCenter:                [''],
        componentID:                  [''],
        ingredientID:                 [''],
        drinkID:                      [''],
        priceC:                       [''],
        priceA:                       [''],
        priceB:                       [''],
        manufacturer:                 [''],
        departmentID:                 [''],
        reOrderLevel:                 [''],
        leadTime:                     [''],
        preparedItems:                [''],
        removeGSTTax:                 [''],
        itemModifier:                 [''],
        requiresMods:                 [''],
        alcoholItem:                  [''],
        manufacturerID:               [''],
        height:                       [''],
        width:                        [''],
        depth:                        [''],
        weight:                       [''],
        productOrder:                 [''],
        medicareAllowable:            [''],
        kcode:                        [''],
        barCodeID:                    [''],
        barCodeAlt:                   [''],
        rentalStatus:                 [''],
        rental:                       [''],
        itemCommission2:              [''],
        itemCommission3:              [''],
        itemPercentCommission1:       [''],
        itemPercentCommission2:       [''],
        itemPercentCommission3:       [''],
        comboItemID1:                 [''],
        comboItemID2:                 [''],
        comboItemID3:                 [''],
        comboItemID4:                 [''],
        menuButtonPic:                [''],
        menuButtonColor:              [''],
        itemCommission1:              [''],
        modifierButton:               [''],
        modifierButtonAltPrice:       [''],
        modifierButtonMultiplier:     [''],
        itemMoneyCommission1:         [''],
        itemMoneyCommission2:         [''],
        itemMoneyCommission3:         [''],
        promptQuantity:               [''],
        markedForReorder:             [''],
        countryOfOrigin:              [''],
        mlAmount:                     [''],
        dateMade:                     [''],
        yearsOld:                     [''],
        caseQty:                      [''],
        caseWholeSale:                [''],
        caseRetail:                   [''],
        casePrice1:                   [''],
        casePrice2:                   [''],
        casePrice3:                   [''],
        productScheduleTime:          [''],
        preventSubPromptModifier:     [''],
        class:                        [''],
        subClass:                     [''],
        colorDesc:                    [''],
        style:                        [''],
        msrp:                         [''],
        itemReturn:                   [''],
        productTypeOption:            [''],
        reOrderAmount:                [''],
        reOrderUnitTypeID:            [''],
        proof:                        [''],
        crv:                          [''],
        foodStampEligible:            [''],
        wickEligible:                 [''],
        unitsOrderHeight:             [''],
        unitsOrderWeight:             [''],
        unitsOrderDepth:              [''],
        unitsOrderWidth:              [''],
        hideTextMenuDisplay:          [''],
        wicebt:                       [''],
        weightedItem:                 [''],
        retailPriceTier:              [''],
        tax2:                         [''],
        tax3:                         [''],
        printLabelsByQuantity:        [''],
        gender:                       [''],
        lowestNegotiatedPrice:        [''],
        useRetailPricing:             [''],
        adjustTotal:                  [''],
        productGroupReturnScheduleID: [''],
        pieceWieght:                  [''],
        brandID:                      [''],
        qbImport:                     [''],
        baseQuantity:                 [''],
        baseItemID:                   [''],
        overRideWeight:               [''],
        giftCardType:                 [''],
        preferredCaseMargin:          [''],
        preferredMargin:              [''],
        gramCount:                    [''],
        webProduct:                   [''],
        maxDiscounts:                 [''],
        testDate:                     [''],
        gramCountMultiplier:          [''],
        groupID:                      [''],
        barcodeLength:                [''],
        packager:                     [''],
        menuSort:                     [''],
        menuName:                     [''],
        description_Temp:             [''],
        uid:                          [''],
        uidPriceCategory:             [''],
        attributeName:                [''],
        attributeValue:               [''],
        unitTypeUID:                  [''],
        description:                  [''],
        urlImageMain:                 [''],
        urlImageOther:                [''],
        onlineShortDescription:       [''],
        onlineDescription:            [''],
        metaDescription:              [''],
        metaTags:                     [''],
        ageOfRequirement:             [''],
        ratingAverage:                [''],
        ratingCount:                  [''],
        thc:                          [''],
        thca:                         [''],
        thc2:                         [''],
        thca2:                        [''],
        cbd:                          [''],
        cbd2:                         [''],
        cbda:                         [''],
        cbda2:                        [''],
        cbn:                          [''],
        cbn2:                         [''],
        species:                      [''],
        productCategoryType:          [''],
        quantityType:                 [''],
        defaultLabTestingState:       [''],
        approvalStatus:               [''],
        approvalStatusDateTime:       [''],
        isUsed:                       [''],
        strainName:                   [''],
        strainID:                     [''],
        webWorkRequired:             [''],
        lastEdited:                   [''],
        abv:                          [''],
        promptGroupID:                [''],
        active:                       [''],
      })

      return fb;

    }
}
