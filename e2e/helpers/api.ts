import type { APIRequestContext } from "@playwright/test";

export const API_BASE_URL = "http://localhost:3000";

type ProductRecord = {
  id: string;
  isOutOfStock?: boolean;
};

export async function deleteAllByQuery(
  request: APIRequestContext,
  path: string,
): Promise<void> {
  const response = await request.get(`${API_BASE_URL}${path}`);
  const items = (await response.json()) as Array<{ id: string }>;
  const basePath = path.split("?")[0];
  await Promise.all(
    items.map((item) =>
      request.delete(`${API_BASE_URL}${basePath}/${item.id}`),
    ),
  );
}

export async function resetCartForUser(
  request: APIRequestContext,
  userId: string,
) {
  await deleteAllByQuery(request, `/cartItems?userId=${userId}`);
}

export async function resetOrdersForUser(
  request: APIRequestContext,
  userId: string,
) {
  await deleteAllByQuery(request, `/orders?userId=${userId}`);
}

export async function getProduct(
  request: APIRequestContext,
  productId: string,
): Promise<ProductRecord> {
  const response = await request.get(`${API_BASE_URL}/products/${productId}`);
  return (await response.json()) as ProductRecord;
}

export async function setProductOutOfStock(
  request: APIRequestContext,
  productId: string,
  isOutOfStock: boolean,
) {
  await request.patch(`${API_BASE_URL}/products/${productId}`, {
    data: { isOutOfStock },
  });
}

