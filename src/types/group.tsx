export type Group = {
  id: number;
  name: string;
  emoji?: string | null;
  description?: string | null;
  createdBy?: number;
  default?: boolean;
};