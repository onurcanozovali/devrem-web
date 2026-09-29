import { LegalPage, createLegalMetadata } from '@/components/legal/legal-page';
import { cookiePolicyDocument } from '@/src/fixtures/legal';

export const metadata = createLegalMetadata(cookiePolicyDocument);

export default function CookiePolicyPage() {
  return <LegalPage document={cookiePolicyDocument} />;
}
