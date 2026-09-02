import { createLegalMetadata, LegalPage } from '@/components/legal/legal-page';
import { communityGuidelinesDocument } from '@/src/fixtures/legal';

export const metadata = createLegalMetadata(communityGuidelinesDocument);

export default function CommunityGuidelinesPage() {
  return <LegalPage document={communityGuidelinesDocument} />;
}
