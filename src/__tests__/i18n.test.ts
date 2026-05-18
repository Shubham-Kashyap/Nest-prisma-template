import { generateKeys, resolveLanguage, maybeTranslate } from '@utilities/i18n';
import { Language } from '@constants/enum';

test('generateKeys produces dot notation keys', () => {
  const obj = {
    user: {
      name: 'John',
      address: {
        city: 'NY',
        zip: '10001'
      }
    },
    role: 'admin'
  };
  const keys = generateKeys(obj);
  expect(keys).toEqual({
    user: {
      name: 'user.name',
      address: {
        city: 'user.address.city',
        zip: 'user.address.zip'
      }
    },
    role: 'role'
  });
});

test('resolveLanguage picks language from request', () => {
  const req = { headers: { 'accept-language': 'hi, en;q=0.8' } } as any;
  const lang = resolveLanguage(req);
  expect(lang).toBe(Language.Hindi);
});

test('maybeTranslate returns fallback when key missing', () => {
  const result = maybeTranslate('nonexistent.key' as any, Language.English);
  expect(result).toBe('nonexistent.key');
});
