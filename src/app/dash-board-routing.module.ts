import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomReuseStrategy } from './_routing/route-reuse-strategy';
import { QuicklinkStrategy } from 'ngx-quicklink';
import { RouterModule, Routes } from '@angular/router';
import { GridMenuLayoutComponent } from './modules/admin/grid-menu-layout/grid-menu-layout.component';
import { GridManagerComponent } from './modules/admin/grid-menu-layout/grid-manager/grid-manager.component';
import { AuthGuard } from './_http-interceptors/auth.guard';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
  { path:  'menu-board',   component: GridManagerComponent,  data : { title: 'Menu Board Layout', animation: 'isLeft'}},

  {path: 'menu-board', component: GridManagerComponent,
      children: [
        { path: 'grid-menu-layout', component: GridMenuLayoutComponent, canActivate: [AuthGuard],  data: {  title: 'Menus', animation: 'isLeft'}},
      ]
  },
]

@NgModule({
  imports:[
    CommonModule,
    // RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    // RouterModule.forRoot(routes, { enableTracing: true }),
    RouterModule.forRoot(routes, { preloadingStrategy: QuicklinkStrategy }),
    IonicModule.forRoot(),
  ],

  exports: [RouterModule],
  providers: [
    {
      provide: CustomReuseStrategy,
      useClass: CustomReuseStrategy
    }],
})
export class DashBoardRoutingModule { }
