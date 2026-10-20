import {
  MOCK_COMPANY_ID,
  defaultBrandsMock,
  defaultCategoriesMock,
  productMock,
} from "../mock/product.mock";
import { toProductItem } from "../utils/mapper";
import type {
  AdjustStockPayload,
  Product,
  ProductErrorCode,
  ProductImageInput,
  ProductOptions,
  ProductStats,
  ProductUpsertPayload,
  UpdateProductPayload,
} from "../type/product.type";

/** error ที่ UI แยกแยะได้ เช่น SKU ซ้ำ → ขึ้นข้อความใต้ช่อง SKU */
export class ProductServiceError extends Error {
  constructor(public readonly code: ProductErrorCode) {
    super(code);
    this.name = "ProductServiceError";
  }
}

// ---------------------------------------------------------------------------
// ยังไม่มี endpoint สินค้าฝั่ง backend ใช้ store ในหน่วยความจำไปก่อน
// ทุกฟังก์ชันคืน Promise รูปเดียวกับ API จริง เปลี่ยนเป็น api.get/post ทีละตัวได้
// โดยไม่ต้องแตะ hook หรือ component (ข้อมูลรีเซ็ตเมื่อรีเฟรชหน้า)
//
// เปิด /product?mock=empty เพื่อดูหน้าตอนร้านยังไม่มีสินค้า
// ---------------------------------------------------------------------------

const startEmpty = new URLSearchParams(window.location.search).get("mock") === "empty";
let store: Product[] = startEmpty ? [] : structuredClone(productMock);

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();
const unique = (values: string[]) =>
  [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right, "th"));

const findProduct = (id: string) => {
  const product = store.find((item) => item.id === id);
  if (!product) throw new ProductServiceError("NOT_FOUND");
  return product;
};

const assertSkuAvailable = (sku: string, exceptVariantId?: string) => {
  const taken = store.some((product) =>
    product.variants.some(
      (variant) =>
        variant.id !== exceptVariantId && variant.sku.toLowerCase() === sku.toLowerCase()
    )
  );
  if (taken) throw new ProductServiceError("SKU_TAKEN");
};

/** แทน backend ที่จะอัปโหลดไฟล์แล้วคืน URL — mock ใช้ object URL ซึ่งอยู่ได้จนรีเฟรชหน้า */
const resolveImages = (images: ProductImageInput[]) =>
  images.map((image) => (image.kind === "existing" ? image.url : URL.createObjectURL(image.file)));

const generateSku = () => `SKU-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    await delay();
    return structuredClone(store);
  },

  getById: async (id: string): Promise<Product> => {
    await delay(200);
    return structuredClone(findProduct(id));
  },

  getStats: async (): Promise<ProductStats> => {
    await delay(250);
    const items = store.map(toProductItem);

    return {
      total: items.length,
      active: items.filter((item) => item.status === "ACTIVE").length,
      lowStock: items.filter((item) => item.stockLevel === "low").length,
    };
  },

  getOptions: async (): Promise<ProductOptions> => {
    await delay(150);

    return {
      categories: unique([
        ...defaultCategoriesMock,
        ...store.map((product) => product.category ?? ""),
      ]),
      brands: unique([...defaultBrandsMock, ...store.map((product) => product.meta.brand ?? "")]),
    };
  },

  create: async (payload: ProductUpsertPayload): Promise<Product> => {
    await delay(600);
    const sku = payload.variant.sku ?? generateSku();
    assertSkuAvailable(sku);

    const productId = crypto.randomUUID();
    const variantId = crypto.randomUUID();
    const timestamp = now();

    const product: Product = {
      id: productId,
      companyId: MOCK_COMPANY_ID,
      name: payload.name,
      aliases: [],
      description: payload.description,
      category: payload.category,
      language: "th",
      status: payload.status,
      presetVersion: 1,
      revision: 1,
      searchRevision: 1,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      meta: { ...payload.meta, images: resolveImages(payload.images) },
      variants: [
        {
          id: variantId,
          companyId: MOCK_COMPANY_ID,
          productId,
          sku,
          price: payload.variant.price,
          compareAtPrice: payload.variant.compareAtPrice,
          inventory: {
            id: crypto.randomUUID(),
            companyId: MOCK_COMPANY_ID,
            variantId,
            onHand: payload.variant.stock,
            reserved: 0,
            version: 1,
            updatedAt: timestamp,
          },
          meta: payload.variant.meta,
          trackStock: payload.variant.trackStock,
          currency: "THB",
          version: 1,
          active: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    };

    store = [product, ...store];
    return structuredClone(product);
  },

  update: async (payload: UpdateProductPayload): Promise<Product> => {
    await delay(600);
    const current = findProduct(payload.id);
    if (current.revision !== payload.revision) throw new ProductServiceError("VERSION_CONFLICT");

    const [variant] = current.variants;
    const sku = payload.variant.sku ?? variant.sku;
    assertSkuAvailable(sku, variant.id);

    const timestamp = now();
    const inventory = variant.inventory;
    const reserved = inventory?.reserved ?? 0;

    const updated: Product = {
      ...current,
      name: payload.name,
      description: payload.description,
      category: payload.category,
      status: payload.status,
      revision: current.revision + 1,
      searchRevision: current.searchRevision + 1,
      updatedAt: timestamp,
      meta: { ...current.meta, ...payload.meta, images: resolveImages(payload.images) },
      variants: [
        {
          ...variant,
          sku,
          price: payload.variant.price,
          compareAtPrice: payload.variant.compareAtPrice,
          trackStock: payload.variant.trackStock,
          meta: { ...variant.meta, ...payload.variant.meta },
          version: variant.version + 1,
          updatedAt: timestamp,
          inventory: inventory && {
            ...inventory,
            onHand: payload.variant.stock + reserved,
            version: inventory.version + 1,
            updatedAt: timestamp,
          },
        },
        ...current.variants.slice(1),
      ],
    };

    store = store.map((product) => (product.id === updated.id ? updated : product));
    return structuredClone(updated);
  },

  adjustStock: async (payload: AdjustStockPayload): Promise<void> => {
    await delay(400);
    const product = store.find((item) =>
      item.variants.some((variant) => variant.id === payload.variantId)
    );
    const variant = product?.variants.find((item) => item.id === payload.variantId);
    if (!product || !variant?.inventory) throw new ProductServiceError("NOT_FOUND");
    if (variant.inventory.version !== payload.expectedVersion) {
      throw new ProductServiceError("VERSION_CONFLICT");
    }

    const timestamp = now();
    variant.inventory = {
      ...variant.inventory,
      onHand: Math.max(0, variant.inventory.onHand + payload.deltaOnHand),
      version: variant.inventory.version + 1,
      updatedAt: timestamp,
    };
    product.updatedAt = timestamp;
  },

  duplicate: async (id: string): Promise<Product> => {
    await delay(500);
    const source = findProduct(id);
    const productId = crypto.randomUUID();
    const timestamp = now();

    // สำเนาเริ่มเป็นฉบับร่างและสต็อก 0 เสมอ กันขายของที่ยังไม่ได้ตรวจ
    const copy: Product = {
      ...structuredClone(source),
      id: productId,
      name: `${source.name} (สำเนา)`,
      status: "DRAFT",
      revision: 1,
      searchRevision: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      variants: source.variants.map((variant) => {
        const variantId = crypto.randomUUID();
        return {
          ...structuredClone(variant),
          id: variantId,
          productId,
          sku: `${variant.sku}-COPY-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
          version: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
          inventory: variant.inventory && {
            ...variant.inventory,
            id: crypto.randomUUID(),
            variantId,
            onHand: 0,
            reserved: 0,
            version: 1,
            updatedAt: timestamp,
          },
        };
      }),
    };

    store = [copy, ...store];
    return structuredClone(copy);
  },

  remove: async (id: string): Promise<void> => {
    await delay(400);
    findProduct(id);
    store = store.filter((product) => product.id !== id);
  },
};
