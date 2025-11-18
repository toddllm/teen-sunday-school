// Comprehensive list of Jesus's miracles categorized by type

export const miracleCategories = {
  HEALING: 'Healing',
  NATURE: 'Nature',
  RESURRECTION: 'Resurrection',
  EXORCISM: 'Exorcism',
  OTHER: 'Other'
};

export const miracles = [
  // HEALING MIRACLES
  {
    id: 1,
    title: "Healing of Peter's Mother-in-Law",
    category: miracleCategories.HEALING,
    description: "Jesus healed Peter's mother-in-law who was sick with a fever. She got up immediately and began to serve them.",
    references: [
      { book: 'Matthew', chapter: 8, verses: '14-15', translation: 'NIV' },
      { book: 'Mark', chapter: 1, verses: '29-31', translation: 'NIV' },
      { book: 'Luke', chapter: 4, verses: '38-39', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 8:14-15',
    location: 'Capernaum',
    significance: 'Demonstrated Jesus\'s compassion and power to heal instantly.',
    lessonForTeens: 'Jesus cares about our everyday problems and those of our family members.'
  },
  {
    id: 2,
    title: "Healing of the Leper",
    category: miracleCategories.HEALING,
    description: "A man with leprosy came to Jesus and begged for healing. Jesus touched him and said, 'Be clean!' and immediately the leprosy left him.",
    references: [
      { book: 'Matthew', chapter: 8, verses: '1-4', translation: 'NIV' },
      { book: 'Mark', chapter: 1, verses: '40-45', translation: 'NIV' },
      { book: 'Luke', chapter: 5, verses: '12-16', translation: 'NIV' }
    ],
    keyVerse: 'Mark 1:41',
    location: 'Galilee',
    significance: 'Jesus touched the untouchable, breaking social barriers to show God\'s love.',
    lessonForTeens: 'No one is too broken or isolated for Jesus to heal and restore.'
  },
  {
    id: 3,
    title: "Healing of the Paralyzed Man",
    category: miracleCategories.HEALING,
    description: "Four friends brought a paralyzed man to Jesus by lowering him through the roof. Jesus forgave his sins and told him to walk.",
    references: [
      { book: 'Matthew', chapter: 9, verses: '1-8', translation: 'NIV' },
      { book: 'Mark', chapter: 2, verses: '1-12', translation: 'NIV' },
      { book: 'Luke', chapter: 5, verses: '17-26', translation: 'NIV' }
    ],
    keyVerse: 'Mark 2:11',
    location: 'Capernaum',
    significance: 'Showed Jesus\'s authority to forgive sins and heal physical ailments.',
    lessonForTeens: 'Good friends will go to great lengths to bring others to Jesus. Don\'t give up on your friends!'
  },
  {
    id: 4,
    title: "Healing of the Man with a Withered Hand",
    category: miracleCategories.HEALING,
    description: "On the Sabbath, Jesus healed a man with a shriveled hand, demonstrating that doing good is always right.",
    references: [
      { book: 'Matthew', chapter: 12, verses: '9-14', translation: 'NIV' },
      { book: 'Mark', chapter: 3, verses: '1-6', translation: 'NIV' },
      { book: 'Luke', chapter: 6, verses: '6-11', translation: 'NIV' }
    ],
    keyVerse: 'Mark 3:5',
    location: 'Synagogue',
    significance: 'Jesus prioritized compassion over rigid religious rules.',
    lessonForTeens: 'Showing love and compassion is more important than following rules for their own sake.'
  },
  {
    id: 5,
    title: "Healing of the Centurion's Servant",
    category: miracleCategories.HEALING,
    description: "A Roman centurion asked Jesus to heal his servant. Jesus marveled at his faith and healed the servant from a distance.",
    references: [
      { book: 'Matthew', chapter: 8, verses: '5-13', translation: 'NIV' },
      { book: 'Luke', chapter: 7, verses: '1-10', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 8:10',
    location: 'Capernaum',
    significance: 'Demonstrated that faith transcends cultural and religious boundaries.',
    lessonForTeens: 'Jesus values genuine faith regardless of your background or identity.'
  },
  {
    id: 6,
    title: "Healing of the Woman with the Issue of Blood",
    category: miracleCategories.HEALING,
    description: "A woman who had been bleeding for 12 years touched Jesus\'s cloak and was instantly healed.",
    references: [
      { book: 'Matthew', chapter: 9, verses: '20-22', translation: 'NIV' },
      { book: 'Mark', chapter: 5, verses: '25-34', translation: 'NIV' },
      { book: 'Luke', chapter: 8, verses: '43-48', translation: 'NIV' }
    ],
    keyVerse: 'Mark 5:34',
    location: 'On the way to Jairus\'s house',
    significance: 'Shows Jesus\'s compassion for those suffering in silence and his power to heal long-term conditions.',
    lessonForTeens: 'Don\'t be afraid to reach out to Jesus, even if you\'ve been struggling for a long time.'
  },
  {
    id: 7,
    title: "Healing of Two Blind Men",
    category: miracleCategories.HEALING,
    description: "Two blind men followed Jesus calling out for mercy. Jesus touched their eyes and they could see.",
    references: [
      { book: 'Matthew', chapter: 9, verses: '27-31', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 9:29',
    location: 'Capernaum',
    significance: 'Faith and persistent prayer are rewarded.',
    lessonForTeens: 'Keep calling out to Jesus with faith, even when others tell you to be quiet.'
  },
  {
    id: 8,
    title: "Healing of a Deaf and Mute Man",
    category: miracleCategories.HEALING,
    description: "Jesus put his fingers in the man\'s ears, spit, touched his tongue, and said \'Ephphatha!\' (Be opened!). The man could hear and speak.",
    references: [
      { book: 'Mark', chapter: 7, verses: '31-37', translation: 'NIV' }
    ],
    keyVerse: 'Mark 7:34',
    location: 'Decapolis',
    significance: 'Jesus uses various methods to heal, showing his personal care for each individual.',
    lessonForTeens: 'Jesus meets us where we are and works in unique ways for each person.'
  },
  {
    id: 9,
    title: "Healing of the Blind Man at Bethsaida",
    category: miracleCategories.HEALING,
    description: "Jesus healed a blind man in stages, first touching his eyes, then touching them again for complete healing.",
    references: [
      { book: 'Mark', chapter: 8, verses: '22-26', translation: 'NIV' }
    ],
    keyVerse: 'Mark 8:25',
    location: 'Bethsaida',
    significance: 'Sometimes healing and growth happen in stages, not all at once.',
    lessonForTeens: 'Spiritual growth is often a journey. Be patient with yourself and trust God\'s timing.'
  },
  {
    id: 10,
    title: "Healing of Bartimaeus (Blind Man at Jericho)",
    category: miracleCategories.HEALING,
    description: "Bartimaeus, a blind beggar, called out to Jesus persistently. Jesus stopped and healed him, and he followed Jesus.",
    references: [
      { book: 'Matthew', chapter: 20, verses: '29-34', translation: 'NIV' },
      { book: 'Mark', chapter: 10, verses: '46-52', translation: 'NIV' },
      { book: 'Luke', chapter: 18, verses: '35-43', translation: 'NIV' }
    ],
    keyVerse: 'Mark 10:52',
    location: 'Jericho',
    significance: 'Persistent faith is rewarded, and true healing leads to following Jesus.',
    lessonForTeens: 'Don\'t let others silence your cry for help. Jesus hears those who call out to him.'
  },
  {
    id: 11,
    title: "Healing of the Ten Lepers",
    category: miracleCategories.HEALING,
    description: "Ten lepers cried out for mercy. Jesus told them to show themselves to the priests, and they were cleansed. Only one returned to thank Jesus.",
    references: [
      { book: 'Luke', chapter: 17, verses: '11-19', translation: 'NIV' }
    ],
    keyVerse: 'Luke 17:17',
    location: 'Border of Samaria and Galilee',
    significance: 'Gratitude and returning to thank God is important after receiving blessings.',
    lessonForTeens: 'Always remember to thank God for answered prayers and blessings.'
  },
  {
    id: 12,
    title: "Healing of the Man Born Blind",
    category: miracleCategories.HEALING,
    description: "Jesus put mud on a blind man\'s eyes and told him to wash in the Pool of Siloam. The man was born blind but now could see.",
    references: [
      { book: 'John', chapter: 9, verses: '1-41', translation: 'NIV' }
    ],
    keyVerse: 'John 9:25',
    location: 'Jerusalem',
    significance: 'Jesus is the light of the world who opens spiritual eyes.',
    lessonForTeens: 'Jesus can bring light into any darkness, no matter how long you\'ve been in it.'
  },
  {
    id: 13,
    title: "Healing of the Crippled Woman",
    category: miracleCategories.HEALING,
    description: "Jesus healed a woman who had been bent over for 18 years. She immediately straightened up and praised God.",
    references: [
      { book: 'Luke', chapter: 13, verses: '10-17', translation: 'NIV' }
    ],
    keyVerse: 'Luke 13:12',
    location: 'Synagogue',
    significance: 'Jesus frees people from long-term bondage and suffering.',
    lessonForTeens: 'No burden is too heavy or too long-lasting for Jesus to lift from you.'
  },
  {
    id: 14,
    title: "Healing of the Man with Dropsy",
    category: miracleCategories.HEALING,
    description: "On the Sabbath, Jesus healed a man suffering from abnormal swelling, challenging the Pharisees\' understanding of Sabbath law.",
    references: [
      { book: 'Luke', chapter: 14, verses: '1-6', translation: 'NIV' }
    ],
    keyVerse: 'Luke 14:4',
    location: 'Pharisee\'s house',
    significance: 'Mercy and compassion take priority over religious traditions.',
    lessonForTeens: 'God values compassion over religious performance.'
  },
  {
    id: 15,
    title: "Healing of Malchus\' Ear",
    category: miracleCategories.HEALING,
    description: "When Peter cut off the ear of the high priest\'s servant during Jesus\'s arrest, Jesus touched the man\'s ear and healed him.",
    references: [
      { book: 'Luke', chapter: 22, verses: '50-51', translation: 'NIV' }
    ],
    keyVerse: 'Luke 22:51',
    location: 'Garden of Gethsemane',
    significance: 'Jesus showed compassion even to his enemies in his darkest hour.',
    lessonForTeens: 'Show love and compassion even to those who oppose you.'
  },

  // NATURE MIRACLES
  {
    id: 16,
    title: "Turning Water into Wine",
    category: miracleCategories.NATURE,
    description: "At a wedding in Cana, Jesus turned water into wine when the wine ran out, performing his first miracle.",
    references: [
      { book: 'John', chapter: 2, verses: '1-11', translation: 'NIV' }
    ],
    keyVerse: 'John 2:11',
    location: 'Cana in Galilee',
    significance: 'First recorded miracle, revealing Jesus\'s glory and divine power over creation.',
    lessonForTeens: 'Jesus cares about celebrations and brings his best to every situation.'
  },
  {
    id: 17,
    title: "First Miraculous Catch of Fish",
    category: miracleCategories.NATURE,
    description: "After fishing all night with no catch, Jesus told Simon Peter to let down his nets. They caught so many fish their nets began to break.",
    references: [
      { book: 'Luke', chapter: 5, verses: '1-11', translation: 'NIV' }
    ],
    keyVerse: 'Luke 5:4',
    location: 'Sea of Galilee',
    significance: 'When we obey Jesus, even when it doesn\'t make sense, he provides abundantly.',
    lessonForTeens: 'Trust Jesus\'s guidance even when it seems illogical. He sees what you cannot.'
  },
  {
    id: 18,
    title: "Calming the Storm",
    category: miracleCategories.NATURE,
    description: "Jesus and his disciples were crossing the sea when a violent storm arose. Jesus stood up and commanded the wind and waves to be still.",
    references: [
      { book: 'Matthew', chapter: 8, verses: '23-27', translation: 'NIV' },
      { book: 'Mark', chapter: 4, verses: '35-41', translation: 'NIV' },
      { book: 'Luke', chapter: 8, verses: '22-25', translation: 'NIV' }
    ],
    keyVerse: 'Mark 4:39',
    location: 'Sea of Galilee',
    significance: 'Jesus has authority over nature and can bring peace to any storm.',
    lessonForTeens: 'When life feels out of control, Jesus can calm the storms you\'re facing.'
  },
  {
    id: 19,
    title: "Feeding of the 5,000",
    category: miracleCategories.NATURE,
    description: "With only five loaves of bread and two fish, Jesus fed a crowd of about 5,000 men (plus women and children) with twelve baskets of leftovers.",
    references: [
      { book: 'Matthew', chapter: 14, verses: '13-21', translation: 'NIV' },
      { book: 'Mark', chapter: 6, verses: '30-44', translation: 'NIV' },
      { book: 'Luke', chapter: 9, verses: '10-17', translation: 'NIV' },
      { book: 'John', chapter: 6, verses: '1-15', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 14:19',
    location: 'Near Bethsaida',
    significance: 'Jesus can multiply our small offerings to meet great needs.',
    lessonForTeens: 'What you have to offer might seem small, but Jesus can do amazing things with it.'
  },
  {
    id: 20,
    title: "Walking on Water",
    category: miracleCategories.NATURE,
    description: "Jesus walked on the Sea of Galilee to reach his disciples\' boat. Peter also walked on water briefly before doubting.",
    references: [
      { book: 'Matthew', chapter: 14, verses: '22-33', translation: 'NIV' },
      { book: 'Mark', chapter: 6, verses: '45-52', translation: 'NIV' },
      { book: 'John', chapter: 6, verses: '16-21', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 14:27',
    location: 'Sea of Galilee',
    significance: 'Jesus defies natural laws and invites us to step out in faith.',
    lessonForTeens: 'Keep your eyes on Jesus when facing impossible situations. Doubt makes us sink.'
  },
  {
    id: 21,
    title: "Feeding of the 4,000",
    category: miracleCategories.NATURE,
    description: "Jesus fed a crowd of 4,000 men (plus women and children) with seven loaves and a few small fish, with seven baskets of leftovers.",
    references: [
      { book: 'Matthew', chapter: 15, verses: '32-39', translation: 'NIV' },
      { book: 'Mark', chapter: 8, verses: '1-10', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 15:36',
    location: 'Near the Sea of Galilee',
    significance: 'Jesus\'s compassion and provision are limitless.',
    lessonForTeens: 'Jesus continues to provide for our needs, even when we\'ve seen his miracles before.'
  },
  {
    id: 22,
    title: "Coin in the Fish\'s Mouth",
    category: miracleCategories.NATURE,
    description: "To pay the temple tax, Jesus told Peter to catch a fish, and in its mouth would be a coin to pay for both of them.",
    references: [
      { book: 'Matthew', chapter: 17, verses: '24-27', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 17:27',
    location: 'Capernaum',
    significance: 'God provides for our needs in unexpected ways.',
    lessonForTeens: 'Trust God to provide what you need, even in miraculous ways.'
  },
  {
    id: 23,
    title: "Cursing of the Fig Tree",
    category: miracleCategories.NATURE,
    description: "Jesus cursed a fig tree that had no fruit, and it withered immediately, teaching about faith and fruitfulness.",
    references: [
      { book: 'Matthew', chapter: 21, verses: '18-22', translation: 'NIV' },
      { book: 'Mark', chapter: 11, verses: '12-14,20-25', translation: 'NIV' }
    ],
    keyVerse: 'Mark 11:14',
    location: 'Between Bethany and Jerusalem',
    significance: 'God expects us to bear spiritual fruit, not just look good on the outside.',
    lessonForTeens: 'Your faith should produce real results, not just outward appearances.'
  },
  {
    id: 24,
    title: "Second Miraculous Catch of Fish",
    category: miracleCategories.NATURE,
    description: "After his resurrection, Jesus told the disciples where to cast their nets, resulting in 153 large fish.",
    references: [
      { book: 'John', chapter: 21, verses: '1-14', translation: 'NIV' }
    ],
    keyVerse: 'John 21:6',
    location: 'Sea of Galilee',
    significance: 'Jesus continues to guide and provide even after the resurrection.',
    lessonForTeens: 'Following Jesus\'s direction leads to abundance and success.'
  },

  // RESURRECTION MIRACLES
  {
    id: 25,
    title: "Raising of Jairus\' Daughter",
    category: miracleCategories.RESURRECTION,
    description: "A synagogue leader\'s 12-year-old daughter died, but Jesus took her hand and said, \'Little girl, get up!\' She came back to life.",
    references: [
      { book: 'Matthew', chapter: 9, verses: '18-19,23-26', translation: 'NIV' },
      { book: 'Mark', chapter: 5, verses: '21-24,35-43', translation: 'NIV' },
      { book: 'Luke', chapter: 8, verses: '40-42,49-56', translation: 'NIV' }
    ],
    keyVerse: 'Mark 5:41',
    location: 'Capernaum',
    significance: 'Jesus has power over death itself.',
    lessonForTeens: 'No situation is beyond hope when Jesus is involved, even death.'
  },
  {
    id: 26,
    title: "Raising of the Widow\'s Son at Nain",
    category: miracleCategories.RESURRECTION,
    description: "Jesus encountered a funeral procession for a widow\'s only son. Moved with compassion, he touched the coffin and told the young man to get up.",
    references: [
      { book: 'Luke', chapter: 7, verses: '11-17', translation: 'NIV' }
    ],
    keyVerse: 'Luke 7:14',
    location: 'Nain',
    significance: 'Jesus\'s compassion leads to miraculous intervention.',
    lessonForTeens: 'Jesus sees your pain and can restore what seems permanently lost.'
  },
  {
    id: 27,
    title: "Raising of Lazarus",
    category: miracleCategories.RESURRECTION,
    description: "Jesus\'s friend Lazarus had been dead for four days. Jesus commanded him to come out of the tomb, and Lazarus walked out alive.",
    references: [
      { book: 'John', chapter: 11, verses: '1-45', translation: 'NIV' }
    ],
    keyVerse: 'John 11:43',
    location: 'Bethany',
    significance: 'The greatest miracle before Jesus\'s own resurrection, proving he is the resurrection and the life.',
    lessonForTeens: 'Even when all hope seems lost, Jesus can bring new life.'
  },

  // EXORCISM MIRACLES
  {
    id: 28,
    title: "Healing of the Demon-Possessed Man in Capernaum",
    category: miracleCategories.EXORCISM,
    description: "In the synagogue, Jesus encountered a man with an evil spirit. He commanded the spirit to be quiet and come out.",
    references: [
      { book: 'Mark', chapter: 1, verses: '21-28', translation: 'NIV' },
      { book: 'Luke', chapter: 4, verses: '31-37', translation: 'NIV' }
    ],
    keyVerse: 'Mark 1:25',
    location: 'Capernaum synagogue',
    significance: 'Jesus has authority over evil spirits.',
    lessonForTeens: 'Jesus has power over spiritual darkness and can free anyone from its grip.'
  },
  {
    id: 29,
    title: "Healing of the Gerasene Demoniac",
    category: miracleCategories.EXORCISM,
    description: "Jesus freed a man possessed by many demons (Legion). The demons entered a herd of pigs which rushed into the lake and drowned.",
    references: [
      { book: 'Matthew', chapter: 8, verses: '28-34', translation: 'NIV' },
      { book: 'Mark', chapter: 5, verses: '1-20', translation: 'NIV' },
      { book: 'Luke', chapter: 8, verses: '26-39', translation: 'NIV' }
    ],
    keyVerse: 'Mark 5:8',
    location: 'Region of the Gerasenes',
    significance: 'No demon is too powerful for Jesus to overcome.',
    lessonForTeens: 'Jesus can restore even the most broken and isolated people to wholeness.'
  },
  {
    id: 30,
    title: "Healing of the Demon-Possessed Boy",
    category: miracleCategories.EXORCISM,
    description: "A father brought his son who was possessed by a spirit that robbed him of speech and caused seizures. Jesus healed him after his disciples couldn\'t.",
    references: [
      { book: 'Matthew', chapter: 17, verses: '14-21', translation: 'NIV' },
      { book: 'Mark', chapter: 9, verses: '14-29', translation: 'NIV' },
      { book: 'Luke', chapter: 9, verses: '37-43', translation: 'NIV' }
    ],
    keyVerse: 'Mark 9:23',
    location: 'Foot of the mountain (after Transfiguration)',
    significance: 'Some spiritual battles require prayer and fasting.',
    lessonForTeens: 'Everything is possible for those who believe. Some challenges require deeper faith and prayer.'
  },
  {
    id: 31,
    title: "Healing of the Canaanite Woman\'s Daughter",
    category: miracleCategories.EXORCISM,
    description: "A Gentile woman persistently begged Jesus to heal her demon-possessed daughter. Jesus commended her faith and healed her daughter from a distance.",
    references: [
      { book: 'Matthew', chapter: 15, verses: '21-28', translation: 'NIV' },
      { book: 'Mark', chapter: 7, verses: '24-30', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 15:28',
    location: 'Region of Tyre and Sidon',
    significance: 'Persistent faith that doesn\'t give up is rewarded.',
    lessonForTeens: 'Don\'t give up when praying for others. Persistent faith matters.'
  },
  {
    id: 32,
    title: "Healing of the Mute Demon-Possessed Man",
    category: miracleCategories.EXORCISM,
    description: "Jesus drove out a demon that had made a man unable to speak. When the demon left, the man spoke.",
    references: [
      { book: 'Matthew', chapter: 9, verses: '32-34', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 9:33',
    location: 'Galilee',
    significance: 'Jesus frees people to communicate and express themselves.',
    lessonForTeens: 'Jesus can remove whatever is preventing you from expressing yourself freely.'
  },
  {
    id: 33,
    title: "Healing of the Blind and Mute Demon-Possessed Man",
    category: miracleCategories.EXORCISM,
    description: "Jesus healed a man who was both blind and mute because of demon possession. The man could then see and speak.",
    references: [
      { book: 'Matthew', chapter: 12, verses: '22-23', translation: 'NIV' },
      { book: 'Luke', chapter: 11, verses: '14', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 12:22',
    location: 'Galilee',
    significance: 'Jesus can heal multiple issues at once, addressing the root cause.',
    lessonForTeens: 'Jesus doesn\'t just treat symptoms; he deals with the root of our problems.'
  },

  // OTHER MIRACLES
  {
    id: 34,
    title: "Healing at the Pool of Bethesda",
    category: miracleCategories.OTHER,
    description: "Jesus healed a man who had been an invalid for 38 years, telling him to pick up his mat and walk.",
    references: [
      { book: 'John', chapter: 5, verses: '1-15', translation: 'NIV' }
    ],
    keyVerse: 'John 5:8',
    location: 'Pool of Bethesda, Jerusalem',
    significance: 'Jesus seeks out and heals those who have been waiting a long time.',
    lessonForTeens: 'It\'s never too late for Jesus to transform your situation.'
  },
  {
    id: 35,
    title: "Jesus\'s Own Resurrection",
    category: miracleCategories.RESURRECTION,
    description: "Jesus rose from the dead on the third day after his crucifixion, conquering death and sin forever.",
    references: [
      { book: 'Matthew', chapter: 28, verses: '1-10', translation: 'NIV' },
      { book: 'Mark', chapter: 16, verses: '1-8', translation: 'NIV' },
      { book: 'Luke', chapter: 24, verses: '1-12', translation: 'NIV' },
      { book: 'John', chapter: 20, verses: '1-18', translation: 'NIV' }
    ],
    keyVerse: 'Matthew 28:6',
    location: 'Jerusalem',
    significance: 'The ultimate miracle - Jesus conquered death, proving he is God and securing eternal life for believers.',
    lessonForTeens: 'Because Jesus rose from the dead, we can have hope of eternal life and victory over sin and death.'
  }
];

// Helper function to get miracles by category
export const getMiraclesByCategory = (category) => {
  return miracles.filter(miracle => miracle.category === category);
};

// Helper function to search miracles
export const searchMiracles = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return miracles.filter(miracle =>
    miracle.title.toLowerCase().includes(term) ||
    miracle.description.toLowerCase().includes(term) ||
    miracle.location.toLowerCase().includes(term)
  );
};

// Get miracle statistics
export const getMiracleStats = () => {
  return {
    total: miracles.length,
    healing: getMiraclesByCategory(miracleCategories.HEALING).length,
    nature: getMiraclesByCategory(miracleCategories.NATURE).length,
    resurrection: getMiraclesByCategory(miracleCategories.RESURRECTION).length,
    exorcism: getMiraclesByCategory(miracleCategories.EXORCISM).length,
    other: getMiraclesByCategory(miracleCategories.OTHER).length
  };
};
