import { C } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import * as _ from "lodash";
import { DateHelperService } from '../reporting/date-helper.service';
import { CurrencyPipe } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class RenderingService {

  constructor(
    private currencyPipe: CurrencyPipe,
    private dateHelperService: DateHelperService) { }

  interpolateText(item: any, text: string) {
    // console.log('object interpolating', item)
    if (!item && !text) { return }

    try {
      if (!item && text) {
        _.templateSettings.interpolate = /\${([\s\S]+?)}/g;

        text =  this.getFormater(text)
        const compiled = _.template( text );

        return  compiled({});
      }

      if (item && text) {
        try {

          _.templateSettings.interpolate = /\${([\s\S]+?)}/g;

          const regEx = new RegExp('</tt>', 'g');
          const regExFront = new RegExp('<tt>', 'g');

          item = _.mapValues(item, v => _.isNil(v) ? '' : v)

          item = this.removeUndefined( item );

          const compiled = _.template( text );

          const compiledText = compiled( { item } );

          let compiledResult =  compiledText.replace(regExFront, '');

          compiledResult     =  compiledResult.replace(regEx,  '');

          if (item) { return  compiledResult }

        } catch (error) {
          return error
        }
      }
    } catch (error) {
    }
  }

  getFormatedText(text: any) {
    let newValue = JSON.stringify(text)
    newValue = newValue.replace('', '')
    const item  = JSON.parse(newValue)
    return item
  }

  removeUndefined(item: any) {

    const result = _.mapValues(item, v => _.isNil(v) ? '' : v)
    if (item) {
      item = this.setItemValues(item)
    }
    return item
  }

  convertToCurrency(value: number): string {
    return this.currencyPipe.transform(value, 'USD', 'symbol', '1.2-2');
    this.currencyPipe.transform(value, 'USD', 'symbol', '1.2-2');
  }

  setItemValues(item) {
    // console.log('item', item)
    for (const key in item) {

      if (key === 'dateMade') {
        let value = this.checkDate(item[key])
        item[key] = value
      }
      // if (key === 'total') {
      //   // item[key] = convertToCurrency(item[key])
      //   // console.log('total converted to currency', this.convertToCurrency(item[key]))
      //   // console.log('item total', item[key])
      //   item[key] = this.convertToCurrency(item[key])
      // }
      // if (key === 'subTotal') {
      //   item[key] = this.convertToCurrency(item[key])
      // }

      // if (key === 'unitPrice') {
      //   // item[key] = convertToCurrency(item[key])
      //   // console.log('unitPrice ', this.convertToCurrency(item[key]))
      //   // console.log('unitPrice ', item[key])
      //   item[key] = this.convertToCurrency(item[key])
      // }

      if (item[key] && isNaN(item[key])) {
        let result;
        if (result) {
          item[key] = result
        }

        if (!result) {

          if (this.isObject(item[key])) {

            if (key === 'name') {
              item[key] = this.setItemValues(item[key])
              return item
            }

            if (key === 'unitName') {
              item[key] = this.setItemValues(item[key])
              return item
            }
            if (key === 'modifierNote') {
              item[key] = this.setItemValues(item[key])
              return item
            }
            if (key === 'serials') {
              item[key] = this.setItemValues(item[key])
              return item
            }
            if (key === 'productName') {
              item[key] = this.setItemValues(item[key])
              return item
            }
            if (key === 'inventory') {
              item[key] = this.setItemValues(item[key])
              return item
            }

            if (key === 'menuItem') {
              item[key] = this.setItemValues(item[key])
            }
            if (key === 'priceCategories') {
              item[key] = this.setItemValues(item[key])
            }
          }
          result = this.checkDate(item[key]);
        }
      }
    }
    return item
  }

  checkDate(e) {

    try {
      if (e instanceof Date) {
        e = this.dateHelperService.format(e, 'MM-dd-yyyy')
        return e;
      }
    } catch (error) {

    }

    try {
      if (this.isIsoDate(e)) {
        e = this.dateHelperService.format(e,'MM-dd-yyyy')
        return e
      }
    } catch (error) {

    }
    try {
      if (e) {
        if (this.dateHelperService.isValidDate(e)) {
          e = this.dateHelperService.format(e, 'MM-dd-yyyy')
        }
      }
      } catch (error) {

      }
    //  return e
  }


   isIsoDate(str) {

    // console.log('is date', str)
    try {
      var dateParsed = new Date(Date.parse(str));
      if (dateParsed) {
        return true
      }
    } catch (error) {
      // console.log('error', error)
      // console.log('str', str)
    }

    if (!isNaN(str)) {
      // console.log('!IsNAN', str)
      return false
    }

    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) {
      // console.log('date not formated adequately', str)
      return false;
    }

    // console.log('date formated', str)
    const d = new Date(str);

    return d instanceof Date &&   d.toISOString()===str; // valid date
  }

  isObject(obj) {
    return obj === Object(obj);
  }

  getFormater(text: string): string {
    return text
  }

  getCurrencyValue(number: any) {
    return Intl.NumberFormat('en-US', {
     style: 'currency',
     currency: 'USD',
     // These options are needed to round to whole numbers if that's what you want.
     //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
     //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
   }).format(number)
  }

  refreshStringArrayData(text: string, obj: any[], type: string) {
    let  stringArray = []
    let percDiscountText = ''
    let newText= '';

    let itemIndex = 1;
    if (obj) {

      obj.forEach( data => {
        if (data) {

          newText = text;
          if (type === 'items') {
            if (data.itemPercentageDiscountValue && data?.itemPercentageDiscountValue != 0) {
              let disc = `${newText} ${this.itemPercentageDiscountText}`;
              newText = disc;
            }
          }
          if (type === 'items') {
            if (data.ItemOrderPercentageDiscount && data?.ItemOrderPercentageDiscount != 0) {
              let disc = `${newText} ${this.itemOrderPercentageDiscountText}`;
              newText = disc;
            }
          }
          if (type === 'items') {
            if (data.itemCashDiscount && data?.itemCashDiscount != 0) {
              let disc = `${newText} ${this.itemCashDiscountText}`;
              newText =  disc;
            }
          }
          if (type === 'items') {
            if (data.itemOrderCashDiscount && data?.itemOrderCashDiscount != 0) {
              let disc = `${newText} ${this.itemOrderCashDiscountText}`;
              newText =  disc;
            }
          }

          if (data.idRef && data.idRef == 0 || (data.id == data.idRef))  {
            if (data.productName) {
              // // .data.productName = ` ${data?.conditionalIndex } ${data?.productName}`
              // data.productName = ` ${data?.productName}`
              let text = ` ${newText}`
              newText = text;
              itemIndex = 1+itemIndex
            }
          }

          stringArray.push( this.interpolateText(data, newText))

        }
      })
    }

    return stringArray
  }

  interporlateFromDB(text: string) {
    _.templateSettings.interpolate = /\${([\s\S]+?)}/g;
    const compiled = _.template( text );
    const textCompiled = compiled( );
    return textCompiled;
  }

  get itemPercentageDiscountText() {
    let line =     "<div class=\'items-span-columns-3 itemName\'>"
    line = line +     "% disc $ ${item.itemPercentageDiscountValue.toFixed(2)}"
    line = line +  "</div>"
    return line
  }

  get itemCashDiscountText() {
    let line =     "<div class=\'items-span-columns-3 itemName\'>"
    line = line +     "$ disc $ ${item.itemCashDiscount.toFixed(2)}"
    line = line +  "</div>"
    return line
  }

  get itemOrderCashDiscountText() {
    let line =     "<div class=\'items-span-columns-3 itemName\'>"
    line = line +     "$ disc $ ${item.itemOrderCashDiscount.toFixed(2)}"
    line = line +  "</div>"
    return line
  }

  //ItemOrderPercentageDiscount
  get itemOrderPercentageDiscountText() {
    let line =     "<div class=\'items-span-columns-3 itemName\'>"
    line = line +     "% disc $ ${item.itemOrderPercentageDiscount.toFixed(2)}"
    line = line +  "</div>"
    return line
  }

  get itemLoyaltyPointDiscountText() {
    let line =     "<div class=\'items-span-columns-3 itemName\'>"
    line = line +     "Points $ ${item.itemLoyaltyPointDiscount.toFixed(2)}"
    line = line +  "</div>"
    return line
  }
}
