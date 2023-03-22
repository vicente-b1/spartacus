import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { I18nModule } from '@spartacus/core';
import { MediaModule } from '@spartacus/storefront';
import { AsmProductItemModule } from '../asm-product-item/asm-product-item.module';

import { AsmCustomerProductListingComponent } from './asm-customer-product-listing.component';

@NgModule({
  imports: [CommonModule, I18nModule, MediaModule, AsmProductItemModule],
  declarations: [AsmCustomerProductListingComponent],
  exports: [AsmCustomerProductListingComponent],
})
export class AsmCustomerProductListingModule {}
