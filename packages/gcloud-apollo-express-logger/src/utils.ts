export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const copyObj: Partial<T> = {}
  keys.forEach(key => {
    copyObj[key] = obj[key]
  })
  return copyObj as Pick<T, K>
}

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const copyObj = { ...obj }
  keys.forEach(key => {
    delete copyObj[key]
  })
  return copyObj
}
