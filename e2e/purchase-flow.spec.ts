import { test, expect } from "@playwright/test";
import {
  DEMO_USER,
  login,
  addToCart,
  goToCart,
  checkout,
  resetCartForUser,
  resetOrdersForUser,
} from "./helper";

test.describe("구매 플로우", () => {
  test.beforeEach(async ({ request }) => {
    // 테스트 전 장바구니와 주문 내역 초기화
    await resetCartForUser(request, DEMO_USER.id!);
    await resetOrdersForUser(request, DEMO_USER.id!);
  });

  test("로그인 → 상품 리스트 조회 → 장바구니 담기 → 구매하기", async ({ page }) => {
    // 1. 로그인
    await login(page, DEMO_USER);

    // 2. 첫 번째 상품 장바구니에 담기
    await addToCart(page, 1);

    // 3. 장바구니 페이지로 이동
    await goToCart(page);

    // 4. 장바구니에 상품이 담겼는지 확인
    await expect(page.getByTestId("cart-item")).toBeVisible();
    await expect(page.getByText("Cloud Linen Bedding")).toBeVisible();

    // 5. 구매하기
    await checkout(page);

    // 6. 장바구니가 비워졌는지 확인
    await expect(page.getByText("장바구니가 비어 있어요")).toBeVisible();
  });
});
