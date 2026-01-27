import { expect, test } from "@playwright/test";
import { demoUser } from "../fixtures/users";
import { resetCartForUser, resetOrdersForUser } from "../helpers/api";
import { CartPage } from "../pages/CartPage";
import { LoginPage } from "../pages/LoginPage";
import { Navbar } from "../pages/Navbar";
import { ProductsPage } from "../pages/ProductsPage";

test("로그인 -> 장바구니 담기 -> 구매", async ({ page, request }) => {
  await resetCartForUser(request, "1");
  await resetOrdersForUser(request, "1");

  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);
  const navbar = new Navbar(page);
  const cartPage = new CartPage(page);

  await loginPage.goto();
  await loginPage.login(demoUser.email, demoUser.password);
  await expect(page).toHaveURL(/\/products/);

  await productsPage.addToCart(1);
  await expect(page.getByText("장바구니에 담았어요.")).toBeVisible();

  await navbar.goToCart();
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByTestId("cart-item")).toHaveCount(1);

  await cartPage.checkout();
  await expect(page.getByTestId("checkout-button")).toBeDisabled();
  await expect(page.getByText("결제 진행 중...")).toBeVisible();
  await expect(
    page.getByText("주문이 완료되었어요. 감사합니다!"),
  ).toBeVisible();

  // cleanup: keep db.json stable for repeated runs
  await resetCartForUser(request, "1");
  await resetOrdersForUser(request, "1");
});
