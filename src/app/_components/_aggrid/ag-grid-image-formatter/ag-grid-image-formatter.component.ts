import { Component } from '@angular/core';


@Component({
  selector: 'app-ag-grid-image-formatter',
  templateUrl: './ag-grid-image-formatter.component.html',
  styleUrls: ['./ag-grid-image-formatter.component.scss']
})

//make sure to pass in the awsBucket URL included in the params
//this.awsService.awsBucketURL()
export class AgGridImageFormatterComponent {

  imagePath: string;

  agInit(params: any){
    if (!params) {
      this.imagePath = ''
      return
    }
    try {
      if (params.value) {
        this.imagePath = params.value;
      }
    } catch (error) {

    }

  }

}
