import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { VaComponent } from './va/va.component';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";
import { VaDashboardComponent } from './va-dashboard/va-dashboard.component';
import { BlsComponent } from '../va/bls/bls.component';

const appRoutes: Routes = [
 
  {
    path: 'va/:id',
    component: VaComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'va',
    component: VaComponent,
    canActivate: [AuthGuard],
  },

];

@NgModule({
  declarations: [VaComponent, VaDashboardComponent, BlsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(appRoutes),
  ]
})
export class VaModule { }
