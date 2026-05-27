/**
 * Article sections configuration
 * Defines the sections displayed as accordions in the editor rail.
 * Each paragraph's `content` is the text inserted into the editor when the card is clicked.
 */

/** Label used for inline citation superscripts. Change here to update everywhere. */
export const CITATION_LABEL = 'Add a citation'

const CITE = `[${CITATION_LABEL}]`

export const articleSections = [
  {
    title: 'Introduction',
    description: 'A short summary of the topic.',
    paragraphs: [
      {
        title: 'Short overview',
        description: 'A brief introduction to the topic.',
        content: `The {{common name}} or {{alternative name}} is a {{taxonomic rank}} of the {{parent taxon common name}} subspecies {{binomial name}} native to {{taxon range}}.${CITE} It once ranged throughout {{historical range}}.${CITE}`,
      },
      {
        title: 'Taxonomy in brief',
        description: 'How it is classified scientifically.',
        content: `The {{common name}} was first described in {{year first described}} by {{author citation}} under the scientific name {{original scientific name}}.${CITE} It belongs to the family {{family}}, order {{order}}, and is one of {{number of subspecies}} living subspecies of {{parent taxon common name}} recognised today.${CITE}`,
      },
    ],
  },
  {
    title: 'Characteristics',
    description: 'Physical traits and appearance.',
    paragraphs: [
      {
        title: 'Body size',
        description: 'Dimensions and weight of adults.',
        content: `The {{common name}} is the {{size superlative}} living {{higher taxon common name}}.${CITE} Males measure {{body length range}} in head-and-body length, with a tail of {{tail length range}}.${CITE} Adult males can weigh between {{weight range}}.${CITE}`,
      },
      {
        title: 'Coat and markings',
        description: 'Fur colour, stripe pattern and seasonal changes.',
        content: `Its coat is {{coat base colour}}, with {{marking description}}.${CITE} The pattern of {{marking type}} is unique to each individual, much like human fingerprints.${CITE} In winter the fur grows {{seasonal coat change}}, helping the {{common name}} blend into {{seasonal habitat}}.${CITE}`,
      },
    ],
  },
  {
    title: 'Distribution and habitat',
    description: 'Where it lives and its environment.',
    paragraphs: [
      {
        title: 'Geographic range',
        description: 'Countries and regions where the tiger is found.',
        content: `Today the {{common name}} inhabits mainly the {{primary habitat description}} in {{primary range regions}}.${CITE} A small population also persists in {{secondary range location}}.${CITE}`,
      },
      {
        title: 'Preferred habitat',
        description: 'Types of terrain and vegetation it occupies.',
        content: `It favours {{preferred vegetation types}} with {{habitat features}}.${CITE} Elevation ranges from {{elevation range}}, though individuals have been recorded at higher altitudes during {{movement context}}.${CITE}`,
      },
    ],
  },
  {
    title: 'Ecology and behaviour',
    description: 'Diet, activity and social behaviour.',
    // paragraphs: [
    //   {
    //     title: 'Hunting and diet',
    //     description: 'What it eats and how it catches prey.',
    //     content:
    //       'The Siberian tiger is an apex predator that hunts primarily ungulates such as red deer, wild boar, and sika deer. It stalks its prey silently through dense vegetation before launching a short, explosive charge, dispatching the quarry with a powerful bite to the neck.',
    //   },
    //   {
    //     title: 'Territory and social structure',
    //     description: 'How it marks and defends its home range.',
    //     content:
    //       'Adults are solitary and maintain large home ranges that they mark with urine, claw marks, and faeces. A male territory may overlap those of several females. Home ranges vary from 500 to over 4 000 square kilometres depending on prey density and habitat quality.',
    //   },
    // ],
  },
]
