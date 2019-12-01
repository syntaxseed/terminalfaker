export function getAllMethodNames(obj) {
  let methods = new Set();

  for (const x in obj) {
    if (x != 'terminal' && x != 'commands') {
      methods.add(x);
    }
  }

  while(obj = Reflect.getPrototypeOf(obj)) {
    let keys = Reflect.ownKeys(obj);
    keys.forEach((k) => {
      methods.add(k);
    });
  }

  return [...methods];
}
