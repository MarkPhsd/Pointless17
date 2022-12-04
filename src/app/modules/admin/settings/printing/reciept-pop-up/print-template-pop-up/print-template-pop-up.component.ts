import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPrintOrders } from 'src/app/_interfaces/transactions/printServiceOrder';

@Component({
  selector: 'app-print-template-pop-up',
  templateUrl: './print-template-pop-up.component.html',
  styleUrls: ['./print-template-pop-up.component.scss']
})
export class PrintTemplatePopUpComponent implements OnInit {

  printOrders : IPrintOrders[];
  
  printedArray = [];


  constructor(private dialogRef: MatDialogRef<PrintTemplatePopUpComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
              )
  {
    if (data) {
      this.printOrders = data;
    }
  }

  // this.printOrders[0].order.posOrderItems.length
  get allSectionsPrinted() { 
    if (this.printedArray.length == this.printOrders.length) { 
      return true;
    }
    return false
  }  

  ngOnInit(): void {
    const i = 0;
    
  }
  
  printingCompleted(event){ 
    if (this.allSectionsPrinted) { 
      this.dialogRef.close('sucess')
    }
  }

}
