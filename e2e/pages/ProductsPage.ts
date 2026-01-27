import type { Locator, Page } from "@playwright/test";

export class ProductsPage {
  constructor(private readonly page: Page) {}

  productCard(productId: number): Locator {
    return this.page.getByTestId(`product-card-${productId}`);
  }

  addToCartButton(productId: number): Locator {
    return this.page.getByTestId(`add-to-cart-${productId}`);
  }

  outOfStockBadge(productId: number): Locator {
    // strict mode: "품절" 텍스트는 버튼에도 있으므로 span 뱃지만 선택
    return this.productCard(productId).locator("span").filter({ hasText: "품절" });
  }

  async addToCart(productId: number) {
    await this.addToCartButton(productId).click();
  }
}

