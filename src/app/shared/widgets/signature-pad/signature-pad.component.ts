import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrdersService } from 'src/app/_services';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, JSONOrder } from 'src/app/_interfaces';
import { _MatListItemGraphicBase } from '@angular/material/list';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import * as Hammer from 'hammerjs';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss']
})
export class SignatureComponent implements  OnDestroy,AfterViewInit {

  action$: Observable<any>;
  _order: Subscription;
  order: IPOSOrder;
  uiHomePage: UIHomePageSettings;
  homePageSetting$: Subscription

  initSettings() {
    this.homePageSetting$ = this.uiSettingsService.homePageSetting$.subscribe(data => {
      this.uiHomePage = data;
    })
  }


  // @ViewChild('signature')
  // public signaturePad: SignaturePadComponent;

  @ViewChild('signaturePad') signaturePad: SignaturePadComponent;


  signaturePadOptions: NgSignaturePadOptions = { // passed through to szimek/signature_pad constructor
    minWidth: 5,
    canvasWidth: 500,
    canvasHeight: 300,
    canvasBackground: '#3a619d4d'
  };

  constructor(
    private orderMethodsService: OrderMethodsService,
    private orderService: OrdersService,
    private siteService: SitesService,
    private location: Location,
    private uiSettingsService: UISettingsService,
    private router: Router,
  ) {
    // no-op
    this.initSettings()
    this._order = this.orderMethodsService.currentOrder$.subscribe(data => {
      this.order = data;
    })
  }


  ngOnDestroy() {
    if (this._order) { this._order.unsubscribe()}
  }

  // ngAfterViewInit() {
  //   // this.signaturePad is now available
  //   try {
  //     this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
  //   } catch (error) {

  //   }
  //   try {

  //     this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  //   } catch (error) {

  //   }
  // }

  ngAfterViewInit() {
    if (this.signaturePad) {
      this.signaturePad.set('minWidth', 5);
      this.signaturePad.clear();
      this.setCanvasSize()
    } else {
      console.error('SignaturePad is not defined');
    }
  }

  setCanvasSize() {
    const width = window.innerWidth * 0.9; // Adjust canvas width based on screen size
    const height = window.innerHeight * 0.3; // Adjust canvas height as needed

    this.signaturePad.set('canvasWidth', width);
    this.signaturePad.set('canvasHeight', height);
    this.signaturePad.clear(); // Clear canvas to ensure proper rendering
  }

  refreshSavedSignature() {
    if (this.order) {
      const features = this.order.orderFeatures
      if ( features?.signatureLocked) {
        // /handled in the template
      }
      if (features?.signature) {
        this.signaturePad.fromDataURL(features?.signature)
      }
    }
  }

  drawComplete(event: MouseEvent | Touch) {
    // will be notified of szimek/signature_pad's onEnd event
    console.log('Completed drawing', event);
    console.log(this.signaturePad.toDataURL());
  }

  drawStart(event: MouseEvent | Touch) {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('Start drawing', event);
  }

  clearSignature() {
    this.signaturePad.clear();
  }

  saveSignature() {
    const site = this.siteService.getAssignedSite()
    // const signature =  this.signaturePad.toDataURL();
    try {
      const signatureText = this.signaturePad.toDataURL('image/png');

      if (signatureText) {
        if (!this.order.orderFeatures) {
          this.order.orderFeatures = {} as JSONOrder
        }

        this.order.orderFeatures.signature = signatureText
        this.order.orderFeatures.signatureLocked = true


        const getIpInfo$ = this.siteService.getIpAddress(this.uiHomePage?.ipInfoToken).pipe(switchMap(data => {
          this.order.orderFeatures.ipInfo = data// JSON.stringify(data)
          this.order.orderFeatures.ipInfoJSON = JSON.stringify(data)
          return of(this.order)
        }))

        const orderPut$ = this.orderService.putOrder(site, this.order)

        this.action$ =  getIpInfo$.pipe(switchMap(data => {

          this.order.json = JSON.stringify(data.orderFeatures)

          console.log('ipinfo', data?.orderFeatures?.ipInfoJSON )
          return of(this.order)
          return orderPut$
        })).pipe(switchMap(data => {

          this.orderMethodsService.updateOrder(data)
          this.goBack()
          return of(data)
        }))
      }
    } catch (error) {
      console.log(error)
      this.siteService.notify('An error has occured while trying to save the signature', 'Close', 3000, 'red')
    }

  }

  goBack(): void {
    this.location.back()
  }

}
