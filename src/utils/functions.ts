import _ from 'lodash';

export const generateUniqueId = (min = 100000, max = 999999) => {
  const randomNumber = _.random(min, max);
  const timestamp = Date.now();
  return `${timestamp}${randomNumber}`;
};
