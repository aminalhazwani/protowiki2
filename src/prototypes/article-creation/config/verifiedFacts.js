/**
 * Verified facts configuration
 * Wikidata facts displayed as cards in the "Verified facts" view.
 * Each fact's reference count is derived from its `references` array length.
 */

export const verifiedFacts = [
  {
    title: 'Panthera tigris altaica',
    description: 'taxon name',
    references: [
      { url: 'https://www.mammalsociety.org/taxonomy/panthera-tigris-altaica' },
      { url: 'https://www.iucnredlist.org/species/15956/5333650' },
    ],
    wikidataUrl: 'https://www.wikidata.org/wiki/Q69581',
  },
  {
    title: 'subspecies',
    description: 'taxon rank',
    references: [
      { url: 'https://www.catalogueoflife.org/data/taxon/4N6PS' },
      { url: 'https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=726546' },
    ],
    wikidataUrl: 'https://www.wikidata.org/wiki/Q69581',
  },
  {
    title: 'tiger',
    description: 'parent taxon',
    references: [
      { url: 'https://www.catalogueoflife.org/data/taxon/4N6PS' },
      { url: 'https://www.iucnredlist.org/species/15955/5333650' },
    ],
    wikidataUrl: 'https://www.wikidata.org/wiki/Q69581',
  },
  {
    title: 'Endangered status',
    description: 'IUCN conservation status',
    references: [
      { url: 'https://www.iucnredlist.org/species/15956/5333650' },
    ],
    wikidataUrl: 'https://www.wikidata.org/wiki/Q69581',
  },
  {
    title: 'Russia',
    description: 'taxon range',
    references: [
      { url: 'https://www.iucnredlist.org/species/15956/5333650' },
    ],
    wikidataUrl: 'https://www.wikidata.org/wiki/Q69581',
  },
]
