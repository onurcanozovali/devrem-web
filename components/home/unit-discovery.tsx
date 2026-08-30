import { popularMilitaryUnits } from '@/src/fixtures/home';
import { Container } from '@/components/site/container';
import { MilitaryUnitSearch } from './military-unit-search';
import { SectionHeader } from './section-header';

export function UnitDiscovery() {
  return (
    <section className="py-20 sm:py-24 lg:py-28" id="birlikler">
      <Container>
        <SectionHeader eyebrow="Birlik rehberi" title="Birliğini bul" description="Birliğin hakkında bilgi edin, aynı dönemde oraya gidecek devrelerini gör." />
        <div className="mt-10"><MilitaryUnitSearch units={popularMilitaryUnits} /></div>
      </Container>
    </section>
  );
}
