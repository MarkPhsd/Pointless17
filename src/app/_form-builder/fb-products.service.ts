import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { IProduct } from '../_interfaces';
import { IItemType } from 'src/app/_services/menu/item-type.service';
import { ItemType } from '../_interfaces/menu/menu-products';
@Injectable({
  providedIn: 'root'
})

export class FbProductsService {

  constructor(private _fb: UntypedFormBuilder) { }

  setOnlineDescription(product: IProduct, value: string) {
    product.onlineShortDescription = value
  }

    setProductValues(product: IProduct, inputForm: UntypedFormGroup): IProduct {
    if (inputForm.valid) {
      product                 = inputForm.value;
      // console.log(product.pB_MainID, inputForm.controls['pB_MainID'].value)
      product.barCodeID       = product.barcode
      return product
    }
  }

  initForm(fb: UntypedFormGroup): UntypedFormGroup {
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
        icon            :             [''],
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
        gramCount:                    [1],
        webProduct:                   [''],
        maxDiscounts:                 [''],
        testDate:                     [''],
        gramCountMultiplier:          [1],
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
        webWorkRequired:              [''],
        lastEdited:                   [''],
        abv:                          [''],
        promptGroupID:                [''],
        active:                       [''],
        glutenFree                 :  [''],
        terpenes                   :  [''],
        childProof                 :   [''],
        mGCBD                      :   [''],
        mGTHC                      :   [''],
        mGTCH                       :   [''],
        parLevel                   :   [''],
        slug                       :   [''],
        pB_MainID                   : [],
        thumbnail                   :  [],
        baySection: [],
        bayName: [],
      })
      return fb;
    }

    usesPriceCategory(itemType: IItemType) {
      if (itemType && itemType.name && (
          !itemType.disablePriceCategory ))
          {
            return true;
          }

        return false;
    }

    isDepartment(itemType: IItemType) {
      if (itemType && itemType.name && (
        itemType.id == 6 ||
        itemType.name == 'department'   ))
          {
            return true;
          }

        return false;
    }

    isLiquor(itemType: IItemType) {
      if (itemType && itemType.name && (
        itemType.type?.toLowerCase() === 'retail liquor' ||
        itemType.type?.toLowerCase() === 'service liquor'   ))
          {
            return true;
          }

        return false;
    }


    isCannabis(itemType: IItemType | ItemType) {
      if (itemType && itemType.type &&
                      (itemType.type?.toLowerCase() === 'cannabis' ||
                      itemType.type?.toLowerCase()  === 'med-cannabis'))
          {
            return true;
          }

        return false;
    }

    isTobacco(itemType: IItemType | ItemType) {
      if (itemType && itemType.type &&
                      (itemType.type?.toLowerCase() === 'tobacco'
                      ))
          {
            return true;
          }

        return false;
    }

    isProduct(itemType: IItemType | ItemType) {
      if (itemType && itemType.useType &&  (
             itemType.useType?.toLowerCase() == 'product' ||
             itemType.useType?.toLowerCase() == 'modifier' ))
          {
            return true;
          }

        return false;
    }

    isWeightedItem(itemType: IItemType | ItemType) {
      if (itemType && itemType.weightedItem) {
        return true;
      }
    }

    isTareItem(itemType: IItemType | ItemType) {
      if (itemType && itemType.weightedItem) {
        return true;
      }
      if (itemType && itemType.name === 'Tare Value') {
        return true;
      }
    }

    isDiscount(itemType: IItemType | ItemType) {

      if (itemType && itemType.name && ( itemType.type?.toLowerCase() === 'discounts' ||
          itemType.type?.toLowerCase() === 'service fee' )) {
        return true;
      }
      // if (itemType && itemType.type &&  (itemType.type?.toLowerCase() === 'food' )) {

      // }
    }

    isFood(itemType: IItemType | ItemType) {
      if (itemType && itemType.type &&  (itemType.type?.toLowerCase() === 'food' )) {
        return true;
      }
    }

    isAlcohol(itemType: IItemType | ItemType) {
      if (itemType && itemType.type &&  (itemType.type?.toLowerCase() === 'alcohol' )) {
        return true;
      }
    }

    isGrocery(itemType: IItemType | ItemType) {
      if (itemType && itemType.type &&  (itemType.type?.toLowerCase() === 'grocery' )) {
        return true;
      }
    }


    isRetail(itemType: IItemType | ItemType) {
      if (itemType && itemType.type &&  (itemType.type?.toLowerCase() === 'retail' )) {
        return true;
      }
    }

    isModifier(itemType: IItemType | ItemType) {
      if (itemType && itemType.type &&  (itemType.type?.toLowerCase() === 'modifier' )) {
        return true;
      }
    }

    isGrouping(itemType: IItemType | ItemType) {
      if (itemType && itemType.type &&  (itemType.type?.toLowerCase() === 'grouping' )) {
        return true;
      }
    }

    isStoreCredit(itemType: IItemType | ItemType) {
      if (itemType && itemType.name && ( itemType.type?.toLowerCase() === 'store credit' )) {
        return true;
      }
    }
}
// itemType && itemType.useType && (itemType.type?.toLowerCase() === 'grocery' ||
//                                                          itemType.type?.toLowerCase() === 'tobacco' ||
//                                                          itemType.type?.toLowerCase() === 'restaurant' ||
//                                                          itemType.type?.toLowerCase() === 'food')"
