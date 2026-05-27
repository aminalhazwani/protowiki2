/**
 * Pre-existing article citations
 * References already present in the article before the user enters the editor.
 * Numbers are derived from array position (index + 1) at runtime.
 * Each segment's `style` controls inline rendering: normal, italic, link, or link-italic.
 */

export const citations = [
  {
    id: 'linnaeus-1758',
    segments: [
      { text: 'Linnaeus, C. (1758). ', style: 'normal' },
      { text: '"', style: 'link' },
      { text: 'Felis tigris', style: 'link-italic' },
      { text: '"', style: 'link' },
      { text: '. ', style: 'normal' },
      {
        text: 'Caroli Linnæi Systema naturæ per regna tria naturæ, secundum classes, ordines, genera, species, cum characteribus, differentiis, synonymis, locis. Tomus I',
        style: 'italic',
      },
      {
        text: ' (decima, reformata ed.). Holmiae: Laurentius Salvius. p. 41.',
        style: 'normal',
      },
    ],
  },
  {
    id: 'temminck-1844',
    segments: [
      { text: 'Temminck, C. J. (1844). ', style: 'normal' },
      {
        text: '"Aperçu général et spécifique sur les Mammifères qui habitent le Japon et les Iles qui en dépendent"',
        style: 'link',
      },
      {
        text: '. In Siebold, P. F. v.; Temminck, C. J.; Schlegel, H. (eds.). ',
        style: 'normal',
      },
      {
        text: 'Fauna Japonica sive Descriptio animalium, quae in itinere per Japoniam, jussu et auspiciis superiorum, qui summum in India Batava imperium tenent, suscepto, annis 1825–1830 collegit, notis, observationibus et adumbrationibus illustravit Ph. Fr. de Siebold.',
        style: 'italic',
      },
      { text: ' Leiden: Lugduni Batavorum.', style: 'normal' },
    ],
  },
]
