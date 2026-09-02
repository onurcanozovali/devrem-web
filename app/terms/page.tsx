import { createLegalMetadata, LegalPage } from '@/components/legal/legal-page';
import { termsDocument } from '@/src/fixtures/legal';

export const metadata = createLegalMetadata(termsDocument);

export default function TermsPage() {
  return <LegalPage document={termsDocument} />;
}
