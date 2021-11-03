import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IInventoryAssignment } from '../inventory/inventory-assignment.service';

export interface IUnitConversion {
  name: string;
  value: number;
}

export interface IUnitsConverted {
  baseQuantity:         number;
  gramsOutPutQuantity:  number;
  unitOutPutQuantity:   number;
  ouputRemainder:       number;
  unitConvertTo:    IUnitConversion;
  unitConvertFrom:  IUnitConversion;
}

@Injectable({
  providedIn: 'root'
})
export class ConversionsService {

  // COMPONENTS = [{'name': 'AdminbranditemComponent', 'selector': 'app-adminbranditem'},
  constructor(
              private fb: FormBuilder,
  ) { }

  getGramsConversions(): IUnitConversion[] {
    //  let unitConversion = {} as  IUnitConversion

    const unitConversion  = [
      {name: 'Half Gram',   value: .5},
      {name: 'Grams',       value:  1},
      {name: 'Half Eighth', value:  1.75},
      {name: 'Eighths',     value:  3.5},
      {name: 'Quarters',    value:  7},
      {name: 'Half Ounces', value:  14},
      {name: 'Ounces',      value:  28},
      {name: 'Joints',      value:  1},
      {name: 'lbs',         value:  453.592},
      {name: 'KiloGrams',   value:  1000},
      {name: 'Each',        value:  1}
    ]

    return unitConversion
  }

  getConversionItemByName(name: any): IUnitConversion {

    let unit = {} as IUnitConversion

    const units =  this.getGramsConversions()
    return units.find(unit => name === unit.name)

  }

  getBaseUnitsConvertedTo(unitsConverted: IUnitsConverted, baseUnitsRemaining: number, inputQuantity: number): number {

    if (unitsConverted) {

      unitsConverted.unitOutPutQuantity = baseUnitsRemaining

      if (unitsConverted.unitConvertTo) {
        // const quantity = (+baseUnitsRemaining / + unitsConverted.unitConvertTo.value ) - + inputQuantity
        const quantity  = baseUnitsRemaining - inputQuantity
        return parseInt(quantity.toFixed(2))
      }

    }
    return 0

  }

  getConversionItemByValue(value: number):  IUnitConversion {
    const units =  this.getGramsConversions()
    if(units) {
      return  units.find(unit => value == unit.value)
    }
    return null;
  }

  editAssignment(inventoryAssignment: IInventoryAssignment, form: FormGroup): boolean {

    if (inventoryAssignment) {
      const inv = inventoryAssignment

      if (inv) {

        try {

          //assign the values to the form .
          if (!inv.cost) { inv.cost =0 }
          if (!inv.price) { inv.price =0 }
          if (!inv.jointWeight) { inv.jointWeight = 1 }

          return true

        } catch (error) {
          console.log(error)
          return false
        }

      }
   }

   return false;

  }

  refreshPackageEnryForm(inv: IInventoryAssignment, form: FormGroup){
    try {
      form = this.fb.group({
        conversionName:                   [ inv.unitConvertedtoName, Validators.required],
        inputQuantity:                    [ inv.packageQuantity,[ Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)] ],
        inventoryLocationID:              [ inv.locationID, Validators.required],
        cost:                             [ inv.cost],
        price:                            [ inv.price],
        jointWeight:                      [ inv.jointWeight],
      })

    } catch (error) {
      console.log(error)
    }
  }

  initPackageEntryForm(form: FormGroup){
    form = this.fb.group({
      conversionName:                   [ ''],
      inputQuantity:                    [ ''], //[ Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)] ],
      inventoryLocationID:              [ 0 ],
      cost:                             [ ''],
      price:                            [ ''],
      jointWeight:                      [ ''],
    })
  }


  getAvailibleQuantityByUnitType(conversion: IUnitsConverted, jointWeight: number,): IUnitsConverted {
    //gets the total Possible of Quantity based on the number of jointWeight. So
    // so if we had 10 grams and used a 1.5 gram joint, it would tell us we can use about 7 joints.
    //also the outputremainder tells us wha we have after the total number of joints that can be used.

    //use the array of inventoryAssignment, and the total being received.
    //use the calculations against each array.

    // baseQuantity:         number; this is the amount we are sending
    // joinWeightValue       number; this is the quantity of the weight of the joint, so 1.5 would multiply against the conversion Rate of 1.
    //                        so the easies way to do this is to use joint weight in place of the conversion value of the joint.
    // gramsOutPutQuantity:  number;   this is the result of the conversion

    //we are taking in a quantity
    //we want to convert that quantity to grams from whatever it is
    //if they aren't grams, then we need to downgrade to grams
    //so if the base quantity is 3.5 and the unit type is Ounces
    //then we multiple OunceValue * 3.5

    const unitConversion = conversion

    if (!conversion) {
      console.log('This conversion value does not exist')
    }

    console.log('method: getAvailibleQuantityByUnitType')

    if (unitConversion.unitConvertFrom) {
      console.log('unitConversion.unitConvertFrom.value', unitConversion.unitConvertFrom.value)
      console.log('Get Avalible Quantity BaseQuantity'  , unitConversion.baseQuantity)
      const gramsCount = unitConversion.baseQuantity * unitConversion.unitConvertFrom.value

      if (unitConversion.unitConvertTo) {

        //allthough JointWeight may not be zero - it's always set to 1, we check both the jointweight and the ConvertedTo.Name to
        //see if we should be converting based on a joint.
        if (unitConversion.unitConvertTo.name.toLocaleLowerCase() === 'Joints' && jointWeight != 0) {
          if (jointWeight) { console.log('get avalible is a joint', jointWeight) }
          console.log('Unit Convert to :' +  unitConversion.unitConvertTo.value + ' jointWeight ' + jointWeight)
          unitConversion.unitConvertTo.value = jointWeight
        }

        //now that we are in grams we can divide by the unit we want to convert to
        if (unitConversion.unitConvertTo.value != 0) {
          console.log('const outPutValue = gramsCount / unitConversion.unitConvertTo.value', gramsCount / unitConversion.unitConvertTo.value)
          const outPutValue = gramsCount / unitConversion.unitConvertTo.value
          unitConversion.unitOutPutQuantity = parseInt(outPutValue.toFixed(2))
        }

        if (unitConversion.unitConvertTo.value != 0) {
          const remainder               =  gramsCount % unitConversion.unitConvertTo.value
          unitConversion.ouputRemainder =  remainder // parseInt(remainder.toFixed(2))
        }

        return unitConversion
      }

    }


  }

}


// const inventory = [
//   {name: 'apples', quantity: 2},
//   {name: 'bananas', quantity: 0},
//   {name: 'cherries', quantity: 5}
// ];

// function isCherries(fruit) {
//   return fruit.name === 'cherries';
// }

// console.log(inventory.find(isCherries));
