import { Component, OnInit,OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
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

  inputForm         : FormGroup;
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

  type$             : Observable<ManifestType[]>;
  status$           : Observable<ManifestStatus[]>;
  sites: ISite[];

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
         this.sendDate = null// this.currentManifest.sendDate;
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
    private fb: FormBuilder,
    private siteService:SitesService,
    private matSnack: MatSnackBar,
    private manifestTypeService: ManifestTypesService,
    private manifestStatusService: ManifestStatusService,
    private dialogRef: MatDialogRef<MainfestEditorComponent>,
    private manifestService: ManifestInventoryService) { }

  ngOnInit(): void {
    const i = 0;
    this.sites$ = this.siteService.getSites();
    this.sites$.subscribe(data => this.sites = data);
    this.status$ = this.manifestStatusService.listAll();
    this.type$   = this.manifestTypeService.listAll();
    this.initForm()
    this.initSubscriptions()
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.currentManifest$) { this.currentManifest$.unsubscribe()}
    if (this.currentManifestSite$) {
      this.manifestService.updateSelectedManifestSite(null)
      this.currentManifestSite$.unsubscribe()
    }
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
    console.log(event);
    if (event) {
      if (this.currentManifest) {
        // this.currentManifest.type = event.name;
        // this.currentManifest.typeID = event.id;
        this.inputForm.controls['type'].setValue(event.name)
        // this.inputForm.controls['typeID'].setValue(event.id)
      }
    }
  }

  applyStatus(event) {
    console.log(event);
    if (event) {
      if (this.currentManifest) {
        // this.currentManifest.status = event.name;
        // this.currentManifest.statusID = event.id;
        this.inputForm.controls['status'].setValue(event.name)
        // this.inputForm.controls['statusID'].setValue(event.id)
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

    console.log('valid')
    if (sourceSite.url === destSite.url) {
      const result = (window.confirm('Both the destination and source sites are the same, are you sure you want to continue?'))
      if (!result) { return };
    }

    const source$ = this.manifestService.getWithProducts(sourceSite, manifest.id);

    source$.pipe(
      switchMap( data => {
        console.log(data)
        return this.manifestService.sendTransfer(destSite, data);
      })).subscribe(
        {
        next: data => {
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
        if (event) {
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
      // this.manifestService.updateCurrentInventoryManifest(data)
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
      // inventoryAssignments:any[];
      // manifestTypes	      :any;
      // manifestStatus	    :any;
      // site                :any;
    })
    return this.inputForm
  }
}
