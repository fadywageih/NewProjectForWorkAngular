export interface IRepository<T, TKey> {
  getById(id: TKey): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: TKey, entity: Partial<T>): Promise<T>;
  delete(id: TKey): Promise<void>;
}