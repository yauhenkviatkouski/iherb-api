export const addBYtoUri = (uri: string): string => {
  return uri.replace(/.+iherb.com/g, 'https://by.iherb.com');
};
