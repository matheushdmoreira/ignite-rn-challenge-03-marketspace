export function formatValueCurrency(value: number) {
  let result = Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
    .format(value)
    .replace(/\R\$/g, '')
    .trim();

  return result;
}
