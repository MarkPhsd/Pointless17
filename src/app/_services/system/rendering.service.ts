import { Injectable } from '@angular/core';
import * as _ from "lodash";

@Injectable({
  providedIn: 'root'
})
export class RenderingService {

  constructor() { }

  interpolateText(item: any, text: string) {

    try {
      if (!item && text) {
        _.templateSettings.interpolate = /\${([\s\S]+?)}/g;

        text =  this.getFormater(text)

        // console.log(text)

        const compiled = _.template( text );
        console.log('compiled - no item', compiled)

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

          if (item) {
            return  compiledResult
          }

        } catch (error) {
          // console.log(error)
          return error
        }
      }
    } catch (error) {
      // console.log(error)
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



  refreshStringArrayData(text: string, obj: any[]) {
    let  stringArray = []
    if (obj) {
      obj.forEach( data => {

        stringArray.push( this.interpolateText(data, text))
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

}
