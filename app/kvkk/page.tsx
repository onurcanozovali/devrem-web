import { createLegalMetadata, LegalPage } from '@/components/legal/legal-page';
import { kvkkDocument } from '@/src/fixtures/legal';

export const metadata = createLegalMetadata(kvkkDocument);

export default function KvkkPage() {
  return <LegalPage document={kvkkDocument} />;
}
