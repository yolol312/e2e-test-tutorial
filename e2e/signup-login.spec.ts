import { test } from "@playwright/test";
import {
  createTestUser,
  signup,
  login,
  logout,
  expectLoggedIn,
  deleteUserByEmail,
} from "./helper";

test.describe("회원가입 및 로그인", () => {
  test("회원가입 → 로그인", async ({ page, request }) => {
    // 테스트마다 고유한 사용자 생성
    const testUser = createTestUser();

    try {
      // 1. 회원가입
      await signup(page, testUser);

      // 2. 로그인 상태 확인
      await expectLoggedIn(page, testUser.name!);

      // 3. 로그아웃
      await logout(page);

      // 4. 다시 로그인
      await login(page, testUser);

      // 5. 로그인 상태 확인
      await expectLoggedIn(page, testUser.name!);
    } finally {
      // 테스트 후 생성된 사용자 삭제
      await deleteUserByEmail(request, testUser.email);
    }
  });
});
