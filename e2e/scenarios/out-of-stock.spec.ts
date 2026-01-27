import { expect, test } from "@playwright/test";
import { demoUser } from "../fixtures/users";
import {
  getProduct,
  resetCartForUser,
  resetOrdersForUser,
  setProductOutOfStock,
} from "../helpers/api";
import { CartPage } from "../pages/CartPage";
import { LoginPage } from "../pages/LoginPage";
import { Navbar } from "../pages/Navbar";
import { ProductsPage } from "../pages/ProductsPage";

test("품절 상품은 장바구니에 담을 수 없다", async ({ page, request }) => {
  const productId = "5";

  const original = await getProduct(request, productId);

  try {
    await setProductOutOfStock(request, productId, true);

    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);

    await loginPage.goto();
    await loginPage.login(demoUser.email, demoUser.password);
    await expect(page).toHaveURL(/\/products/);

    const productIdNumber = Number(productId);
    await expect(productsPage.outOfStockBadge(productIdNumber)).toBeVisible();
    await expect(productsPage.addToCartButton(productIdNumber)).toBeDisabled();
    await expect(productsPage.addToCartButton(productIdNumber)).toHaveText(
      "품절",
    );
  } finally {
    // 복구 + 데이터 정리(반복 실행 안정화)
    await setProductOutOfStock(request, productId, original.isOutOfStock);
    await resetCartForUser(request, "1");
    await resetOrdersForUser(request, "1");
  }
});

test("장바구니에 품절 상품이 포함되면 구매하기가 비활성화된다", async ({
  page,
  request,
}) => {
  // 다른 테스트와 상태 충돌을 피하기 위해, 이 테스트에서만 상품 6번을 토글합니다.
  const productId = "6";

  await resetCartForUser(request, "1");
  await resetOrdersForUser(request, "1");

  const original = await getProduct(request, productId);

  try {
    await setProductOutOfStock(request, productId, false);

    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const navbar = new Navbar(page);
    const cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login(demoUser.email, demoUser.password);
    await expect(page).toHaveURL(/\/products/);

    await productsPage.addToCart(Number(productId));
    await expect(page.getByText("장바구니에 담았어요.")).toBeVisible();

    await navbar.goToCart();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByTestId("cart-item")).toHaveCount(1);
    await expect(cartPage.checkoutButton()).toBeEnabled();

    // 장바구니에 담긴 후 "품절"로 변경되는 상황을 재현
    await setProductOutOfStock(request, productId, true);
    await page.reload();

    await expect(cartPage.outOfStockNotice()).toBeVisible();
    await expect(cartPage.checkoutButton()).toBeDisabled();
  } finally {
    // 복구 + 데이터 정리(반복 실행 안정화)
    await setProductOutOfStock(request, productId, original.isOutOfStock);
    await resetCartForUser(request, "1");
    await resetOrdersForUser(request, "1");
  }
});
