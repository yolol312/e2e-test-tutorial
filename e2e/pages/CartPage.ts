import type { Locator, Page } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  checkoutButton(): Locator {
    return this.page.getByTestId("checkout-button");
  }

  outOfStockNotice(): Locator {
    return this.page.getByText("품절 상품이 포함되어 구매할 수 없어요.");
  }

  async checkout() {
    await this.checkoutButton().click();
  }
}

