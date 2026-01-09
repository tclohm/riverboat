// Maps pass types to their corresponding key images
export const passTypeImages: Record<string, string> = {
  'Dream Key': '/keys/dreamkey.png',
  'Inspire Key': '/keys/inspirekey.png',
  'Enchant Key': '/keys/enchantkey.png',
  'Believe Key': '/keys/believekey.png'
};

export function getPassImage(passType: string): string {
  return passTypeImages[passType] || '/keys/dreamkey.png';
}
