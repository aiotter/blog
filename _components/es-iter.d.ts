declare class Iter<T> {
  constructor(iter: Iterable<T>);
  product(...iterables: Iterable<T>[]): Iter<T[]>;
  toIter(): Iterator<T>;
  toArray(): T[];
}
export default Iter;
