export interface TestDataItem {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'password';
  description?: string;
}

export interface TestDataSet {
  id: string;
  name: string;
  description?: string;
  productId: string;
  createdBy: string;
  lastModified?: string | number;
  isActive: boolean;
  items?: TestDataItem[];
  data?: TestDataItem[]; // Alternative property name for items
}
