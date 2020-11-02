import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule, Routes } from '@angular/router';
import { ProjectComponent } from './project/project.component';
import { ReactiveFormsModule } from '@angular/forms';
import { VasComponent } from './vas/vas.component';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";
import { TransitionComponent } from './transition/transition.component';

const appRoutes: Routes = [
 
  {
    path: 'project/:id',
    component: ProjectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'project',
    component: ProjectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'project/:id/transitions',
    component: TransitionComponent,
    canActivate: [AuthGuard],
  },

];

@NgModule({
  declarations: [ProjectComponent, VasComponent, TransitionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(appRoutes),
    ReactiveFormsModule,
  ]
})
export class ProjectModule { }
