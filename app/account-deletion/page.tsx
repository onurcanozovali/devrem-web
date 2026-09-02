import { createLegalMetadata, LegalPage } from '@/components/legal/legal-page';
import { accountDeletionDocument } from '@/src/fixtures/legal';

export const metadata = createLegalMetadata(accountDeletionDocument);

export default function AccountDeletionPage() {
  return <LegalPage document={accountDeletionDocument} />;
}
