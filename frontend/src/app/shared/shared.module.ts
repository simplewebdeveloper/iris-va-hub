import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule, MatIconModule, MatSidenavModule, MatListModule, MatButtonModule } from  '@angular/material';
import { JumbotronComponent } from './jumbotron/jumbotron.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { LeftnavComponent } from './leftnav/leftnav.component';
import { EditModule } from '../edit/edit.module';
import { BlsComponent } from './bls/bls.component';


@NgModule({
  declarations: [TopNavbarComponent, JumbotronComponent, ChatboxComponent, LeftnavComponent, BlsComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    EditModule,
  ],
  exports: [
    CommonModule,
    TopNavbarComponent,
    JumbotronComponent,
    ChatboxComponent,
    LeftnavComponent,
    BlsComponent,
  ]
})
export class SharedModule { }
