import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule, Routes } from '@angular/router';
import { ProjectComponent } from './project/project.component';
import { ReactiveFormsModule } from '@angular/forms';
import { VasComponent } from './vas/vas.component';
import { AuthGuardService as AuthGuard } from "../auth/auth-guard.service";
import { CreateProjectComponent } from './create-project/create-project.component';
import { EditProjectComponent } from './edit-project/edit-project.component';

const appRoutes: Routes = [
 
  {
    path: 'project/create',
    component: CreateProjectComponent, 
    canActivate: [AuthGuard],
  },
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

];

@NgModule({
  declarations: [ProjectComponent, VasComponent, CreateProjectComponent, EditProjectComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(appRoutes),
    ReactiveFormsModule,
  ]
})
export class ProjectModule { }
