import { Component, OnInit, ViewEncapsulation, Inject, ViewChild, TemplateRef, HostListener, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {  PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptWalkThroughService } from 'src/app/_services/menuPrompt/prompt-walk-through.service';
import { OrdersService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { Observable } from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { InputTrackerService } from 'src/app/_services/system/input-tracker.service';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-prompt-walk-through',
  templateUrl: './prompt-walk-through.component.html',
  styleUrls: ['./prompt-walk-through.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PromptWalkThroughComponent implements OnInit, OnDestroy {

  @ViewChild('buttonDisplay')    buttonDisplay: TemplateRef<any>;

  _savePrompt      : Subscription

  modifierNote     : string;
  processing       : boolean;
  action$:          Observable<any>;
  _promptGroup     : Subscription;
  promptGroup      : IPromptGroup

  orderPromptGroup : IPromptGroup;
  _orderPromptGroup: Subscription;

  order            : IPOSOrder;
  _order           : Subscription;

  posItem          : PosOrderItem;
  _posItem         : Subscription;
  smallDevice      : boolean;
  phoneDevice       : boolean;
  noteForm         : FormGroup;
  saveNotes$: Observable<any>;
  toggleKeyboard: boolean;
  notesDisplayColumns = 40;
  showNotes: boolean;


  setToggleKeyboard() {
    this.toggleKeyboard  = !this.toggleKeyboard;
  }

  intSubscriptions() {
    this.initPOSItemSubscription();
    this.initPromptGroupSubscription();
    this.initOrderPromptGroupSubscription();
  }

  initPOSItemSubscription() {
    this._posItem = this.posOrderItemService.posOrderItem$.subscribe(data => {
      // console.log('working on:', data.productName)
      this.posItem = data;
    })
  }

  initSaveSubscription() {
    this._savePrompt = this.promptWalkThroughService.savePromptSelection$.subscribe(data => {
      if (data) {

        this.applyChoices()
      }
    })
  }

  initPromptGroupSubscription() {
    try {
      this._promptGroup =
      this.promptGroupService.promptGroup$.pipe(
        switchMap(data => {
          if (!data) { return this.orderMethodsService.currentOrder$ }
          this.promptGroup = data;
          return this.orderMethodsService.currentOrder$
      })).subscribe(data => {

        if (data) { this.order = data;}
        if (this.promptGroup) {
          this.orderPromptGroup = this.promptGroup;
          this.orderPromptGroup.orderID = this.order.id
          return of(this.orderPromptGroup)
        }
        return of(null)
      })
    } catch (error) {
    }

    try {
      this._order = this.orderMethodsService.currentOrder$.subscribe(data => {
        this.order = data;
      })
    } catch (error) {
    }

  }

  initOrderPromptGroupSubscription() {
    //this should be initialized from selecting an item earlier.
    //the order and the prompt will be assigned.
    //the main item should also be included .
    //we might in the future want to use a multiplier. based on size selection
    // this._orderPromptGroup = this.promptWalkThroughService.orderPromptGroup$.subscribe( data => {
    //   // console.log('initOrderPromptGroupSubscription', data)
    //   this.orderPromptGroup = data;
    // })

  }

  constructor(
    private sitesService             : SitesService,
    private posOrderItemService      : POSOrderItemService,
    private orderService             : OrdersService,
    public orderMethodsService       : OrderMethodsService,
    private promptGroupService       : PromptGroupService,
    private promptWalkThroughService : PromptWalkThroughService,
    public platformService           : PlatformService,
    private trackerService           : InputTrackerService,
    private _fb: FormBuilder,
    private dialogRef                : MatDialogRef<PromptWalkThroughComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    )
  {
  }

  ngOnDestroy() {
    if (this._order) {this._order.unsubscribe()}
    if (this._promptGroup) { this._promptGroup.unsubscribe()};
    if (this._posItem) { this._posItem.unsubscribe()}
  }

  ngOnInit(): void {
    this.intSubscriptions()
    this.updateScreenSize()
    this.initSaveSubscription()
    this.initNoteForm();

    if (!this.phoneDevice) {
      this.showNotes = true;
    }
  }

  initNoteForm() {
    this.noteForm = this._fb.group({
      modifierNote : []
    })
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    this.phoneDevice = false;
    if ( window.innerWidth < 811 ) {
      this.smallDevice = true
      this.notesDisplayColumns = 50
    }
    if ( window.innerWidth < 600 ) {
      this.phoneDevice = true
      this.notesDisplayColumns = 90
    }
  }

  reset() {
    // this.orderPromptGroup.prompts.
    // this.orderPromptGroup.
  }

  close() {
    this.dialogRef.close()
  }

  getItem() {
    if (!this.orderPromptGroup) {
      return this.posItem;
    }

    if (this.orderPromptGroup) {
      return this.orderPromptGroup.posOrderItem;
    }
  }

  getOrderID() {
    if (!this.orderPromptGroup) {
      if (!this.posItem) { return 0}
      return this.posItem.orderID;
    }

    if (this.orderPromptGroup) {
      return this.orderPromptGroup.orderID;
    }
  }

  cancel() {
    //cancel prompt and item being applied to.
    const result = window.confirm("Do you want to cancel this prompt? This will  apply all selections")

    if (result) {

      const site = this.sitesService.getAssignedSite();

      let orderID = this.getOrderID()

      // console.log(orderID)/
      if (orderID == 0) {
        this.dialogRef.close('success')
        return;
      }

      const item = this.getItem();

      if (!item) {
        this.dialogRef.close('success')
        return of(null)
      }

      // console.log(item?.orderID, item);
      if (item) {
        this.action$ = this.posOrderItemService.deletePOSOrderItem(site, item.id).pipe(
          switchMap(data => {
            return  this.orderService.getOrder(site, orderID.toString(), false)
          }
          )).pipe(
            switchMap( data => {

              this.orderMethodsService.updateOrderSubscription(data)
              this.dialogRef.close('success')
              return of('success')
            }
          )
        ),catchError(data => {
          this.dialogRef.close('success')
          return of(null)
        })
      }

    }
  }

  get  largeScreenButtons(){
    return this.buttonDisplay;
    if (this.phoneDevice) {
    }
  }

  get smallScreenButtons() {
    return null;
  }

  applyChoices() {

    if (this.orderPromptGroup) {
      const site = this.sitesService.getAssignedSite();
      const saveAction$ =  this.setNotes();

      let time = 10000
      let message = ''
      const quantityMetValidation = this.promptWalkThroughService.validateAllPromptsQuantityMet(this.orderPromptGroup);

      if (quantityMetValidation.length) {
        quantityMetValidation.forEach(data => {
           if (!data.quantityMet) {
            if (message != '') { message.concat(' and ')}
            message = message.concat(`Section ${data.name} requires ${data.quantityRequired} item(s). `);
           }
        })

        if (message != '') {
          return;
        }
      }

      const result =   this.promptWalkThroughService.validateSelections(this.orderPromptGroup)
      if (result && result.length  > 0) {
        let notes = ''
        result.forEach(data => {
          notes = `notes ${data}`
        })
        this.sitesService.notify(notes, 'close', 5000, 'yellow')
        return;
      }

      // console.log(' this.orderPromptGroup',  this.orderPromptGroup)
      const prompt$ = this.posOrderItemService.postPromptItems(site, this.orderPromptGroup);
      this.processing = true;

      this.action$ =  saveAction$.pipe(switchMap(data => {
        return prompt$
      })).pipe(
          switchMap( data  => {
              return  this.orderService.getOrder(site, data.orderID.toString(), false)
             }
          )
          ).pipe(
            switchMap( data => {
              this.processing = false
              this.dialogRef.close(false)
              this.orderMethodsService.updateOrderSubscription(data)
              return of('success')
            }),
            catchError(data => {
              this.sitesService.notify(`Error ${data}`, 'Error', 5000, 'red')
              this.processing = false;
              return of('false')
          })
      )
    }
  }

  setNotes() {
    let modifierNote = ''
    if ( this.noteForm) {
      modifierNote = this.noteForm.controls['modifierNote'].value;
    }

    if (modifierNote && this.orderPromptGroup.posOrderItem) {
         this.orderPromptGroup.posOrderItem.modifierNote =  modifierNote;
        const site = this.sitesService.getAssignedSite()
        return  this.posOrderItemService.putItem(site, this.orderPromptGroup.posOrderItem)
    }

    return of({})
  }

}


// function catchErrors(arg0: (data: any) => void) {
//   throw new Error('Function not implemented.');
// }
// this.orderService.getOrder(site, this.order.id.toString()).subscribe( data => {
//   this.orderService.updateOrderSubscription(data)
//   console.log('posted')
//   this.dialogRef.close()
