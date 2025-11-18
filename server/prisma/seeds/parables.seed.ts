import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed data for Parables
 *
 * This script populates the database with well-known parables from the Gospels.
 * These are marked as public so all organizations can access them.
 */

const parablesSeedData = [
  {
    title: 'The Parable of the Sower',
    reference: 'Matthew 13:3-9, 18-23',
    category: 'Kingdom of God',
    parableText: `A farmer went out to sow his seed. As he was scattering the seed, some fell along the path, and the birds came and ate it up. Some fell on rocky places, where it did not have much soil. It sprang up quickly, because the soil was shallow. But when the sun came up, the plants were scorched, and they withered because they had no root. Other seed fell among thorns, which grew up and choked the plants. Still other seed fell on good soil, where it produced a crop—a hundred, sixty or thirty times what was sown.`,
    interpretation: `The seed represents the word of God. The different types of soil represent different responses to God's word:
- Path: Those who hear but don't understand, and Satan takes away what was sown
- Rocky soil: Those who receive the word with joy but have no root and fall away when trouble comes
- Thorny soil: Those who hear the word but are choked by life's worries and wealth
- Good soil: Those who hear the word, understand it, and produce a fruitful harvest`,
    historicalContext: `In first-century Palestine, farming was a central part of life. Farmers would broadcast seed by hand across fields, and the yield would vary based on soil conditions. Jesus' audience would have been very familiar with this agricultural imagery.`,
    applicationPoints: [
      'Examine your heart: What kind of soil are you?',
      'Guard against spiritual distractions that choke out God\'s word',
      'Develop deep spiritual roots through consistent Bible study and prayer',
      'Be patient - spiritual growth takes time',
      'Share God\'s word widely, knowing different people will respond differently',
    ],
    keyTheme: 'Receptivity to God\'s Word',
    crossReferences: [
      { ref: 'Mark 4:3-20', description: 'Mark\'s account of the same parable' },
      { ref: 'Luke 8:5-15', description: 'Luke\'s account of the same parable' },
      { ref: 'James 1:21-22', description: 'Being doers of the word' },
    ],
    relatedParables: ['The Parable of the Growing Seed', 'The Parable of the Wheat and the Weeds'],
  },
  {
    title: 'The Parable of the Good Samaritan',
    reference: 'Luke 10:25-37',
    category: 'Love and Compassion',
    parableText: `A man was going down from Jerusalem to Jericho, when he was attacked by robbers. They stripped him of his clothes, beat him and went away, leaving him half dead. A priest happened to be going down the same road, and when he saw the man, he passed by on the other side. So too, a Levite, when he came to the place and saw him, passed by on the other side. But a Samaritan, as he traveled, came where the man was; and when he saw him, he took pity on him. He went to him and bandaged his wounds, pouring on oil and wine. Then he put the man on his own donkey, brought him to an inn and took care of him. The next day he took out two denarii and gave them to the innkeeper. 'Look after him,' he said, 'and when I return, I will reimburse you for any extra expense you may have.'`,
    interpretation: `Jesus tells this parable in response to the question "Who is my neighbor?" The story challenges the listener's prejudices and redefines what it means to love your neighbor. The religious leaders (priest and Levite) fail to help, while the despised Samaritan shows true compassion. This teaches that anyone in need is our neighbor, regardless of ethnicity, religion, or social status.`,
    historicalContext: `Jews and Samaritans had a long history of hostility. The road from Jerusalem to Jericho was notoriously dangerous, known as the "Way of Blood" due to frequent robberies. For Jesus to make a Samaritan the hero of the story would have been shocking to his Jewish audience. The priest and Levite may have avoided the man to maintain ritual purity, as touching a dead body would make them ceremonially unclean.`,
    applicationPoints: [
      'Love transcends ethnic, religious, and social boundaries',
      'True compassion requires action, not just feelings',
      'Don\'t let religious rules prevent you from showing mercy',
      'Look for opportunities to help those in need around you',
      'Be willing to inconvenience yourself to help others',
    ],
    keyTheme: 'Compassionate Love for All People',
    crossReferences: [
      { ref: 'Leviticus 19:18', description: 'Love your neighbor as yourself' },
      { ref: 'Matthew 22:39', description: 'The second greatest commandment' },
      { ref: 'James 2:14-17', description: 'Faith without works is dead' },
      { ref: '1 John 3:17-18', description: 'Love in action, not just words' },
    ],
    relatedParables: ['The Parable of the Unmerciful Servant', 'The Parable of the Lost Sheep'],
  },
  {
    title: 'The Parable of the Prodigal Son',
    reference: 'Luke 15:11-32',
    category: 'Grace and Forgiveness',
    parableText: `A man had two sons. The younger one said to his father, 'Father, give me my share of the estate.' So he divided his property between them. Not long after that, the younger son got together all he had, set off for a distant country and there squanered his wealth in wild living. After he had spent everything, there was a severe famine in that whole country, and he began to be in need. He longed to fill his stomach with the pods that the pigs were eating, but no one gave him anything. When he came to his senses, he said, 'I will set out and go back to my father and say to him: Father, I have sinned against heaven and against you. I am no longer worthy to be called your son; make me like one of your hired servants.' But while he was still a long way off, his father saw him and was filled with compassion for him; he ran to his son, threw his arms around him and kissed him. The father said to his servants, 'Quick! Bring the best robe and put it on him. Put a ring on his finger and sandals on his feet. Bring the fattened calf and kill it. Let's have a feast and celebrate. For this son of mine was dead and is alive again; he was lost and is found.'`,
    interpretation: `This parable illustrates God's incredible love and forgiveness. The younger son represents sinners who turn away from God, while the father represents God's unconditional love and readiness to forgive. The older son represents the self-righteous who struggle with God's grace toward others. The father's response shows that no matter how far we've wandered, God welcomes us back with open arms.`,
    historicalContext: `In Jewish culture, asking for an inheritance early was essentially wishing the father dead - a grave insult. A father running was considered undignified in that culture, yet the father runs to meet his returning son. The robe, ring, and sandals signified restored sonship, not servanthood. The fattened calf was reserved for the most special occasions.`,
    applicationPoints: [
      'God\'s love is unconditional and unwavering',
      'It\'s never too late to return to God',
      'Repentance means turning back to God',
      'Don\'t let pride keep you from accepting God\'s grace',
      'Celebrate when others come to faith, even if their story differs from yours',
      'Guard against self-righteousness and resentment',
    ],
    keyTheme: 'God\'s Unconditional Love and Forgiveness',
    crossReferences: [
      { ref: 'Ephesians 2:4-5', description: 'God\'s rich mercy and great love' },
      { ref: '1 John 1:9', description: 'God is faithful to forgive' },
      { ref: 'Romans 5:8', description: 'God\'s love demonstrated while we were sinners' },
      { ref: 'Luke 15:7', description: 'Joy in heaven over one sinner who repents' },
    ],
    relatedParables: ['The Parable of the Lost Sheep', 'The Parable of the Lost Coin'],
  },
  {
    title: 'The Parable of the Mustard Seed',
    reference: 'Matthew 13:31-32',
    category: 'Kingdom of God',
    parableText: `The kingdom of heaven is like a mustard seed, which a man took and planted in his field. Though it is the smallest of all seeds, yet when it grows, it is the largest of garden plants and becomes a tree, so that the birds come and perch in its branches.`,
    interpretation: `This parable teaches about the growth of God's kingdom. Just as a tiny mustard seed grows into a large plant, the kingdom of God starts small but grows to have a worldwide impact. What may seem insignificant at first can, through God's power, become something magnificent.`,
    historicalContext: `The black mustard seed was proverbially the smallest seed known to Palestinian farmers, yet it could grow into a shrub 10-12 feet tall. The image of birds nesting in branches echoes Old Testament prophecies about God's kingdom (Ezekiel 17:23, Daniel 4:12).`,
    applicationPoints: [
      'Don\'t despise small beginnings',
      'God can use small acts of faith in mighty ways',
      'Be patient - God\'s kingdom grows gradually',
      'Your faith, though small, can grow into something powerful',
      'God\'s kingdom provides shelter and blessing to many',
    ],
    keyTheme: 'The Growth of God\'s Kingdom',
    crossReferences: [
      { ref: 'Mark 4:30-32', description: 'Mark\'s account of the same parable' },
      { ref: 'Luke 13:18-19', description: 'Luke\'s account of the same parable' },
      { ref: 'Zechariah 4:10', description: 'Do not despise the day of small things' },
      { ref: '1 Corinthians 3:6-7', description: 'God makes things grow' },
    ],
    relatedParables: ['The Parable of the Yeast', 'The Parable of the Growing Seed'],
  },
  {
    title: 'The Parable of the Lost Sheep',
    reference: 'Luke 15:3-7',
    category: 'Grace and Forgiveness',
    parableText: `Suppose one of you has a hundred sheep and loses one of them. Doesn't he leave the ninety-nine in the open country and go after the lost sheep until he finds it? And when he finds it, he joyfully puts it on his shoulders and goes home. Then he calls his friends and neighbors together and says, 'Rejoice with me; I have found my lost sheep.' I tell you that in the same way there will be more rejoicing in heaven over one sinner who repents than over ninety-nine righteous persons who do not need to repent.`,
    interpretation: `This parable illustrates God's relentless pursuit of those who are lost. The shepherd represents Jesus, who seeks out the lost sinner with determination and joy. It emphasizes the value of each individual soul to God and the celebration that occurs in heaven when someone turns to God.`,
    historicalContext: `Shepherds in Palestine would often graze their flocks in wilderness areas. Losing a sheep was common, and a good shepherd would indeed search diligently for it. Sheep were valuable assets, and losing one represented a significant loss.`,
    applicationPoints: [
      'Every person matters to God',
      'God actively seeks those who are lost',
      'There is great joy in heaven over each person who comes to faith',
      'Don\'t give up on people who seem far from God',
      'Celebrate with those who come to faith',
    ],
    keyTheme: 'God\'s Seeking Love',
    crossReferences: [
      { ref: 'Matthew 18:12-14', description: 'Matthew\'s account of the same parable' },
      { ref: 'Ezekiel 34:11-16', description: 'God as the shepherd who searches for his sheep' },
      { ref: 'John 10:11-14', description: 'Jesus as the Good Shepherd' },
    ],
    relatedParables: ['The Parable of the Lost Coin', 'The Parable of the Prodigal Son'],
  },
  {
    title: 'The Parable of the Talents',
    reference: 'Matthew 25:14-30',
    category: 'Stewardship',
    parableText: `A man going on a journey called his servants and entrusted his wealth to them. To one he gave five bags of gold, to another two bags, and to another one bag, each according to his ability. The man who had received five bags of gold went at once and put his money to work and gained five bags more. So also, the one with two bags of gold gained two more. But the man who had received one bag went off, dug a hole in the ground and hid his master's money. After a long time the master returned and settled accounts with them. The servants who had gained more were praised: 'Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things. Come and share your master's happiness!' But the servant who had buried his talent was rebuked and the talent was taken from him.`,
    interpretation: `This parable teaches about faithful stewardship of what God has given us. The talents represent abilities, resources, opportunities, and gifts that God entrusts to us. We are expected to use these gifts for God's kingdom, not hide them out of fear. Those who faithfully use what they've been given will be rewarded, while those who fail to use their gifts will lose them.`,
    historicalContext: `A talent was a large sum of money (about 20 years' wages for a laborer). The parable was told in the context of Jesus' second coming, emphasizing preparedness and faithful service during his absence.`,
    applicationPoints: [
      'Use your gifts and abilities for God\'s kingdom',
      'God gives different people different abilities - use what you have',
      'Faithful stewardship in small things leads to greater responsibility',
      'Don\'t let fear paralyze you from serving God',
      'God expects a return on what He\'s invested in you',
    ],
    keyTheme: 'Faithful Stewardship',
    crossReferences: [
      { ref: 'Luke 19:11-27', description: 'The Parable of the Ten Minas (similar parable)' },
      { ref: '1 Corinthians 12:4-11', description: 'Different gifts, same Spirit' },
      { ref: '1 Peter 4:10', description: 'Use your gifts to serve others' },
      { ref: 'Luke 12:48', description: 'Much is required from those given much' },
    ],
    relatedParables: ['The Parable of the Faithful Servant', 'The Parable of the Ten Virgins'],
  },
  {
    title: 'The Parable of the Pharisee and the Tax Collector',
    reference: 'Luke 18:9-14',
    category: 'Humility',
    parableText: `Two men went up to the temple to pray, one a Pharisee and the other a tax collector. The Pharisee stood by himself and prayed: 'God, I thank you that I am not like other people—robbers, evildoers, adulterers—or even like this tax collector. I fast twice a week and give a tenth of all I get.' But the tax collector stood at a distance. He would not even look up to heaven, but beat his breast and said, 'God, have mercy on me, a sinner.' I tell you that this man, rather than the other, went home justified before God. For all those who exalt themselves will be humbled, and those who humble themselves will be exalted.`,
    interpretation: `This parable contrasts self-righteousness with genuine humility. The Pharisee's prayer was really about himself and his accomplishments, while the tax collector recognized his need for God's mercy. Jesus teaches that God honors humble repentance over proud self-justification. It's not about comparing ourselves to others, but recognizing our need for God's grace.`,
    historicalContext: `Pharisees were known for their strict adherence to the law and were highly respected. Tax collectors, on the other hand, were despised as traitors who collaborated with Rome and were known for extortion. For Jesus to praise the tax collector and criticize the Pharisee would have been shocking to his audience.`,
    applicationPoints: [
      'Pride prevents us from receiving God\'s grace',
      'True prayer is about honest communication with God, not impressing others',
      'Don\'t compare yourself to others spiritually',
      'Recognize your need for God\'s mercy',
      'Humility is essential for a right relationship with God',
    ],
    keyTheme: 'Humility Before God',
    crossReferences: [
      { ref: 'James 4:6', description: 'God opposes the proud but gives grace to the humble' },
      { ref: 'Proverbs 16:18', description: 'Pride goes before destruction' },
      { ref: 'Matthew 23:12', description: 'Those who exalt themselves will be humbled' },
      { ref: '1 John 1:8-10', description: 'Confessing our sins' },
    ],
    relatedParables: ['The Parable of the Wedding Feast', 'The Parable of the Prodigal Son'],
  },
];

/**
 * Seed parables into the database
 * This function should be called from the main seed script
 */
export async function seedParables(organizationId: string) {
  console.log('🌱 Seeding parables...');

  try {
    for (const parableData of parablesSeedData) {
      await prisma.parable.create({
        data: {
          ...parableData,
          organizationId,
          isPublic: true, // Make these public so all orgs can see them
          createdBy: null,
        },
      });
    }

    console.log(`✓ Successfully seeded ${parablesSeedData.length} parables`);
  } catch (error) {
    console.error('Error seeding parables:', error);
    throw error;
  }
}

export default seedParables;
