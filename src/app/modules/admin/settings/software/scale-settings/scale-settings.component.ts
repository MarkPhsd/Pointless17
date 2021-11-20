import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ScaleService, ScaleSetup } from 'src/app/_services/system/scale-service.service';

@Component({
  selector: 'app-scale-settings',
  templateUrl: './scale-settings.component.html',
  styleUrls: ['./scale-settings.component.scss']
})
export class ScaleSettingsComponent implements OnInit {
  inputForm  : FormGroup;
  scaleSetup = {} as ScaleSetup

  constructor(
      private scaleService: ScaleService,
      private fb: FormBuilder
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
