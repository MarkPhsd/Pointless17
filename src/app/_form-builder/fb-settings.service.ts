import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ISetting } from '../_interfaces';

@Injectable({
  providedIn: 'root'
})
export class FbSettingsService {

  constructor(private _fb: FormBuilder) { }

  initForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
        id:           [''],
        name:         [''],
        boolean:      [''],
        filter:       [''],
        text:         [''],
        tempField:    [''],
        value:        [''],
        group:        [''],
        option1:      [''],
        option2:      [''],
        option3:      [''],
        option4:      [''],
        description:  [''],
        option5:      [''],
        option6:      [''],
        option7:      [''],
        option8:      [''],
        option9:      [''],
        option10:     [''],
        option11:     [''],
        option12:     [''],
        option13:     [''],
        uid:          [''],
        webEnabled:   [''],
    })

    return fb;
  }

  intitFormData(inputForm: FormGroup, data: ISetting) {
    inputForm.patchValue(data)
    return inputForm
  }
}
