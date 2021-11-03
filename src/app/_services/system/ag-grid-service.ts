import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';

@Injectable({
  providedIn: 'root'
})
export class AgGridService {

  constructor() { }

    /** Define column types */
    columnTypes: { [key: string]: ColDef } = {
      nonEditableColumn: { editable: false },
      dateColumn: {
        filter: 'agDateColumnFilter',
        suppressMenu: true
      }
    };

    currencyCellRendererUSD(params: any) {

      if (isNaN(params) != true)  {  return 0.00 }

      var inrFormat = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      });

      if (inrFormat.format(params.value) == '$NaN') { return ''}
      return inrFormat.format(params.value);

    }

    dateCellRendererUSD(params: any) {
      let date = ''
      let time = ''

      if (!params)  {
        // console.log('date time empty')
        return ''
      }

      if (params) {
         time = new Date(params.value).toLocaleTimeString()
         date = new Date(params.value).toLocaleDateString()
      }

      if (date == 'Invalid Date' || time == 'Invalid Date' ) { return '' }
      // console.log('date time', date, time)
      return  ( date + ' ' + time )

    }

    onCellValueChanged({ value }) {
      // console.log(typeof value);
    }

    bracketsFormatter(params) {
      return '(' + params.value + ')';
    }

    currencyFormatter(params) {
      return '£' + this.formatNumber(params.value);
    }

    formatNumber(number) {
      // this puts commas into the number eg 1000 goes to 1,000,
      // i pulled this from stack overflow, i have no idea how it works
      return Math.floor(number)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

}
