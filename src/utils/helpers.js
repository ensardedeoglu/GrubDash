const isProvided = thing => {
  return thing && thing !== undefined && thing !== "";
}

const arrayIsEmpty = thingArray => {
  return thingArray.length === 0;
}

const isPositiveInteger = potentialInt => {
  return Number(potentialInt) && Number.isInteger(potentialInt) && potentialInt > 0;
}

module.exports = {
  isProvided,
  arrayIsEmpty,
  isPositiveInteger
}