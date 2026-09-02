import { createLegalMetadata, LegalPage } from '@/components/legal/legal-page';
import { supportDocument } from '@/src/fixtures/legal';

export const metadata = createLegalMetadata(supportDocument);

export default function SupportPage() {
  return <LegalPage document={supportDocument} />;
}
