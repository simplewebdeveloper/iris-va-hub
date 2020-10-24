import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsComponent } from './projects/projects.component';
import { SharedModule } from '../shared/shared.module'
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";
import { ReactiveFormsModule } from '@angular/forms';

const appRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  }
]

@NgModule({
  declarations: [ProjectsComponent, DashboardComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(appRoutes),
    ReactiveFormsModule,
  ],
  exports: [
    ProjectsComponent,
    SharedModule
  ]
})

export class DashboardModule { }
