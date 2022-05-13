import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ExportDataService } from 'src/app/_services/data/export-data.service';

@Component({
  selector: 'app-export-data',
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.scss']
})
export class ExportDataComponent implements OnInit {
  inputForm   : FormGroup;
  name: string;
  schemaValue: any;

  constructor(
    private fb: FormBuilder,
    public exportDataService: ExportDataService) { }

  ngOnInit(): void {
    const i = 0;
    this.inputForm = this.fb.group({
      id: [],
      name: [],
    })
  }

  selectSchema(event) { 
    this.schemaValue = event;
    return;
  }

  export() {
    const schemaValue = this.schemaValue; 
    if (schemaValue == 1) { 

    }
  }



}
