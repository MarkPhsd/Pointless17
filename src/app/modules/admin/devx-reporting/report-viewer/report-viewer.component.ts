import { CommonModule } from '@angular/common';
import { Component, OnInit , ViewEncapsulation} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss']
})
export class ReportViewerComponent implements OnInit {

  title = 'DXReportViewerSample';
  reportUrl = 'TestReport';
  hostUrl = 'https://localhost:5001';
  // Use this line if you use an ASP.NET MVC backend
  invokeAction = "/WebDocumentViewer/Invoke";
  // Use this line if you use an ASP.NET Core backend
  // invokeAction = 'DXXRDV';

  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

}
