import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { of } from 'rxjs';
import { saveAs } from 'file-saver';
import { FakeProductsService } from 'src/app/_services/data/fake-products.service';
import { FakeContactsService } from 'src/app/_services/data/fake-contacts.service';
import { FakeInventoryService } from 'src/app/_services/data/fake-inventory.service';
import { ExportDataService } from 'src/app/_services/data/export-data.service';

@Component({
  selector: 'app-csv-import',
  templateUrl: './csv-import.component.html',
  styleUrls: ['./csv-import.component.scss']
})
export class CSVImportComponent implements OnInit {
  inputForm   : FormGroup;
  headerValues= true;
  schemas$  = of([
    {id: 1, name: 'Products'},
    {id: 2, name: 'Inventory'},
    {id: 3, name: 'Clients - Vendors'},
  ])

  csvRecords: any;
  header  = false;
  schemaValue: any;

  constructor( 
    private fakeProductsService: FakeProductsService,
    private fakeContactService: FakeContactsService,
    private fakeInventoryService: FakeInventoryService,
    public exportDataService: ExportDataService,
    private fb: FormBuilder,
    private ngxCsvParser: NgxCsvParser) { }

  @ViewChild('fileImportInput') fileImportInput: any;

  ngOnInit(): void {
    const i = 0;
    this.inputForm = this.fb.group({
      id: [],
      name: [],
    })
  }

  fileChangeListener($event: any): void {

    const files = $event.srcElement.files;

    this.ngxCsvParser.parse(files[0], { header: this.headerValues, delimiter: ',' })
      .pipe().subscribe({
        next: (result): void => {
          console.log('Result', result);
          this.csvRecords = result;
        },
        error: (error: NgxCSVParserError): void => {
          console.log('Error', error);
        }
      });
  }

  selectScheme(event) { 
    this.schemaValue = event;
    return;
  }

  onFileDropped($event) {
    this.fileChangeListener($event);
  }

  downloadExample() { 
    let items = [] as any;
    let name = 'filename'
    if (this.schemaValue == 1) {
       items = this.fakeProductsService.getRecords(10);
       name = 'productsSchema'
    }

    if (this.schemaValue == 2) {
       items = this.fakeContactService.getRecords(10);
       name = 'contactSchema'
    }

    if (this.schemaValue == 2) {
      items = this.fakeInventoryService.getRecords(10);
      name = 'inventorySchema'
    }

    console.log(items)
    if (!items) { return }
    this.downloadFile(items, name)

  }
  
  downloadFile(data: any, name: string) {
      const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
      const header = Object.keys(data[0]);
      let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
      csv.unshift(header.join(','));
      let csvArray = csv.join('\r\n');

      var blob = new Blob([csvArray], {type: 'text/csv' })
      saveAs(blob, `${name}.csv`);
  }

}


