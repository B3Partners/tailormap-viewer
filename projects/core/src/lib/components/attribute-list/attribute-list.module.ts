import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedComponentsModule, SharedImportsModule } from '@tailormap-viewer/shared';
import { AttributeListMenuButtonComponent } from './attribute-list-menu-button/attribute-list-menu-button.component';
import { AttributeListComponent } from './attribute-list/attribute-list.component';
import { AttributeListTabComponent } from './attribute-list-tab/attribute-list-tab.component';
import { MenubarModule } from '../menubar';
import { StoreModule } from '@ngrx/store';
import { attributeListStateKey } from './state/attribute-list.state';
import { attributeListReducer } from './state/attribute-list.reducer';
import { AttributeListManagerService } from './services/attribute-list-manager.service';
import { AttributeListEffects } from './state/attribute-list.effects';
import { EffectsModule } from '@ngrx/effects';
import { AttributeListContentComponent } from './attribute-list-content/attribute-list-content.component';
import { AttributeListTableComponent } from './attribute-list-table/attribute-list-table.component';
import { AttributeListTabToolbarComponent } from './attribute-list-tab-toolbar/attribute-list-tab-toolbar.component';
import { AttributeListPagingDialogComponent } from './attribute-list-paging-dialog/attribute-list-paging-dialog.component';

@NgModule({
  declarations: [
    AttributeListComponent,
    AttributeListMenuButtonComponent,
    AttributeListTabComponent,
    AttributeListTabToolbarComponent,
    AttributeListContentComponent,
    AttributeListTableComponent,
    AttributeListPagingDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedImportsModule,
    SharedComponentsModule,
    MenubarModule,
    StoreModule.forFeature(attributeListStateKey, attributeListReducer),
    EffectsModule.forFeature([AttributeListEffects]),
  ],
  exports: [
    AttributeListComponent,
  ],
})
export class AttributeListModule {
  public constructor(
    // Service is instantiated here, watches changes to visible layers to create tabs
    public attributeListManagerService: AttributeListManagerService,
  ) {}
}
