import {Pipe,PipeTransform,Injectable} from "@angular/core"

declare var numeral:any

@Pipe({
name:'numeralPipe'
})

export class NumeralPipe implements PipeTransform{
    transform(count:any):any{ //eg: in count has value something like 52456.0
        var numericalFormat = numeral(count).format('0.0a');//error here
    return numericalFormat; // i have to format it like 52,5k
  };
}
