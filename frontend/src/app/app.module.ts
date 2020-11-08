import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from "./auth/auth-interceptor";

// Custom modules
import { ProjectModule } from "../app/project/project.module";
import { SharedModule } from '../app/shared/shared.module';
import { DashboardModule } from '../app/dashboard/dashboard.module';
import { CreateModule } from './create/create.module';
import { TrainModule } from '../app/train/train.module';
import { EditModule } from './edit/edit.module';
import { AuthModule } from './auth/auth.module'
import { SettingsModule } from './settings/settings.module';
import { VaNavModule } from './va-nav/va-nav.module';
import { ResponseModule } from './response/response.module';
import { TestModule } from './test/test.module';
import { VaModule } from './va/va.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthGuardService} from "./auth/auth-guard.service";
import { AuthService } from './auth/auth.service';


const appRoutes: Routes = [
  {
    path: '',
    loadChildren: './auth/auth.module#AuthModule',
    
  },
  {
    path: 'login',
    loadChildren: './auth/auth.module#AuthModule',
  },
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule',
    
  },
  {
    path: 'project',
   loadChildren: './project/project.module#ProjectModule',
  
 },
 {
  path: 'va',
  loadChildren: './va/va.module#VaModule',

},
  {
    path: 'create',
    loadChildren: './create/create.module#CreateModule',
    
  },
  {
    path: 'profile',
    loadChildren: './edit/edit.module#EditModule',
   
  },
  {
    path: 'train',
    loadChildren: './train/train.module#TrainModule',
    
  },
  {
    path: 'responses',
    loadChildren: './response/response.module#ResponseModule',
    
  },
  {
    path: 'test',
    loadChildren: './test/test.module#TestModule',
    
  },
  {
    path: 'settings',
    loadChildren: './settings/settings.module#SettingsModule',
    
  },
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    ProjectModule,
    SharedModule,
    DashboardModule,
    CreateModule,
    TrainModule,
    TestModule,
    EditModule,
    SettingsModule,
    VaNavModule,
    ResponseModule,
    VaModule,
    AuthModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
