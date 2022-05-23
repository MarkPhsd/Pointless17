import { Component, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxCsvParser, NgxCSVParserError } from 'ngx-csv-parser';
import { Observable, of, switchMap } from 'rxjs';
import { saveAs } from 'file-saver';
import { FakeProductsService } from 'src/app/_services/data/fake-products.service';
import { FakeContactsService } from 'src/app/_services/data/fake-contacts.service';
import { FakeInventoryService } from 'src/app/_services/data/fake-inventory.service';
import { ExportDataService } from 'src/app/_services/data/export-data.service';
import { ImportProductResults, MenuService } from 'src/app/_services';
import { FlowPrice, FlowProducts, FlowStrain, ImportFlowPriceResults, ImportFlowProductResults, ImportFlowStainsResults } from 'src/app/_interfaces/import_interfaces/productflow';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FlowVendor, ImportFlowVendorResults, IProduct } from 'src/app/_interfaces';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { FlowInventory, ImportFlowInventoryResults } from 'src/app/_interfaces/import_interfaces/inventory-flow';

@Component({
  selector: 'app-csv-import',
  templateUrl: './csv-import.component.html',
  styleUrls: ['./csv-import.component.scss']
})
export class CSVImportComponent implements OnInit, OnDestroy {
  public timerInterval:any;
  inputForm   : FormGroup;
  headerValues= true;
  csvRecords  : any;
  header      = false;
  schemaValue : any;
  itemCount   : number;
  schemaName  : string;
  reportProgress = false;
  progress: any;
  progressValue: number;
  progress$                 : Observable<any>;
  importFlowInventoryResults: ImportFlowInventoryResults;
  importProductResults      : ImportProductResults;
  importFlowPriceResults    : ImportFlowPriceResults;
  importFlowVendorResults   : ImportFlowVendorResults;
  flowProductImportresults  : ImportFlowProductResults;
  importFlowStainsResults   : ImportFlowStainsResults;
  productImports            : ImportProductResults;
  resultsMessage            : any;

  constructor( 
    private fakeProductsService : FakeProductsService,
    private fakeContactService  : FakeContactsService,
    private fakeInventoryService: FakeInventoryService,
    public exportDataService    : ExportDataService,
    private fb                  : FormBuilder,
    private siteService:          SitesService,
    private clientTableService: ClientTableService,
    private menuService         : MenuService,
    private ngxCsvParser        : NgxCsvParser) { }

  @ViewChild('fileDropRef') fileImportInput: any;

  ngOnInit(): void {
    const i = 0;
    this.initForm()
    this.getProgress()
    this.getProgressCount(true)
  }

  initForm(){ 
     this.inputForm = this.fb.group({
      id: [],
      name: [],
    })
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    clearInterval(this.timerInterval)
  }

  fileChangeListener($event: any): void {

    // this.resetFileInfo();
    const files = $event.srcElement.files;
    clearInterval(this.timerInterval)
    this.ngxCsvParser.parse(files[0], { header: this.headerValues, delimiter: ',' })
      .pipe().subscribe({
        next: (result): void => {
          this.csvRecords = result;
          this.itemCount = this.csvRecords.length
          this.resultsMessage = null;
          this.resetProgressIndicator();
          this.getSchemaType();
        },
        error: (error: NgxCSVParserError): void => {
          this.csvRecords    = null;
          this.itemCount     = 0;
          this.resultsMessage  = error;
        }
      });
  }

  selectScheme(event) { 
    this.schemaValue = event;
    this.getSchemaType();
    return;
  }

  onFileDropped($event) {
    this.fileChangeListener($event);
  }

  downloadExample() { 
    let items = [] as any;
    let name = 'filename';

    if (this.schemaValue == 1) {
      items = this.fakeProductsService.getRecords(10);
      name = 'productsSchema'
    }

    if (this.schemaValue == 2) {
        items = this.fakeContactService.getRecords(10);
        name = 'contactSchema'
    }

    if (this.schemaValue == 3) {
      items = this.fakeInventoryService.getRecords(10);
      name = 'inventorySchema'
    }

    if (this.schemaValue == 4) {
      items = this.fakeInventoryService.getRecords(10);
      name = 'Import Flow Products'
    }
    this.getSchemaType()
    
    this.schemaName = name;
    if (!items) { return }
    this.downloadFile(items, name)

  }

  getSchemaType(): any {
    let items = [] as any;
    let name = 'filename'

    if (this.schemaValue == 1) {
      items = this.fakeProductsService.getRecords(10);
      name = 'Import Products'
    }

    if (this.schemaValue == 2) {
      items = this.fakeContactService.getRecords(10);
      name = 'Import Contacts'
    }

    if (this.schemaValue == 3) {
      items = this.fakeInventoryService.getRecords(10);
      name = 'Import Inventory'
    }

    if (this.schemaValue == 4) {
      items = this.fakeInventoryService.getRecords(10);
      name = 'Import FH Products'
    }

    if (this.schemaValue == 5) {
      name = 'Import FH Prices'
    }
    if (this.schemaValue == 6) {
      name = 'Import FH Inventory'
    }
   
    if (this.schemaValue == 7) {
      name = 'Import FH Clients'
    }
   
    if (this.schemaValue == 8) {
      name = 'Import FH Vendors'
    }
   
    if (this.schemaValue == 9) {
      name = 'Import FH Strains'
    }
   
    this.schemaName = name;
    return name
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

  reset() { 
    this.schemaValue = 0;
    this.schemaName  = '';
    this.resetFileInfo();
    this.resetProgressIndicator();
    this.initForm()
  }

  resetFileInfo() { 
    this.flowProductImportresults = null;
    this.csvRecords = null;
    this.resultsMessage = '';
    this.fileImportInput.nativeElement.value = "";
  }

  importFiles() { 

    if (this.schemaValue == 1) { 
      this.importProducts()
    }
    if (this.schemaValue == 2) { }

    if (this.schemaValue == 3) { }

    if (this.schemaValue == 4) {
      this.importFlowProducts()
    }
    if (this.schemaValue == 5) {
      this.importFlowPrices()
    }
    if (this.schemaValue == 6) {
      this.importFlowInventory()
    }
    if (this.schemaValue == 7) {
      // this.importFlowProduct()
    }
    if (this.schemaValue == 8) {
      this.importFlowVendors()
    }
    if (this.schemaValue == 9) {
      this.importFlowStrains()
    }
  }

  getProgressCount(report: boolean){ 
    if (report) { 
      this.timerInterval = setInterval(() => {
         this.getProgress()
      }, 5000);
      return
    }
    clearInterval(this.timerInterval)
    this.progress$ = null;
  }

  getProgress() {
    const site  = this.siteService.getAssignedSite()
    this.menuService.getImportCountProgress(site).subscribe(data => { 
      try {
        this.progress = data;
        this.progressValue =  +((+data.progress/+data.total ) * 100).toFixed(0)
      } catch (error) {
        this.progressValue =0
      }
    })
  }
  
  importFlowProducts(){ 
    const items =  this.csvRecords  as FlowProducts[];
    if (!items) { this.resultsMessage  = 'No files read'}
    this.resultsMessage = 'Processing.'
    const site  = this.siteService.getAssignedSite()
    if (items) { 
      this.getProgressCount(true)
      this.menuService.importFlowProducts(site,items).subscribe(data => { 
        this.flowProductImportresults = data;
        this.csvRecords = 'Operation complete';
        this.fileImportInput.nativeElement.value = "";
        this.getProgressCount(false)
      })
    }
  }


  importFlowStrains(){ 
    const items =  this.csvRecords  as FlowStrain[];
    if (!items) { this.resultsMessage  = 'No files read'}
    this.resultsMessage = 'Processing.'
    const site  = this.siteService.getAssignedSite()
    if (items) { 
      this.getProgressCount(true)
      this.menuService.importFlowStrains(site,items).subscribe(data => { 
        this.importFlowStainsResults = data;
        this.csvRecords = 'Operation complete';
        this.fileImportInput.nativeElement.value = "";
        this.getProgressCount(false)
      })
    }
  }

  importProducts(){ 
    const items =  this.csvRecords  as IProduct[];
    if (!items) { this.resultsMessage  = 'No files read'}
    this.resultsMessage = 'Processing.'
    const site  = this.siteService.getAssignedSite()

    if (items) { 
      this.getProgressCount(true)
      this.menuService.importProducts(site,items).subscribe(data => { 
        this.importProductResults = data;
        this.csvRecords = 'Operation complete';
        this.fileImportInput.nativeElement.value = "";
        this.getProgressCount(false)
      })
    }
  }

  importFlowVendors(){ 
    const items =  this.csvRecords  as FlowVendor[];
    if (!items) { this.resultsMessage  = 'No files read'}
    this.resultsMessage = 'Processing.'
    const site  = this.siteService.getAssignedSite()
    if (items) { 
      this.getProgressCount(true)
      this.clientTableService.importFlowVendors(site,items).subscribe(data => { 
        this.importFlowVendorResults = data;
        this.csvRecords = 'Operation complete';
        this.fileImportInput.nativeElement.value = "";
        this.getProgressCount(false)
      })
    }
  }

  importFlowPrices(){ 
    const items =  this.csvRecords  as FlowPrice[];
    if (!items) { this.resultsMessage  = 'No files read'}
    this.resultsMessage = 'Processing.'
    const site  = this.siteService.getAssignedSite()
    if (items) { 
      this.getProgressCount(true)
      this.menuService.importFlowPrices(site,items).subscribe(data => { 
        this.importFlowPriceResults = data;
        this.csvRecords = 'Operation complete';
        this.fileImportInput.nativeElement.value = "";
        this.getProgressCount(false)
      })
    }
  }

  importFlowInventory(){ 
    const items =  this.csvRecords  as FlowInventory[];
    if (!items) { this.resultsMessage  = 'No files read'}
    this.resultsMessage = 'Processing.'
    const site  = this.siteService.getAssignedSite()
    
    if (items) { 
      this.getProgressCount(true)
      this.menuService.importFlowInventory(site,items).subscribe(data => { 
        this.importFlowInventoryResults = data;
        this.csvRecords = 'Operation complete';
        this.fileImportInput.nativeElement.value = "";
        this.getProgressCount(false)
      })
    }
  }

  resetProgressIndicator(){ 
    const site  = this.siteService.getAssignedSite()
    const item$ = this.menuService.resetProgressIndicator(site)
    item$.pipe(
      switchMap(data => { 
        {
          return  this.menuService.getImportCountProgress(site)
        }
      }
      )
    ).subscribe(data => { 
        this.progress = data;
        this.progressValue =  +((+data.progress/+data.total ) * 100).toFixed(0)
    })
  }
}

