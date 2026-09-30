import Purchases, {
  LOG_LEVEL,
  PurchasesPackage,
} from "react-native-purchases";

export const ENTITLEMENT_ID = "keavex_pro_monthly";

export async function initPurchases() {
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

  if (!apiKey) {
    throw new Error("RevenueCat API key is missing.");
  }

  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  await Purchases.configure({ apiKey });
}

export async function isPro(): Promise<boolean> {
  const customerInfo = await Purchases.getCustomerInfo();

  return Boolean(
    customerInfo.entitlements.active[ENTITLEMENT_ID]
  );
}

export async function getMonthlyPackage(): Promise<PurchasesPackage | null> {
  const offerings = await Purchases.getOfferings();

  if (!offerings.current) {
    return null;
  }

  return offerings.current.monthly ?? null;
}

export async function buyPro() {
  const pkg = await getMonthlyPackage();

  if (!pkg) {
    throw new Error("Monthly Pro package is not available.");
  }

  const result = await Purchases.purchasePackage(pkg);

  return Boolean(
    result.customerInfo.entitlements.active[ENTITLEMENT_ID]
  );
}

export async function restorePro(): Promise<boolean> {
  const customerInfo = await Purchases.restorePurchases();

  return Boolean(
    customerInfo.entitlements.active[ENTITLEMENT_ID]
  );
}
