import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VaNavComponent } from './va-nav/va-nav.component'
import { EditModule } from '../edit/edit.module';


@NgModule({
  declarations: [VaNavComponent],
  imports: [
    CommonModule,
    EditModule,
  ],
  exports: [
    VaNavComponent,
  ]
})
export class VaNavModule { }
