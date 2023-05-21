import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductPrice } from 'src/app/_interfaces/menu/price-categories';

@Component({
  selector: 'app-unit-type-prompt',
  templateUrl: './unit-type-prompt.component.html',
  styleUrls: ['./unit-type-prompt.component.scss']
})
export class UnitTypePromptComponent implements OnInit {

  productPrice: ProductPrice;
  inputForm:    UntypedFormGroup;
  @Output() itemSelect  = new EventEmitter();

  constructor(
    public fb: UntypedFormBuilder,
    private _snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UnitTypePromptComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
    {
      this.productPrice = data;
    }

  ngOnInit(): void {
    this.initForm()
  }

  initForm() {
    if (this.productPrice) {
      this.inputForm =  this.fb.group({
        unitTypeID: this.productPrice.unitTypeID
      })
    }
  }

  assignItem(productPrice) {
    // const unitType = this.inputForm.controls['unitTypeID']
    if (this.dialogRef) {
      this.dialogRef.close(
         productPrice
      );
      return
    }
    this.itemSelect.emit(productPrice)
  }

  exit() {
    this.dialogRef.close(
    );
  }
}
