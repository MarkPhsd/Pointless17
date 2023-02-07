import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateRight'
})
export class TruncateRightPipe implements PipeTransform {

  transform(value: string, length: number): string {

    const biggestWord = 50;
    const elipses = "";

    if(typeof value === "undefined") return value;
    if(value === null) return value;

    const maxLength = value.length;

    if(maxLength <= length) return value;

    if (maxLength > length) {
      let truncatedText = value.slice(-5);
      return truncatedText ;
    }

    return value;

  }
}
