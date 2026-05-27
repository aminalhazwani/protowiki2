/**
 * Reference sources configuration
 * Wikimedia project sources displayed as cards in the "References" view.
 * Each source includes individual references shown in the Discover tab.
 * The referenceCount is derived from the references array length.
 */

export const referenceSources = [
  {
    id: 'wikispecies',
    title: 'Wikispecies',
    description: 'Free species directory',
    url: 'https://species.wikimedia.org/wiki/Panthera_tigris_altaica',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/WikiSpecies_notext.svg',
    references: [
      {
        id: 'mazak-1981',
        text: 'Vratislav Mazák (1981) Panthera tigris. Mammalian species. 152 :1-8 The American Society of Mammalogists.',
      },
      {
        id: 'wilson-reeder-2005',
        text: 'Panthera tigris altaica in Mammal Species of the World. Wilson, Don E. & Reeder, DeeAnn M. (Editors.) 2005. Mammal Species of the World \u2013 A Taxonomic and Geographic Reference. Third edition. ISBN 0-8018-8221-4.',
      },
    ],
  },
  {
    id: 'commons',
    title: 'Commons',
    description: 'Free media collection',
    url: 'https://commons.wikimedia.org/wiki/Category:Panthera_tigris_altaica',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Commons-logo.svg',
    references: [
      {
        id: 'msw-v3-2005',
        text: 'Mammal Species of the World (v3, 2005): Panthera tigris altaica',
      },
    ],
  },
  {
    id: 'wikidata',
    title: 'Wikidata',
    description: 'Free knowledge base',
    url: 'https://www.wikidata.org/wiki/Q69581',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg',
    references: [
      {
        id: 'iucn-critically-endangered',
        text: 'IUCN: Panthera tigris altaica  (Critically Endangered)',
      },
    ],
  },
]
