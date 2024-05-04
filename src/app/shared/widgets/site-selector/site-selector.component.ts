import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { AWSBucketService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-site-selector',
  templateUrl: './site-selector.component.html',
  styleUrls: ['./site-selector.component.scss']
})
export class SiteSelectorComponent implements OnInit {

  sites$: Observable<ISite[]>;
  bucketName:             string;
  constructor(private siteService: SitesService,
              private _snackBar: MatSnackBar,
              private dialogRef: MatDialogRef<SiteSelectorComponent>,
              private awsBucketService: AWSBucketService) { }


  async ngOnInit() {
    this.bucketName =  await this.awsBucketService.awsBucket();
    this.sites$ = this.siteService.getSites()

  }

  getImageURL(imageName: string): string {
    if (imageName) {
      return  this.awsBucketService.getImageURLPath(this.bucketName, imageName)
    }
    return ''
  }

  setSite(id: any) {

    this.siteService.getSite(id).subscribe( data => {

      this.siteService.setAssignedSite(data)

      this.notifyEvent(`${data.name} site assigned.` , '')

      this.dialogRef.close()

    }, err => {
      this.notifyEvent(`Site not set ${err}`, 'Oh no!')
    }
    )
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }


}
