import { Injectable } from '@angular/core';
import * as _ from "lodash";

@Injectable({
  providedIn: 'root'
})
export class RenderingService {

  constructor() { }

  interpolateText(item: any, text: string) {
    if (!item && !text) { return }

    try {
      if (!item && text) {
        _.templateSettings.interpolate = /\${([\s\S]+?)}/g;

        text =  this.getFormater(text)

        const compiled = _.template( text );
        // console.log('compiled - no item', compiled)

        return  compiled({});
      }

      if (item && text) {
        try {
          // use custom delimiter ${ }
          _.templateSettings.interpolate = /\${([\s\S]+?)}/g;

          // console.log('item', item);
          // console.log('text', text)

          const regEx = new RegExp('</tt>', 'g');
          const regExFront = new RegExp('<tt>', 'g');
          // console.log('template text', text)

          const compiled = _.template( text );
          const compiledText = compiled( { item } );

          let compiledResult =  compiledText.replace(regExFront, '')
          compiledResult     =  compiledResult.replace(regEx,  '')

          // console.log('compiledResult', compiledResult )
          // console.log('compiledText'  , compiledText )

          if (item) { return  compiledResult }

        } catch (error) {
          return error
        }
      }
    } catch (error) {
    }
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

    if (obj) {

      obj.forEach( data => {
        if (data) {

          newText = text;
          // console.log('text', text)
          // console.log('data pre processeds', data) 
          if (type === 'items') {
            if (data.itemPercentageDiscountValue && data?.itemPercentageDiscountValue != 0) {
              console.log('data itemPercentageDiscountValue %', data?.itemPercentageDiscountValue)
              let disc = `${newText} ${this.itemPercentageDiscountText}`;
              newText = disc;
            }
          }

          
          if (type === 'items') {
            if (data.ItemOrderPercentageDiscount && data?.ItemOrderPercentageDiscount != 0) {
              console.log('data ItemOrderPercentageDiscount %', data?.ItemOrderPercentageDiscount)
              let disc = `${newText} ${this.itemOrderPercentageDiscountText}`;
              newText = disc;
            }
          }

          if (type === 'items') {
            if (data.itemCashDiscount && data?.itemCashDiscount != 0) {
              console.log('data itemCashDiscount %', data?.itemCashDiscount)
              let disc = `${newText} ${this.itemCashDiscountText}`;
              newText =  disc;
            }
          }

          if (type === 'items') {
            if (data.itemOrderCashDiscount && data?.itemOrderCashDiscount != 0) {
              console.log('data itemOrderCashDiscount %', data?.itemOrderCashDiscount)
              let disc = `${newText} ${this.itemOrderCashDiscountText}`;
              newText =  disc;
            }
          }

          // console.log('new text', newText)
          // console.log('data', data)
          stringArray.push( this.interpolateText(data, newText))
          // console.log(this.interpolateText(data, newText))
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
