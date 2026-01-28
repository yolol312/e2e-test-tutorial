import { test, expect } from "@playwright/test";
import type { Page, APIRequestContext } from "@playwright/test";

const API_BASE_URL = "http://localhost:3000";

// ============================================
// 테스트 사용자 타입
// ============================================
export type TestUser = {
  id?: string;
  name?: string;
  email: string;
  password: string;
};

// 기본 데모 사용자
export const DEMO_USER: TestUser = {
  id: "1",
  name: "Demo User",
  email: "demo@breeze.com",
  password: "demo1234",
};

// 고유한 테스트 사용자 생성
export const createTestUser = (name = "테스트유저"): TestUser => ({
  name,
  email: `test-${Date.now()}@example.com`,
  password: "test1234",
});

// ============================================
// 인증 관련 헬퍼 함수
// ============================================

/** 로그인 수행 */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();

  await page.getByTestId("login-email").fill(user.email);
  await page.getByTestId("login-password").fill(user.password);
  await page.getByTestId("login-submit").click();

  // 로그인 성공 후 상품 페이지로 이동 확인
  await expect(page).toHaveURL("/products");
  await expect(
    page.getByRole("heading", { name: "오늘의 추천 상품" })
  ).toBeVisible();
}

/** 회원가입 수행 */
export async function signup(page: Page, user: TestUser): Promise<void> {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "회원가입" })).toBeVisible();

  await page.getByPlaceholder("홍길동").fill(user.name || "테스트유저");
  await page.getByPlaceholder("you@example.com").fill(user.email);
  await page.getByPlaceholder("8자 이상").fill(user.password);

  await page.getByRole("button", { name: "회원가입 완료하기" }).click();

  // 회원가입 성공 후 상품 페이지로 이동 확인
  await expect(page).toHaveURL("/products");
  await expect(
    page.getByRole("heading", { name: "오늘의 추천 상품" })
  ).toBeVisible();
}

/** 로그아웃 수행 */
export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: "로그아웃" }).click();
}

/** 로그인 상태 확인 */
export async function expectLoggedIn(page: Page, userName: string): Promise<void> {
  await expect(page.getByText(`${userName} 님`)).toBeVisible();
}

// ============================================
// 상품/장바구니 관련 헬퍼 함수
// ============================================

/** 상품을 장바구니에 담기 */
export async function addToCart(page: Page, productId: number | string): Promise<void> {
  await expect(page.getByTestId(`product-card-${productId}`)).toBeVisible();
  await page.getByTestId(`add-to-cart-${productId}`).click();
}

/** 장바구니 페이지로 이동 */
export async function goToCart(page: Page): Promise<void> {
  await page.getByTestId("nav-cart").click();
  await expect(page).toHaveURL("/cart");
}

/** 구매하기 (체크아웃) */
export async function checkout(page: Page): Promise<void> {
  await page.getByTestId("checkout-button").click();

  // 결제 진행 중 메시지 확인
  await expect(page.getByText("결제 진행 중...")).toBeVisible();

  // 주문 완료 메시지 확인 (결제 처리에 3초 delay가 있음)
  await expect(
    page.getByText("주문이 완료되었어요. 감사합니다!")
  ).toBeVisible({ timeout: 10000 });
}

// ============================================
// API 관련 헬퍼 함수
// ============================================

async function deleteAllByQuery(
  request: APIRequestContext,
  path: string
): Promise<void> {
  const response = await request.get(`${API_BASE_URL}${path}`);
  const items = (await response.json()) as Array<{ id: string }>;
  const basePath = path.split("?")[0];
  await Promise.all(
    items.map((item) =>
      request.delete(`${API_BASE_URL}${basePath}/${item.id}`)
    )
  );
}

/** 사용자의 장바구니 초기화 */
export async function resetCartForUser(
  request: APIRequestContext,
  userId: string
): Promise<void> {
  await deleteAllByQuery(request, `/cartItems?userId=${userId}`);
}

/** 사용자의 주문 내역 초기화 */
export async function resetOrdersForUser(
  request: APIRequestContext,
  userId: string
): Promise<void> {
  await deleteAllByQuery(request, `/orders?userId=${userId}`);
}

/** 이메일로 사용자 삭제 */
export async function deleteUserByEmail(
  request: APIRequestContext,
  email: string
): Promise<void> {
  await deleteAllByQuery(
    request,
    `/users?email=${encodeURIComponent(email)}`
  );
}

export { API_BASE_URL, deleteAllByQuery, test, expect };
