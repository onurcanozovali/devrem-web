import { createLegalMetadata, LegalPage } from '@/components/legal/legal-page';
import { privacyDocument } from '@/src/fixtures/legal';

export const metadata = createLegalMetadata(privacyDocument);

export default function PrivacyPage() {
  return <LegalPage document={privacyDocument} />;
}
