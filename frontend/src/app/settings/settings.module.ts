import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SetttingsComponent } from './setttings/setttings.component';

import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";

const appRoutes: Routes = [
  {
    path: 'settings',
    component: SetttingsComponent,
    canActivate: [AuthGuard],
  }
]

@NgModule({
  declarations: [SetttingsComponent],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(appRoutes),
  ],
  exports: [
    
  ]
})
export class SettingsModule { }
