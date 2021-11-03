import { Component, OnInit } from '@angular/core';

// https://stackoverflow.com/questions/57001410/which-module-we-can-for-electron-pos-application-receipt-print

// https://github.com/Hubertformin/electron-pos-printer/blob/master/README.md

@Component({
  selector: 'app-bt-posprinter',
  templateUrl: './bt-posprinter.component.html',
  styleUrls: ['./bt-posprinter.component.scss']
})
export class BtPOSPrinterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log('init')
  }

}
