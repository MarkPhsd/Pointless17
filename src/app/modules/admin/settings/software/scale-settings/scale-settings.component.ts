import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacySlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { ScaleService, ScaleSetup } from 'src/app/_services/system/scale-service.service';

@Component({
  selector: 'app-scale-settings',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,
        MatLegacyInputModule, MatLegacySlideToggleModule,
      MatLegacyCardModule,MatLegacyFormFieldModule],
  templateUrl: './scale-settings.component.html',
  styleUrls: ['./scale-settings.component.scss']
})
export class ScaleSettingsComponent implements OnInit {
  inputForm  : UntypedFormGroup;
  scaleSetup = {} as ScaleSetup

  constructor(
      private scaleService: ScaleService,
      private fb: UntypedFormBuilder
    ) { }

  ngOnInit(): void {
    this.scaleSetup = this.scaleService.getScaleSetup()
    this.initForm();
  }

  initForm() {
    this.inputForm = this.fb.group({
      enabled: [''],
      decimalPlaces: [''],
      timer: [.5],
    })
    this.inputForm.patchValue(this.scaleSetup);
  }


  updateSetting() {
    this.scaleService.updateScaleSetup(this.inputForm.value)
  }
}
