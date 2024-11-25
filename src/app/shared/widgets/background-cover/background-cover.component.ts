import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AWSBucketService } from 'src/app/_services';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-background-cover',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './background-cover.component.html',
  styleUrls: ['./background-cover.component.scss']
})
export class BackgroundCoverComponent implements OnInit {

  backgroundImage: string;
  constructor(private uiSettingService: UISettingsService,
              private awsBucketService : AWSBucketService) {
   }

   async ngOnInit() {
    this.initBackGround();
   }

  async initBackGround() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    const bucket = await this.awsBucketService.awsBucketURL()
    //Add 'implements OnInit' to the class.
    if (!bucket) { return }
    this.uiSettingService.homePageSetting$.subscribe(data => {
      if (data) {
        if (!data.backgroundImage) { return }
        const image  = this.awsBucketService.getImageURLPath(bucket, data.backgroundImage)
        this.assingBackGround(image)
      }
    })
  }

  assingBackGround(image: string) {
    if (!image) { return }
    // const image = 'https://naturesherbs.s3-us-west-1.amazonaws.com/splash-woman-on-rock-1.jpg'
    const backUrl = this.getBkUrl(image)
    this.backgroundImage = backUrl
    const i = 1
  }

  getBkUrl(image: string) {
    const styles =  `'background-image': 'url(${image})'` ;
    return styles;
  }

}
