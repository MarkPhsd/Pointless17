import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { switchMap, of, Observable } from 'rxjs';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BrandsResaleService } from 'src/app/_services/resale/brands-resale.service';
import { Classes_Clothing ,ClassesResaleService } from 'src/app/_services/resale/classes-resale.service';

@Component({
  selector: 'resale-classes-editor',
  templateUrl: './resale-classes-editor.component.html',
  styleUrls: ['./resale-classes-editor.component.scss']
})
export class ResaleClassesEditorComponent implements OnInit {

  @Input() classes_Clothing: Classes_Clothing;
  @Output() outPutRefresh = new EventEmitter()
  @Input() inputForm: FormGroup;

  action$ : Observable<any>;

  brandsList = this.brandsResaleService.lClassFieldData;
  genderList = [{id:0, name:'Male'}, {id:1, name:'Female'}]
  gender
  @Input() thumbnail: string;

  @Input() editForm: FormGroup;

  constructor(
    private fb                      : UntypedFormBuilder,
    private siteService             : SitesService,
    private classesResaleService    : ClassesResaleService,
    private brandsResaleService       : BrandsResaleService,
    private menuService             : MenuService,
  )
  {  }

  ngOnInit(): void {
    this.initForm();

  }

  ngOnChanges() {
    console.log('ngOnChanges ', this.thumbnail)
    if (this.classes_Clothing) {
      this.thumbnail = this.classes_Clothing.classThumbNail;
      console.log(this.classes_Clothing.classThumbNail)
      return
    }
    this.thumbnail = null;
  }

  setThumbnail(event) {
    if (this.classes_Clothing) {
      const site = this.siteService.getAssignedSite()
      const item$ = this.classesResaleService.get(site, this.classes_Clothing.id ).pipe(switchMap(data => {
        data.thumbNail = event
        this.thumbnail = event
        this.siteService.notify("All items of this deparment, attribute and gender are provded the same thumbnail now", 'Close', 3000, 'green')
        return this.classesResaleService.putClasses_ClothingThumbnail(site, data)
      }))

      this.action$ =  item$.pipe(switchMap(data => {
        this.outPutRefresh.emit();
        return of(data)
      }))
    }
  }

  setGender(gender) {
    this.gender = gender;
  }

  reset() {
    this.initForm()
  }

  addAttribute() {
    if (this.inputForm) {
      //will output x new items.
      //uses attribute name and department
      //then we can send the list to the api and it can loop and add
      const departmentID = this.inputForm.controls['departmentID'].value;
      const rowCount = this.inputForm.controls['rowCount'].value;
      const name = this.inputForm.controls['name'].value;
      const gender = this.inputForm.controls['gender'].value;
      const site = this.siteService.getAssignedSite()
      this.action$ = this.classesResaleService.postAttributeList(site, name, departmentID, gender, rowCount).pipe(
        switchMap(data =>  {
            this.siteService.notify('Please input your new Attribute above and refresh to see the changes.', 'Close', 5000, 'green')

            return of(data)
        })
      )
    }
  }

  initForm( ) {
    this.inputForm = this.fb.group({
      departmentID: [],
      name: [],
      rowCount: [],
      gender: [],
    })

  }

}
