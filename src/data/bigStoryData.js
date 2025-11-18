/**
 * Big Story Overview: Creation → New Creation
 *
 * The overarching biblical narrative showing how all of Scripture
 * fits together into one unified story of God's plan for humanity.
 */

export const bigStorySections = [
  {
    id: 'creation',
    sectionTitle: 'Creation',
    sectionSlug: 'creation',
    order: 1,
    timelineEra: 'Beginning',
    description: 'God creates a perfect world and places humanity in it to reflect His image and rule over creation in relationship with Him.',
    keyPassages: [
      {
        ref: 'Genesis 1:1-2:3',
        notes: 'The seven days of creation - God creates everything good',
        isOT: true,
      },
      {
        ref: 'Genesis 1:26-28',
        notes: 'Humanity created in God\'s image to rule and reflect Him',
        isOT: true,
      },
      {
        ref: 'Genesis 2:15-17',
        notes: 'Humanity placed in Eden with freedom and responsibility',
        isOT: true,
      },
      {
        ref: 'John 1:1-3',
        notes: 'Jesus as the eternal Creator - all things made through Him',
        isOT: false,
      },
      {
        ref: 'Colossians 1:15-17',
        notes: 'Christ is the image of God, all things created through Him',
        isOT: false,
      },
    ],
    keyEvents: [
      'God creates the heavens and the earth',
      'God creates humanity in His image (male and female)',
      'God places humanity in the Garden of Eden',
      'God declares creation "very good"',
      'God establishes relationship with humanity',
    ],
    narrative: {
      summary: 'In the beginning, God creates a perfect world filled with beauty, order, and goodness. He creates humanity in His own image to be in relationship with Him and to rule over creation as His representatives. Everything functions as it should - no pain, no death, no separation from God.',
      connections: [
        'Points forward to Christ as the Creator (John 1:1-3)',
        'Sets up humanity\'s original purpose: relationship with God and reflecting His image',
        'Establishes the pattern of God\'s good design that will be restored in New Creation',
        'Shows God\'s desire for intimate relationship with His creation',
      ],
      howItFits: 'This is the beginning of God\'s story. It shows us who God is (Creator, relational, good), who we are (image-bearers, designed for relationship), and what God\'s original design looked like. Everything that follows is about how God works to restore this perfect beginning.',
      nextSection: 'But humanity chooses to reject God\'s way and seek independence...',
    },
    visualData: {
      color: '#4CAF50',
      icon: '🌍',
    },
  },
  {
    id: 'fall',
    sectionTitle: 'The Fall',
    sectionSlug: 'fall',
    order: 2,
    timelineEra: 'Beginning',
    description: 'Humanity rejects God\'s rule and chooses independence, bringing sin, death, and separation into the world.',
    keyPassages: [
      {
        ref: 'Genesis 3:1-7',
        notes: 'The serpent\'s deception and humanity\'s choice to disobey',
        isOT: true,
      },
      {
        ref: 'Genesis 3:8-24',
        notes: 'Consequences of sin: shame, broken relationships, exile from Eden',
        isOT: true,
      },
      {
        ref: 'Genesis 3:15',
        notes: 'First promise of redemption - the offspring who will crush the serpent',
        isOT: true,
      },
      {
        ref: 'Romans 5:12-21',
        notes: 'Sin and death entered through one man, life comes through Christ',
        isOT: false,
      },
      {
        ref: 'Romans 3:23',
        notes: 'All have sinned and fall short of God\'s glory',
        isOT: false,
      },
    ],
    keyEvents: [
      'The serpent tempts Eve to doubt God\'s goodness',
      'Adam and Eve eat the forbidden fruit',
      'They experience shame and try to hide from God',
      'God pronounces judgment but promises a Redeemer',
      'Humanity is exiled from Eden - the relationship is broken',
    ],
    narrative: {
      summary: 'Instead of trusting God, humanity listens to the serpent\'s lie that they can be like God on their own terms. This rebellion breaks everything - their relationship with God, with each other, and with creation itself. Sin and death enter the world. But even in judgment, God promises hope: a future offspring who will defeat the serpent.',
      connections: [
        'Genesis 3:15 is the first promise of the Gospel - Jesus will crush the serpent',
        'The broken relationship sets up the need for reconciliation through Christ',
        'The entrance of death shows why Jesus must die and rise again',
        'Shows that humanity cannot fix the problem on their own',
      ],
      howItFits: 'The Fall creates the central problem that the rest of the Bible addresses: How can sinful humanity be restored to relationship with a holy God? Every story, every promise, every sacrifice in the Old Testament points toward God\'s solution.',
      nextSection: 'God begins His plan to rescue and restore humanity...',
    },
    visualData: {
      color: '#F44336',
      icon: '🍎',
    },
  },
  {
    id: 'covenant',
    sectionTitle: 'God\'s Covenant Promises',
    sectionSlug: 'covenant',
    order: 3,
    timelineEra: 'Old Testament',
    description: 'God makes covenant promises to Abraham, Isaac, and Jacob that through their family, all nations will be blessed.',
    keyPassages: [
      {
        ref: 'Genesis 12:1-3',
        notes: 'God\'s covenant with Abraham - blessing to all nations',
        isOT: true,
      },
      {
        ref: 'Genesis 15:1-6',
        notes: 'God promises Abraham countless descendants - Abraham believes',
        isOT: true,
      },
      {
        ref: 'Genesis 17:1-8',
        notes: 'God establishes His covenant - Abraham will be a father of many nations',
        isOT: true,
      },
      {
        ref: 'Galatians 3:8-9',
        notes: 'The Gospel was preached to Abraham - blessing comes through faith',
        isOT: false,
      },
      {
        ref: 'Galatians 3:16',
        notes: 'The promises were to Abraham and his Seed - Christ',
        isOT: false,
      },
    ],
    keyEvents: [
      'God calls Abraham to leave his homeland',
      'God promises land, descendants, and blessing to all nations',
      'God confirms the covenant with Isaac and Jacob',
      'God changes Jacob\'s name to Israel',
      'The family of Israel goes to Egypt',
    ],
    narrative: {
      summary: 'God doesn\'t give up on humanity. He chooses one man, Abraham, and makes an astounding promise: through Abraham\'s family, all the families of the earth will be blessed. This covenant is based on God\'s grace, not human effort. Abraham believes God, and it is counted to him as righteousness.',
      connections: [
        'The promise to bless all nations points to the Gospel going to all peoples through Christ',
        'Abraham\'s faith is the model for how we are saved - by trusting God\'s promise',
        'The "offspring" promised is ultimately Jesus Christ (Galatians 3:16)',
        'Shows God\'s plan is international from the beginning',
      ],
      howItFits: 'God begins His rescue plan by choosing a family through whom the promised Redeemer will come. Every promise made to Abraham finds its fulfillment in Jesus, who brings the blessing of salvation to all nations.',
      nextSection: 'God\'s people become slaves in Egypt, crying out for deliverance...',
    },
    visualData: {
      color: '#2196F3',
      icon: '⭐',
    },
  },
  {
    id: 'exodus',
    sectionTitle: 'Exodus & The Law',
    sectionSlug: 'exodus',
    order: 4,
    timelineEra: 'Old Testament',
    description: 'God rescues His people from slavery in Egypt and gives them His law, showing them how to live as His holy people.',
    keyPassages: [
      {
        ref: 'Exodus 3:7-10',
        notes: 'God hears His people\'s cry and sends Moses to deliver them',
        isOT: true,
      },
      {
        ref: 'Exodus 12:1-13',
        notes: 'The Passover - blood of the lamb saves from judgment',
        isOT: true,
      },
      {
        ref: 'Exodus 19:4-6',
        notes: 'God makes Israel a kingdom of priests and a holy nation',
        isOT: true,
      },
      {
        ref: 'Exodus 20:1-17',
        notes: 'The Ten Commandments - God\'s law for His people',
        isOT: true,
      },
      {
        ref: '1 Corinthians 5:7',
        notes: 'Christ our Passover Lamb has been sacrificed',
        isOT: false,
      },
      {
        ref: 'John 1:17',
        notes: 'The law came through Moses; grace and truth through Jesus',
        isOT: false,
      },
    ],
    keyEvents: [
      'God calls Moses at the burning bush',
      'The ten plagues demonstrate God\'s power over Egypt',
      'The Passover - death passes over those marked by blood',
      'God parts the Red Sea and delivers His people',
      'God gives the law at Mount Sinai',
      'The tabernacle is built - God dwells with His people',
    ],
    narrative: {
      summary: 'When God\'s people cry out from slavery in Egypt, God hears and acts. He sends Moses to lead them out through mighty acts of power. The Passover lamb\'s blood saves them from judgment. God gives them His law to show them how to live as His holy people and builds a tabernacle to dwell among them.',
      connections: [
        'The Passover lamb points to Jesus, the Lamb of God who takes away sin',
        'The exodus becomes the pattern for salvation - God rescuing His people',
        'The law shows God\'s holiness and humanity\'s need for grace',
        'The tabernacle foreshadows God dwelling with us in Christ',
      ],
      howItFits: 'The exodus is the Old Testament\'s central act of salvation, pointing forward to the greater exodus Jesus accomplishes through His death and resurrection. The law reveals God\'s character and shows humanity their need for a Savior who can fulfill it perfectly.',
      nextSection: 'God gives His people a land and establishes a kingdom...',
    },
    visualData: {
      color: '#FF9800',
      icon: '🔥',
    },
  },
  {
    id: 'kingdom',
    sectionTitle: 'The Kingdom',
    sectionSlug: 'kingdom',
    order: 5,
    timelineEra: 'Old Testament',
    description: 'God establishes a kingdom under David and promises an eternal King from his line who will rule with justice and righteousness.',
    keyPassages: [
      {
        ref: '2 Samuel 7:12-16',
        notes: 'God\'s covenant with David - an eternal kingdom and throne',
        isOT: true,
      },
      {
        ref: 'Psalm 2:7-12',
        notes: 'The Lord\'s Anointed will rule the nations',
        isOT: true,
      },
      {
        ref: 'Isaiah 9:6-7',
        notes: 'A child is born who will reign on David\'s throne forever',
        isOT: true,
      },
      {
        ref: 'Luke 1:31-33',
        notes: 'Jesus will reign on David\'s throne forever',
        isOT: false,
      },
      {
        ref: 'Revelation 5:5',
        notes: 'Jesus is the Lion of Judah, the Root of David',
        isOT: false,
      },
    ],
    keyEvents: [
      'Israel demands a king like the other nations',
      'Saul becomes the first king but disobeys God',
      'David is anointed king - a man after God\'s heart',
      'God promises David an eternal kingdom',
      'Solomon builds the temple',
      'The kingdom divides after Solomon\'s death',
    ],
    narrative: {
      summary: 'God gives Israel kings to lead them, and David becomes the greatest king - a man after God\'s own heart. God makes an amazing promise to David: one of his descendants will reign on his throne forever. Solomon builds a magnificent temple, but even David and Solomon fail. The kingdom divides, showing that Israel needs a better King.',
      connections: [
        'The promise of an eternal King is fulfilled in Jesus, the Son of David',
        'Jesus is the perfect King who rules with justice and righteousness',
        'The temple points to Jesus as the place where God dwells with humanity',
        'David\'s kingdom foreshadows the eternal Kingdom of God',
      ],
      howItFits: 'Every king in Israel\'s history points to the need for the perfect King - Jesus Christ. The promises made to David find their ultimate fulfillment when Jesus establishes God\'s eternal kingdom.',
      nextSection: 'The people rebel and are sent into exile...',
    },
    visualData: {
      color: '#9C27B0',
      icon: '👑',
    },
  },
  {
    id: 'exile-return',
    sectionTitle: 'Exile & Return',
    sectionSlug: 'exile-return',
    order: 6,
    timelineEra: 'Old Testament',
    description: 'Because of persistent rebellion, God\'s people are exiled from the land, but God promises to bring them back and give them new hearts.',
    keyPassages: [
      {
        ref: '2 Kings 17:7-23',
        notes: 'Israel goes into exile because of persistent sin',
        isOT: true,
      },
      {
        ref: 'Jeremiah 29:10-14',
        notes: 'God promises to bring His people back after 70 years',
        isOT: true,
      },
      {
        ref: 'Ezekiel 36:24-28',
        notes: 'God promises to give them a new heart and His Spirit',
        isOT: true,
      },
      {
        ref: 'Isaiah 40:1-5',
        notes: 'Comfort for God\'s people - prepare the way for the Lord',
        isOT: true,
      },
      {
        ref: '2 Corinthians 5:17',
        notes: 'In Christ, we are new creation - the old has passed away',
        isOT: false,
      },
    ],
    keyEvents: [
      'Israel and Judah persistently reject God and worship idols',
      'Assyria conquers the Northern Kingdom (Israel)',
      'Babylon destroys Jerusalem and the temple',
      'God\'s people are exiled to Babylon',
      'After 70 years, some return to rebuild Jerusalem',
      'The temple is rebuilt, but it\'s not like the first one',
    ],
    narrative: {
      summary: 'Despite God\'s patience and the warnings of prophets, the people persist in rebellion and idolatry. God allows them to be conquered and exiled from the promised land. But even in exile, God doesn\'t abandon them. He promises to bring them back and to give them something better than external law - He will give them new hearts and put His Spirit in them.',
      connections: [
        'The exile shows the devastating consequences of sin',
        'The return from exile foreshadows the greater return from spiritual exile through Christ',
        'The promise of a new heart is fulfilled through the New Covenant in Jesus',
        'The Spirit\'s indwelling happens at Pentecost after Jesus ascends',
      ],
      howItFits: 'The exile and return demonstrate that external religion isn\'t enough - people need transformed hearts. This sets up the need for the New Covenant that Jesus will establish, where God writes His law on hearts and dwells within His people through the Spirit.',
      nextSection: 'After 400 years of silence, God\'s promised King arrives...',
    },
    visualData: {
      color: '#795548',
      icon: '⛓️',
    },
  },
  {
    id: 'jesus-coming',
    sectionTitle: 'Jesus\' Coming',
    sectionSlug: 'jesus-coming',
    order: 7,
    timelineEra: 'Gospels',
    description: 'After centuries of waiting, God fulfills His promises. Jesus, the eternal Son of God, becomes human to be the Savior and King.',
    keyPassages: [
      {
        ref: 'Luke 1:26-38',
        notes: 'The angel announces Jesus\' birth to Mary',
        isOT: false,
      },
      {
        ref: 'John 1:1-14',
        notes: 'The Word became flesh and dwelt among us',
        isOT: false,
      },
      {
        ref: 'Matthew 4:17',
        notes: 'Jesus begins preaching: "The kingdom of heaven is at hand"',
        isOT: false,
      },
      {
        ref: 'Luke 4:16-21',
        notes: 'Jesus announces He\'s come to fulfill Isaiah\'s prophecy',
        isOT: false,
      },
      {
        ref: 'Mark 10:45',
        notes: 'The Son of Man came to serve and give His life as a ransom',
        isOT: false,
      },
    ],
    keyEvents: [
      'Jesus is born in Bethlehem - God becomes human',
      'John the Baptist prepares the way for Jesus',
      'Jesus is baptized and the Spirit descends on Him',
      'Jesus announces the Kingdom of God has arrived',
      'Jesus performs miracles, showing God\'s power and compassion',
      'Jesus teaches with authority, revealing God\'s character',
      'Jesus calls disciples to follow Him',
    ],
    narrative: {
      summary: 'After 400 years of silence, God speaks. Jesus, the eternal Son of God, enters human history as a baby born in Bethlehem. He is everything Israel\'s history pointed to - the promised offspring of Abraham, the ultimate Passover Lamb, the Prophet like Moses, the Son of David. He announces that God\'s kingdom has arrived in Him.',
      connections: [
        'Jesus fulfills every Old Testament promise and prophecy',
        'He is the image of God that humanity was created to be',
        'He perfectly obeys the law that Israel could not keep',
        'He demonstrates God\'s love and power through miracles',
      ],
      howItFits: 'Jesus is the climax of the entire Old Testament story. Every promise, every prophecy, every sacrifice, every king - they all point to Him. He is the solution to the problem of sin introduced in the Fall. He is the blessing promised to Abraham that will reach all nations.',
      nextSection: 'But to accomplish salvation, Jesus must die...',
    },
    visualData: {
      color: '#03A9F4',
      icon: '✨',
    },
  },
  {
    id: 'cross-resurrection',
    sectionTitle: 'Death & Resurrection',
    sectionSlug: 'cross-resurrection',
    order: 8,
    timelineEra: 'Gospels',
    description: 'Jesus dies on the cross to pay for sin, then rises from the dead, defeating death and securing salvation for all who believe.',
    keyPassages: [
      {
        ref: 'Mark 10:45',
        notes: 'Jesus came to give His life as a ransom for many',
        isOT: false,
      },
      {
        ref: 'John 19:28-30',
        notes: 'Jesus\' final words: "It is finished"',
        isOT: false,
      },
      {
        ref: '1 Corinthians 15:3-4',
        notes: 'Christ died for our sins and rose on the third day',
        isOT: false,
      },
      {
        ref: 'Romans 4:25',
        notes: 'Jesus was delivered over for our sins and raised for our justification',
        isOT: false,
      },
      {
        ref: 'Colossians 2:13-15',
        notes: 'God forgave us and triumphed over powers through the cross',
        isOT: false,
      },
    ],
    keyEvents: [
      'Jesus celebrates the Last Supper, instituting the New Covenant',
      'Jesus is betrayed and arrested in Gethsemane',
      'Jesus is tried before Jewish and Roman authorities',
      'Jesus is crucified on a Roman cross',
      'Jesus dies, taking the penalty for sin',
      'Jesus is buried in a tomb',
      'On the third day, Jesus rises from the dead',
      'Jesus appears to His disciples over 40 days',
    ],
    narrative: {
      summary: 'Jesus, though perfectly innocent, is arrested, tried, and crucified. On the cross, He bears the penalty for human sin - experiencing the separation from God that we deserved. He dies and is buried. But death cannot hold Him. On the third day, He rises victorious, defeating death and proving He is who He claimed to be. The resurrection changes everything.',
      connections: [
        'Jesus is the Passover Lamb whose blood saves from judgment',
        'His death fulfills all the Old Testament sacrifices',
        'He crushes the serpent\'s head, as promised in Genesis 3:15',
        'His resurrection is the beginning of New Creation',
        'Through His death and resurrection, the New Covenant is established',
      ],
      howItFits: 'The cross and resurrection are the turning point of all history. Here, God accomplishes what humanity could never do - He provides the perfect sacrifice for sin and defeats death itself. Every promise in the Old Testament finds its fulfillment here. This is how God rescues His people and restores relationship.',
      nextSection: 'Jesus sends His Spirit and commissions His people...',
    },
    visualData: {
      color: '#E91E63',
      icon: '✝️',
    },
  },
  {
    id: 'church-age',
    sectionTitle: 'The Church Age',
    sectionSlug: 'church-age',
    order: 9,
    timelineEra: 'Church Age',
    description: 'Jesus ascends to heaven and sends the Holy Spirit. The church is born and spreads the Gospel to all nations, making disciples.',
    keyPassages: [
      {
        ref: 'Acts 1:8',
        notes: 'Jesus promises the Spirit and commissions witnesses to all nations',
        isOT: false,
      },
      {
        ref: 'Acts 2:1-4',
        notes: 'The Holy Spirit comes at Pentecost',
        isOT: false,
      },
      {
        ref: 'Acts 2:41-47',
        notes: 'The early church devotes themselves to teaching, fellowship, and prayer',
        isOT: false,
      },
      {
        ref: 'Matthew 28:18-20',
        notes: 'The Great Commission - make disciples of all nations',
        isOT: false,
      },
      {
        ref: 'Ephesians 2:19-22',
        notes: 'The church is God\'s household, built on Christ',
        isOT: false,
      },
    ],
    keyEvents: [
      'Jesus ascends to heaven and sits at God\'s right hand',
      'The Holy Spirit comes at Pentecost',
      'Peter preaches and 3,000 are saved',
      'The Gospel spreads from Jerusalem to Judea to Samaria',
      'Paul is converted and becomes apostle to the Gentiles',
      'The Gospel reaches the ends of the earth',
      'Churches are planted throughout the Roman world',
    ],
    narrative: {
      summary: 'After His resurrection, Jesus appears to His disciples for 40 days, then ascends to heaven. He sends the Holy Spirit as He promised, empowering His followers to be witnesses. The church is born at Pentecost and begins to spread rapidly. What started with 120 people in Jerusalem soon reaches the entire Roman world. The promise to Abraham - blessing to all nations - is being fulfilled.',
      connections: [
        'The Spirit\'s coming fulfills Ezekiel\'s promise of God dwelling in His people',
        'The church is the new temple - where God dwells by His Spirit',
        'The Gospel going to all nations fulfills God\'s promise to Abraham',
        'Believers are now God\'s kingdom of priests (as promised in Exodus 19)',
      ],
      howItFits: 'We are living in the Church Age now. This is the time between Jesus\' first coming (when He secured salvation) and His second coming (when He will complete it). During this time, God is building His church from every nation, calling people to repent and believe in Jesus. One day, Jesus will return to make all things new.',
      nextSection: 'One day, Jesus will return to complete what He started...',
    },
    visualData: {
      color: '#FF5722',
      icon: '🕊️',
    },
  },
  {
    id: 'new-creation',
    sectionTitle: 'New Creation',
    sectionSlug: 'new-creation',
    order: 10,
    timelineEra: 'Future',
    description: 'Jesus will return to judge the world, defeat evil completely, and create new heavens and a new earth where God dwells with His people forever.',
    keyPassages: [
      {
        ref: 'Revelation 21:1-5',
        notes: 'New heaven and new earth - God dwells with His people',
        isOT: false,
      },
      {
        ref: 'Revelation 21:22-27',
        notes: 'No temple needed - God Himself is the temple',
        isOT: false,
      },
      {
        ref: 'Revelation 22:1-5',
        notes: 'The river of life and the tree of life - paradise restored',
        isOT: false,
      },
      {
        ref: '1 Corinthians 15:20-28',
        notes: 'Christ will put all enemies under His feet, including death',
        isOT: false,
      },
      {
        ref: '2 Peter 3:13',
        notes: 'We await new heavens and earth where righteousness dwells',
        isOT: false,
      },
    ],
    keyEvents: [
      'Jesus will return in glory and power',
      'All people will be resurrected and judged',
      'Evil and death will be defeated completely',
      'God will create new heavens and a new earth',
      'The New Jerusalem will come down from heaven',
      'God will dwell with His people forever',
      'No more death, mourning, crying, or pain',
      'All things will be made new',
    ],
    narrative: {
      summary: 'The story that began in a garden ends in a garden city. Jesus will return to judge the living and the dead and to make all things new. God will create new heavens and a new earth - not a replacement, but a renewal and perfection of the original creation. The curse of sin will be completely removed. Death will be defeated. And God will dwell with His people in perfect, unbroken relationship forever.',
      connections: [
        'Eden is restored - but better, in a city filled with God\'s glory',
        'The tree of life returns (from Genesis 2)',
        'God dwells with His people (the goal from the beginning)',
        'The serpent and all evil are defeated (Genesis 3:15 fulfilled)',
        'Abraham\'s descendants are from every nation (the promise fulfilled)',
        'Jesus reigns forever on David\'s throne (2 Samuel 7 fulfilled)',
      ],
      howItFits: 'This is the glorious ending that the entire Bible points toward. Everything God has been doing throughout history has been leading to this: a redeemed humanity living in a restored creation in perfect relationship with their Creator. This is our hope and our future. The story that began with "In the beginning, God created..." ends with "Behold, I am making all things new!"',
      nextSection: null,
    },
    visualData: {
      color: '#FFD700',
      icon: '🏙️',
    },
  },
];

/**
 * Get section by slug
 */
export const getSectionBySlug = (slug) => {
  return bigStorySections.find((section) => section.sectionSlug === slug);
};

/**
 * Get next section
 */
export const getNextSection = (currentSlug) => {
  const currentIndex = bigStorySections.findIndex(
    (section) => section.sectionSlug === currentSlug
  );
  if (currentIndex === -1 || currentIndex === bigStorySections.length - 1) {
    return null;
  }
  return bigStorySections[currentIndex + 1];
};

/**
 * Get previous section
 */
export const getPreviousSection = (currentSlug) => {
  const currentIndex = bigStorySections.findIndex(
    (section) => section.sectionSlug === currentSlug
  );
  if (currentIndex <= 0) {
    return null;
  }
  return bigStorySections[currentIndex - 1];
};
