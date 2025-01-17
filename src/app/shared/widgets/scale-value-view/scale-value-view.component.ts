import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ScaleInfo, ScaleService, ScaleSetup } from 'src/app/_services/system/scale-service.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'scale-value-view',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './scale-value-view.component.html',
  styleUrls: ['./scale-value-view.component.scss']
})
export class ScaleValueViewComponent implements OnInit {

  weight: string;
  mode: string;
  scaleInfo           : ScaleInfo;
  _scaleInfo          : Subscription;
  scaleSetup          : ScaleSetup;

  scaleSubscriber() {
    this._scaleInfo = this.scaleService.scaleInfo$.subscribe( data => {
      // console.log('scale info data', data)
      this.weight  =''
      this.mode = ''
      this.changeDetectorRef.detectChanges();
      if (data && data.value) {
        this.weight = data?.value;
      }
      if (data && data.mode) {
        this.mode =  data.mode;
      }
      this.scaleInfo = data;
    })
  }
  constructor(
    public  platformService       : PlatformService,
    public  scaleService          : ScaleService,
    private changeDetectorRef: ChangeDetectorRef
    ) { }

  ngOnInit(): void {
    this.scaleSetup = this.scaleService.getScaleSetup(); //get before subscriptions;
    if (this.scaleSetup && this.scaleSetup.enabled) {
      this.restartScale();
    }
    this.scaleSubscriber();
  }

  get displayWeight()  {
    if (this.platformService && this.platformService.isAppElectron) {
      return true;
    }
    return false
  }

  restartScale() {
    this.scaleService.initScaleService()
  }

  getIsScaleNaN(scale){
    if (scale) {
      if (scale && scale.value && scale.value.toLowerCase() === 'nan') {
        return true
      }
      if (scale && scale.mode && scale.mode.toLowerCase() === 'nan') {
        return true
      }
    }
  }

  killScale() {
    // this.scaleService.killProcessByName('ScaleService.exe')
    this.scaleService.killScaleProcess()
    // this.scaleService.killProcessByName('ScaleService (32 bit)')
  }
}
