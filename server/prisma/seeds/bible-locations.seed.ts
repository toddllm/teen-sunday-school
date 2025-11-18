import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const bibleLocations = [
  {
    name: 'Jerusalem',
    alternateNames: 'Zion, City of David, Holy City',
    latitude: 31.7683,
    longitude: 35.2137,
    region: 'Judea',
    modernName: 'Jerusalem, Israel',
    summary: 'The holiest city in Judaism and Christianity, and a sacred place in Islam. The spiritual and political center of ancient Israel.',
    description: 'Jerusalem has been the focal point of Jewish spiritual life since King David made it the capital of Israel around 1000 BCE. It was the site of both the First and Second Temples and witnessed many pivotal events in Jesus\' ministry, including His crucifixion and resurrection.',
    keyEvents: [
      {
        title: 'David Captures Jerusalem',
        description: 'King David conquered the Jebusite city and made it the capital of Israel.'
      },
      {
        title: 'Solomon Builds the Temple',
        description: 'King Solomon built the First Temple on Mount Moriah.'
      },
      {
        title: 'Jesus\' Triumphal Entry',
        description: 'Jesus entered Jerusalem on a donkey, fulfilling prophecy.'
      },
      {
        title: 'Crucifixion and Resurrection',
        description: 'Jesus was crucified outside Jerusalem and rose from the dead.'
      }
    ],
    relatedPassages: [
      { reference: '2 Samuel 5:6-9', description: 'David captures Jerusalem' },
      { reference: '1 Kings 6:1-38', description: 'Solomon builds the Temple' },
      { reference: 'Matthew 21:1-11', description: 'Triumphal Entry' },
      { reference: 'Luke 23-24', description: 'Crucifixion and Resurrection' },
      { reference: 'Psalm 122', description: 'A psalm about Jerusalem' }
    ]
  },
  {
    name: 'Bethlehem',
    alternateNames: 'Ephrathah, City of David',
    latitude: 31.7054,
    longitude: 35.2024,
    region: 'Judea',
    modernName: 'Bethlehem, West Bank',
    summary: 'The birthplace of King David and Jesus Christ. A small town with profound significance in biblical history.',
    description: 'Bethlehem, meaning "house of bread," is located about 6 miles south of Jerusalem. It was the hometown of Ruth and Boaz, the birthplace of King David, and most significantly, where Jesus was born.',
    keyEvents: [
      {
        title: 'Ruth and Boaz',
        description: 'The story of Ruth took place in Bethlehem.'
      },
      {
        title: 'Birth of David',
        description: 'King David was born and raised in Bethlehem.'
      },
      {
        title: 'Birth of Jesus',
        description: 'Jesus was born in Bethlehem, fulfilling Micah\'s prophecy.'
      }
    ],
    relatedPassages: [
      { reference: 'Ruth 1-4', description: 'Ruth\'s story in Bethlehem' },
      { reference: '1 Samuel 16:1-13', description: 'David anointed in Bethlehem' },
      { reference: 'Micah 5:2', description: 'Prophecy of Messiah\'s birthplace' },
      { reference: 'Luke 2:1-20', description: 'Jesus\' birth in Bethlehem' }
    ]
  },
  {
    name: 'Nazareth',
    latitude: 32.7046,
    longitude: 35.2979,
    region: 'Galilee',
    modernName: 'Nazareth, Israel',
    summary: 'The hometown of Jesus where He grew up. A small village in Galilee that witnessed Jesus\' childhood and early ministry.',
    description: 'Nazareth was an insignificant village in Galilee during biblical times. It was here that Mary and Joseph raised Jesus, and where He spent most of His life before beginning His public ministry.',
    keyEvents: [
      {
        title: 'Annunciation',
        description: 'Angel Gabriel appeared to Mary announcing Jesus\' birth.'
      },
      {
        title: 'Jesus\' Childhood',
        description: 'Jesus grew up in Nazareth with Mary and Joseph.'
      },
      {
        title: 'Rejection at Nazareth',
        description: 'Jesus was rejected by His hometown synagogue.'
      }
    ],
    relatedPassages: [
      { reference: 'Luke 1:26-38', description: 'Annunciation to Mary' },
      { reference: 'Luke 2:39-40', description: 'Jesus grows up in Nazareth' },
      { reference: 'Luke 4:16-30', description: 'Rejection at Nazareth' },
      { reference: 'Matthew 2:23', description: 'Jesus will be called a Nazarene' }
    ]
  },
  {
    name: 'Sea of Galilee',
    alternateNames: 'Lake of Gennesaret, Sea of Tiberias',
    latitude: 32.8152,
    longitude: 35.5871,
    region: 'Galilee',
    modernName: 'Sea of Galilee, Israel',
    summary: 'A freshwater lake where Jesus performed many miracles and called His first disciples. The center of Jesus\' Galilean ministry.',
    description: 'The Sea of Galilee is actually a large freshwater lake in northern Israel. It was a fishing hub in Jesus\' time and the backdrop for many of His teachings and miracles.',
    keyEvents: [
      {
        title: 'Calling the First Disciples',
        description: 'Jesus called Peter, Andrew, James, and John by the sea.'
      },
      {
        title: 'Calming the Storm',
        description: 'Jesus calmed a violent storm on the sea.'
      },
      {
        title: 'Walking on Water',
        description: 'Jesus walked on water to meet His disciples.'
      },
      {
        title: 'Miraculous Catch of Fish',
        description: 'Jesus directed a miraculous catch after His resurrection.'
      }
    ],
    relatedPassages: [
      { reference: 'Matthew 4:18-22', description: 'Calling of the disciples' },
      { reference: 'Mark 4:35-41', description: 'Jesus calms the storm' },
      { reference: 'Matthew 14:22-33', description: 'Jesus walks on water' },
      { reference: 'John 21:1-14', description: 'Miraculous catch of fish' }
    ]
  },
  {
    name: 'Capernaum',
    latitude: 32.8814,
    longitude: 35.5745,
    region: 'Galilee',
    modernName: 'Tel Nahum, Israel',
    summary: 'Jesus\' ministry headquarters in Galilee. The town where He performed many miracles and taught in the synagogue.',
    description: 'Capernaum was a fishing village on the northern shore of the Sea of Galilee. Jesus made it His base of operations during His Galilean ministry, calling it "His own town."',
    keyEvents: [
      {
        title: 'Healing Peter\'s Mother-in-Law',
        description: 'Jesus healed Peter\'s mother-in-law of a fever.'
      },
      {
        title: 'Healing the Paralytic',
        description: 'Jesus healed a paralyzed man lowered through a roof.'
      },
      {
        title: 'Calling Matthew',
        description: 'Jesus called the tax collector Matthew to follow Him.'
      }
    ],
    relatedPassages: [
      { reference: 'Matthew 4:13', description: 'Jesus moves to Capernaum' },
      { reference: 'Mark 1:29-31', description: 'Healing Peter\'s mother-in-law' },
      { reference: 'Mark 2:1-12', description: 'Healing the paralytic' },
      { reference: 'Matthew 9:9-13', description: 'Calling of Matthew' }
    ]
  },
  {
    name: 'Mount Sinai',
    alternateNames: 'Horeb, Mount Horeb, Jebel Musa',
    latitude: 28.5392,
    longitude: 33.9753,
    region: 'Sinai Peninsula',
    modernName: 'Jebel Musa, Egypt',
    summary: 'The mountain where God gave Moses the Ten Commandments. A sacred mountain central to the Exodus story.',
    description: 'Mount Sinai is the mountain where God appeared to Moses in a burning bush and later gave him the Ten Commandments and the Law. It represents God\'s covenant with Israel.',
    keyEvents: [
      {
        title: 'Burning Bush',
        description: 'God spoke to Moses from a burning bush.'
      },
      {
        title: 'Ten Commandments',
        description: 'God gave Moses the Ten Commandments on stone tablets.'
      },
      {
        title: 'Golden Calf',
        description: 'While Moses was on the mountain, Israel made a golden calf.'
      }
    ],
    relatedPassages: [
      { reference: 'Exodus 3:1-15', description: 'The burning bush' },
      { reference: 'Exodus 19-20', description: 'God gives the Ten Commandments' },
      { reference: 'Exodus 32', description: 'The golden calf incident' },
      { reference: '1 Kings 19:8-18', description: 'Elijah at Mount Horeb' }
    ]
  },
  {
    name: 'Jericho',
    latitude: 31.8558,
    longitude: 35.4617,
    region: 'Judea',
    modernName: 'Jericho, West Bank',
    summary: 'One of the oldest cities in the world. The first city conquered by Joshua when Israel entered the Promised Land.',
    description: 'Jericho is known as the "City of Palms" and is one of the lowest cities on Earth. It was famously conquered when its walls fell after the Israelites marched around it.',
    keyEvents: [
      {
        title: 'Fall of Jericho',
        description: 'The walls of Jericho fell after Israel marched around it for seven days.'
      },
      {
        title: 'Rahab\'s Faith',
        description: 'Rahab the prostitute helped Israel\'s spies and was saved.'
      },
      {
        title: 'Healing Blind Bartimaeus',
        description: 'Jesus healed a blind beggar named Bartimaeus.'
      },
      {
        title: 'Zacchaeus Encounters Jesus',
        description: 'Zacchaeus climbed a tree to see Jesus and was transformed.'
      }
    ],
    relatedPassages: [
      { reference: 'Joshua 6', description: 'The fall of Jericho' },
      { reference: 'Joshua 2', description: 'Rahab and the spies' },
      { reference: 'Mark 10:46-52', description: 'Healing of blind Bartimaeus' },
      { reference: 'Luke 19:1-10', description: 'Zacchaeus meets Jesus' }
    ]
  },
  {
    name: 'Garden of Gethsemane',
    latitude: 31.7795,
    longitude: 35.2398,
    region: 'Judea',
    modernName: 'Jerusalem, Israel',
    summary: 'The olive grove where Jesus prayed before His arrest. A place of intense prayer and surrender.',
    description: 'Gethsemane, meaning "oil press," was an olive grove on the Mount of Olives. It was here that Jesus prayed in agony the night before His crucifixion.',
    keyEvents: [
      {
        title: 'Jesus\' Agony in Prayer',
        description: 'Jesus prayed intensely, sweating drops of blood.'
      },
      {
        title: 'Betrayal and Arrest',
        description: 'Judas betrayed Jesus with a kiss, and He was arrested.'
      }
    ],
    relatedPassages: [
      { reference: 'Matthew 26:36-46', description: 'Jesus prays in Gethsemane' },
      { reference: 'Mark 14:32-42', description: 'The agony in the garden' },
      { reference: 'Luke 22:39-46', description: 'Jesus sweats blood' },
      { reference: 'John 18:1-11', description: 'Betrayal and arrest' }
    ]
  }
];

export async function seedBibleLocations() {
  console.log('Seeding bible locations...');

  for (const location of bibleLocations) {
    await prisma.bibleLocation.upsert({
      where: {
        // Use a combination that's likely unique
        name: location.name
      },
      update: {},
      create: location,
    });
  }

  console.log(`✓ Seeded ${bibleLocations.length} bible locations`);
}

// Run if executed directly
if (require.main === module) {
  seedBibleLocations()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
