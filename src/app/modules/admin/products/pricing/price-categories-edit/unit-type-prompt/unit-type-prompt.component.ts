import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ProductPrice } from 'src/app/_interfaces/menu/price-categories';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { UnitTypeSelectComponent } from '../../../productedit/_product-edit-parts/unit-type-select/unit-type-select.component';

@Component({
  selector: 'app-unit-type-prompt',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    UnitTypeSelectComponent,
  SharedPipesModule],
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
