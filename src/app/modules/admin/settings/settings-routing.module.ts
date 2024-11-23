import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component'; // Ensure this path matches your component's location

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent, // Replace with your main component for this module
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Use `forChild` for feature modules
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
