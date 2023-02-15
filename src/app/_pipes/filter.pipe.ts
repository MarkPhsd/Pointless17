import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
@Injectable()
export class FilterPipe implements PipeTransform {
  transform(items: any[], field : string, value : string): any[] {

    if (!items) {
      console.log('filter no item')
      return [];
    }
    if (!value || value.length == 0) {
      console.log('filter is 0')
      return items;
    }

    return  items.filter(it =>

      {
        console.log('filter is unknown', value)
        console.log('field value', it[field])
        if (!it[field]) return;
        it[field].toString().toLowerCase().indexOf(value.toLowerCase()) !=-1

      }
    )
    ;
  }
}

