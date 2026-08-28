export type NqProduct = {
  id: string;
  name: string;
  quantity: string;
  quantityUnit: string;
  factoryId: string;
  expiry: string;
};

export const NQ_UNIT_OPTIONS = ["g", "kg", "ml", "L", "個"];
