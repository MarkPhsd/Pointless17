import { Component, OnInit,OnDestroy, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { InventoryManifest, ManifestInventoryService } from 'src/app/_services/inventory/manifest-inventory.service';
import { ManifestStatus, ManifestStatusService } from 'src/app/_services/inventory/manifest-status.service';
import { ManifestType, ManifestTypesService } from 'src/app/_services/inventory/manifest-types.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-mainfest-editor',
  templateUrl: './mainfest-editor.component.html',
  styleUrls: ['./mainfest-editor.component.scss']
})
export class MainfestEditorComponent implements OnInit,OnDestroy {

  inputForm         : UntypedFormGroup;
  currentManifest   : InventoryManifest;
  currentManifest$  : Subscription;
  inventoryItems    : IInventoryAssignment[];
  manifestID        : number;
  site              : ISite;
  sites$            : Observable<ISite[]>;
  active            = false;
  currentManifestSite$ : Subscription;
  sendDate:              string;
  scheduleDate:          string;
  acceptedDate:          string;
  paidDate          : string;
  type$             : Observable<ManifestType[]>;
  status$           : Observable<ManifestStatus[]>;
  sites             : ISite[];
  autoReceive       : boolean;

  get isWarehouse(): boolean {
    return this.manifestService.isWarehouse;
  }

  initManifestSubscriber() {
    try {
      this.currentManifest$ = this.manifestService.currentInventoryManifest$.subscribe(data => {
       if (data) {
         this.currentManifest = data;
         this.manifestID = data.id;
         this.inventoryItems = this.currentManifest.inventoryAssignments;
         this.scheduleDate = this.currentManifest.scheduleDate;
         this.sendDate = this.currentManifest.sendDate;
         this.acceptedDate = this.currentManifest.acceptedDate;
         this.paidDate = this.currentManifest.paidDate;
         if (this.currentManifest.active == 0) {
          this.active = false
         }
         if (this.currentManifest.active != 0) {
          this.active = true
         }
         this.initForm();
         this.inputForm.patchValue(this.currentManifest)
         return
      }
        this.initForm();
         this.currentManifest = null;
         this.manifestID = 0;
         this.inventoryItems = null;
         this.scheduleDate = null//this.currentManifest.scheduleDate;
         this.sendDate = null;// this.currentManifest.sendDate;
         this.paidDate = null;
         this.acceptedDate = null;
      })
    } catch (error) {
      console.log('subscription error manifest', error)
    }
  }

  initSubscriptions() {
    this.initManifestSubscriber()
    try {
      this.currentManifestSite$ = this.manifestService.currentManifestSite$.subscribe(data => {
        this.site = data;
      })
    } catch (error) {
      console.log('subscription error manifest', error)
    }
  }

  constructor(
    private fb: UntypedFormBuilder,
    private siteService:SitesService,
    private matSnack: MatSnackBar,
    private manifestTypeService: ManifestTypesService,
    private manifestStatusService: ManifestStatusService,
    private manifestService: ManifestInventoryService,
    private dialogRef: MatDialogRef<MainfestEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      if (data) {
        if (data.autoReceive)  {
          this.autoReceive = true;
        }
      }
    }

  ngOnInit(): void {
    const i = 0;
    this.sites$ = this.siteService.getSites();
    this.sites$.subscribe(data => this.sites = data);
    this.status$ = this.manifestStatusService.listAll();
    this.type$   = this.manifestTypeService.listAll();
    this.initForm()
    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    if (this.currentManifestSite$) { this.currentManifestSite$.unsubscribe()}
    const i = 0;
  }

  setDestinationSite(event) {
    const id = event.value;
    if (event) {
      if (this.manifestService.isWarehouse) {
        if (this.currentManifest && !this.currentManifest.sendDate) {
          this.siteService.getSite(id).subscribe(data => {
            this.currentManifest.destinationID  = data.id;
            this.currentManifest.destinationURL = data.url;
            this.currentManifest.destinationSiteName = data.name;
            this.inputForm.controls['destinationID'].setValue(data.id);
            this.inputForm.controls['destinationURL'].setValue(data.url);
            this.inputForm.controls['destinationSiteName'].setValue(data.name);
          })
          const manifest         = this.inputForm.value as InventoryManifest;
        }
      }
    }
  }

  applyType(event) {
    // console.log(event);
    if (event) {
      if (this.currentManifest) {
        this.currentManifest.type = event.value;
      }
    }
  }

  applyStatus(event) {
    if (event) {
      if (this.currentManifest) {
        this.currentManifest.type = event.value.name;
      }
    }
  }

  applySite(event) {

  }

  validateDispatch(sourceSite: ISite, destSite: ISite) {

    if (!sourceSite.url) {
      this.matSnack.open('No source assigned.', 'Failed')
      return false
    }

    if (!destSite.url) {
      this.matSnack.open('No destination assigned.', 'Failed')
      return false
    }

    return true

  }

  dispatchManifest(event) {

    const manifest = this.currentManifest;
    const sourceSite = {} as ISite;
    sourceSite.url =  manifest.sourceSiteURL;

    const destSite = {} as ISite;
    destSite.url = manifest.destinationURL;

    if (!this.validateDispatch(sourceSite, destSite)) { return };

    // console.log('valid')
    if (sourceSite.url === destSite.url) {
      const result = (window.confirm('Both the destination and source sites are the same, are you sure you want to continue?'))
      if (!result) { return };
    }

    const source$ = this.manifestService.getWithProducts(sourceSite, manifest.id);

    source$.pipe(
      switchMap( data => {
        return this.manifestService.sendTransfer(destSite, data);
      })).subscribe(
        {
        next: data => {
          if (data.errorMessage) {
            this.matSnack.open(data.errorMessage, 'Result');
            return
          }
          this.matSnack.open('Dispatch Sent', 'Succes');
        },
        error: err => {
          this.matSnack.open(`Dispatch Failed to send ${err}`, 'Failed');
        }
    })

  }

  saveManifest(event) {
    //const site = this.site
    const site = this.siteService.getAssignedSite()
    if (!site) { return }
    if (!this.currentManifest) { return }

    const manifest         = this.inputForm.value as InventoryManifest;
    manifest.scheduleDate  = this.scheduleDate;
    manifest.sendDate      = this.sendDate;
    manifest.acceptedDate  = this.acceptedDate;
    manifest.active        = +this.active;
    const manifest$ = this.manifestService.update(site, this.currentManifest.id, manifest )
    manifest$.subscribe(data => {
        this.manifestService.updateCurrentInventoryManifest(data)
        if (data.errorMessage) {
          this.matSnack.open(data.errorMessage, 'Result');
          return
        }
        if (event == 'true') {
          this.dialogRef.close();
        }
      }
    )
  }

  deleteManifest(event) {
    const site = this.site
    const warn = window.confirm('Are you sure you want to delete this?')
    if (!warn) { return }
    if (!this.currentManifest) { return }
    const manifest$ = this.manifestService.update(site, this.currentManifest.id, this.currentManifest )
    manifest$.subscribe(data => {
      this.dialogRef.close()
    })

  }

  initForm(){
    this.inputForm = this.fb.group({
      id:                 [],
      name:               [],
      originatorID:       [],

      sourceSiteID:       [],
      sourceSiteURL:      [],
      sourceSiteName:     [],

      destinationID:       [],
      destinationURL:      [],
      destinationSiteName: [],

      receiverManifestID: [],
      active:             [],
      status:             [],
      type:               [],
      entryUser:          [],
      entryUserID:        [],
      requestedBy:        [],
      requestedByID:      [],
      createdDate:        [],
      sendDate:           [],
      receiverName:       [],
      scheduleDate:       [],
      carrierName:        [],
      carrierEmployee:    [],
      acceptedDate:       [],
      description:        [],
      recieverID:         [],
      statusID:           [],
      typeID:             [],
    })
    return this.inputForm
  }
}
